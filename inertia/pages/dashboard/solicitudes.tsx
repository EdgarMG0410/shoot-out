import { Head } from '@inertiajs/react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Card, EmptyState } from '~/components/ui'
import { cn } from '~/lib/utils'

type Lead = {
  id: number
  name: string
  email: string
  phone: string | null
  type: 'jugador' | 'cancha'
  contactMedium: string | null
  message: string | null
  createdAt: string
}
type Counts = { total: number; jugador: number; cancha: number }

const TYPE_LABEL: Record<string, string> = { jugador: 'Jugador', cancha: 'Cancha' }

function when(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

const waLink = (phone: string) => `https://wa.me/52${phone.replace(/\D/g, '')}`

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-6">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-graphite">{value}</p>
    </Card>
  )
}

export default function Solicitudes({ leads, counts }: { leads: Lead[]; counts: Counts }) {
  return (
    <>
      <Head title="Solicitudes" />
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Total" value={counts.total} />
          <Stat label="Jugadores" value={counts.jugador} />
          <Stat label="Canchas" value={counts.cancha} />
        </section>

        {leads.length === 0 ? (
          <EmptyState
            title="Aún no hay solicitudes"
            hint="Cuando alguien deje sus datos en la landing, aparecerá aquí."
          />
        ) : (
          <Card className="overflow-hidden">
            <>
              {/* Mobile cards — no lateral scroll */}
              <div className="space-y-3 p-3 md:hidden">
                {leads.map((l) => (
                  <div key={l.id} className="rounded-2xl border border-bone-3 bg-bone-1/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-graphite">{l.name}</p>
                      <span
                        className={cn(
                          'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
                          l.type === 'cancha' ? 'bg-graphite text-chalk' : 'bg-bone-2 text-graphite'
                        )}
                      >
                        {TYPE_LABEL[l.type] ?? l.type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm">
                      <a
                        href={`mailto:${l.email}`}
                        className="inline-flex items-center gap-1.5 text-slate-6 hover:text-graphite"
                      >
                        <Mail className="size-3.5 shrink-0" /> {l.email}
                      </a>
                      {l.phone && (
                        <a
                          href={waLink(l.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-6 hover:text-lime-deep"
                        >
                          <Phone className="size-3.5 shrink-0" /> {l.phone}
                        </a>
                      )}
                    </div>
                    {l.contactMedium && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-6">
                        <MessageCircle className="size-3.5" /> {l.contactMedium}
                      </p>
                    )}
                    {l.message && <p className="mt-2 text-sm text-slate-6">{l.message}</p>}
                    <p className="mt-2 text-xs tabular-nums text-slate-6">{when(l.createdAt)}</p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden w-full text-sm md:table">
                <thead>
                  <tr className="border-b border-bone-3 bg-bone-1/40 text-left font-mono text-xs font-bold uppercase tracking-[0.12em] text-slate-6">
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Contacto</th>
                    <th className="px-5 py-3">Medio</th>
                    <th className="px-5 py-3">Mensaje</th>
                    <th className="px-5 py-3 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-bone-2 align-top transition-colors last:border-0 hover:bg-bone-1/50"
                    >
                      <td className="px-5 py-3 font-medium text-graphite">{l.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
                            l.type === 'cancha'
                              ? 'bg-graphite text-chalk'
                              : 'bg-bone-2 text-graphite'
                          )}
                        >
                          {TYPE_LABEL[l.type] ?? l.type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`mailto:${l.email}`}
                            className="inline-flex items-center gap-1.5 text-slate-6 transition-colors hover:text-graphite"
                          >
                            <Mail className="size-3.5 shrink-0" /> {l.email}
                          </a>
                          {l.phone && (
                            <a
                              href={waLink(l.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-slate-6 transition-colors hover:text-lime-deep"
                            >
                              <Phone className="size-3.5 shrink-0" /> {l.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-6">
                        {l.contactMedium ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="size-3.5 shrink-0" /> {l.contactMedium}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="max-w-xs px-5 py-3 text-slate-6">{l.message || '—'}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-slate-6">
                        {when(l.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          </Card>
        )}
      </div>
    </>
  )
}

Solicitudes.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Solicitudes" subtitle="Interesados que dejaron sus datos en la landing">
    {page}
  </DashboardLayout>
)
