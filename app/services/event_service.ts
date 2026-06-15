import { DateTime } from 'luxon'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Space from '#models/space'
import Booking from '#models/booking'
import Block from '#models/block'
import Event from '#models/event'
import BookingService from '#services/booking_service'

export class EventError extends Exception {}

export type EventInput = {
  spaceId: number
  name: string
  description?: string | null
  date: string
  startTime: string
  endTime: string
  capacity?: number | null
  price?: number | null
  status?: 'scheduled' | 'cancelled'
}

/**
 * EventService owns event scheduling. An event targets one space and conflicts
 * with bookings, blocks and other scheduled events on that space.
 */
export default class EventService {
  private time = new BookingService()

  async spaceHasOverlap(
    spaceId: number,
    date: string,
    startTime: string,
    endTime: string,
    trx?: TransactionClientContract,
    excludeEventId?: number
  ): Promise<boolean> {
    const eventsQuery = Event.query(trx ? { client: trx } : undefined)
      .where('space_id', spaceId)
      .where('date', date)
      .where('status', 'scheduled')
    if (excludeEventId) eventsQuery.whereNot('id', excludeEventId)

    const [bookings, blocks, events] = await Promise.all([
      Booking.query(trx ? { client: trx } : undefined)
        .where('space_id', spaceId)
        .where('date', date)
        .whereIn('status', ['pending', 'confirmed']),
      Block.query(trx ? { client: trx } : undefined).where('space_id', spaceId).where('date', date),
      eventsQuery,
    ])

    return [...bookings, ...blocks, ...events].some((s) =>
      this.time.rangesOverlap(startTime, endTime, s.startTime, s.endTime)
    )
  }

  private assertValid(input: EventInput) {
    if (this.time.toMinutes(input.endTime) <= this.time.toMinutes(input.startTime)) {
      throw new EventError('endTime must be after startTime', { status: 422, code: 'E_INVALID_RANGE' })
    }
  }

  async createEvent(input: EventInput): Promise<Event> {
    this.assertValid(input)

    return db.transaction(async (trx) => {
      const space = await Space.query({ client: trx }).where('id', input.spaceId).first()
      if (!space) throw new EventError('Space not found', { status: 404, code: 'E_SPACE_NOT_FOUND' })

      const overlap = await this.spaceHasOverlap(input.spaceId, input.date, input.startTime, input.endTime, trx)
      if (overlap) {
        throw new EventError('Event time overlaps a booking, block or another event', {
          status: 409,
          code: 'E_OVERLAP',
        })
      }

      return Event.create(
        {
          locationId: space.locationId,
          spaceId: input.spaceId,
          name: input.name,
          description: input.description ?? null,
          date: DateTime.fromISO(input.date),
          startTime: input.startTime,
          endTime: input.endTime,
          capacity: input.capacity ?? null,
          price: input.price ?? null,
          status: input.status ?? 'scheduled',
        },
        { client: trx }
      )
    })
  }

  async updateEvent(event: Event, input: EventInput): Promise<Event> {
    this.assertValid(input)

    return db.transaction(async (trx) => {
      event.useTransaction(trx)
      const space = await Space.query({ client: trx }).where('id', input.spaceId).first()
      if (!space) throw new EventError('Space not found', { status: 404, code: 'E_SPACE_NOT_FOUND' })

      const overlap = await this.spaceHasOverlap(
        input.spaceId,
        input.date,
        input.startTime,
        input.endTime,
        trx,
        event.id
      )
      if (overlap) {
        throw new EventError('Event time overlaps a booking, block or another event', {
          status: 409,
          code: 'E_OVERLAP',
        })
      }

      event.merge({
        locationId: space.locationId,
        spaceId: input.spaceId,
        name: input.name,
        description: input.description ?? null,
        date: DateTime.fromISO(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        capacity: input.capacity ?? null,
        price: input.price ?? null,
        status: input.status ?? event.status,
      })
      await event.save()
      return event
    })
  }
}
