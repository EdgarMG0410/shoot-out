import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Open match (partido abierto / reta) — community feature. Anyone can publish
 * "me faltan N jugadores" and others join with just their email. No login.
 */
export default class extends BaseSchema {
  protected tableName = 'open_matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('title').notNullable()
      table.string('host_name').notNullable()
      table.string('host_email').notNullable()

      table
        .integer('location_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('locations')
        .onDelete('SET NULL')
      table.string('zona').nullable()

      table.date('date').notNullable()
      table.string('start_time').notNullable()
      table.string('end_time').nullable()

      table
        .enu('level', ['principiante', 'intermedio', 'avanzado', 'mixto'])
        .notNullable()
        .defaultTo('mixto')
      table.integer('spots_total').unsigned().notNullable().defaultTo(2)
      table.string('notes').nullable()
      table.enu('status', ['open', 'full', 'closed']).notNullable().defaultTo('open')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['date'])
      table.index(['location_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
