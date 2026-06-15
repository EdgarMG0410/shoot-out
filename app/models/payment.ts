import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Booking from '#models/booking'

const toNumber = (value: string | number | null) => (value === null ? value : Number(value))

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare bookingId: number

  @column({ consume: toNumber })
  declare amount: number

  @column()
  declare status: string

  @column()
  declare method: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Booking)
  declare booking: BelongsTo<typeof Booking>
}
