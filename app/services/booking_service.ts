import { DateTime } from 'luxon'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Space from '#models/space'
import Booking from '#models/booking'
import Block from '#models/block'
import Event from '#models/event'
import Match from '#models/match'

/**
 * Domain error carrying an HTTP status. Controllers translate it to JSON.
 */
export class BookingError extends Exception {}

type CreateBookingInput = {
  userId: number
  spaceId: number
  date: string
  startTime: string
  endTime: string
}

/**
 * BookingService holds the booking business logic — overlap detection and
 * pricing — so it stays out of controllers and is unit-testable.
 *
 * Times are 'HH:mm'; overlap is computed in minutes. Two ranges overlap when
 * aStart < bEnd AND bStart < aEnd.
 */
export default class BookingService {
  toMinutes(time: string): number {
    const [hours, minutes] = time.split(':')
    return Number(hours) * 60 + Number(minutes)
  }

  rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    return this.toMinutes(aStart) < this.toMinutes(bEnd) && this.toMinutes(bStart) < this.toMinutes(aEnd)
  }

  durationHours(startTime: string, endTime: string): number {
    return (this.toMinutes(endTime) - this.toMinutes(startTime)) / 60
  }

  computeTotalPrice(startTime: string, endTime: string, pricePerHour: number): number {
    return Number((this.durationHours(startTime, endTime) * pricePerHour).toFixed(2))
  }

  /**
   * Occupied slots for a space on a date: bookings + blocks + scheduled events
   * + league matches (which count as court usage and block the schedule).
   */
  async getOccupiedSlots(spaceId: number, date: string) {
    const bookings = await Booking.query()
      .where('space_id', spaceId)
      .where('date', date)
      .whereIn('status', ['pending', 'confirmed'])
      .orderBy('start_time')

    const blocks = await Block.query().where('space_id', spaceId).where('date', date).orderBy('start_time')

    const events = await Event.query()
      .where('space_id', spaceId)
      .where('date', date)
      .where('status', 'scheduled')
      .orderBy('start_time')

    const matches = await Match.query()
      .where('space_id', spaceId)
      .where('date', date)
      .whereIn('status', ['scheduled', 'played'])
      .preload('homeTeam')
      .preload('awayTeam')
      .orderBy('start_time')

    return {
      bookings: bookings.map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime, status: b.status })),
      blocks: blocks.map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime, reason: b.reason })),
      events: events.map((e) => ({ id: e.id, name: e.name, startTime: e.startTime, endTime: e.endTime })),
      matches: matches.map((m) => ({
        id: m.id,
        name: `${m.homeTeam?.name ?? '—'} vs ${m.awayTeam?.name ?? '—'}`,
        startTime: m.startTime,
        endTime: m.endTime,
      })),
    }
  }

  async hasOverlap(
    spaceId: number,
    date: string,
    startTime: string,
    endTime: string,
    trx?: TransactionClientContract,
    excludeMatchId?: number
  ): Promise<boolean> {
    const bookingsQuery = Booking.query(trx ? { client: trx } : undefined)
      .where('space_id', spaceId)
      .where('date', date)
      .whereIn('status', ['pending', 'confirmed'])

    const blocksQuery = Block.query(trx ? { client: trx } : undefined)
      .where('space_id', spaceId)
      .where('date', date)

    const eventsQuery = Event.query(trx ? { client: trx } : undefined)
      .where('space_id', spaceId)
      .where('date', date)
      .where('status', 'scheduled')

    const matchesQuery = Match.query(trx ? { client: trx } : undefined)
      .where('space_id', spaceId)
      .where('date', date)
      .whereIn('status', ['scheduled', 'played'])
      .if(excludeMatchId, (q) => q.whereNot('id', excludeMatchId!))

    const [bookings, blocks, events, matches] = await Promise.all([
      bookingsQuery,
      blocksQuery,
      eventsQuery,
      matchesQuery,
    ])

    return [...bookings, ...blocks, ...events, ...matches].some((slot) =>
      this.rangesOverlap(startTime, endTime, slot.startTime, slot.endTime)
    )
  }

  /**
   * Create a booking with full validation in a transaction:
   *  - space must exist and be active
   *  - end after start
   *  - no overlap with bookings/blocks/events (row locked FOR UPDATE)
   *  - totalPrice = hours * space.pricePerHour
   */
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const { userId, spaceId, date, startTime, endTime } = input

    if (this.toMinutes(endTime) <= this.toMinutes(startTime)) {
      throw new BookingError('endTime must be after startTime', { status: 422, code: 'E_INVALID_RANGE' })
    }

    return db.transaction(async (trx) => {
      const space = await Space.query({ client: trx }).where('id', spaceId).forUpdate().first()
      if (!space) {
        throw new BookingError('Space not found', { status: 404, code: 'E_SPACE_NOT_FOUND' })
      }
      if (space.status !== 'active') {
        throw new BookingError('Space is not available for booking', { status: 422, code: 'E_SPACE_BLOCKED' })
      }

      if (
        this.toMinutes(startTime) < this.toMinutes(space.openTime) ||
        this.toMinutes(endTime) > this.toMinutes(space.closeTime)
      ) {
        throw new BookingError(
          `El horario debe estar entre ${space.openTime} y ${space.closeTime}`,
          { status: 422, code: 'E_OUTSIDE_HOURS' }
        )
      }

      const overlap = await this.hasOverlap(spaceId, date, startTime, endTime, trx)
      if (overlap) {
        throw new BookingError('Requested time range overlaps an existing booking, block or event', {
          status: 409,
          code: 'E_OVERLAP',
        })
      }

      const totalPrice = this.computeTotalPrice(startTime, endTime, space.pricePerHour)

      return Booking.create(
        { userId, spaceId, date: DateTime.fromISO(date), startTime, endTime, status: 'pending', totalPrice },
        { client: trx }
      )
    })
  }
}
