import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Location = a venue/sede that holds 1-2 courts and, sometimes, an events terrace.
 */
export default class extends BaseSchema {
  protected tableName = 'locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('address').notNullable()
      table.string('phone').nullable()
      table.string('photo_url').nullable()
      table.enu('status', ['active', 'inactive']).notNullable().defaultTo('active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
