import vine from '@vinejs/vine'

const STATUS = ['active', 'inactive'] as const

export const createLocationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    address: vine.string().trim().minLength(2).maxLength(200),
    phone: vine.string().trim().maxLength(40).nullable().optional(),
    photoUrl: vine.string().trim().url().nullable().optional(),
    status: vine.enum(STATUS).optional(),
  })
)

export const updateLocationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120).optional(),
    address: vine.string().trim().minLength(2).maxLength(200).optional(),
    phone: vine.string().trim().maxLength(40).nullable().optional(),
    photoUrl: vine.string().trim().url().nullable().optional(),
    status: vine.enum(STATUS).optional(),
  })
)
