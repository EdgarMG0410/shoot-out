import { useMemo, useRef, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  MapPin,
  Megaphone,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Button, Card, Field, Input, Photo, Select, Textarea } from '~/components/ui'
import { cn } from '~/lib/utils'
import { money } from '~/lib/format'
import { spaceImage } from '~/lib/stock'

const HERO_IMG =
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&q=70&auto=format&fit=crop'

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
    accent: 'bg-lime-mark/20 text-lime-deep',
    title: 'Encuentra cancha cerca',
    text: 'Busca por zona y tipo, mira fotos, precio y horarios.',
  },
  {
    icon: CalendarCheck,
    accent: 'bg-electric/15 text-electric-deep',
    title: 'Reserva en segundos',
    text: 'Apartas tu horario con solo tu correo. Sin filas, sin llamadas.',
  },
  {
    icon: Users,
    accent: 'bg-flame/15 text-flame',
    title: 'Arma tu partido',
    text: 'Publica retas, súmate a partidos abiertos y encuentra jugadores.',
  },
]
const OWNER_BENEFITS = [
  {
    icon: CalendarCheck,
    accent: 'bg-electric/15 text-electric-deep',
    title: 'Llena tus horarios',
    text: 'Publica disponibilidad y recibe reservas de nuevos jugadores.',
  },
  {
    icon: Trophy,
    accent: 'bg-lime-mark/20 text-lime-deep',
    title: 'Administra torneos',
    text: 'Ligas, calendario, tabla de posiciones y estadísticas en un panel.',
  },
  {
    icon: Megaphone,
    accent: 'bg-amber-mark/20 text-amber-mark',
    title: 'Más visibilidad',
    text: 'Tu cancha aparece ante toda la comunidad futbolera de la zona.',
  },
]

const TYPE_BADGE: Record<string, string> = {
  cancha: 'bg-lime-mark text-graphite',
  terraza: 'bg-amber-mark text-graphite',
  otro: 'bg-electric text-chalk',
}

