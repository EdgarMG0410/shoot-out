import { useMemo, useRef, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChevronDown,
  Clock,
  MapPin,
  Megaphone,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Button, Card, Field, Input, Photo, Select, Textarea } from '~/components/ui'
import { Reveal, CountUp, Marquee, Magnetic, CommunityGallery } from '~/components/interactive'
import { COMMUNITY_PHOTOS, HERO_PHOTO } from '~/lib/community'
import { cn } from '~/lib/utils'
import { money } from '~/lib/format'
import { spaceImage } from '~/lib/stock'

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

const HERO_TITLE_TOP = ['El', 'futbol', 'amateur']
const HERO_TITLE_BOTTOM = ['vive', 'aquí.']

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
    text: 'Torneos, calendario, tabla de posiciones y estadísticas en un panel.',
  },
  {
    icon: Megaphone,
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

function LocationRow({ loc, defaultOpen = false }: { loc: Loc; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const minPrice = loc.spaces.length ? Math.min(...loc.spaces.map((s) => s.pricePerHour)) : 0
  const thumb = loc.photoUrl || (loc.spaces[0] ? spaceImage(loc.spaces[0]) : '')
  const n = loc.spaces.length

  return (
    <div className="overflow-hidden rounded-3xl border border-bone-3 bg-chalk transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-3 text-left sm:p-4"
      >
        <img
          src={thumb}
          alt=""
          aria-hidden="true"
          className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-bone-3 sm:size-20"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-graphite">{loc.name}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-6">
            <MapPin className="size-3.5 shrink-0" /> {loc.zona || loc.address}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-semibold text-graphite">
            {n} {n === 1 ? 'cancha' : 'canchas'}
          </p>
          <p className="text-xs text-slate-6">desde {money(minPrice)}/h</p>
        </div>
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-full bg-bone-2 text-graphite transition-transform duration-300 ease-(--ease-quart)',
            open && 'rotate-180'
          )}
        >
          <ChevronDown className="size-4.5" />
        </span>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-500 ease-(--ease-quart)',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 border-t border-bone-3 p-4 sm:p-5 md:grid-cols-3">
            {loc.spaces.map((s) => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitColumn({
  label,
  items,
  cta,
}: {
  label: string
  items: { title: string; text: string }[]
  cta: { label: string; onClick: () => void }
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-graphite pb-3">
        <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-graphite">
          {label}
        </h3>
        <span className="font-display text-sm tabular-nums text-slate-6">
          {String(items.length).padStart(2, '0')}
        </span>
      </div>
      <ul>
        {items.map((b, i) => (
          <li key={b.title} className="group flex items-start gap-5 border-b border-bone-3 py-5">
            <span className="font-display w-8 shrink-0 text-[1.75rem] font-bold leading-none tabular-nums text-bone-3 transition-colors duration-300 ease-(--ease-quart) group-hover:text-graphite">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-graphite">{b.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-6">{b.text}</p>
            </div>
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 -translate-x-1.5 text-graphite opacity-0 transition-all duration-300 ease-(--ease-expo) group-hover:translate-x-0 group-hover:opacity-100" />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={cta.onClick}
        className="group/cta mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-graphite hover:text-slate-6"
      >
        {cta.label}
        <ArrowUpRight className="size-4 transition-transform duration-300 ease-(--ease-expo) group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
      </button>
    </div>
  )
}

function LeadForm({ initialType }: { initialType: 'jugador' | 'cancha' }) {
  const form = useForm({
    name: '',
    email: '',
    phone: '',
    type: initialType,
    contactMedium: [] as string[],
    message: '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      ...d,
      phone: d.phone || null,
      message: d.message || null,
      contactMedium: d.contactMedium.length ? d.contactMedium.join(', ') : null,
    }))
    form.post('/interesados', { preserveScroll: true, onSuccess: () => form.reset() })
  }

  const TYPES = [
    { key: 'jugador', label: 'Soy jugador' },
    { key: 'cancha', label: 'Tengo cancha' },
  ] as const
  const MEDIUMS = ['WhatsApp', 'Llamada'] as const
  const toggleMedium = (m: string) =>
    form.setData(
      'contactMedium',
      form.data.contactMedium.includes(m)
        ? form.data.contactMedium.filter((x) => x !== m)
        : [...form.data.contactMedium, m]
    )

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-bone-2 p-1">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => form.setData('type', t.key)}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
              form.data.type === t.key
                ? 'bg-graphite text-chalk shadow-sm'
                : 'text-slate-6 hover:text-graphite'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Field label="Nombre y apellido" error={form.errors.name}>
        <Input
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
          placeholder="Tu nombre y apellido"
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
      <Field
        label="¿Por cuál medio deseas que te contactemos?"
        hint="Opcional"
        error={form.errors.contactMedium}
      >
        <div className="flex flex-wrap gap-2">
          {MEDIUMS.map((m) => {
            const active = form.data.contactMedium.includes(m)
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMedium(m)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-transparent bg-lime-mark text-graphite'
                    : 'border-bone-3 text-slate-6 hover:border-graphite hover:text-graphite'
                )}
              >
                {m}
              </button>
            )
          })}
        </div>
      </Field>
      <Field label="¿En qué te podemos ayudar?" hint="Opcional" error={form.errors.message}>
        <Textarea
          value={form.data.message}
          onChange={(e) => form.setData('message', e.target.value)}
          placeholder="Cuéntanos qué buscas…"
        />
      </Field>
      <Button type="submit" variant="lime" className="mt-1 w-full" disabled={form.processing}>
        {form.processing
          ? 'Enviando…'
          : form.data.type === 'cancha'
            ? 'Registrar mi cancha'
            : 'Quiero jugar'}
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
        .filter((l) => l.spaces.length > 0),
    [locations, zona]
  )

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const HERO_STATS = [
    { n: stats.sucursales, l: 'Sucursales' },
    { n: stats.canchas, l: 'Canchas' },
    { n: stats.ligas, l: 'Torneos activos' },
  ]

  let wordDelay = 220

  return (
    <>
      <Head title="Reserva canchas, arma partidos y administra torneos" />

      {/* ============================ Hero ============================ */}
      <section className="relative isolate flex min-h-dvh items-center overflow-hidden">
        <img
          src={HERO_PHOTO.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full min-h-dvh scale-105 object-cover"
        />
        <div className="hero-scrim absolute inset-0 -z-10" />

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 py-20 text-chalk lg:grid-cols-[1.25fr_0.75fr] lg:py-28">
            <div>
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-chalk/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-chalk ring-1 ring-chalk/25 backdrop-blur motion-safe:animate-[fade-in_700ms_var(--ease-quart)_both]">
                <Zap className="size-3.5" /> Marketplace deportivo · Guadalajara
              </span>

              <h1 className="mt-6 text-[3.25rem] font-bold leading-[0.92] tracking-[-0.03em] sm:text-7xl xl:text-[6.5rem]">
                <div className="block">
                  {HERO_TITLE_TOP.map((w) => (
                    <span
                      key={w}
                      className="word-up mr-[0.22em]"
                      style={{ animationDelay: `${(wordDelay += 90)}ms` }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <div className="block text-chalk/70">
                  {HERO_TITLE_BOTTOM.map((w) => (
                    <span
                      key={w}
                      className="word-up mr-[0.22em]"
                      style={{ animationDelay: `${(wordDelay += 90)}ms` }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk/75 motion-safe:animate-[fade-in_800ms_600ms_var(--ease-quart)_both]">
                Futhub conecta jugadores y canchas. Encuentra dónde jugar, aparta tu horario y vive
                el fútbol amateur sin complicaciones.
              </p>

              <div className="mt-9 flex flex-col gap-3 motion-safe:animate-[fade-in_800ms_750ms_var(--ease-quart)_both] sm:flex-row sm:flex-wrap">
                <Magnetic className="w-full sm:w-auto">
                  <Button
                    variant="lime"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => scrollTo(canchasRef)}
                  >
                    Quiero reservar cancha <ArrowRight />
                  </Button>
                </Magnetic>
                <button
                  type="button"
                  onClick={() => {
                    setLeadType('cancha')
                    scrollTo(leadRef)
                  }}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-chalk/25 bg-chalk/10 px-5 text-sm font-medium text-chalk backdrop-blur transition-colors hover:bg-chalk/20 sm:w-auto"
                >
                  Quiero registrar mi cancha
                </button>
              </div>

              <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-chalk/15 pt-6 motion-safe:animate-[fade-in_800ms_900ms_var(--ease-quart)_both]">
                {HERO_STATS.map((s) => (
                  <div key={s.l}>
                    <dt className="font-mono text-4xl font-bold tabular-nums text-chalk">
                      <CountUp value={s.n} />
                    </dt>
                    <dd className="text-xs font-medium uppercase tracking-wide text-chalk/60">
                      {s.l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Floating community card (desktop) */}
            <div className="hidden justify-self-end lg:block motion-safe:animate-[fade-in_900ms_700ms_var(--ease-expo)_both]">
              <div className="w-72 rotate-2 overflow-hidden rounded-3xl bg-chalk/10 p-2 shadow-2xl ring-1 ring-chalk/20 backdrop-blur-md transition-transform duration-500 [transition-timing-function:var(--ease-expo)] hover:rotate-0">
                <img
                  src={COMMUNITY_PHOTOS[6].src}
                  alt={COMMUNITY_PHOTOS[6].alt}
                  className="aspect-4/5 w-full rounded-2xl object-cover"
                />
                <div className="flex items-center gap-2.5 px-3 py-3">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-mark opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-lime-mark" />
                  </span>
                  <p className="text-sm font-medium text-chalk">Comunidad activa cada semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-5 flex justify-center text-chalk/55 motion-safe:animate-[fade-in_1s_1.1s_var(--ease-quart)_both]">
          <ChevronDown className="size-6 motion-safe:animate-bounce" />
        </div>
      </section>

      {/* ===================== Community marquee ===================== */}
      <section className="border-y border-bone-3 bg-graphite py-12">
        <div className="mx-auto mb-8 max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-chalk" />
            <h2 className="text-2xl font-bold tracking-tight text-chalk sm:text-3xl">
              La comunidad que ya juega
            </h2>
          </div>
          <p className="mt-1 pl-[18px] text-sm text-chalk/55">
            Retas, torneos y equipos reales en nuestras canchas.
          </p>
        </div>
        <Marquee speed={52}>
          {COMMUNITY_PHOTOS.map((p) => (
            <div
              key={p.src}
              className="mr-4 aspect-4/3 w-[clamp(15rem,32vw,21rem)] shrink-0 overflow-hidden rounded-2xl ring-1 ring-chalk/10"
            >
              <img src={p.src} alt={p.alt} loading="lazy" className="size-full object-cover" />
            </div>
          ))}
        </Marquee>
      </section>

      {/* ============================ Body ============================ */}
      <div className="mx-auto max-w-7xl space-y-24 px-5 pb-24 pt-20 sm:px-8">
        {/* Value props — editorial index */}
        <section className="border-t border-bone-3 pt-14">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-6">
                  Por qué Futhub
                </span>
                <h2 className="mt-3 text-4xl font-bold leading-[1.04] tracking-tight text-graphite sm:text-5xl">
                  Menos organizar.
                  <br />
                  Más jugar.
                </h2>
              </div>
              <p className="text-slate-6 lg:col-span-5 lg:pb-2">
                Conectamos a quien quiere jugar con quien tiene la cancha — sin grupos de WhatsApp
                eternos ni llamadas.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-x-14 gap-y-12 lg:grid-cols-2">
            <Reveal>
              <BenefitColumn
                label="Para jugadores"
                items={PLAYER_BENEFITS}
                cta={{ label: 'Ver canchas disponibles', onClick: () => scrollTo(canchasRef) }}
              />
            </Reveal>
            <Reveal delay={100}>
              <BenefitColumn
                label="Para canchas"
                items={OWNER_BENEFITS}
                cta={{
                  label: 'Registrar mi cancha',
                  onClick: () => {
                    setLeadType('cancha')
                    scrollTo(leadRef)
                  },
                }}
              />
            </Reveal>
          </div>
        </section>

        {/* Canchas listing — compact location accordion */}
        <div ref={canchasRef} className="scroll-mt-24">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-graphite" />
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-graphite sm:text-4xl">
                    Encuentra tu cancha
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-6">
                    {stats.sucursales} sucursales en Guadalajara. Abre una para ver sus canchas.
                  </p>
                </div>
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
          </Reveal>

          <div className="space-y-3">
            {filteredLocations.length === 0 && (
              <p className="text-sm text-slate-6">No hay sucursales en esa zona.</p>
            )}
            {filteredLocations.map((loc, i) => (
              <Reveal key={loc.id} delay={i * 60}>
                <LocationRow loc={loc} defaultOpen={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Community gallery */}
        <section>
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-graphite" />
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-graphite sm:text-4xl">
                    Momentos de la comunidad
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-6">
                    Toca cualquier foto para verla en grande.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <CommunityGallery photos={COMMUNITY_PHOTOS} />
          </Reveal>
        </section>

        {/* Leagues teaser */}
        {leagues.length > 0 && (
          <Reveal>
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1.5 rounded-full bg-graphite" />
                  <h2 className="text-3xl font-bold tracking-tight text-graphite sm:text-4xl">
                    Torneos
                  </h2>
                </div>
                <Link
                  href="/ligas"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-lime-deep hover:underline"
                >
                  Ver todas <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {leagues.slice(0, 8).map((l) => (
                  <Link key={l.id} href={`/ligas/${l.id}`}>
                    <Card className="flex items-center gap-3 p-4 transition-all duration-300 [transition-timing-function:var(--ease-quart)] hover:-translate-y-1 hover:shadow-md">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bone-2 text-graphite">
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
          </Reveal>
        )}

        {/* Pilot + lead capture */}
        <section ref={leadRef} className="scroll-mt-24">
          <Reveal>
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="relative isolate overflow-hidden p-8 text-chalk sm:p-12">
                  <img
                    src={COMMUNITY_PHOTOS[4].src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 size-full object-cover"
                  />
                  <div className="brand-gradient absolute inset-0 -z-10 opacity-90" />
                  <span className="inline-flex items-center rounded-full bg-chalk/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.16em] text-chalk ring-1 ring-chalk/20">
                    Caso piloto
                  </span>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                    Shoot Out, nuestra cancha piloto
                  </h2>
                  <p className="mt-4 text-chalk/80">
                    Shoot Out opera desde 2021 con reservas, torneos y comunidad futbolera. Arranca
                    en Futhub con <span className="font-semibold text-chalk">3 sucursales</span>:
                    Centro, Norte y Sur.
                  </p>
                  <p className="mt-6 text-sm text-chalk/65">
                    ¿Tienes una cancha o quieres empezar a jugar? Déjanos tus datos y te
                    contactamos.
                  </p>
                </div>
                <div className="p-8 sm:p-12">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-6">
                    Súmate
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-graphite">
                    Déjanos tus datos
                  </h3>
                  <p className="mb-6 mt-1 text-sm text-slate-6">Te contactamos en menos de 24 h.</p>
                  <LeadForm key={leadType} initialType={leadType} />
                </div>
              </div>
            </Card>
          </Reveal>
        </section>
      </div>
    </>
  )
}

PublicHome.layout = (page: React.ReactNode) => <PublicLayout bleed>{page}</PublicLayout>
