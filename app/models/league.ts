import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from '#models/location'
import Team from '#models/team'
import Match from '#models/match'

export type LeagueStatus = 'active' | 'finished'

export default class League extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare locationId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.date()
  declare seasonStart: DateTime | null

  @column.date()
  declare seasonEnd: DateTime | null

  @column()
  declare status: LeagueStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @hasMany(() => Team)
  declare teams: HasMany<typeof Team>

  @hasMany(() => Match)
  declare matches: HasMany<typeof Match>
}
