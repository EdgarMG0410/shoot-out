import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import League from '#models/league'
import Space from '#models/space'
import Team from '#models/team'
import MatchEvent from '#models/match_event'

export type MatchStatus = 'scheduled' | 'played' | 'cancelled'

const toHHmm = (value: string | null) => (value ? value.slice(0, 5) : value)

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leagueId: number

  @column()
  declare spaceId: number

  @column()
  declare homeTeamId: number

  @column()
  declare awayTeamId: number

  @column.date()
  declare date: DateTime

  @column({ consume: toHHmm })
  declare startTime: string

  @column({ consume: toHHmm })
  declare endTime: string

  @column()
  declare status: MatchStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => League)
  declare league: BelongsTo<typeof League>

  @belongsTo(() => Space)
  declare space: BelongsTo<typeof Space>

  @belongsTo(() => Team, { foreignKey: 'homeTeamId' })
  declare homeTeam: BelongsTo<typeof Team>

  @belongsTo(() => Team, { foreignKey: 'awayTeamId' })
  declare awayTeam: BelongsTo<typeof Team>

  @hasMany(() => MatchEvent)
  declare events: HasMany<typeof MatchEvent>
}
