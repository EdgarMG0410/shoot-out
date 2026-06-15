import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const createBlockValidator = vine.compile(
  vine.object({
    date: vine.string().trim().regex(DATE_RE),
    startTime: vine.string().trim().regex(TIME_RE),
    endTime: vine.string().trim().regex(TIME_RE),
    reason: vine.string().trim().maxLength(160).nullable().optional(),
  })
)
