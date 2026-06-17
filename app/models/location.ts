import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Space from '#models/space'
import Event from '#models/event'
import League from '#models/league'

export type LocationStatus = 'active' | 'inactive'

export default class Location extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare address: string

  /** Neighborhood/municipio used to filter canchas by area. */
  @column()
  declare zona: string | null

  @column()
  declare phone: string | null

  @column()
  declare photoUrl: string | null

  @column()
  declare status: LocationStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Space)
  declare spaces: HasMany<typeof Space>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  @hasMany(() => League)
  declare leagues: HasMany<typeof League>
}
