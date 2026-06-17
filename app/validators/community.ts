import vine from '@vinejs/vine'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/
const MATCH_LEVEL = ['principiante', 'intermedio', 'avanzado', 'mixto'] as const
const PLAYER_LEVEL = ['principiante', 'intermedio', 'avanzado'] as const

export const createOpenMatchValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(120),
    hostName: vine.string().trim().minLength(2).maxLength(120),
    hostEmail: vine.string().trim().email().maxLength(180),
    locationId: vine.number().positive().nullable().optional(),
    zona: vine.string().trim().maxLength(120).nullable().optional(),
    date: vine.string().trim().regex(DATE_RE),
    startTime: vine.string().trim().regex(TIME_RE),
    endTime: vine.string().trim().regex(TIME_RE).nullable().optional(),
    level: vine.enum(MATCH_LEVEL).optional(),
    spotsTotal: vine.number().min(1).max(22),
    notes: vine.string().trim().maxLength(280).nullable().optional(),
  })
)

export const joinOpenMatchValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(180),
    position: vine.string().trim().maxLength(60).nullable().optional(),
  })
)

export const upsertPlayerProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(180),
    position: vine.string().trim().maxLength(60).nullable().optional(),
    level: vine.enum(PLAYER_LEVEL).optional(),
    zona: vine.string().trim().maxLength(120).nullable().optional(),
    phone: vine.string().trim().maxLength(40).nullable().optional(),
  })
)

export const createTeamRecruitmentValidator = vine.compile(
  vine.object({
    teamName: vine.string().trim().minLength(2).maxLength(120),
    contactName: vine.string().trim().minLength(2).maxLength(120),
    contactEmail: vine.string().trim().email().maxLength(180),
    zona: vine.string().trim().maxLength(120).nullable().optional(),
    level: vine.enum(MATCH_LEVEL).optional(),
    positionsNeeded: vine.string().trim().maxLength(160).nullable().optional(),
    notes: vine.string().trim().maxLength(280).nullable().optional(),
  })
)
