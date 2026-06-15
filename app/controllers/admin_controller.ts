import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import Payment from '#models/payment'

export default class AdminController {
  /**
   * GET /admin/bookings — every booking, optional ?status filter.
   */
  async bookings({ request }: HttpContext) {
    const { status } = request.qs()
    const query = Booking.query()
      .preload('user')
      .preload('space')
      .preload('payment')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'desc')

    if (status) query.where('status', status)
    return query
  }

  /**
   * GET /admin/revenue — sum of all 'fake_paid' payments.
   */
  async revenue({}: HttpContext) {
    const row = await Payment.query()
      .where('status', 'fake_paid')
      .sum('amount as total')
      .count('* as count')
      .first()

    return {
      totalRevenue: Number(row?.$extras.total ?? 0),
      payments: Number(row?.$extras.count ?? 0),
      currency: 'MXN',
    }
  }
}
