import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Space from '#models/space'
import Payment from '#models/payment'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

const toNumber = (value: string | number | null) => (value === null ? value : Number(value))
const toHHmm = (value: string | null) => (value ? value.slice(0, 5) : value)

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare spaceId: number

  @column()
  declare userId: number

  @column.date()
  declare date: DateTime

  @column({ consume: toHHmm })
  declare startTime: string

  @column({ consume: toHHmm })
  declare endTime: string

  @column()
  declare status: BookingStatus

  @column({ consume: toNumber })
  declare totalPrice: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Space)
  declare space: BelongsTo<typeof Space>

  @hasOne(() => Payment)
  declare payment: HasOne<typeof Payment>
}
