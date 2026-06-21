import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Assigns a jornada (round) to existing matches that have none, grouping by
 * match date per league. Non-destructive: only touches matches where round is
 * null, never overwrites a round already set. Safe to run on real data and to
 * re-run (idempotent).
 */
export default class BackfillRounds extends BaseCommand {
  static commandName = 'matches:backfill-rounds'
  static description = 'Assign a jornada by date to matches that have none (non-destructive)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: League } = await import('#models/league')
    const { default: Match } = await import('#models/match')

    const leagues = await League.query().orderBy('id')
    let updated = 0

    for (const league of leagues) {
      const matches = await Match.query()
        .where('league_id', league.id)
        .orderBy('date')
        .orderBy('start_time')

      // Seed date -> round from matches that already have one, so backfilled
      // matches share the round of same-day games.
      const dateRound = new Map<string, number>()
      let maxRound = 0
      for (const m of matches) {
        if (m.round == null) continue
        const key = m.date?.toISODate() ?? ''
        if (!dateRound.has(key)) dateRound.set(key, m.round)
        if (m.round > maxRound) maxRound = m.round
      }

      // Assign new sequential rounds to remaining dates, in chronological order.
      const pending = matches.filter((m) => m.round == null)
      const newDates = [...new Set(pending.map((m) => m.date?.toISODate() ?? ''))]
        .filter((d) => !dateRound.has(d))
        .sort((a, b) => a.localeCompare(b))
      for (const d of newDates) dateRound.set(d, ++maxRound)

      for (const m of pending) {
        const key = m.date?.toISODate() ?? ''
        m.round = dateRound.get(key) ?? null
        if (m.round != null) {
          await m.save()
          updated++
        }
      }

      if (pending.length) {
        this.logger.info(`Liga ${league.id} (${league.name}): ${pending.length} partidos asignados`)
      }
    }

    this.logger.success(`Listo. ${updated} partidos con jornada asignada.`)
  }
}
