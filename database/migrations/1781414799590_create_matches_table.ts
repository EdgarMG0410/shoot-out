import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A scheduled league match on a Space (cancha). Counts as court usage: it is
 * included in the booking overlap check, so it blocks that time window.
 * The score is derived from goal events (match_events).
 */
export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('league_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('leagues')
        .onDelete('CASCADE')
      table
        .integer('space_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('spaces')
        .onDelete('CASCADE')
      table
        .integer('home_team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')
      table
        .integer('away_team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')

      table.date('date').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.enu('status', ['scheduled', 'played', 'cancelled']).notNullable().defaultTo('scheduled')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['space_id', 'date'])
      table.index(['league_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
