import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Match from '#models/match'
import Team from '#models/team'
import Player from '#models/player'

export type MatchEventType = 'goal' | 'yellow' | 'red'

export default class MatchEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare matchId: number

  @column()
  declare teamId: number

  @column()
  declare playerId: number | null

  @column()
  declare type: MatchEventType

  @column()
  declare minute: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Match)
  declare match: BelongsTo<typeof Match>

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => Player)
  declare player: BelongsTo<typeof Player>
}
