import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const STATUS = ['scheduled', 'played', 'cancelled'] as const
const EVENT_TYPE = ['goal', 'yellow', 'red'] as const

export const createMatchValidator = vine.compile(
  vine.object({
    spaceId: vine.number().positive(),
    homeTeamId: vine.number().positive(),
    awayTeamId: vine.number().positive(),
    date: vine.string().trim().regex(DATE_RE),
    startTime: vine.string().trim().regex(TIME_RE),
    endTime: vine.string().trim().regex(TIME_RE),
  })
)

export const updateMatchValidator = vine.compile(
  vine.object({
    spaceId: vine.number().positive().optional(),
    homeTeamId: vine.number().positive().optional(),
    awayTeamId: vine.number().positive().optional(),
    date: vine.string().trim().regex(DATE_RE).optional(),
    startTime: vine.string().trim().regex(TIME_RE).optional(),
    endTime: vine.string().trim().regex(TIME_RE).optional(),
    status: vine.enum(STATUS).optional(),
  })
)

export const createMatchEventValidator = vine.compile(
  vine.object({
    teamId: vine.number().positive(),
    playerId: vine.number().positive().nullable().optional(),
    type: vine.enum(EVENT_TYPE),
    minute: vine.number().min(0).max(200).nullable().optional(),
  })
)
