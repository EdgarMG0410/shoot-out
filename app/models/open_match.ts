import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from '#models/location'
import OpenMatchPlayer from '#models/open_match_player'

export type MatchLevel = 'principiante' | 'intermedio' | 'avanzado' | 'mixto'
export type OpenMatchStatus = 'open' | 'full' | 'closed'

/**
 * Partido abierto (reta). Published by anyone with just an email; other players
 * join via OpenMatchPlayer. `spotsTotal` is how many players are wanted.
 */
export default class OpenMatch extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare hostName: string

  @column()
  declare hostEmail: string

  @column()
  declare locationId: number | null

  @column()
  declare zona: string | null

  @column.date()
  declare date: DateTime | null

  @column()
  declare startTime: string

  @column()
  declare endTime: string | null

  @column()
  declare level: MatchLevel

  @column()
  declare spotsTotal: number

  @column()
  declare notes: string | null

  @column()
  declare status: OpenMatchStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @hasMany(() => OpenMatchPlayer)
  declare players: HasMany<typeof OpenMatchPlayer>
}
