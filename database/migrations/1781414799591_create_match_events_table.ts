import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * The match minute (minuta) the admin uploads: goals and cards, each tied to a
 * team and (optionally) a roster player. Goals drive the score and stats.
 */
export default class extends BaseSchema {
  protected tableName = 'match_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('matches')
        .onDelete('CASCADE')
      table
        .integer('team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')
      table
        .integer('player_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('players')
        .onDelete('SET NULL')

      table.enu('type', ['goal', 'yellow', 'red']).notNullable()
      table.integer('minute').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['match_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
