import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Zona = neighborhood/municipio used to search canchas by area (Centro, Zapopan…).
 */
export default class extends BaseSchema {
  protected tableName = 'locations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('zona').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('zona')
    })
  }
}
