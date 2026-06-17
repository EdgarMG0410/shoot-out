import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type LeadType = 'jugador' | 'cancha'

/** Landing lead — an interested player or court owner (captar interesados). */
export default class Lead extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare type: LeadType

  @column()
  declare message: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
