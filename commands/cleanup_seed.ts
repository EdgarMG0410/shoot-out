import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Removes the demo/seeder content created by database/seeders/main_seeder.ts:
 * the five demo leagues (with their teams, players, matches, events) and the
 * comunidad demo rows. Locations, spaces and users are LEFT ALONE — those are
 * the real pilot-tenant catalog, not throwaway data.
 *
 * Dry-run by default (prints what it would delete). Pass --force to execute.
 */
const SEED_LEAGUES = [
  'Liga Amateur GDL',
  'Copa Zapopan 7v7',
  'Liga Sur Dominical',
  'Liga Centro Sabatina',
  'Copa Norte Dominical',
]
const SEED_OPEN_MATCHES = ['Reta 5v5 — nos faltan 3', 'Cascarita dominical 7v7']
const SEED_PROFILE_EMAILS = ['ivan@demo.mx', 'pepe@demo.mx', 'saul@demo.mx']
const SEED_RECRUIT_EMAILS = ['halcones@demo.mx']
const SEED_EVENTS = ['Torneo Relámpago 5v5', 'Fiesta de fin de torneo']

export default class CleanupSeed extends BaseCommand {
  static commandName = 'players:cleanup-seed'
  static description = 'Delete demo/seeder leagues + comunidad data (locations/spaces/users untouched)'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Actually delete. Without it, runs as a dry-run.' })
  declare force: boolean

  async run() {
    const { default: League } = await import('#models/league')
    const { default: Team } = await import('#models/team')
    const { default: Player } = await import('#models/player')
    const { default: Match } = await import('#models/match')
    const { default: MatchEvent } = await import('#models/match_event')
    const { default: OpenMatch } = await import('#models/open_match')
    const { default: PlayerProfile } = await import('#models/player_profile')
    const { default: TeamRecruitment } = await import('#models/team_recruitment')
    const { default: Event } = await import('#models/event')

    const dry = !this.force
    const tag = dry ? '[dry-run]' : '[borrando]'

    const leagues = await League.query().whereIn('name', SEED_LEAGUES)
    for (const league of leagues) {
      const teams = await Team.query().where('league_id', league.id)
      const teamIds = teams.map((t) => t.id)
      const matches = await Match.query().where('league_id', league.id)
      const matchIds = matches.map((m) => m.id)
      const players = teamIds.length
        ? Number(
            (await Player.query().whereIn('team_id', teamIds).count('* as c').first())?.$extras.c ??
              0
          )
        : 0

      this.logger.info(
        `${tag} Liga "${league.name}" → ${teams.length} equipos, ${players} jugadores, ${matches.length} partidos`
      )

      if (!dry) {
        if (matchIds.length) await MatchEvent.query().whereIn('match_id', matchIds).delete()
        await Match.query().where('league_id', league.id).delete()
        if (teamIds.length) await Player.query().whereIn('team_id', teamIds).delete()
        await Team.query().where('league_id', league.id).delete()
        await league.delete()
      }
    }

    const oms = await OpenMatch.query().whereIn('title', SEED_OPEN_MATCHES)
    this.logger.info(`${tag} ${oms.length} retas comunidad`)
    if (!dry) for (const om of oms) await om.delete() // cascades open_match_players

    const profs = await PlayerProfile.query().whereIn('email', SEED_PROFILE_EMAILS)
    this.logger.info(`${tag} ${profs.length} perfiles comunidad`)
    if (!dry && profs.length)
      await PlayerProfile.query().whereIn('email', SEED_PROFILE_EMAILS).delete()

    const recs = await TeamRecruitment.query().whereIn('contact_email', SEED_RECRUIT_EMAILS)
    this.logger.info(`${tag} ${recs.length} reclutamientos comunidad`)
    if (!dry && recs.length)
      await TeamRecruitment.query().whereIn('contact_email', SEED_RECRUIT_EMAILS).delete()

    const evs = await Event.query().whereIn('name', SEED_EVENTS)
    this.logger.info(`${tag} ${evs.length} eventos demo`)
    if (!dry && evs.length) await Event.query().whereIn('name', SEED_EVENTS).delete()

    if (dry) {
      this.logger.warning('Dry-run: nada borrado. Vuelve a correr con --force para ejecutar.')
    } else {
      this.logger.success('Limpieza de datos sembrados completada.')
    }
  }
}
