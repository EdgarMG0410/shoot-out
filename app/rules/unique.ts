import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import type { FieldContext } from '@vinejs/vine/types'

type Options = {
  table: string
  column: string
}

/**
 * Reusable VineJS rule: fails validation if `value` already exists in
 * `table.column`. Lets uniqueness live in the validator layer.
 */
async function unique(value: unknown, options: Options, field: FieldContext) {
  if (typeof value !== 'string') return

  const row = await db.from(options.table).where(options.column, value).select(options.column).first()
  if (row) {
    field.report('The {{ field }} has already been taken', 'unique', field)
  }
}

export const uniqueRule = vine.createRule(unique)
