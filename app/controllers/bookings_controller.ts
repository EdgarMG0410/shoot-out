import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import Payment from '#models/payment'
import BookingService, { BookingError } from '#services/booking_service'
import { createBookingValidator, payBookingValidator } from '#validators/booking'

export default class BookingsController {
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createBookingValidator)
    try {
      const booking = await new BookingService().createBooking({
        userId: auth.getUserOrFail().id,
        ...data,
      })
      await booking.load('space')
      return response.created(booking)
    } catch (error) {
      if (error instanceof BookingError) {
        return response.status(error.status ?? 400).send({ error: error.message, code: error.code })
      }
      throw error
    }
  }

  async pay({ params, request, response, auth }: HttpContext) {
    const booking = await Booking.query()
      .where('id', params.id)
      .where('user_id', auth.getUserOrFail().id)
      .first()

    if (!booking) return response.notFound({ error: 'Booking not found' })
    if (booking.status === 'cancelled') {
      return response.unprocessableEntity({ error: 'Cannot pay a cancelled booking' })
    }
    if (booking.status === 'confirmed') {
      return response.unprocessableEntity({ error: 'Booking is already confirmed' })
    }

    const { method } = await request.validateUsing(payBookingValidator)
    const payment = await Payment.create({
      bookingId: booking.id,
      amount: booking.totalPrice,
      status: 'fake_paid',
      method: method ?? 'card',
    })
    booking.status = 'confirmed'
    await booking.save()

    return response.created({ booking, payment })
  }

  async mine({ auth }: HttpContext) {
    return Booking.query()
      .where('user_id', auth.getUserOrFail().id)
      .preload('space')
      .preload('payment')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'desc')
  }
}
