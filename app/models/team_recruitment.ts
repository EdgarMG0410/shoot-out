import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { MatchLevel } from '#models/open_match'

export type RecruitmentStatus = 'open' | 'closed'

/** "Equipos buscando jugadores" — a community recruitment post. */
export default class TeamRecruitment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teamName: string

  @column()
  declare contactName: string

  @column()
  declare contactEmail: string

  @column()
  declare zona: string | null

  @column()
  declare level: MatchLevel

  @column()
  declare positionsNeeded: string | null

  @column()
  declare notes: string | null

  @column()
  declare status: RecruitmentStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
