import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * "Equipos buscando jugadores" — a simple recruitment post for the community.
 */
export default class extends BaseSchema {
  protected tableName = 'team_recruitments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('team_name').notNullable()
      table.string('contact_name').notNullable()
      table.string('contact_email').notNullable()
      table.string('zona').nullable()
      table
        .enu('level', ['principiante', 'intermedio', 'avanzado', 'mixto'])
        .notNullable()
        .defaultTo('mixto')
      table.string('positions_needed').nullable()
      table.string('notes').nullable()
      table.enu('status', ['open', 'closed']).notNullable().defaultTo('open')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
