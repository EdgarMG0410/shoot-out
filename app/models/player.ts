import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Team from '#models/team'

export default class Player extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teamId: number

  @column()
  declare name: string

  @column()
  declare number: number | null

  @column()
  declare firstName: string | null

  @column()
  declare paternalSurname: string | null

  @column()
  declare maternalSurname: string | null

  @column.date()
  declare birthdate: DateTime | null

  @column()
  declare photoUrl: string | null

  @column()
  declare phone: string | null

  /** Mini-CURP identity key (see #services/player_key). Unique across rosters. */
  @column()
  declare playerKey: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>
}
