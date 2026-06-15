import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Business hours per space: bookings are only allowed between open_time and
 * close_time. Stored as 'HH:mm' strings to match the booking time handling.
 */
export default class extends BaseSchema {
  protected tableName = 'spaces'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('open_time', 5).notNullable().defaultTo('08:00')
      table.string('close_time', 5).notNullable().defaultTo('22:00')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('open_time')
      table.dropColumn('close_time')
    })
  }
}
