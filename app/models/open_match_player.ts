import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OpenMatch from '#models/open_match'

/** A player who joined an open match. Email-only, no account. */
export default class OpenMatchPlayer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare openMatchId: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare position: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => OpenMatch)
  declare openMatch: BelongsTo<typeof OpenMatch>
}
