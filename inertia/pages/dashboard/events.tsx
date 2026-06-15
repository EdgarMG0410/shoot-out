import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Button, Card, Dialog, EmptyState, Field, Input, Select, StatusPill, Textarea } from '~/components/ui'
import { formatDate, money, timeRange } from '~/lib/format'

type SpaceOpt = { id: number; name: string; type: 'cancha' | 'terraza' | 'otro' }
type LocationOpt = { id: number; name: string; spaces: SpaceOpt[] }
type EventRow = {
  id: number
  name: string
  description: string | null
  date: string
  startTime: string
  endTime: string
  capacity: number | null
  price: number | null
  status: 'scheduled' | 'cancelled'
  location: string
  locationId: number
  spaceId: number
  venue: string
}

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }

function EventDialog({
  event,
  locations,
  onClose,
}: {
  event: EventRow | 'new'
  locations: LocationOpt[]
  onClose: () => void
}) {
  const isEdit = event !== 'new'
  const form = useForm({
    locationId: String(isEdit ? event.locationId : locations[0]?.id ?? ''),
    spaceId: String(isEdit ? event.spaceId : ''),
    name: isEdit ? event.name : '',
    description: isEdit ? (event.description ?? '') : '',
    date: isEdit ? event.date : '',
    startTime: isEdit ? event.startTime : '',
    endTime: isEdit ? event.endTime : '',
    capacity: isEdit && event.capacity != null ? String(event.capacity) : '',
    price: isEdit && event.price != null ? String(event.price) : '',
    status: isEdit ? event.status : 'scheduled',
  })

  const selectedLoc = locations.find((l) => String(l.id) === form.data.locationId)
  const spaces = selectedLoc?.spaces ?? []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      spaceId: d.spaceId ? Number(d.spaceId) : 0,
      name: d.name,
      description: d.description || null,
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      capacity: d.capacity ? Number(d.capacity) : null,
      price: d.price ? Number(d.price) : null,
      status: d.status,
    }))
    const opts = { onSuccess: onClose, preserveScroll: true }
    if (isEdit) form.put(`/dashboard/events/${event.id}`, opts)
    else form.post('/dashboard/events', opts)
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Editar evento' : 'Nuevo evento'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre" error={form.errors.name}>
          <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Torneo Relámpago 5v5" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Locación">
            <Select value={form.data.locationId} onChange={(e) => { form.setData('locationId', e.target.value); form.setData('spaceId', '') }}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <Field label="Espacio" error={form.errors.spaceId}>
            <Select value={form.data.spaceId} onChange={(e) => form.setData('spaceId', e.target.value)} required>
              <option value="" disabled>{spaces.length ? 'Selecciona…' : 'Sin espacios'}</option>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name} ({TYPE_LABEL[s.type]})</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Fecha" error={form.errors.date}>
          <Input type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Inicio" error={form.errors.startTime}>
            <Input type="time" value={form.data.startTime} onChange={(e) => form.setData('startTime', e.target.value)} required />
          </Field>
          <Field label="Fin" error={form.errors.endTime}>
            <Input type="time" value={form.data.endTime} onChange={(e) => form.setData('endTime', e.target.value)} required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cupo" hint="Opcional">
            <Input type="number" min="1" value={form.data.capacity} onChange={(e) => form.setData('capacity', e.target.value)} placeholder="40" />
          </Field>
          <Field label="Precio" hint="Opcional">
            <Input type="number" min="1" step="0.01" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} placeholder="2000" />
          </Field>
        </div>
        <Field label="Descripción" hint="Opcional">
          <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
        </Field>
        {isEdit && (
          <Field label="Estado">
            <Select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as 'scheduled' | 'cancelled')}>
              <option value="scheduled">Programado</option>
              <option value="cancelled">Cancelado</option>
            </Select>
          </Field>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="lime" disabled={form.processing}>{isEdit ? 'Guardar' : 'Crear evento'}</Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function Events({ events, locations }: { events: EventRow[]; locations: LocationOpt[] }) {
  const [dialog, setDialog] = useState<EventRow | 'new' | null>(null)

  const remove = (ev: EventRow) => {
    if (confirm(`¿Eliminar el evento "${ev.name}"?`)) {
      router.delete(`/dashboard/events/${ev.id}`, { preserveScroll: true })
    }
  }

  return (
    <>
      <Head title="Eventos" />
      <div className="mb-5 flex justify-end">
        <Button variant="lime" onClick={() => setDialog('new')} disabled={locations.length === 0}><Plus /> Nuevo evento</Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Aún no hay eventos"
          hint={locations.length === 0 ? 'Primero crea una locación con espacios.' : 'Programa un torneo, fiesta o clase.'}
          action={locations.length > 0 ? <Button variant="lime" onClick={() => setDialog('new')}><Plus /> Nuevo evento</Button> : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                  <th className="px-5 py-3">Evento</th>
                  <th className="px-5 py-3">Espacio</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Hora</th>
                  <th className="px-5 py-3 text-right">Cupo</th>
                  <th className="px-5 py-3 text-right">Precio</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-bone-2 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-graphite">{ev.name}</p>
                      <p className="text-xs text-slate-6">{ev.location}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-6">{ev.venue}</td>
                    <td className="px-5 py-3.5 text-slate-6">{formatDate(ev.date)}</td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-6">{timeRange(ev.startTime, ev.endTime)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-6">{ev.capacity ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-graphite">{ev.price != null ? money(ev.price) : '—'}</td>
                    <td className="px-5 py-3.5"><StatusPill status={ev.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setDialog(ev)}><Pencil className="size-3.5" /> Editar</Button>
                        <Button variant="danger" size="icon" onClick={() => remove(ev)} aria-label="Eliminar"><Trash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {dialog && <EventDialog key={dialog === 'new' ? 'new' : dialog.id} event={dialog} locations={locations} onClose={() => setDialog(null)} />}
    </>
  )
}

Events.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Eventos" subtitle="Torneos, fiestas y clases por espacio">
    {page}
  </DashboardLayout>
)
