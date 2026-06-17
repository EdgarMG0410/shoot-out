import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Community player card — name, position, level and zona. Email is the identity
 * (one profile per email), consistent with the email-only product direction.
 */
export default class extends BaseSchema {
  protected tableName = 'player_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('position').nullable()
      table
        .enu('level', ['principiante', 'intermedio', 'avanzado'])
        .notNullable()
        .defaultTo('intermedio')
      table.string('zona').nullable()
      table.string('phone').nullable()
      table.string('photo_url').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
