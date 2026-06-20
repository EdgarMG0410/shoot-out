import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Space from '#models/space'
import Booking from '#models/booking'
import Payment from '#models/payment'
import User from '#models/user'
import BookingService from '#services/booking_service'

const count = (row: { $extras: { c?: string | number } } | null) => Number(row?.$extras.c ?? 0)
const REPORT_DAYS = 7

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

    // ---- Tendencia de actividad (últimos 14 días) ----
    const TREND_DAYS = 14
    const trendStart = DateTime.now()
      .startOf('day')
      .minus({ days: TREND_DAYS - 1 })
    const trendRows = await Booking.query().where('created_at', '>=', trendStart.toSQLDate()!)

    const byDay = new Map<string, { bookings: number; revenue: number }>()
    for (let i = 0; i < TREND_DAYS; i++) {
      byDay.set(trendStart.plus({ days: i }).toISODate()!, { bookings: 0, revenue: 0 })
    }
    for (const b of trendRows) {
      const key = b.createdAt?.toISODate()
      const slot = key ? byDay.get(key) : undefined
      if (!slot) continue
      slot.bookings += 1
      if (b.status !== 'cancelled') slot.revenue += b.totalPrice
    }
    const timeseries = [...byDay.entries()].map(([date, v]) => ({
      date,
      bookings: v.bookings,
      revenue: Number(v.revenue.toFixed(2)),
    }))

    // ---- Desglose de reservas por estado ----
    const statusRows = await Booking.query().select('status').count('* as c').groupBy('status')
    const byStatus = statusRows.map((r) => ({
      status: r.status as string,
      count: count(r),
    }))

    // ---- Ocupación simple (próximos 7 días) ----
    const svc = new BookingService()
    const start = DateTime.now().startOf('day')
    const end = start.plus({ days: REPORT_DAYS - 1 })
    const startISO = start.toISODate()!
    const endISO = end.toISODate()!

    const activeSpacesList = await Space.query()
      .where('status', 'active')
      .preload('location')
      .orderBy('name')

    const rangeBookings = await Booking.query()
      .whereIn('status', ['pending', 'confirmed'])
      .whereBetween('date', [startISO, endISO])

    const bookedBySpace = new Map<number, number>()
    for (const b of rangeBookings) {
      const hrs = svc.durationHours(b.startTime, b.endTime)
      bookedBySpace.set(b.spaceId, (bookedBySpace.get(b.spaceId) ?? 0) + hrs)
    }

    const reportSpaces = activeSpacesList.map((s) => {
      const dailyHours = Math.max(0, svc.durationHours(s.openTime, s.closeTime))
      const availableHours = dailyHours * REPORT_DAYS
      const bookedHours = bookedBySpace.get(s.id) ?? 0
      const occupancy = availableHours > 0 ? Math.min(1, bookedHours / availableHours) : 0
      return {
        id: s.id,
        name: s.name,
        locationName: s.location?.name ?? '—',
        bookedHours: Number(bookedHours.toFixed(1)),
        availableHours: Number(availableHours.toFixed(1)),
        occupancy: Number((occupancy * 100).toFixed(0)),
      }
    })

    const totalAvailable = reportSpaces.reduce((a, s) => a + s.availableHours, 0)
    const totalBooked = reportSpaces.reduce((a, s) => a + s.bookedHours, 0)

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
      report: {
        days: REPORT_DAYS,
        rangeStart: startISO,
        rangeEnd: endISO,
        bookingsCount: rangeBookings.length,
        bookedHours: Number(totalBooked.toFixed(1)),
        availableHours: Number(totalAvailable.toFixed(1)),
        occupancy:
          totalAvailable > 0 ? Number(((totalBooked / totalAvailable) * 100).toFixed(0)) : 0,
        spaces: reportSpaces,
      },
      timeseries,
      byStatus,
    })
  }
}
