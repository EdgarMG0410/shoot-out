import { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Ban, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Button, Card, EmptyState, Field, Input, Select, StatusPill } from '~/components/ui'
import { ImageUpload } from '~/components/image-upload'
import { money } from '~/lib/format'
import { BlockDialog, SpaceFormDialog, TYPE_LABEL, type SpaceRow } from '~/components/space-dialogs'

type LocationData = {
  id: number
  name: string
  address: string
  phone: string | null
  photoUrl: string | null
  status: 'active' | 'inactive'
}

const hhmm = (t: string) => (t ?? '').slice(0, 5)

function LocationForm({ location }: { location: LocationData }) {
  const form = useForm({
    name: location.name,
    address: location.address,
    phone: location.phone ?? '',
    photoUrl: location.photoUrl ?? '',
    status: location.status,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({ ...d, phone: d.phone || null, photoUrl: d.photoUrl || null }))
    form.put(`/dashboard/locations/${location.id}`, { preserveScroll: true })
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-graphite">Datos de la locación</h2>
      <div className="mt-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Nombre" error={form.errors.name}>
            <Input
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              required
            />
          </Field>
          <Field label="Dirección" error={form.errors.address}>
            <Input
              value={form.data.address}
              onChange={(e) => form.setData('address', e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono" error={form.errors.phone} hint="Opcional">
              <Input
                value={form.data.phone}
                onChange={(e) => form.setData('phone', e.target.value)}
                placeholder="33 1111 2222"
              />
            </Field>
            <Field label="Estado" error={form.errors.status}>
              <Select
                value={form.data.status}
                onChange={(e) => form.setData('status', e.target.value as LocationData['status'])}
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </Select>
            </Field>
          </div>
          <Field label="Foto" error={form.errors.photoUrl} hint="Opcional">
            <ImageUpload
              value={form.data.photoUrl || null}
              onChange={(url) => form.setData('photoUrl', url ?? '')}
              folder="locations"
              aspect="video"
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" variant="lime" disabled={form.processing}>
              {form.processing ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}

export default function LocationEdit({
  location,
  spaces,
}: {
  location: LocationData
  spaces: SpaceRow[]
}) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<SpaceRow | null>(null)
  const [blocking, setBlocking] = useState<SpaceRow | null>(null)

  const locOpt = [{ id: location.id, name: location.name }]

  const removeSpace = (s: SpaceRow) => {
    if (confirm(`¿Eliminar "${s.name}"? También se borran sus reservas y eventos.`)) {
      router.delete(`/dashboard/spaces/${s.id}`, { preserveScroll: true })
    }
  }

  return (
    <>
      <Head title={`Editar · ${location.name}`} />

      <Link
        href="/dashboard/locations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-6 hover:text-graphite"
      >
        <ArrowLeft className="size-4" /> Locaciones
      </Link>

      <div className="space-y-6">
        <LocationForm location={location} />

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-graphite">Espacios de la locación</h2>
            <Button variant="lime" size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Nuevo espacio
            </Button>
          </div>

          {spaces.length === 0 ? (
            <EmptyState
              title="Sin espacios"
              hint="Agrega una cancha, terraza u otro espacio a esta locación."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {spaces.map((s) => (
                <div key={s.id} className="rounded-2xl border border-bone-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-graphite">{s.name}</p>
                      <p className="mt-0.5 text-sm text-slate-6">
                        {TYPE_LABEL[s.type]}
                        {s.type === 'cancha' && s.size ? ` ${s.size}` : ''}
                        {s.type !== 'cancha' && s.capacity ? ` · ${s.capacity} pers.` : ''}
                      </p>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  <p className="mt-2 flex items-center gap-3 text-sm text-slate-6">
                    <span className="font-semibold tabular-nums text-graphite">
                      {money(s.pricePerHour)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {hhmm(s.openTime)}–{hhmm(s.closeTime)}
                    </span>
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-bone-2 pt-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(s)}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setBlocking(s)}>
                      <Ban className="size-3.5" /> Bloquear
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => removeSpace(s)}
                      aria-label="Eliminar"
                      className="ml-auto"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {(creating || editing) && (
        <SpaceFormDialog
          key={editing?.id ?? 'new'}
          space={editing ?? 'new'}
          locations={locOpt}
          lockLocation
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
      {blocking && <BlockDialog space={blocking} onClose={() => setBlocking(null)} />}
    </>
  )
}

LocationEdit.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Editar locación" subtitle="Datos, foto y espacios de la sede">
    {page}
  </DashboardLayout>
)
