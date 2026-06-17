import { useMemo, useRef, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowRight, CalendarCheck, Clock, MapPin, Megaphone, Trophy, Users } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Button, Card, Field, Input, Photo, Select, Textarea } from '~/components/ui'
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
  zona: string | null
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

const PLAYER_BENEFITS = [
  {
    icon: MapPin,
    title: 'Encuentra cancha cerca',
    text: 'Busca por zona y tipo, mira fotos, precio y horarios.',
  },
  {
    icon: CalendarCheck,
    title: 'Reserva en segundos',
    text: 'Apartas tu horario con solo tu correo. Sin filas, sin llamadas.',
  },
  {
    icon: Users,
    title: 'Arma tu partido',
    text: 'Publica retas, súmate a partidos abiertos y encuentra jugadores.',
  },
]
const OWNER_BENEFITS = [
  {
    icon: CalendarCheck,
    title: 'Llena tus horarios',
    text: 'Publica disponibilidad y recibe reservas de nuevos jugadores.',
  },
  {
    icon: Trophy,
    title: 'Administra torneos',
    text: 'Ligas, calendario, tabla de posiciones y estadísticas en un panel.',
  },
  {
    icon: Megaphone,
    title: 'Más visibilidad',
    text: 'Tu cancha aparece ante toda la comunidad futbolera de la zona.',
  },
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

function BenefitList({
  heading,
  items,
}: {
  heading: string
  items: { icon: typeof MapPin; title: string; text: string }[]
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-graphite">{heading}</h3>
      <ul className="flex flex-col gap-4">
        {items.map((b) => (
          <li key={b.title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime-mark/20 text-lime-deep">
              <b.icon className="size-5" />
            </span>
            <div>
              <p className="font-medium text-graphite">{b.title}</p>
              <p className="text-sm text-slate-6">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function LeadForm({ initialType }: { initialType: 'jugador' | 'cancha' }) {
  const form = useForm({ name: '', email: '', phone: '', type: initialType, message: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form
      .transform((d) => ({ ...d, phone: d.phone || null, message: d.message || null }))
      .post('/interesados', { preserveScroll: true, onSuccess: () => form.reset() })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </Field>
        <Field label="Correo" error={form.errors.email}>
          <Input
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </Field>
        <Field label="Teléfono" hint="Opcional" error={form.errors.phone}>
          <Input
            value={form.data.phone}
            onChange={(e) => form.setData('phone', e.target.value)}
            placeholder="33 1234 5678"
          />
        </Field>
        <Field label="Soy" error={form.errors.type}>
          <Select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
            <option value="jugador">Jugador — quiero reservar</option>
            <option value="cancha">Cancha — quiero registrarme</option>
          </Select>
        </Field>
      </div>
      <Field label="Mensaje" hint="Opcional" error={form.errors.message}>
        <Textarea
          value={form.data.message}
          onChange={(e) => form.setData('message', e.target.value)}
          placeholder="Cuéntanos qué buscas…"
        />
      </Field>
      <Button type="submit" variant="lime" className="self-start" disabled={form.processing}>
        {form.processing ? 'Enviando…' : 'Quiero más información'}
      </Button>
    </form>
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
  const [zona, setZona] = useState<string>('todas')
  const [leadType, setLeadType] = useState<'jugador' | 'cancha'>('jugador')
  const canchasRef = useRef<HTMLDivElement>(null)
  const leadRef = useRef<HTMLDivElement>(null)

  const zonas = useMemo(
    () => [...new Set(locations.map((l) => l.zona).filter((z): z is string => !!z))].sort(),
    [locations]
  )

  const filteredLocations = useMemo(
    () =>
      locations
        .filter((l) => zona === 'todas' || l.zona === zona)
        .map((l) => ({
          ...l,
          spaces: filter === 'todos' ? l.spaces : l.spaces.filter((s) => s.type === filter),
        }))
        .filter((l) => l.spaces.length > 0),
    [locations, filter, zona]
  )

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <Head title="Reserva canchas, arma partidos y administra torneos" />

      {/* Hero */}
      <section className="mb-10 overflow-hidden rounded-3xl bg-graphite p-7 text-chalk sm:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-chalk/10 px-3 py-1 text-xs font-medium text-chalk/80">
          <Trophy className="size-3.5" /> Marketplace deportivo
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          Reserva canchas, arma partidos y administra torneos en una sola plataforma
        </h1>
        <p className="mt-4 max-w-xl text-chalk/70">
          Futhub conecta jugadores y canchas. Encuentra dónde jugar, aparta tu horario y vive el
          fútbol amateur sin complicaciones.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="lime" onClick={() => scrollTo(canchasRef)}>
            Quiero reservar cancha <ArrowRight />
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setLeadType('cancha')
              scrollTo(leadRef)
            }}
          >
            Quiero registrar mi cancha
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-12 grid gap-5 lg:grid-cols-2">
        <BenefitList heading="Para jugadores" items={PLAYER_BENEFITS} />
        <BenefitList heading="Para canchas" items={OWNER_BENEFITS} />
      </section>

      {/* Canchas listing */}
      <div ref={canchasRef} className="scroll-mt-20">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-graphite">
            Encuentra tu cancha
          </h2>
          <p className="mt-1 text-sm text-slate-6">Filtra por zona y tipo de espacio.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex gap-1 rounded-2xl bg-bone-2 p-1">
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

          {zonas.length > 0 && (
            <Select value={zona} onChange={(e) => setZona(e.target.value)} className="w-auto">
              <option value="todas">Todas las zonas</option>
              {zonas.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="space-y-9">
          {filteredLocations.length === 0 && (
            <p className="text-sm text-slate-6">No hay espacios disponibles con esos filtros.</p>
          )}

          {filteredLocations.map((loc) => (
            <section key={loc.id}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold tracking-tight text-graphite">{loc.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                  <MapPin className="size-3.5 shrink-0" /> {loc.address}
                  {loc.zona ? ` · ${loc.zona}` : ''}
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

      {/* Pilot + lead capture */}
      <section ref={leadRef} className="mt-12 scroll-mt-20">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="bg-graphite p-7 text-chalk sm:p-9">
              <span className="inline-flex items-center rounded-full bg-lime-mark/20 px-3 py-1 text-xs font-semibold text-lime-mark">
                Caso piloto
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Shoot Out, nuestra cancha piloto
              </h2>
              <p className="mt-3 text-chalk/70">
                Shoot Out opera desde 2021 con reservas, torneos y comunidad futbolera. Arranca en
                Futhub con <span className="font-semibold text-chalk">3 sucursales</span>: Centro,
                Norte y Sur.
              </p>
              <p className="mt-6 text-sm text-chalk/60">
                ¿Tienes una cancha o quieres empezar a jugar? Déjanos tus datos y te contactamos.
              </p>
            </div>
            <div className="p-7 sm:p-9">
              <h3 className="mb-5 text-lg font-semibold text-graphite">Déjanos tus datos</h3>
              <LeadForm key={leadType} initialType={leadType} />
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

PublicHome.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
