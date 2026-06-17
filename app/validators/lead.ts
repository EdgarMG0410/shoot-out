import vine from '@vinejs/vine'

const LEAD_TYPE = ['jugador', 'cancha'] as const

export const createLeadValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(180),
    phone: vine.string().trim().maxLength(40).nullable().optional(),
    type: vine.enum(LEAD_TYPE),
    message: vine.string().trim().maxLength(280).nullable().optional(),
  })
)
