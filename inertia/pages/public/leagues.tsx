import { Head, Link } from '@inertiajs/react'
import { ArrowRight, CalendarRange, MapPin, Trophy, Users } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Card, EmptyState, StatusPill } from '~/components/ui'
import { formatDate } from '~/lib/format'

type LeagueRow = {
  id: number
  name: string
  locationName: string
  status: 'active' | 'finished'
  seasonStart: string | null
  seasonEnd: string | null
  teamsCount: number
  matchesCount: number
}

export default function PublicLeagues({ leagues }: { leagues: LeagueRow[] }) {
  return (
    <>
      <Head title="Ligas" />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-graphite">Ligas</h1>

      {leagues.length === 0 ? (
        <EmptyState title="Aún no hay ligas" hint="Pronto habrá torneos disponibles." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((l) => (
            <Link key={l.id} href={`/ligas/${l.id}`} className="block">
              <Card className="flex flex-col p-5 transition-colors hover:bg-bone-1 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 shrink-0 text-lime-deep" />
                      <h3 className="truncate font-semibold text-graphite">{l.name}</h3>
                      <StatusPill status={l.status === 'active' ? 'active' : 'inactive'} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-6">
                      <MapPin className="size-3.5" /> {l.locationName}
                    </p>
                    {(l.seasonStart || l.seasonEnd) && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                        <CalendarRange className="size-3.5" />
                        {l.seasonStart ? formatDate(l.seasonStart) : '—'} –{' '}
                        {l.seasonEnd ? formatDate(l.seasonEnd) : '—'}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-slate-6" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-6">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" /> {l.teamsCount} equipos
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="size-3.5" /> {l.matchesCount} partidos
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

PublicLeagues.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
