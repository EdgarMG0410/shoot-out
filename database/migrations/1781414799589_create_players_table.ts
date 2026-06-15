import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.integer('number').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['team_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
