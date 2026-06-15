import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const createBookingValidator = vine.compile(
  vine.object({
    spaceId: vine.number().positive(),
    date: vine.string().trim().regex(DATE_RE),
    startTime: vine.string().trim().regex(TIME_RE),
    endTime: vine.string().trim().regex(TIME_RE),
  })
)

export const payBookingValidator = vine.compile(
  vine.object({
    method: vine.string().trim().minLength(2).maxLength(40).optional(),
  })
)

export const availabilityValidator = vine.compile(
  vine.object({
    date: vine.string().trim().regex(DATE_RE),
  })
)
