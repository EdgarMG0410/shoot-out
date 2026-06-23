import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'players'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Foto visible de cara — required at the app level, nullable here so the
      // column can be added to any pre-existing rows without backfilling first.
      table.string('photo_url', 1024).nullable()

      // Structured name parts feed the player_key (mini-CURP) generator.
      table.string('first_name', 80).nullable()
      table.string('paternal_surname', 80).nullable()
      table.string('maternal_surname', 80).nullable()

      table.date('birthdate').nullable()

      // Optional now, but doubles as a future identity match key.
      table.string('phone', 32).nullable()

      // Mini-CURP (10 chars: name initials + birthdate) + 3-char homoclave.
      // Unique across the whole roster so the same person isn't double-registered.
      // Nullable + unique: Postgres allows many NULLs, so legacy rows are fine.
      table.string('player_key', 16).nullable().unique()

      table.index(['phone'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photo_url')
      table.dropColumn('first_name')
      table.dropColumn('paternal_surname')
      table.dropColumn('maternal_surname')
      table.dropColumn('birthdate')
      table.dropColumn('phone')
      table.dropColumn('player_key')
    })
  }
}
