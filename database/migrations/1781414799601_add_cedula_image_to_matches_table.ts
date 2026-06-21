import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Optional scanned/photo image of the physical cédula (match sheet), stored as
 * a public URL (Supabase Storage). Nullable — uploading is optional.
 */
export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cedula_image_url', 1024).nullable().after('round')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cedula_image_url')
    })
  }
}
