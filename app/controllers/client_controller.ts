import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import Space from '#models/space'
import Booking from '#models/booking'
import Payment from '#models/payment'
import BookingService, { BookingError } from '#services/booking_service'
import { createBookingValidator } from '#validators/booking'

/**
 * Client (renter) web experience under /app — browse, check availability,
 * book and pay. Uses the `web` session guard (any authenticated user).
 */
export default class ClientController {
  async home({ inertia }: HttpContext) {
    const locations = await Location.query()
      .where('status', 'active')
      .preload('spaces', (q) => q.where('status', 'active').orderBy('name'))
      .orderBy('name')

    return inertia.render('app/home', {
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        address: l.address,
        phone: l.phone,
        photoUrl: l.photoUrl,
        spaces: l.spaces.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          size: s.size,
          pricePerHour: s.pricePerHour,
          photoUrl: s.photoUrl,
          openTime: s.openTime,
          closeTime: s.closeTime,
        })),
      })),
    })
  }

  async space({ params, request, inertia, response }: HttpContext) {
    const space = await Space.query().where('id', params.id).preload('location').first()
    if (!space) return response.redirect().toPath('/app')

    const date = (request.qs().date as string) || DateTime.now().toISODate()!
    const occupied = await new BookingService().getOccupiedSlots(space.id, date)

    return inertia.render('app/space', {
      space: {
        id: space.id,
        name: space.name,
        type: space.type,
        size: space.size,
        pricePerHour: space.pricePerHour,
        capacity: space.capacity,
        photoUrl: space.photoUrl,
        openTime: space.openTime,
        closeTime: space.closeTime,
        location: space.location?.name ?? '—',
        address: space.location?.address ?? null,
        status: space.status,
      },
      date,
      occupied,
    })
  }

  async book({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(createBookingValidator)
    try {
      await new BookingService().createBooking({ userId: auth.getUserOrFail().id, ...data })
      session.flash('success', 'Reserva creada — paga para confirmar')
      return response.redirect().toPath('/app/bookings')
    } catch (error) {
      if (error instanceof BookingError) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
      throw error
    }
  }

  async pay({ params, response, auth, session }: HttpContext) {
    const booking = await Booking.query()
      .where('id', params.id)
      .where('user_id', auth.getUserOrFail().id)
      .first()

    if (!booking) {
      session.flash('error', 'Reserva no encontrada')
      return response.redirect().back()
    }
    if (booking.status === 'confirmed') {
      session.flash('error', 'La reserva ya está confirmada')
      return response.redirect().back()
    }
    if (booking.status === 'cancelled') {
      session.flash('error', 'No puedes pagar una reserva cancelada')
      return response.redirect().back()
    }

    await Payment.create({
      bookingId: booking.id,
      amount: booking.totalPrice,
      status: 'fake_paid',
      method: 'card',
    })
    booking.status = 'confirmed'
    await booking.save()

    session.flash('success', 'Pago realizado — reserva confirmada')
    return response.redirect().toPath('/app/bookings')
  }

  async bookings({ inertia, auth }: HttpContext) {
    const bookings = await Booking.query()
      .where('user_id', auth.getUserOrFail().id)
      .preload('space')
      .preload('payment')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'desc')

    return inertia.render('app/bookings', {
      bookings: bookings.map((b) => ({
        id: b.id,
        space: b.space?.name ?? '—',
        date: b.date?.toISODate() ?? '',
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        totalPrice: b.totalPrice,
        paid: !!b.payment,
      })),
    })
  }
}
