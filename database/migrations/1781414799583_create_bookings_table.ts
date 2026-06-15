import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

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
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.date('date').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.enu('status', ['pending', 'confirmed', 'cancelled']).notNullable().defaultTo('pending')
      table.decimal('total_price', 10, 2).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['space_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
