import { useMemo, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ArrowRight, Clock, MapPin, Trophy } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Card, Photo } from '~/components/ui'
import { cn } from '~/lib/utils'
import { money } from '~/lib/format'

type Space = {
  id: number
  name: string
  type: 'cancha' | 'terraza' | 'otro'
  size: string | null
  pricePerHour: number
  photoUrl: string | null
  openTime: string
  closeTime: string
}
type Loc = {
  id: number
  name: string
  address: string
  phone: string | null
  photoUrl: string | null
  spaces: Space[]
}
type LeagueRow = {
  id: number
  name: string
  locationName: string
  status: string
  teamsCount: number
}

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }
const hhmm = (t: string) => (t ?? '').slice(0, 5)

type Filter = 'todos' | 'cancha' | 'terraza'
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todo' },
  { key: 'cancha', label: 'Canchas' },
  { key: 'terraza', label: 'Terrazas' },
]

function SpaceCard({ space }: { space: Space }) {
  return (
    <Link href={`/espacios/${space.id}`} className="group block">
      <Photo
        src={space.photoUrl}
        alt={space.name}
        className="aspect-square w-full rounded-2xl"
        overlay={
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-chalk/90 px-2.5 py-1 text-xs font-semibold text-graphite shadow-sm backdrop-blur">
            {TYPE_LABEL[space.type]}
            {space.type === 'cancha' && space.size ? ` ${space.size}` : ''}
          </span>
        }
      />
      <div className="mt-2.5">
        <p className="truncate font-medium text-graphite">{space.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
          <Clock className="size-3.5 shrink-0" /> {hhmm(space.openTime)}–{hhmm(space.closeTime)}
        </p>
        <p className="mt-1 text-sm text-graphite">
          <span className="font-semibold">{money(space.pricePerHour)}</span>
          <span className="text-slate-6"> MXN / hora</span>
        </p>
      </div>
    </Link>
  )
}

export default function PublicHome({
  locations,
  leagues,
}: {
  locations: Loc[]
  leagues: LeagueRow[]
}) {
  const [filter, setFilter] = useState<Filter>('todos')

  const filteredLocations = useMemo(
    () =>
      locations
        .map((l) => ({
          ...l,
          spaces: filter === 'todos' ? l.spaces : l.spaces.filter((s) => s.type === filter),
        }))
        .filter((l) => l.spaces.length > 0),
    [locations, filter]
  )

  return (
    <>
      <Head title="Canchas y terrazas para rentar" />

      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-3xl bg-graphite p-7 text-chalk sm:p-10">
        <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Reserva canchas y terrazas, sin complicaciones
        </h1>
        <p className="mt-3 max-w-lg text-chalk/70">
          Explora los espacios disponibles y aparta tu horario. Para reservar solo necesitas tu
          correo.
        </p>
      </section>

      {/* Filters */}
      <div className="mb-6 inline-flex gap-1 rounded-2xl bg-bone-2 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-xl px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.key
                ? 'bg-chalk text-graphite shadow-sm'
                : 'text-slate-6 hover:text-graphite'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-9">
        {filteredLocations.length === 0 && (
          <p className="text-sm text-slate-6">No hay espacios disponibles por ahora.</p>
        )}

        {filteredLocations.map((loc) => (
          <section key={loc.id}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-graphite">{loc.name}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                <MapPin className="size-3.5 shrink-0" /> {loc.address}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {loc.spaces.map((s) => (
                <SpaceCard key={s.id} space={s} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Leagues teaser */}
      {leagues.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-graphite">Ligas</h2>
            <Link
              href="/ligas"
              className="inline-flex items-center gap-1 text-sm font-medium text-lime-deep hover:underline"
            >
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.slice(0, 6).map((l) => (
              <Link key={l.id} href={`/ligas/${l.id}`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-bone-1">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-mark/20 text-lime-deep">
                    <Trophy className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-graphite">{l.name}</p>
                    <p className="truncate text-sm text-slate-6">
                      {l.locationName} · {l.teamsCount} equipos
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

PublicHome.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
