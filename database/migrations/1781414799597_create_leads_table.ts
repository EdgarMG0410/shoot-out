import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Landing lead capture (formulario para captar interesados): players who want
 * to reserve and court owners who want to register their cancha with Futhub.
 */
export default class extends BaseSchema {
  protected tableName = 'leads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.enu('type', ['jugador', 'cancha']).notNullable().defaultTo('jugador')
      table.string('message').nullable()

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
