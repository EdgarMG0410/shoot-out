import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Clock, MapPin, Trophy } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Card, EmptyState } from '~/components/ui'
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

type Tab = 'tabla' | 'calendario'

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
  const hasPlayed = standings.some((s) => s.played > 0)

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
          <Trophy className="size-5 text-lime-deep" />
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
        {(['tabla', 'calendario'] as Tab[]).map((t) => (
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                    <th className="py-3 pl-5 pr-2 font-medium">#</th>
                    <th className="py-3 pr-4 font-medium">Equipo</th>
                    <th className="px-3 py-3 text-center font-medium">PJ</th>
                    <th className="px-3 py-3 text-center font-medium">G</th>
                    <th className="px-3 py-3 text-center font-medium">E</th>
                    <th className="px-3 py-3 text-center font-medium">P</th>
                    <th className="px-3 py-3 text-center font-medium">DIF</th>
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
                              i < 3 ? 'bg-lime-mark/30 text-graphite' : 'text-slate-6'
                            )}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-graphite">{s.team}</td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.played}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.won}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.drawn}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.lost}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
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
                <h2 className="mb-4 text-sm font-semibold text-graphite">⚽ Goleadores</h2>
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
                        {c.yellow > 0 && <span className="tabular-nums">🟨 {c.yellow}</span>}
                        {c.red > 0 && <span className="tabular-nums">🟥 {c.red}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === 'calendario' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <EmptyState title="Sin partidos" hint="El calendario aún no está disponible." />
          ) : (
            matches.map((m) => (
              <Card key={m.id} className="p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-6">
                  <span className="font-medium text-graphite">{formatDate(m.date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {timeRange(m.startTime, m.endTime)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {m.spaceName}
                  </span>
                  <span
                    className={cn(
                      'inline-flex h-5 items-center rounded-md px-2 text-[11px] font-semibold',
                      MATCH_STATUS[m.status].cls
                    )}
                  >
                    {MATCH_STATUS[m.status].label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  <span className="truncate text-right font-semibold text-graphite">
                    {m.homeTeam}
                  </span>
                  <span className="rounded-xl bg-bone-2 px-4 py-1.5 text-lg font-bold tabular-nums text-graphite">
                    {m.homeGoals}–{m.awayGoals}
                  </span>
                  <span className="truncate font-semibold text-graphite">{m.awayTeam}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </>
  )
}

PublicLeague.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
