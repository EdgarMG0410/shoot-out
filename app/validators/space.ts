import vine from '@vinejs/vine'

const TYPES = ['cancha', 'terraza', 'otro'] as const
const SIZES = ['5', '7', '11'] as const
const STATUS = ['active', 'blocked'] as const
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const createSpaceValidator = vine.compile(
  vine.object({
    locationId: vine.number().positive(),
    name: vine.string().trim().minLength(2).maxLength(120),
    type: vine.enum(TYPES),
    size: vine.enum(SIZES).nullable().optional(),
    pricePerHour: vine.number().positive(),
    capacity: vine.number().positive().nullable().optional(),
    photoUrl: vine.string().trim().url().nullable().optional(),
    openTime: vine.string().trim().regex(TIME_RE).optional(),
    closeTime: vine.string().trim().regex(TIME_RE).optional(),
    status: vine.enum(STATUS).optional(),
  })
)

export const updateSpaceValidator = vine.compile(
  vine.object({
    locationId: vine.number().positive().optional(),
    name: vine.string().trim().minLength(2).maxLength(120).optional(),
    type: vine.enum(TYPES).optional(),
    size: vine.enum(SIZES).nullable().optional(),
    pricePerHour: vine.number().positive().optional(),
    capacity: vine.number().positive().nullable().optional(),
    photoUrl: vine.string().trim().url().nullable().optional(),
    openTime: vine.string().trim().regex(TIME_RE).optional(),
    closeTime: vine.string().trim().regex(TIME_RE).optional(),
    status: vine.enum(STATUS).optional(),
  })
)
