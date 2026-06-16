import vine from '@vinejs/vine'
import { uniqueRule } from '#rules/unique'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120),
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(254)
      .use(uniqueRule({ table: 'users', column: 'email' })),
    password: vine.string().minLength(6).maxLength(120),
    renterType: vine.enum(['particular', 'liga', 'empresa', 'evento', 'otro']).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
)

/** Renter passwordless access — identified only by email. */
export const accessValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().maxLength(254),
    fullName: vine.string().trim().minLength(2).maxLength(120).nullable().optional(),
  })
)
