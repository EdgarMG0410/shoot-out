import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A player who joined an open match ("quiero jugar"). Email-only, no account.
 */
export default class extends BaseSchema {
  protected tableName = 'open_match_players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('open_match_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('open_matches')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('position').nullable()

      table.timestamp('created_at').notNullable()

      table.unique(['open_match_id', 'email'])
      table.index(['open_match_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
