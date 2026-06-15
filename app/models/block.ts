import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Space from '#models/space'
import User from '#models/user'

const toHHmm = (value: string | null) => (value ? value.slice(0, 5) : value)

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare spaceId: number

  @column()
  declare createdBy: number | null

  @column.date()
  declare date: DateTime

  @column({ consume: toHHmm })
  declare startTime: string

  @column({ consume: toHHmm })
  declare endTime: string

  @column()
  declare reason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Space)
  declare space: BelongsTo<typeof Space>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}
