import type { HttpContext } from '@adonisjs/core/http'
import Space from '#models/space'
import Booking from '#models/booking'
import Payment from '#models/payment'
import User from '#models/user'

const count = (row: { $extras: { c?: string | number } } | null) => Number(row?.$extras.c ?? 0)

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    const [activeSpaces, blockedSpaces, totalBookings, pendingBookings, revenueRow, renters] =
      await Promise.all([
        Space.query().where('status', 'active').count('* as c').first(),
        Space.query().where('status', 'blocked').count('* as c').first(),
        Booking.query().count('* as c').first(),
        Booking.query().where('status', 'pending').count('* as c').first(),
        Payment.query().where('status', 'fake_paid').sum('amount as total').first(),
        User.query().where('role', 'user').count('* as c').first(),
      ])

    const recent = await Booking.query()
      .preload('space')
      .preload('user')
      .orderBy('created_at', 'desc')
      .limit(8)

    return inertia.render('dashboard/index', {
      stats: {
        activeSpaces: count(activeSpaces),
        blockedSpaces: count(blockedSpaces),
        totalBookings: count(totalBookings),
        pendingBookings: count(pendingBookings),
        revenue: Number(revenueRow?.$extras.total ?? 0),
        renters: count(renters),
      },
      recent: recent.map((b) => ({
        id: b.id,
        space: b.space?.name ?? '—',
        user: b.user?.fullName ?? b.user?.email ?? '—',
        date: b.date?.toISODate() ?? '',
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        totalPrice: b.totalPrice,
      })),
    })
  }
}
