import { useForm } from '@inertiajs/react'
import { Button, Dialog, Field, Input, Select, Textarea } from '~/components/ui'

export type SpaceType = 'cancha' | 'terraza' | 'otro'
export type LocationOpt = { id: number; name: string }
export type SpaceRow = {
  id: number
  name: string
  locationId: number
  locationName: string
  type: SpaceType
  size: '5' | '7' | '11' | null
  pricePerHour: number
  capacity: number | null
  photoUrl: string | null
  openTime: string
  closeTime: string
  status: 'active' | 'blocked'
  bookingsCount: number
}

export const TYPE_LABEL: Record<SpaceType, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }

export function SpaceFormDialog({
  space,
  locations,
  lockLocation = false,
  onClose,
}: {
  space: SpaceRow | 'new'
  locations: LocationOpt[]
  /** Hide the location selector (when editing within a single location). */
  lockLocation?: boolean
  onClose: () => void
}) {
  const isEdit = space !== 'new'
  const form = useForm({
    locationId: String(isEdit ? space.locationId : locations[0]?.id ?? ''),
    name: isEdit ? space.name : '',
    type: (isEdit ? space.type : 'cancha') as SpaceType,
    size: isEdit && space.size ? space.size : '5',
    pricePerHour: isEdit ? String(space.pricePerHour) : '',
    capacity: isEdit && space.capacity != null ? String(space.capacity) : '',
    photoUrl: isEdit ? (space.photoUrl ?? '') : '',
    openTime: isEdit ? space.openTime.slice(0, 5) : '08:00',
    closeTime: isEdit ? space.closeTime.slice(0, 5) : '22:00',
    status: isEdit ? space.status : 'active',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      locationId: Number(d.locationId),
      name: d.name,
      type: d.type,
      size: d.type === 'cancha' ? d.size : null,
      pricePerHour: d.pricePerHour ? Number(d.pricePerHour) : 0,
      capacity: d.type !== 'cancha' && d.capacity ? Number(d.capacity) : null,
      photoUrl: d.photoUrl || null,
      openTime: d.openTime,
      closeTime: d.closeTime,
      status: d.status,
    }))
    const opts = { onSuccess: onClose, preserveScroll: true }
    if (isEdit) form.put(`/dashboard/spaces/${space.id}`, opts)
    else form.post('/dashboard/spaces', opts)
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Editar espacio' : 'Nuevo espacio'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!lockLocation && (
          <Field label="Locación" error={form.errors.locationId}>
            <Select value={form.data.locationId} onChange={(e) => form.setData('locationId', e.target.value)} required>
              <option value="" disabled>{locations.length ? 'Selecciona…' : 'Crea una locación primero'}</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Nombre" error={form.errors.name}>
          <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Cancha Norte / Terraza Centro" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo" error={form.errors.type}>
            <Select value={form.data.type} onChange={(e) => form.setData('type', e.target.value as SpaceType)}>
              <option value="cancha">Cancha</option>
              <option value="terraza">Terraza</option>
              <option value="otro">Otro</option>
            </Select>
          </Field>
          {form.data.type === 'cancha' ? (
            <Field label="Tamaño" error={form.errors.size}>
              <Select value={form.data.size} onChange={(e) => form.setData('size', e.target.value as '5' | '7' | '11')}>
                <option value="5">Fútbol 5</option>
                <option value="7">Fútbol 7</option>
                <option value="11">Fútbol 11</option>
              </Select>
            </Field>
          ) : (
            <Field label="Capacidad" error={form.errors.capacity} hint="Opcional">
              <Input type="number" min="1" value={form.data.capacity} onChange={(e) => form.setData('capacity', e.target.value)} placeholder="120" />
            </Field>
          )}
        </div>
        <Field label="Precio / hora (MXN)" error={form.errors.pricePerHour}>
          <Input type="number" min="1" step="0.01" value={form.data.pricePerHour} onChange={(e) => form.setData('pricePerHour', e.target.value)} placeholder="450" required />
        </Field>
        <Field label="URL de foto" error={form.errors.photoUrl} hint="Opcional">
          <Input type="url" value={form.data.photoUrl} onChange={(e) => form.setData('photoUrl', e.target.value)} placeholder="https://…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Abre" error={form.errors.openTime} hint="Horario de renta">
            <Input type="time" value={form.data.openTime} onChange={(e) => form.setData('openTime', e.target.value)} required />
          </Field>
          <Field label="Cierra" error={form.errors.closeTime}>
            <Input type="time" value={form.data.closeTime} onChange={(e) => form.setData('closeTime', e.target.value)} required />
          </Field>
        </div>
        {isEdit && (
          <Field label="Estado" error={form.errors.status}>
            <Select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as 'active' | 'blocked')}>
              <option value="active">Activo</option>
              <option value="blocked">Bloqueado</option>
            </Select>
          </Field>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="lime" disabled={form.processing}>{isEdit ? 'Guardar cambios' : 'Crear espacio'}</Button>
        </div>
      </form>
    </Dialog>
  )
}

export function BlockDialog({ space, onClose }: { space: SpaceRow; onClose: () => void }) {
  const form = useForm({ date: '', startTime: '', endTime: '', reason: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post(`/dashboard/spaces/${space.id}/block`, { onSuccess: onClose, preserveScroll: true })
  }
  return (
    <Dialog open onClose={onClose} title={`Bloquear horario · ${space.name}`} description="Marca una franja como no disponible.">
      <form onSubmit={submit} className="flex flex-col gap-4">
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
        <Field label="Motivo" error={form.errors.reason} hint="Opcional">
          <Textarea value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="Mantenimiento, evento privado…" />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={form.processing}>Agregar bloqueo</Button>
        </div>
      </form>
    </Dialog>
  )
}
