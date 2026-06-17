import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type PlayerLevel = 'principiante' | 'intermedio' | 'avanzado'

/** Community player card. Email is the identity (one profile per email). */
export default class PlayerProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare position: string | null

  @column()
  declare level: PlayerLevel

  @column()
  declare zona: string | null

  @column()
  declare phone: string | null

  @column()
  declare photoUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
