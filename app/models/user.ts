import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { AccessToken } from '@adonisjs/auth/access_tokens'
import Booking from '#models/booking'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export type UserRole = 'admin' | 'user'
export type RenterType = 'particular' | 'liga' | 'empresa' | 'evento' | 'otro'

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  /**
   * For renters (role 'user'): individual, league, company, event, other.
   */
  @column()
  declare renterType: RenterType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Booking)
  declare bookings: HasMany<typeof Booking>

  /**
   * Set by the access-tokens guard after authentication (used on logout).
   */
  declare currentAccessToken: AccessToken

  /**
   * Tokens provider used by the `api` guard (mobile app).
   */
  static accessTokens = DbAccessTokensProvider.forModel(User)
}
