import { Head, Link } from '@inertiajs/react'
import {
  Ban,
  CalendarCheck2,
  Clock,
  LandPlot,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Card, StatusPill } from '~/components/ui'
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
    <Card className={accent ? 'border-lime-mark bg-lime-mark p-5' : 'p-5'}>
      <span
        className={
          accent
            ? 'flex size-9 items-center justify-center rounded-xl bg-graphite/10 text-graphite'
            : 'flex size-9 items-center justify-center rounded-xl bg-bone-2 text-graphite'
        }
      >
        <Icon className="size-[18px]" strokeWidth={1.85} />
      </span>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-graphite/60">{label}</p>
      <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight tabular-nums text-graphite">
        {value}
      </p>
    </Card>
  )
}

export default function DashboardIndex({
  stats,
  recent,
  report,
}: {
  stats: Stats
  recent: RecentBooking[]
  report: Report
}) {
  return (
    <>
      <Head title="Resumen" />
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-graphite">
              Ocupación · próximos {report.days} días
            </h2>
            <span className="text-sm text-slate-6">
              {formatDate(report.rangeStart)} – {formatDate(report.rangeEnd)}
            </span>
          </div>
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite/60">
                  Ocupación global
                </p>
                <p className="mt-1 text-[2rem] font-bold leading-none tabular-nums text-graphite">
                  {report.occupancy}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite/60">
                  Horas reservadas
                </p>
                <p className="mt-1 text-[2rem] font-bold leading-none tabular-nums text-graphite">
                  {formatNumber(report.bookedHours)}
                  <span className="text-base font-medium text-slate-6">
                    {' '}
                    / {formatNumber(report.availableHours)} h
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite/60">
                  Reservas en el periodo
                </p>
                <p className="mt-1 text-[2rem] font-bold leading-none tabular-nums text-graphite">
                  {formatNumber(report.bookingsCount)}
                </p>
              </div>
            </div>

            {report.spaces.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-6">No hay espacios activos.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {report.spaces.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className="w-44 shrink-0">
                      <p className="truncate text-sm font-medium text-graphite">{s.name}</p>
                      <p className="truncate text-xs text-slate-6">{s.locationName}</p>
                    </div>
                    <div className="h-2.5 grow overflow-hidden rounded-full bg-bone-2">
                      <div
                        className="h-full rounded-full bg-lime-mark"
                        style={{ width: `${Math.max(2, s.occupancy)}%` }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right text-sm tabular-nums text-slate-6">
                      {s.occupancy}% · {formatNumber(s.bookedHours)}h
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-graphite">Reservas recientes</h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm font-medium text-slate-6 transition-colors hover:text-graphite"
            >
              Ver todas →
            </Link>
          </div>

          <Card className="overflow-hidden">
            {recent.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-6">Aún no hay reservas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
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
                      <tr key={b.id} className="border-b border-bone-2 last:border-0">
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
              </div>
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
