import { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowRight, CalendarRange, MapPin, Plus, Trash2, Trophy, Users } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  Select,
  StatusPill,
  Textarea,
} from '~/components/ui'
import { formatDate } from '~/lib/format'

type LocationOpt = { id: number; name: string }
type LeagueRow = {
  id: number
  name: string
  locationId: number
  locationName: string
  seasonStart: string | null
  seasonEnd: string | null
  status: 'active' | 'finished'
  teamsCount: number
  matchesCount: number
}

function LeagueDialog({ locations, onClose }: { locations: LocationOpt[]; onClose: () => void }) {
  const form = useForm({
    locationId: String(locations[0]?.id ?? ''),
    name: '',
    description: '',
    seasonStart: '',
    seasonEnd: '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      locationId: Number(d.locationId),
      name: d.name,
      description: d.description || null,
      seasonStart: d.seasonStart || null,
      seasonEnd: d.seasonEnd || null,
    }))
    form.post('/dashboard/leagues', { onSuccess: onClose })
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title="Nueva liga"
      description="Crea la liga; luego agrega equipos, calendario y cédulas."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Locación" error={form.errors.locationId}>
          <Select
            value={form.data.locationId}
            onChange={(e) => form.setData('locationId', e.target.value)}
            required
          >
            <option value="" disabled>
              {locations.length ? 'Selecciona…' : 'Crea una locación primero'}
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Liga Amateur GDL"
            required
          />
        </Field>
        <Field label="Descripción" error={form.errors.description} hint="Opcional">
          <Textarea
            value={form.data.description}
            onChange={(e) => form.setData('description', e.target.value)}
            placeholder="Fútbol 5, sábados…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Inicio temporada" error={form.errors.seasonStart} hint="Opcional">
            <Input
              type="date"
              value={form.data.seasonStart}
              onChange={(e) => form.setData('seasonStart', e.target.value)}
            />
          </Field>
          <Field label="Fin temporada" error={form.errors.seasonEnd} hint="Opcional">
            <Input
              type="date"
              value={form.data.seasonEnd}
              onChange={(e) => form.setData('seasonEnd', e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Crear liga
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function Leagues({
  leagues,
  locations,
}: {
  leagues: LeagueRow[]
  locations: LocationOpt[]
}) {
  const [creating, setCreating] = useState(false)

  const remove = (l: LeagueRow) => {
    if (confirm(`¿Eliminar "${l.name}"? Se borran equipos, jugadores y partidos.`)) {
      router.delete(`/dashboard/leagues/${l.id}`, { preserveScroll: true })
    }
  }

  return (
    <>
      <Head title="Torneos" />
      <div className="mb-5 flex justify-end">
        <Button variant="lime" onClick={() => setCreating(true)}>
          <Plus /> Nuevo torneo
        </Button>
      </div>

      {leagues.length === 0 ? (
        <EmptyState
          title="Aún no hay torneos"
          hint="Crea un torneo para gestionar equipos, calendario y estadísticas."
          action={
            <Button variant="lime" onClick={() => setCreating(true)}>
              <Plus /> Nuevo torneo
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {leagues.map((l) => (
            <Card key={l.id} className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <Trophy className="size-4 shrink-0 text-graphite" />
                    <h3 className="truncate font-semibold text-graphite">{l.name}</h3>
                    <StatusPill
                      status={l.status === 'active' ? 'active' : 'inactive'}
                      className="shrink-0"
                    />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-6">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{l.locationName}</span>
                  </p>
                  {(l.seasonStart || l.seasonEnd) && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                      <CalendarRange className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {l.seasonStart ? formatDate(l.seasonStart) : '—'} –{' '}
                        {l.seasonEnd ? formatDate(l.seasonEnd) : '—'}
                      </span>
                    </p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => remove(l)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-6">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {l.teamsCount} equipos
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarRange className="size-3.5" /> {l.matchesCount} partidos
                </span>
              </div>

              <div className="mt-auto pt-4">
                <Link
                  href={`/dashboard/leagues/${l.id}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-bone-3 bg-bone-1 px-4 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-bone-2"
                >
                  Gestionar liga <ArrowRight className="size-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {creating && <LeagueDialog locations={locations} onClose={() => setCreating(false)} />}
    </>
  )
}

Leagues.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Torneos" subtitle="Equipos, calendario y estadísticas">
    {page}
  </DashboardLayout>
)
