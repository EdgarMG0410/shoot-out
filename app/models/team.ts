import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import League from '#models/league'
import Player from '#models/player'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leagueId: number

  @column()
  declare name: string

  @column()
  declare logoUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => League)
  declare league: BelongsTo<typeof League>

  @hasMany(() => Player)
  declare players: HasMany<typeof Player>
}
