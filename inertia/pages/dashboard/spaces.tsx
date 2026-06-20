import { useEffect, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Ban, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Button, Card, EmptyState, StatusPill } from '~/components/ui'
import { money } from '~/lib/format'
import {
  BlockDialog,
  SpaceFormDialog,
  TYPE_LABEL,
  type LocationOpt,
  type SpaceRow,
} from '~/components/space-dialogs'

export default function Spaces({
  spaces,
  locations,
}: {
  spaces: SpaceRow[]
  locations: LocationOpt[]
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<SpaceRow | null>(null)
  const [blocking, setBlocking] = useState<SpaceRow | null>(null)

  useEffect(() => {
    const open = () => setCreateOpen(true)
    window.addEventListener('shootout:new-space', open)
    return () => window.removeEventListener('shootout:new-space', open)
  }, [])

  const remove = (s: SpaceRow) => {
    if (confirm(`¿Eliminar "${s.name}"? También se borran sus reservas y eventos.`)) {
      router.delete(`/dashboard/spaces/${s.id}`, { preserveScroll: true })
    }
  }

  return (
    <>
      <Head title="Espacios" />
      {spaces.length === 0 ? (
        <EmptyState
          title="Aún no hay espacios"
          hint="Agrega una cancha, terraza u otro espacio para empezar a rentar."
          action={
            <Button variant="lime" onClick={() => setCreateOpen(true)}>
              <Plus /> Nuevo espacio
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <>
            {/* Mobile cards — no lateral scroll */}
            <div className="space-y-3 p-3 md:hidden">
              {spaces.map((s) => (
                <div key={s.id} className="rounded-2xl border border-bone-3 bg-bone-1/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-graphite">{s.name}</p>
                      <p className="inline-flex items-center gap-1 truncate text-sm text-slate-6">
                        <MapPin className="size-3 shrink-0" /> {s.locationName}
                      </p>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-6">
                    <span>
                      {TYPE_LABEL[s.type]}
                      {s.type === 'cancha' && s.size ? ` ${s.size}` : ''}
                      {s.type !== 'cancha' && s.capacity ? ` · ${s.capacity} pers.` : ''}
                    </span>
                    <span className="font-medium text-graphite">{money(s.pricePerHour)}/h</span>
                    <span>{s.bookingsCount} reservas</span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-bone-2 pt-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(s)}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setBlocking(s)}>
                      <Ban className="size-3.5" /> Bloquear
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => remove(s)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                  <th className="px-5 py-3">Espacio</th>
                  <th className="px-5 py-3">Locación</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-right">Precio / h</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Reservas</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {spaces.map((s) => (
                  <tr key={s.id} className="border-b border-bone-2 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-graphite">{s.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-slate-6">
                        <MapPin className="size-3" /> {s.locationName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-6">
                      {TYPE_LABEL[s.type]}
                      {s.type === 'cancha' && s.size ? ` ${s.size}` : ''}
                      {s.type !== 'cancha' && s.capacity ? ` · ${s.capacity} pers.` : ''}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-graphite">
                      {money(s.pricePerHour)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-6">
                      {s.bookingsCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(s)}>
                          <Pencil className="size-3.5" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setBlocking(s)}>
                          <Ban className="size-3.5" /> Bloquear
                        </Button>
                        <Button
                          variant="danger"
                          size="icon"
                          onClick={() => remove(s)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        </Card>
      )}

      {(createOpen || editing) && (
        <SpaceFormDialog
          key={editing?.id ?? 'new'}
          space={editing ?? 'new'}
          locations={locations}
          onClose={() => {
            setCreateOpen(false)
            setEditing(null)
          }}
        />
      )}
      {blocking && <BlockDialog space={blocking} onClose={() => setBlocking(null)} />}
    </>
  )
}

Spaces.layout = (page: React.ReactNode) => (
  <DashboardLayout
    title="Espacios"
    subtitle="Canchas, terrazas y más — precios y disponibilidad"
    actions={<NewSpaceButton />}
  >
    {page}
  </DashboardLayout>
)

function NewSpaceButton() {
  return (
    <Button
      variant="lime"
      onClick={() => window.dispatchEvent(new CustomEvent('shootout:new-space'))}
    >
      <Plus /> Nuevo espacio
    </Button>
  )
}
