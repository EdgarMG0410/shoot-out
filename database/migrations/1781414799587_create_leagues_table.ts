import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A League lives in a Location and groups teams + scheduled matches. Each match
 * is played on a Space (cancha) and blocks that court's schedule.
 */
export default class extends BaseSchema {
  protected tableName = 'leagues'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('location_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('locations')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('description').nullable()
      table.date('season_start').nullable()
      table.date('season_end').nullable()
      table.enu('status', ['active', 'finished']).notNullable().defaultTo('active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['location_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
