import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const STATUS = ['scheduled', 'cancelled'] as const

export const eventValidator = vine.compile(
  vine.object({
    spaceId: vine.number().positive(),
    name: vine.string().trim().minLength(2).maxLength(120),
    description: vine.string().trim().maxLength(500).nullable().optional(),
    date: vine.string().trim().regex(DATE_RE),
    startTime: vine.string().trim().regex(TIME_RE),
    endTime: vine.string().trim().regex(TIME_RE),
    capacity: vine.number().positive().nullable().optional(),
    price: vine.number().positive().nullable().optional(),
    status: vine.enum(STATUS).optional(),
  })
)
