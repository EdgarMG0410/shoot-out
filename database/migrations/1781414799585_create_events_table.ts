import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * An organized booking (tournament, party, class) on a specific space.
 * It blocks that space's time slot.
 */
export default class extends BaseSchema {
  protected tableName = 'events'

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
      table
        .integer('space_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('spaces')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.text('description').nullable()
      table.date('date').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.integer('capacity').nullable()
      table.decimal('price', 10, 2).nullable()
      table.enu('status', ['scheduled', 'cancelled']).notNullable().defaultTo('scheduled')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['space_id', 'date'])
      table.index(['location_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
