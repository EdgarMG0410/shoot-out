import { useMemo, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, MapPin, Trophy } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Card, EmptyState, Select } from '~/components/ui'
import { cn } from '~/lib/utils'
import { formatDate, timeRange } from '~/lib/format'

type MatchStatus = 'scheduled' | 'played' | 'cancelled'
type Match = {
  id: number
  spaceName: string
  date: string
  startTime: string
  endTime: string
  status: MatchStatus
  round: number | null
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
}
type Standing = {
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
type Scorer = { player: string; team: string; goals: number }
type CardRow = { player: string; team: string; yellow: number; red: number }
type League = {
  id: number
  name: string
  description: string | null
  locationName: string
  seasonStart: string | null
  seasonEnd: string | null
  status: 'active' | 'finished'
}

const MATCH_STATUS: Record<MatchStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Programado', cls: 'bg-amber-mark/15 text-amber-mark' },
  played: { label: 'Jugado', cls: 'bg-emerald-mark/15 text-emerald-mark' },
  cancelled: { label: 'Cancelado', cls: 'bg-rose-mark/15 text-rose-mark' },
}

type Tab = 'tabla' | 'jornadas'

export default function PublicLeague({
  league,
  matches,
  standings,
  scorers,
  cards,
}: {
  league: League
  matches: Match[]
  standings: Standing[]
  scorers: Scorer[]
  cards: CardRow[]
}) {
  const [tab, setTab] = useState<Tab>('tabla')
  const [jornada, setJornada] = useState<string>('')
  const hasPlayed = standings.some((s) => s.played > 0)

  // Group fixtures into jornadas. Prefer the explicit round column; fall back to
  // grouping by match date for legacy leagues that have no round set.
  const jornadas = useMemo(() => {
    const hasRounds = matches.some((m) => m.round != null)
    if (hasRounds) {
      const byRound = new Map<number, Match[]>()
      const noRound: Match[] = []
      for (const m of matches) {
        if (m.round == null) {
          noRound.push(m)
        } else {
          const arr = byRound.get(m.round) ?? []
          arr.push(m)
          byRound.set(m.round, arr)
        }
      }
      const list = [...byRound.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([n, ms]) => ({ key: String(n), label: `Jornada ${n}`, date: ms[0]?.date ?? '', matches: ms }))
      if (noRound.length)
        list.push({ key: 'none', label: 'Sin jornada', date: noRound[0]?.date ?? '', matches: noRound })
      return list
    }
    const byDate = new Map<string, Match[]>()
    for (const m of matches) {
      const arr = byDate.get(m.date) ?? []
      arr.push(m)
      byDate.set(m.date, arr)
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, ms], i) => ({ key: String(i + 1), label: `Jornada ${i + 1}`, date, matches: ms }))
  }, [matches])

  const current = jornadas.find((j) => j.key === jornada) ?? jornadas[0]

  return (
    <>
      <Head title={league.name} />

      <Link
        href="/ligas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-6 hover:text-graphite"
      >
        <ArrowLeft className="size-4" /> Ligas
      </Link>

      <Card className="mb-5 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-graphite" />
          <h1 className="text-xl font-semibold tracking-tight text-graphite">{league.name}</h1>
        </div>
        {league.description && <p className="mt-1 text-sm text-slate-6">{league.description}</p>}
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-6">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {league.locationName}
          </span>
          {(league.seasonStart || league.seasonEnd) && (
            <span>
              {league.seasonStart ? formatDate(league.seasonStart) : '—'} –{' '}
              {league.seasonEnd ? formatDate(league.seasonEnd) : '—'}
            </span>
          )}
        </p>
      </Card>

      <div className="mb-6 inline-flex gap-1 rounded-2xl bg-bone-2 p-1">
        {(['tabla', 'jornadas'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-xl px-5 py-2 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-chalk text-graphite shadow-sm' : 'text-slate-6 hover:text-graphite'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'tabla' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-bone-3 px-5 py-4">
              <h2 className="text-sm font-semibold text-graphite">Tabla de posiciones</h2>
            </div>
            <div>
              <table className="w-full table-fixed text-sm sm:table-auto">
                <thead>
                  <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                    <th className="py-3 pl-5 pr-2 font-medium">#</th>
                    <th className="py-3 pr-4 font-medium">Equipo</th>
                    <th className="px-1.5 py-3 text-center font-medium sm:px-3">PJ</th>
                    <th className="px-1.5 py-3 text-center font-medium sm:px-3">G</th>
                    <th className="px-1.5 py-3 text-center font-medium sm:px-3">E</th>
                    <th className="px-1.5 py-3 text-center font-medium sm:px-3">P</th>
                    <th className="px-1.5 py-3 text-center font-medium sm:px-3">DIF</th>
                    <th className="py-3 pl-3 pr-5 text-center font-bold text-graphite">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-6">
                        Sin equipos todavía.
                      </td>
                    </tr>
                  ) : (
                    standings.map((s, i) => (
                      <tr key={s.teamId} className="border-t border-bone-2">
                        <td className="py-3.5 pl-5 pr-2">
                          <span
                            className={cn(
                              'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                              i < 3 ? 'bg-graphite text-chalk' : 'text-slate-6'
                            )}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="truncate py-3.5 pr-3 font-medium text-graphite">{s.team}</td>
                        <td className="px-1.5 py-3.5 text-center sm:px-3 tabular-nums text-slate-6">
                          {s.played}
                        </td>
                        <td className="px-1.5 py-3.5 text-center sm:px-3 tabular-nums text-slate-6">
                          {s.won}
                        </td>
                        <td className="px-1.5 py-3.5 text-center sm:px-3 tabular-nums text-slate-6">
                          {s.drawn}
                        </td>
                        <td className="px-1.5 py-3.5 text-center sm:px-3 tabular-nums text-slate-6">
                          {s.lost}
                        </td>
                        <td className="px-1.5 py-3.5 text-center sm:px-3 tabular-nums text-slate-6">
                          {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-center font-bold tabular-nums text-graphite">
                          {s.points}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {hasPlayed && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="mb-4 text-sm font-semibold text-graphite">Goleadores</h2>
                {scorers.length === 0 ? (
                  <p className="text-sm text-slate-6">Sin goles aún.</p>
                ) : (
                  <ul className="-my-2 divide-y divide-bone-2 text-sm">
                    {scorers.map((s, i) => (
                      <li key={i} className="flex items-center gap-3 py-2.5">
                        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-slate-6">
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate text-graphite">
                          {s.player} <span className="text-slate-6">· {s.team}</span>
                        </span>
                        <span className="font-bold tabular-nums text-graphite">{s.goals}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="p-6">
                <h2 className="mb-4 text-sm font-semibold text-graphite">Tarjetas</h2>
                {cards.length === 0 ? (
                  <p className="text-sm text-slate-6">Sin tarjetas.</p>
                ) : (
                  <ul className="-my-2 divide-y divide-bone-2 text-sm">
                    {cards.map((c, i) => (
                      <li key={i} className="flex items-center gap-3 py-2.5">
                        <span className="flex-1 truncate text-graphite">
                          {c.player} <span className="text-slate-6">· {c.team}</span>
                        </span>
                        {c.yellow > 0 && (
                          <span className="inline-flex items-center gap-1 tabular-nums text-slate-6">
                            <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-amber-mark" />
                            {c.yellow}
                          </span>
                        )}
                        {c.red > 0 && (
                          <span className="inline-flex items-center gap-1 tabular-nums text-slate-6">
                            <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-rose-mark" />
                            {c.red}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === 'jornadas' && (
        <div className="space-y-8">
          {matches.length === 0 || !current ? (
            <EmptyState title="Sin partidos" hint="El calendario aún no está disponible." />
          ) : (
            <section>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Select
                  className="w-auto"
                  value={current.key}
                  onChange={(e) => setJornada(e.target.value)}
                >
                  {jornadas.map((j) => (
                    <option key={j.key} value={j.key}>
                      {j.label}
                    </option>
                  ))}
                </Select>
                {current.date && (
                  <span className="text-sm text-slate-6">{formatDate(current.date)}</span>
                )}
              </div>
              <div className="space-y-3">
                {current.matches.map((m) => (
                    <Card key={m.id} className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-xs font-medium uppercase tracking-wide text-slate-6">
                          {formatDate(m.date)} · {m.startTime}
                        </p>
                        <span
                          className={cn(
                            'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold',
                            MATCH_STATUS[m.status].cls
                          )}
                        >
                          {MATCH_STATUS[m.status].label}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={cn(
                              'truncate font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl',
                              m.status === 'played' && m.awayGoals > m.homeGoals
                                ? 'text-slate-6'
                                : 'text-graphite'
                            )}
                          >
                            {m.homeTeam}
                          </span>
                          {m.status === 'played' && (
                            <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-graphite sm:text-3xl">
                              {m.homeGoals}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold uppercase text-rose-mark">
                            vs
                          </span>
                          <span className="h-px flex-1 bg-bone-3" />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={cn(
                              'truncate font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl',
                              m.status === 'played' && m.homeGoals > m.awayGoals
                                ? 'text-slate-6'
                                : 'text-graphite'
                            )}
                          >
                            {m.awayTeam}
                          </span>
                          {m.status === 'played' && (
                            <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-graphite sm:text-3xl">
                              {m.awayGoals}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-bone-2 pt-3 text-sm text-slate-6">
                        <MapPin className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{m.spaceName}</span>
                        <span className="font-mono text-xs tabular-nums">
                          {timeRange(m.startTime, m.endTime)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
          )}
        </div>
      )}
    </>
  )
}

PublicLeague.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
