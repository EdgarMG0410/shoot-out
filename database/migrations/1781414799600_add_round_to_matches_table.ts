import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Jornada (matchday) a match belongs to. Nullable: legacy/manual matches may
 * have none. FixtureService stamps it per round; admins can set it manually.
 */
export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('round').unsigned().nullable().after('status')
      table.index(['league_id', 'round'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['league_id', 'round'])
      table.dropColumn('round')
    })
  }
}
