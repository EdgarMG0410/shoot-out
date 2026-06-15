import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from '#models/location'
import Booking from '#models/booking'
import Block from '#models/block'
import Event from '#models/event'
import Match from '#models/match'

export type SpaceType = 'cancha' | 'terraza' | 'otro'
export type SpaceSize = '5' | '7' | '11'
export type SpaceStatus = 'active' | 'blocked'

const toNumber = (value: string | number | null) => (value === null ? value : Number(value))

export default class Space extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare locationId: number

  @column()
  declare name: string

  @column()
  declare type: SpaceType

  /** Football size — only meaningful for canchas. */
  @column()
  declare size: SpaceSize | null

  @column({ consume: toNumber })
  declare pricePerHour: number

  @column()
  declare capacity: number | null

  @column()
  declare photoUrl: string | null

  /** Business hours — bookings only allowed within this window. 'HH:mm'. */
  @column()
  declare openTime: string

  @column()
  declare closeTime: string

  @column()
  declare status: SpaceStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @hasMany(() => Booking)
  declare bookings: HasMany<typeof Booking>

  @hasMany(() => Block)
  declare blocks: HasMany<typeof Block>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  @hasMany(() => Match)
  declare matches: HasMany<typeof Match>
}
