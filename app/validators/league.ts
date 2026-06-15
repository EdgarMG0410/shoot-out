import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUS = ['active', 'finished'] as const

export const createLeagueValidator = vine.compile(
  vine.object({
    locationId: vine.number().positive(),
    name: vine.string().trim().minLength(2).maxLength(120),
    description: vine.string().trim().maxLength(280).nullable().optional(),
    seasonStart: vine.string().trim().regex(DATE_RE).nullable().optional(),
    seasonEnd: vine.string().trim().regex(DATE_RE).nullable().optional(),
    status: vine.enum(STATUS).optional(),
  })
)

export const updateLeagueValidator = vine.compile(
  vine.object({
    locationId: vine.number().positive().optional(),
    name: vine.string().trim().minLength(2).maxLength(120).optional(),
    description: vine.string().trim().maxLength(280).nullable().optional(),
    seasonStart: vine.string().trim().regex(DATE_RE).nullable().optional(),
    seasonEnd: vine.string().trim().regex(DATE_RE).nullable().optional(),
    status: vine.enum(STATUS).optional(),
  })
)

export const createTeamValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(120),
    logoUrl: vine.string().trim().url().nullable().optional(),
  })
)

export const updateTeamValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(120).optional(),
    logoUrl: vine.string().trim().url().nullable().optional(),
  })
)

export const createPlayerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(120),
    number: vine.number().min(0).max(999).nullable().optional(),
  })
)

export const updatePlayerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(120).optional(),
    number: vine.number().min(0).max(999).nullable().optional(),
  })
)
