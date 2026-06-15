import { Head, Link } from '@inertiajs/react'
import { Ban, CalendarCheck2, Clock, LandPlot, TrendingUp, Users, type LucideIcon } from 'lucide-react'
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

export default function DashboardIndex({ stats, recent }: { stats: Stats; recent: RecentBooking[] }) {
  return (
    <>
      <Head title="Resumen" />
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={TrendingUp} label="Ingresos" value={money(stats.revenue)} accent />
          <StatCard icon={CalendarCheck2} label="Reservas" value={formatNumber(stats.totalBookings)} />
          <StatCard icon={Clock} label="Pendientes" value={formatNumber(stats.pendingBookings)} />
          <StatCard icon={LandPlot} label="Espacios activos" value={formatNumber(stats.activeSpaces)} />
          <StatCard icon={Ban} label="Espacios bloqueados" value={formatNumber(stats.blockedSpaces)} />
          <StatCard icon={Users} label="Rentadores" value={formatNumber(stats.renters)} />
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-graphite">Reservas recientes</h2>
            <Link href="/dashboard/bookings" className="text-sm font-medium text-slate-6 transition-colors hover:text-graphite">
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
                        <td className="px-5 py-3 tabular-nums text-slate-6">{timeRange(b.startTime, b.endTime)}</td>
                        <td className="px-5 py-3"><StatusPill status={b.status} /></td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums text-graphite">{money(b.totalPrice)}</td>
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
