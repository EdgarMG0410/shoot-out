import Team from '#models/team'
import Match from '#models/match'

export type StandingRow = {
  teamId: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export type ScorerRow = { player: string; team: string; goals: number }
export type CardRow = { player: string; team: string; yellow: number; red: number }

/**
 * Computes the league table, top scorers and cards from played matches and
 * their events (the uploaded minuta). Goals are the single source of truth for
 * the score: home/away goals are counted from goal events per team.
 */
export default class StandingsService {
  async compute(leagueId: number): Promise<{
    standings: StandingRow[]
    scorers: ScorerRow[]
    cards: CardRow[]
  }> {
    const teams = await Team.query().where('league_id', leagueId).preload('players')
    const matches = await Match.query().where('league_id', leagueId).where('status', 'played').preload('events')

    const rows = new Map<number, StandingRow>()
    const teamName = new Map<number, string>()
    const playerName = new Map<number, string>()
    for (const t of teams) {
      teamName.set(t.id, t.name)
      for (const p of t.players) playerName.set(p.id, p.name)
      rows.set(t.id, {
        teamId: t.id,
        team: t.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
      })
    }

    const goalsBy = new Map<string, ScorerRow>()
    const cardsBy = new Map<string, CardRow>()

    for (const m of matches) {
      const home = rows.get(m.homeTeamId)
      const away = rows.get(m.awayTeamId)

      let homeGoals = 0
      let awayGoals = 0
      for (const e of m.events) {
        const pname = e.playerId ? (playerName.get(e.playerId) ?? 'Jugador') : 'Sin asignar'
        const tname = teamName.get(e.teamId) ?? '—'
        const key = `${e.playerId ?? 'x'}-${e.teamId}`

        if (e.type === 'goal') {
          if (e.teamId === m.homeTeamId) homeGoals++
          else if (e.teamId === m.awayTeamId) awayGoals++
          const g = goalsBy.get(key) ?? { player: pname, team: tname, goals: 0 }
          g.goals++
          goalsBy.set(key, g)
        } else {
          const c = cardsBy.get(key) ?? { player: pname, team: tname, yellow: 0, red: 0 }
          if (e.type === 'yellow') c.yellow++
          else c.red++
          cardsBy.set(key, c)
        }
      }

      if (!home || !away) continue
      home.played++
      away.played++
      home.goalsFor += homeGoals
      home.goalsAgainst += awayGoals
      away.goalsFor += awayGoals
      away.goalsAgainst += homeGoals
      if (homeGoals > awayGoals) {
        home.won++
        home.points += 3
        away.lost++
      } else if (homeGoals < awayGoals) {
        away.won++
        away.points += 3
        home.lost++
      } else {
        home.drawn++
        away.drawn++
        home.points++
        away.points++
      }
    }

    const standings = [...rows.values()]
      .map((r) => ({ ...r, goalDiff: r.goalsFor - r.goalsAgainst }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDiff - a.goalDiff ||
          b.goalsFor - a.goalsFor ||
          a.team.localeCompare(b.team)
      )

    const scorers = [...goalsBy.values()].sort(
      (a, b) => b.goals - a.goals || a.player.localeCompare(b.player)
    )
    const cards = [...cardsBy.values()].sort(
      (a, b) => b.red - a.red || b.yellow - a.yellow || a.player.localeCompare(b.player)
    )

    return { standings, scorers, cards }
  }
}
