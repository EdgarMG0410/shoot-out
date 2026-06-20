import { Head, Link } from '@inertiajs/react'
import {
  ArrowRight,
  Ban,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Clock,
  Inbox,
  LandPlot,
  PartyPopper,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Card, StatusPill } from '~/components/ui'
import { AreaChart, Donut, RadialGauge } from '~/components/charts'
import { formatDate, formatNumber, money, timeRange } from '~/lib/format'

type Stats = {
  activeSpaces: number
  blockedSpaces: number
  totalBookings: number
  pendingBookings: number
  revenue: number
  renters: number
}

type RecentBooking = {
  id: number
  space: string
  user: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
}

type Report = {
  days: number
  rangeStart: string
  rangeEnd: string
  bookingsCount: number
  bookedHours: number
  availableHours: number
  occupancy: number
  spaces: {
    id: number
    name: string
    locationName: string
    bookedHours: number
    availableHours: number
    occupancy: number
  }[]
}

type TrendPoint = { date: string; bookings: number; revenue: number }
type StatusSlice = { status: string; count: number }

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmadas', color: 'oklch(62% 0.15 158)' },
  pending: { label: 'Pendientes', color: 'oklch(80% 0.13 80)' },
  cancelled: { label: 'Canceladas', color: 'oklch(63% 0.2 18)' },
}

type UpcomingMatch = {
  id: number
  homeTeam: string
  awayTeam: string
  league: string
  space: string
  date: string
  startTime: string
}
type LeagueRow = { id: number; name: string; locationName: string; teamsCount: number }

const QUICK = [
  { href: '/dashboard/bookings', label: 'Reservas', icon: CalendarCheck2 },
  { href: '/dashboard/leagues', label: 'Torneos', icon: Trophy },
  { href: '/dashboard/locations', label: 'Locaciones', icon: Building2 },
  { href: '/dashboard/spaces', label: 'Espacios', icon: LandPlot },
  { href: '/dashboard/events', label: 'Eventos', icon: PartyPopper },
  { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: Inbox },
] as const

function shortDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(d)
}

/* ------------------------------- Stat card ------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Card
      className={
        accent
          ? 'group p-5 ring-1 ring-graphite/5 transition-shadow hover:shadow-md bg-graphite border-graphite'
          : 'group p-5 transition-shadow hover:shadow-md'
      }
    >
      <span
        className={
          accent
            ? 'flex size-9 items-center justify-center rounded-xl bg-chalk/10 text-chalk'
            : 'flex size-9 items-center justify-center rounded-xl bg-bone-2 text-graphite transition-colors group-hover:bg-bone-3'
        }
      >
        <Icon className="size-[18px]" strokeWidth={1.85} />
      </span>
      <p
        className={
          accent
            ? 'mt-4 text-xs font-medium uppercase tracking-wide text-chalk/55'
            : 'mt-4 text-xs font-medium uppercase tracking-wide text-graphite/55'
        }
      >
        {label}
      </p>
      <p
        className={
          accent
            ? 'mt-1 text-[2rem] font-bold leading-none tracking-tight tabular-nums text-chalk'
            : 'mt-1 text-[2rem] font-bold leading-none tracking-tight tabular-nums text-graphite'
        }
      >
        {value}
      </p>
    </Card>
  )
}

/* -------------------------------- Header --------------------------------- */

