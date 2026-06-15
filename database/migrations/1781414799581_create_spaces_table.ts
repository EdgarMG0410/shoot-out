import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A Space is any rentable area in a location: a court (cancha), an events
 * terrace (terraza), or something else (otro). All spaces can be booked by the
 * hour and can host events.
 */
export default class extends BaseSchema {
  protected tableName = 'spaces'

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
      table.enu('type', ['cancha', 'terraza', 'otro']).notNullable().defaultTo('cancha')
      table.enu('size', ['5', '7', '11']).nullable() // only meaningful for canchas
      table.decimal('price_per_hour', 10, 2).notNullable()
      table.integer('capacity').nullable()
      table.string('photo_url').nullable()
      table.enu('status', ['active', 'blocked']).notNullable().defaultTo('active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['location_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
