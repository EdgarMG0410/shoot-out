import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('league_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('leagues')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('logo_url').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['league_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
