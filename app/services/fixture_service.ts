import { DateTime } from 'luxon'
import League from '#models/league'
import Team from '#models/team'
import Match from '#models/match'
import BookingService from '#services/booking_service'

export type GenerateOptions = {
  /** Court ids to schedule on (must belong to the league's location). */
  spaceIds: number[]
  /** First match-day, ISO 'YYYY-MM-DD'. Round 1 plays here; later rounds +1 week. */
  startDate: string
  /** Earliest kickoff each day, 'HH:mm'. */
  firstTime: string
  /** Match length in minutes. */
  matchDuration: number
  /** Minutes between consecutive matches on the same court. */
  gap: number
  /** Delete existing 'scheduled' matches before generating. */
  replace: boolean
}

export type GenerateResult = { created: number; rounds: number; skipped: number }

type Interval = { start: number; end: number }

const toMin = (t: string) => {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}
const toTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

const DAY_END = toMin('23:00') // last kickoff window guard

/**
 * Builds a single round-robin calendar (each pair plays once) and auto-schedules
 * it: one round per week from `startDate`, matches spread across the chosen
 * courts in sequential time slots, never overlapping existing bookings, blocks,
 * events or matches. Created matches are 'scheduled' and admins can edit them.
 */
export default class FixtureService {
  /** Circle method: returns rounds, each a list of [home, away] team-id pairs. */
  private roundRobin(teamIds: number[]): [number, number][][] {
    const ids = [...teamIds]
    if (ids.length % 2 === 1) ids.push(-1) // bye marker
    const n = ids.length
    const rounds: [number, number][][] = []
    const arr = [...ids]

    for (let r = 0; r < n - 1; r++) {
      const pairs: [number, number][] = []
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i]
        const b = arr[n - 1 - i]
        if (a !== -1 && b !== -1) {
          // Alternate home/away by round for fairness.
          pairs.push(r % 2 === 0 ? [a, b] : [b, a])
        }
      }
      rounds.push(pairs)
      // Rotate, keeping the first element fixed.
      arr.splice(1, 0, arr.pop()!)
    }
    return rounds
  }

  async generate(league: League, opts: GenerateOptions): Promise<GenerateResult> {
    const teams = await Team.query().where('league_id', league.id).orderBy('id')
    if (teams.length < 2) return { created: 0, rounds: 0, skipped: 0 }

    if (opts.replace) {
      await Match.query().where('league_id', league.id).where('status', 'scheduled').delete()
    }

    const svc = new BookingService()
    const rounds = this.roundRobin(teams.map((t) => t.id))
    const courts = opts.spaceIds
    const step = opts.matchDuration + opts.gap
    const first = toMin(opts.firstTime)

    // Per-(date,court) occupied intervals — seeded from the DB, grown as we place.
    const busy = new Map<string, Interval[]>()
    const loadBusy = async (date: string, court: number) => {
      const key = `${date}|${court}`
      if (busy.has(key)) return busy.get(key)!
      const occ = await svc.getOccupiedSlots(court, date)
      const intervals: Interval[] = [
        ...occ.bookings,
        ...occ.blocks,
        ...occ.events,
        ...occ.matches,
      ].map((s) => ({ start: toMin(s.startTime), end: toMin(s.endTime) }))
      busy.set(key, intervals)
      return intervals
    }
    const overlaps = (list: Interval[], iv: Interval) =>
      list.some((o) => iv.start < o.end && o.start < iv.end)

    let created = 0
    let skipped = 0

    for (const [r, pairs] of rounds.entries()) {
      const date = DateTime.fromISO(opts.startDate).plus({ weeks: r }).toISODate()!

      for (const [g, [homeId, awayId]] of pairs.entries()) {
        // Spread the round's games across courts, then fall back to others.
        const courtOrder = courts.map((_, i) => courts[(g + i) % courts.length])

        let placed = false
        for (const court of courtOrder) {
          const list = await loadBusy(date, court)
          for (let start = first; start + opts.matchDuration <= DAY_END; start += step) {
            const iv = { start, end: start + opts.matchDuration }
            if (!overlaps(list, iv)) {
              list.push(iv)
              await Match.create({
                leagueId: league.id,
                spaceId: court,
                homeTeamId: homeId,
                awayTeamId: awayId,
                date: DateTime.fromISO(date),
                startTime: toTime(start),
                endTime: toTime(start + opts.matchDuration),
                status: 'scheduled',
                round: r + 1,
              })
              created++
              placed = true
              break
            }
          }
          if (placed) break
        }
        if (!placed) skipped++
      }
    }

    return { created, rounds: rounds.length, skipped }
  }
}
