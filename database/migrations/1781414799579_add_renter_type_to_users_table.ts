import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A user with role 'user' is a *renter* (rentador) — who can be an individual,
 * a league, a company or an event organizer. renterType captures that nature.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enu('renter_type', ['particular', 'liga', 'empresa', 'evento', 'otro'])
        .notNullable()
        .defaultTo('particular')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('renter_type')
    })
  }
}
