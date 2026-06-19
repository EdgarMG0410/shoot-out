import { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Button, Card, Dialog, EmptyState, Field, Input, Select, StatusPill } from '~/components/ui'

type SpaceRef = {
  id: number
  name: string
  type: 'cancha' | 'terraza' | 'otro'
  size: string | null
  status: string
}
type LocationRow = {
  id: number
  name: string
  address: string
  phone: string | null
  status: 'active' | 'inactive'
  spaces: SpaceRef[]
}

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }

function LocationDialog({
  location,
  onClose,
}: {
  location: LocationRow | 'new'
  onClose: () => void
}) {
  const isEdit = location !== 'new'
  const form = useForm({
    name: isEdit ? location.name : '',
    address: isEdit ? location.address : '',
    phone: isEdit ? (location.phone ?? '') : '',
    status: isEdit ? location.status : 'active',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const opts = { onSuccess: onClose, preserveScroll: true }
    if (isEdit) form.put(`/dashboard/locations/${location.id}`, opts)
    else form.post('/dashboard/locations', opts)
  }
  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Editar locación' : 'Nueva locación'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Shootout Centro"
            required
          />
        </Field>
        <Field label="Dirección" error={form.errors.address}>
          <Input
            value={form.data.address}
            onChange={(e) => form.setData('address', e.target.value)}
            placeholder="Av. Chapultepec 100"
            required
          />
        </Field>
        <Field label="Teléfono" error={form.errors.phone} hint="Opcional">
          <Input
            value={form.data.phone}
            onChange={(e) => form.setData('phone', e.target.value)}
            placeholder="33 1111 2222"
          />
        </Field>
        {isEdit && (
          <Field label="Estado" error={form.errors.status}>
            <Select
              value={form.data.status}
              onChange={(e) => form.setData('status', e.target.value as LocationRow['status'])}
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </Select>
          </Field>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function Locations({ locations }: { locations: LocationRow[] }) {
  const [dialog, setDialog] = useState<LocationRow | 'new' | null>(null)

  const remove = (l: LocationRow) => {
    if (confirm(`¿Eliminar "${l.name}"? Se borran sus espacios y eventos.`)) {
      router.delete(`/dashboard/locations/${l.id}`, { preserveScroll: true })
    }
  }

  return (
    <>
      <Head title="Locaciones" />
      <div className="mb-5 flex justify-end">
        <Button variant="lime" onClick={() => setDialog('new')}>
          <Plus /> Nueva locación
        </Button>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          title="Aún no hay locaciones"
          hint="Crea una sede para agrupar sus espacios."
          action={
            <Button variant="lime" onClick={() => setDialog('new')}>
              <Plus /> Nueva locación
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {locations.map((loc) => (
            <Card key={loc.id} className="p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-graphite">{loc.name}</h3>
                  <StatusPill status={loc.status} />
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-6">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {loc.address}
                  </span>
                  {loc.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" /> {loc.phone}
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {loc.spaces.length === 0 ? (
                  <span className="text-sm text-slate-6">Sin espacios</span>
                ) : (
                  loc.spaces.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-md bg-bone-2 px-2 py-1 text-xs text-graphite"
                    >
                      {s.name}
                      <span className="text-slate-6">
                        · {TYPE_LABEL[s.type]}
                        {s.type === 'cancha' && s.size ? ` ${s.size}` : ''}
                      </span>
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-bone-2 pt-4">
                <Link href={`/dashboard/locations/${loc.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => remove(loc)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {dialog && (
        <LocationDialog
          key={dialog === 'new' ? 'new' : dialog.id}
          location={dialog}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  )
}

Locations.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Locaciones" subtitle="Sedes y sus espacios">
    {page}
  </DashboardLayout>
)
