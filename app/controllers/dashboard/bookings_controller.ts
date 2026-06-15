import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'

export default class DashboardBookingsController {
  async index({ request, inertia }: HttpContext) {
    const status = request.qs().status as string | undefined

    const query = Booking.query()
      .preload('space')
      .preload('user')
      .preload('payment')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'desc')

    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      query.where('status', status)
    }

    const bookings = await query

    return inertia.render('dashboard/bookings', {
      filter: status ?? 'all',
      bookings: bookings.map((b) => ({
        id: b.id,
        space: b.space?.name ?? '—',
        user: b.user?.fullName ?? b.user?.email ?? '—',
        date: b.date?.toISODate() ?? '',
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        totalPrice: b.totalPrice,
        paid: !!b.payment,
        method: b.payment?.method ?? null,
      })),
    })
  }
}