function SpaceCard({ space }: { space: Space }) {
  return (
    <Link href={`/espacios/${space.id}`} className="group block">
      <Photo
        src={spaceImage(space)}
        alt={space.name}
        className="aspect-4/3 w-full rounded-2xl shadow-sm ring-1 ring-bone-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
        overlay={
          <>
            <span
              className={cn(
                'absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm',
                TYPE_BADGE[space.type] ?? 'bg-chalk text-graphite'
              )}
            >
              {TYPE_LABEL[space.type]}
              {space.type === 'cancha' && space.size ? ` ${space.size}` : ''}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-graphite/70 to-transparent" />
            <span className="absolute bottom-3 right-3 rounded-full bg-chalk/95 px-2.5 py-1 text-xs font-bold text-graphite shadow-sm backdrop-blur">
              {money(space.pricePerHour)}
              <span className="font-medium text-slate-6"> /h</span>
            </span>
          </>
        }
      />
      <div className="mt-2.5">
        <p className="truncate font-semibold text-graphite">{space.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
          <Clock className="size-3.5 shrink-0" /> {hhmm(space.openTime)}–{hhmm(space.closeTime)}
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
  items: { icon: typeof MapPin; accent: string; title: string; text: string }[]
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-bold tracking-tight text-graphite">{heading}</h3>
      <ul className="flex flex-col gap-5">
        {items.map((b) => (
          <li key={b.title} className="flex gap-3.5">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', b.accent)}>
              <b.icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-graphite">{b.title}</p>
              <p className="mt-0.5 text-sm text-slate-6">{b.text}</p>
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

type Stats = { sucursales: number; canchas: number; ligas: number }

export default function PublicHome({
  stats,
  locations,
  leagues,
}: {
  stats: Stats
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

  const HERO_CARDS = [
    {
      icon: CalendarCheck,
      title: 'Reserva en segundos',
      text: 'Aparta tu horario solo con tu correo.',
    },
    { icon: Trophy, title: 'Torneos y tabla', text: 'Ligas, calendario y estadísticas en vivo.' },
    { icon: Users, title: 'Comunidad', text: 'Arma retas y encuentra jugadores cerca.' },
  ]

  return (
    <>
      <Head title="Reserva canchas, arma partidos y administra torneos" />

      {/* Hero — full-bleed */}
      <section className="relative isolate overflow-hidden">
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="hero-scrim absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 py-16 text-chalk lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-mark/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lime-mark ring-1 ring-lime-mark/30">
                <Zap className="size-3.5" /> Marketplace deportivo
              </span>
              <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
                Reserva canchas, arma partidos y administra torneos
              </h1>
              <p className="mt-5 max-w-xl text-lg text-chalk/75">
                Futhub conecta jugadores y canchas. Encuentra dónde jugar, aparta tu horario y vive
                el fútbol amateur sin complicaciones.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="lime" size="md" onClick={() => scrollTo(canchasRef)}>
                  Quiero reservar cancha <ArrowRight />
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setLeadType('cancha')
                    scrollTo(leadRef)
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-chalk/25 bg-chalk/10 px-5 text-sm font-medium text-chalk backdrop-blur transition-colors hover:bg-chalk/20"
                >
                  Quiero registrar mi cancha
                </button>
              </div>

              {/* Stat strip */}
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-chalk/15 pt-6">
                {[
                  { n: stats.sucursales, l: 'Sucursales' },
                  { n: stats.canchas, l: 'Canchas' },
                  { n: stats.ligas, l: 'Ligas activas' },
                ].map((s) => (
                  <div key={s.l}>
                    <dt className="text-3xl font-bold tabular-nums text-lime-mark">{s.n}</dt>
                    <dd className="text-xs font-medium uppercase tracking-wide text-chalk/60">
                      {s.l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Floating feature cards (desktop) */}
            <div className="hidden flex-col gap-3 lg:flex">
              {HERO_CARDS.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-4 rounded-2xl border border-chalk/15 bg-chalk/10 p-4 backdrop-blur-md"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-mark text-graphite">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-chalk">{c.title}</p>
                    <p className="text-sm text-chalk/65">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl space-y-20 px-5 pb-24 pt-16 sm:px-8">
        {/* Benefits */}
        <section className="grid gap-6 lg:grid-cols-2">
          <BenefitList heading="Para jugadores" items={PLAYER_BENEFITS} />
          <BenefitList heading="Para canchas" items={OWNER_BENEFITS} />
        </section>

        {/* Canchas listing */}
        <div ref={canchasRef} className="scroll-mt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-lime-mark" />
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-graphite">
                  Encuentra tu cancha
                </h2>
                <p className="mt-0.5 text-sm text-slate-6">Filtra por zona y tipo de espacio.</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex gap-1 rounded-2xl bg-bone-2 p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors',
                      filter === f.key
                        ? 'bg-graphite text-chalk shadow-sm'
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
          </div>

          <div className="space-y-10">
            {filteredLocations.length === 0 && (
              <p className="text-sm text-slate-6">No hay espacios disponibles con esos filtros.</p>
            )}

            {filteredLocations.map((loc) => (
              <section key={loc.id}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold tracking-tight text-graphite">{loc.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                    <MapPin className="size-3.5 shrink-0" /> {loc.address}
                    {loc.zona ? ` · ${loc.zona}` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
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
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-electric" />
                <h2 className="text-3xl font-bold tracking-tight text-graphite">Ligas</h2>
              </div>
              <Link
                href="/ligas"
                className="inline-flex items-center gap-1 text-sm font-semibold text-lime-deep hover:underline"
              >
                Ver todas <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {leagues.slice(0, 8).map((l) => (
                <Link key={l.id} href={`/ligas/${l.id}`}>
                  <Card className="flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-mark/20 text-lime-deep">
                      <Trophy className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-graphite">{l.name}</p>
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
        <section ref={leadRef} className="scroll-mt-24">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="brand-gradient p-8 text-chalk sm:p-12">
                <span className="inline-flex items-center rounded-full bg-lime-mark/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lime-mark">
                  Caso piloto
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight">
                  Shoot Out, nuestra cancha piloto
                </h2>
                <p className="mt-4 text-chalk/75">
                  Shoot Out opera desde 2021 con reservas, torneos y comunidad futbolera. Arranca en
                  Futhub con <span className="font-semibold text-chalk">3 sucursales</span>: Centro,
                  Norte y Sur.
                </p>
                <p className="mt-6 text-sm text-chalk/60">
                  ¿Tienes una cancha o quieres empezar a jugar? Déjanos tus datos y te contactamos.
                </p>
              </div>
              <div className="p-8 sm:p-12">
                <h3 className="mb-5 text-lg font-bold tracking-tight text-graphite">
                  Déjanos tus datos
                </h3>
                <LeadForm key={leadType} initialType={leadType} />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </>
  )
}

PublicHome.layout = (page: React.ReactNode) => <PublicLayout bleed>{page}</PublicLayout>
