import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Backfills legacy players that predate the identity fields: splits the single
 * `name` into nombre / apellido paterno / apellido materno and assigns a
 * player_key. Legacy rows have no birthdate, so the key's date block is 000000
 * (a placeholder) — editing the player to add a real birthdate mints a proper
 * key (see DashboardPlayersController.update). Non-destructive and idempotent:
 * only touches players whose player_key is still null.
 */
export default class BackfillPlayers extends BaseCommand {
  static commandName = 'players:backfill'
  static description = 'Split legacy player names and assign a player_key (non-destructive)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: Player } = await import('#models/player')
    const { generatePlayerKey } = await import('#services/player_key')

    const players = await Player.query().whereNull('player_key')
    let done = 0

    for (const p of players) {
      const { firstName, paternalSurname, maternalSurname } = splitName(p.name)
      p.firstName = firstName
      p.paternalSurname = paternalSurname
      p.maternalSurname = maternalSurname
      p.playerKey = await generatePlayerKey(
        paternalSurname ?? '',
        maternalSurname ?? '',
        firstName ?? p.name,
        '0000-00-00' // unknown DOB → 000000 date block, replaced on first edit
      )
      await p.save()
      done++
    }

    this.logger.success(`Backfill listo. ${done} jugadores con nombre dividido + player_key.`)
  }
}

/**
 * Best-effort split of a Mexican full name. The last two tokens are taken as the
 * two surnames; everything before is the given name(s). Admins can correct any
 * mis-split via the edit dialog.
 */
function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: null, paternalSurname: null, maternalSurname: null }
  if (parts.length === 1) return { firstName: parts[0], paternalSurname: null, maternalSurname: null }
  if (parts.length === 2)
    return { firstName: parts[0], paternalSurname: parts[1], maternalSurname: null }
  return {
    firstName: parts.slice(0, -2).join(' '),
    paternalSurname: parts[parts.length - 2],
    maternalSurname: parts[parts.length - 1],
  }
}