function SectionHead({
  title,
  meta,
  action,
}: {
  title: string
  meta?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-semibold text-graphite">{title}</h2>
      {meta && <span className="text-sm text-slate-6">{meta}</span>}
      {action}
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function DashboardIndex({
  stats,
  recent,
  report,
  timeseries,
  byStatus,
  upcomingMatches,
  leagues,
}: {
  stats: Stats
  recent: RecentBooking[]
  report: Report
  timeseries: TrendPoint[]
  byStatus: StatusSlice[]
  upcomingMatches: UpcomingMatch[]
  leagues: LeagueRow[]
}) {
  const trendBookings = timeseries.reduce((a, p) => a + p.bookings, 0)
  const trendRevenue = timeseries.reduce((a, p) => a + p.revenue, 0)
  const trendData = timeseries.map((p) => ({
    label: shortDay(p.date),
    value: p.bookings,
    sub: money(p.revenue),
  }))

  const statusTotal = byStatus.reduce((a, s) => a + s.count, 0)
  const segments = byStatus
    .filter((s) => STATUS_META[s.status])
    .map((s) => ({
      key: s.status,
      label: STATUS_META[s.status].label,
      value: s.count,
      color: STATUS_META[s.status].color,
    }))

  return (
    <>
      <Head title="Resumen" />
      <div className="space-y-6">
        {/* Quick actions — mobile only */}
        <section className="lg:hidden">
          <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-6">
            Accesos rápidos
          </h2>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex w-28 shrink-0 snap-start flex-col items-start gap-3 rounded-2xl border border-bone-3 bg-chalk p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-bone-2 text-graphite">
                  <q.icon className="size-5" strokeWidth={1.85} />
                </span>
                <span className="text-sm font-semibold text-graphite">{q.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats — desktop only */}
        <section className="hidden gap-4 lg:grid lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={TrendingUp} label="Ingresos" value={money(stats.revenue)} accent />
          <StatCard
            icon={CalendarCheck2}
            label="Reservas"
            value={formatNumber(stats.totalBookings)}
          />
          <StatCard icon={Clock} label="Pendientes" value={formatNumber(stats.pendingBookings)} />
          <StatCard
            icon={LandPlot}
            label="Espacios activos"
            value={formatNumber(stats.activeSpaces)}
          />
          <StatCard
            icon={Ban}
            label="Espacios bloqueados"
            value={formatNumber(stats.blockedSpaces)}
          />
          <StatCard icon={Users} label="Rentadores" value={formatNumber(stats.renters)} />
        </section>

        {/* Trend + occupancy gauge */}
        <section className="hidden gap-4 lg:grid lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-graphite">Actividad</h2>
                <p className="text-sm text-slate-6">Reservas por día · últimos 14 días</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold leading-none tabular-nums text-graphite">
                  {formatNumber(trendBookings)}
                </p>
                <p className="mt-1 text-xs text-slate-6">reservas · {money(trendRevenue)}</p>
              </div>
            </div>
            <div className="-mx-1">
              <AreaChart
                data={trendData}
                height={252}
                unit="reservas"
                ariaLabel="Reservas por día en los últimos 14 días"
              />
            </div>
          </Card>

          <Card className="flex flex-col p-5">
            <h2 className="text-base font-semibold text-graphite">Ocupación</h2>
            <p className="text-sm text-slate-6">Próximos {report.days} días</p>
            <div className="flex flex-1 items-center justify-center py-4">
              <RadialGauge value={report.occupancy} caption="global" />
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t border-bone-3 pt-4">
              <div>
                <dt className="text-xs text-slate-6">Horas reservadas</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-graphite">
                  {formatNumber(report.bookedHours)}
                  <span className="text-xs font-medium text-slate-6">
                    {' '}
                    / {formatNumber(report.availableHours)}h
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-6">Reservas periodo</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-graphite">
                  {formatNumber(report.bookingsCount)}
                </dd>
              </div>
            </dl>
          </Card>
        </section>

        {/* Status breakdown + per-space occupancy */}
        <section className="hidden gap-4 lg:grid lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-graphite">Reservas por estado</h2>
            <p className="text-sm text-slate-6">Distribución histórica</p>
            {statusTotal === 0 ? (
              <p className="py-10 text-center text-sm text-slate-6">Aún no hay reservas.</p>
            ) : (
              <div className="mt-4 flex items-center gap-5">
                <Donut
                  segments={segments}
                  centerValue={formatNumber(statusTotal)}
                  centerLabel="total"
                />
                <ul className="flex-1 space-y-2.5">
                  {segments.map((s) => {
                    const pct = statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0
                    return (
                      <li key={s.key} className="flex items-center gap-2.5 text-sm">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="flex-1 text-slate-6">{s.label}</span>
                        <span className="font-semibold tabular-nums text-graphite">{s.value}</span>
                        <span className="w-9 text-right text-xs tabular-nums text-slate-6">
                          {pct}%
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold text-graphite">Ocupación por espacio</h2>
              <span className="text-sm text-slate-6">
                {formatDate(report.rangeStart)} – {formatDate(report.rangeEnd)}
              </span>
            </div>
            {report.spaces.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-6">No hay espacios activos.</p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {report.spaces.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className="w-40 shrink-0">
                      <p className="truncate text-sm font-medium text-graphite">{s.name}</p>
                      <p className="truncate text-xs text-slate-6">{s.locationName}</p>
                    </div>
                    <div className="h-2.5 grow overflow-hidden rounded-full bg-bone-2">
                      <div
                        className="h-full rounded-full bg-graphite transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.max(2, s.occupancy)}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right text-sm tabular-nums text-slate-6">
                      {s.occupancy}% · {formatNumber(s.bookedHours)}h
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Próximos partidos */}
        <section>
          <SectionHead
            title="Próximos partidos"
            action={
              <Link
                href="/dashboard/leagues"
                className="ml-auto text-sm font-medium text-slate-6 transition-colors hover:text-graphite"
              >
                Ver más →
              </Link>
            }
          />
          {upcomingMatches.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-sm text-slate-6">No hay partidos programados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcomingMatches.slice(0, 3).map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-medium uppercase tracking-wide text-slate-6">
                      {formatDate(m.date)} · {m.startTime}
                    </p>
                    <span className="inline-flex h-6 items-center rounded-full bg-amber-mark/15 px-2.5 text-[11px] font-semibold text-amber-mark">
                      Próximo
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="truncate font-display text-xl font-bold uppercase tracking-tight text-graphite">
                      {m.homeTeam}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold uppercase text-rose-mark">
                        vs
                      </span>
                      <span className="h-px flex-1 bg-bone-3" />
                    </div>
                    <p className="truncate font-display text-xl font-bold uppercase tracking-tight text-graphite">
                      {m.awayTeam}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-bone-2 pt-3 text-sm text-slate-6">
                    <Trophy className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{m.league}</span>
                    <span className="shrink-0 truncate">{m.space}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Torneos */}
        <section>
          <SectionHead
            title="Torneos"
            action={
              <Link
                href="/dashboard/leagues"
                className="ml-auto text-sm font-medium text-slate-6 transition-colors hover:text-graphite"
              >
                Ver todos →
              </Link>
            }
          />
          {leagues.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-sm text-slate-6">Aún no hay torneos.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {leagues.map((l) => (
                <Link key={l.id} href={`/dashboard/leagues/${l.id}`}>
                  <Card className="flex h-full items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
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
          )}
        </section>

        {/* Recent bookings */}
        <section>
          <SectionHead
            title="Reservas recientes"
            action={
              <Link
                href="/dashboard/bookings"
                className="ml-auto text-sm font-medium text-slate-6 transition-colors hover:text-graphite"
              >
                Ver todas →
              </Link>
            }
          />
          <Card className="overflow-hidden">
            {recent.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-6">Aún no hay reservas.</p>
            ) : (
              <>
                {/* Mobile cards — no lateral scroll */}
                <div className="space-y-3 p-3 md:hidden">
                  {recent.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-bone-3 bg-bone-1/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-graphite">{b.space}</p>
                          <p className="truncate text-sm text-slate-6">{b.user}</p>
                        </div>
                        <StatusPill status={b.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-bone-2 pt-3 text-sm text-slate-6">
                        <span>
                          {formatDate(b.date)} ·{' '}
                          <span className="tabular-nums">{timeRange(b.startTime, b.endTime)}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-graphite">
                          {money(b.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <table className="hidden w-full text-sm md:table">
                  <thead>
                    <tr className="border-b border-bone-3 bg-bone-1/40 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                      <th className="px-5 py-3">Espacio</th>
                      <th className="px-5 py-3">Rentador</th>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Hora</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-bone-2 transition-colors last:border-0 hover:bg-bone-1/50"
                      >
                        <td className="px-5 py-3 font-medium text-graphite">{b.space}</td>
                        <td className="px-5 py-3 text-slate-6">{b.user}</td>
                        <td className="px-5 py-3 text-slate-6">{formatDate(b.date)}</td>
                        <td className="px-5 py-3 tabular-nums text-slate-6">
                          {timeRange(b.startTime, b.endTime)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={b.status} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums text-graphite">
                          {money(b.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Card>
        </section>
      </div>
    </>
  )
}

DashboardIndex.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Resumen" subtitle="Lo que está pasando en tus espacios">
    {page}
  </DashboardLayout>
)
