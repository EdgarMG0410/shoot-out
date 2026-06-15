import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Admin-created unavailability windows on a space. Kept separate from bookings
 * so the bookings domain stays clean; the overlap check considers both.
 */
export default class extends BaseSchema {
  protected tableName = 'blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('space_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('spaces')
        .onDelete('CASCADE')
      table
        .integer('created_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.date('date').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.string('reason').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['space_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
