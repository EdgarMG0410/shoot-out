import { Head, Link } from '@inertiajs/react'
import { Check, Minus } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Card, StatusPill } from '~/components/ui'
import { cn } from '~/lib/utils'
import { formatDate, money, timeRange } from '~/lib/format'

type BookingRow = {
  id: number
  space: string
  user: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  paid: boolean
  method: string | null
}

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export default function Bookings({ bookings, filter }: { bookings: BookingRow[]; filter: string }) {
  return (
    <>
      <Head title="Reservas" />
      <div className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key
            const href =
              f.key === 'all' ? '/dashboard/bookings' : `/dashboard/bookings?status=${f.key}`
            return (
              <Link
                key={f.key}
                href={href}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-graphite text-chalk'
                    : 'bg-chalk text-slate-6 border border-bone-3 hover:bg-bone-2 hover:text-graphite'
                )}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        <Card className="overflow-hidden">
          {bookings.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-6">No hay reservas aquí.</p>
          ) : (
            <>
              {/* Mobile cards — no lateral scroll */}
              <div className="space-y-3 p-3 md:hidden">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-bone-3 bg-bone-1/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-graphite">{b.space}</p>
                        <p className="truncate text-sm text-slate-6">{b.user}</p>
                      </div>
                      <StatusPill status={b.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-6">
                      <span>{formatDate(b.date)}</span>
                      <span className="tabular-nums">{timeRange(b.startTime, b.endTime)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-bone-2 pt-3">
                      {b.paid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-mark">
                          <Check className="size-3.5" /> {b.method}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-6">Sin pago</span>
                      )}
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
                  <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Espacio</th>
                    <th className="px-5 py-3">Rentador</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Hora</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Pago</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-bone-2 last:border-0">
                      <td className="px-5 py-3.5 tabular-nums text-slate-6">{b.id}</td>
                      <td className="px-5 py-3.5 font-medium text-graphite">{b.space}</td>
                      <td className="px-5 py-3.5 text-slate-6">{b.user}</td>
                      <td className="px-5 py-3.5 text-slate-6">{formatDate(b.date)}</td>
                      <td className="px-5 py-3.5 tabular-nums text-slate-6">
                        {timeRange(b.startTime, b.endTime)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {b.paid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-mark">
                            <Check className="size-3.5" /> {b.method}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-6">
                            <Minus className="size-3.5" /> —
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-graphite">
                        {money(b.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Card>
      </div>
    </>
  )
}

Bookings.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Reservas" subtitle="Todas las reservas de tus canchas">
    {page}
  </DashboardLayout>
)
