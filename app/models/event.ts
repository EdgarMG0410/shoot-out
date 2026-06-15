import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Location from '#models/location'
import Space from '#models/space'

export type EventStatus = 'scheduled' | 'cancelled'

const toNumber = (value: string | number | null) => (value === null ? value : Number(value))
const toHHmm = (value: string | null) => (value ? value.slice(0, 5) : value)

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare locationId: number

  @column()
  declare spaceId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.date()
  declare date: DateTime

  @column({ consume: toHHmm })
  declare startTime: string

  @column({ consume: toHHmm })
  declare endTime: string

  @column()
  declare capacity: number | null

  @column({ consume: toNumber })
  declare price: number | null

  @column()
  declare status: EventStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @belongsTo(() => Space)
  declare space: BelongsTo<typeof Space>
}
