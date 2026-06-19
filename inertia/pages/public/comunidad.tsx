import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { CalendarDays, MapPin, Users, UserPlus, Shield, Plus } from 'lucide-react'
import PublicLayout from '~/layouts/public'
import { Button, Card, Dialog, EmptyState, Field, Input, Select, Textarea } from '~/components/ui'
import { cn } from '~/lib/utils'
import { formatDate } from '~/lib/format'

type Level = 'principiante' | 'intermedio' | 'avanzado' | 'mixto'

type MatchRow = {
  id: number
  title: string
  hostName: string
  locationName: string | null
  zona: string | null
  date: string
  startTime: string
  endTime: string | null
  level: Level
  spotsTotal: number
  joined: number
  status: 'open' | 'full' | 'closed'
  notes: string | null
  players: { name: string; position: string | null }[]
}
type PlayerRow = {
  id: number
  name: string
  position: string | null
  level: Level
  zona: string | null
  photoUrl: string | null
}
type Recruitment = {
  id: number
  teamName: string
  contactName: string
  contactEmail: string
  zona: string | null
  level: Level
  positionsNeeded: string | null
  notes: string | null
}
type LocationOpt = { id: number; name: string; zona: string | null }

const LEVEL_LABEL: Record<Level, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  mixto: 'Todos los niveles',
}

const hhmm = (t: string | null) => (t ?? '').slice(0, 5)
const matchTime = (m: MatchRow) =>
  m.endTime ? `${hhmm(m.startTime)}–${hhmm(m.endTime)}` : hhmm(m.startTime)

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bone-2 px-2.5 py-1 text-xs font-medium text-slate-6">
      {children}
    </span>
  )
}

/* ------------------------------- Partidos ------------------------------- */

function MatchCard({ m, onJoin }: { m: MatchRow; onJoin: (m: MatchRow) => void }) {
  const left = Math.max(0, m.spotsTotal - m.joined)
  const full = m.status !== 'open' || left === 0
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-graphite">{m.title}</p>
          <p className="mt-0.5 text-sm text-slate-6">Organiza {m.hostName}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold',
            full ? 'bg-bone-2 text-slate-6' : 'bg-lime-mark/20 text-lime-deep'
          )}
        >
          {full ? 'Completo' : `Faltan ${left}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip>
          <CalendarDays className="size-3.5" /> {formatDate(m.date)} · {matchTime(m)}
        </Chip>
        {(m.locationName || m.zona) && (
          <Chip>
            <MapPin className="size-3.5" /> {m.locationName ?? m.zona}
          </Chip>
        )}
        <Chip>
          <Users className="size-3.5" /> {m.joined}/{m.spotsTotal} · {LEVEL_LABEL[m.level]}
        </Chip>
      </div>

      {m.notes && <p className="text-sm text-slate-6">{m.notes}</p>}

      <Button
        variant={full ? 'secondary' : 'lime'}
        className="mt-1"
        disabled={full}
        onClick={() => onJoin(m)}
      >
        {full ? 'Cupo lleno' : 'Quiero jugar'}
      </Button>
    </Card>
  )
}

function JoinDialog({ match, onClose }: { match: MatchRow; onClose: () => void }) {
  const form = useForm({ name: '', email: '', position: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({ ...d, position: d.position || null }))
    form.post(`/comunidad/partidos/${match.id}/unirse`, { onSuccess: onClose })
  }
  return (
    <Dialog open onClose={onClose} title="Quiero jugar" description={match.title}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Tu nombre"
            required
            autoFocus
          />
        </Field>
        <Field label="Correo" error={form.errors.email} hint="Para que el organizador te contacte">
          <Input
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </Field>
        <Field label="Posición" hint="Opcional" error={form.errors.position}>
          <Input
            value={form.data.position}
            onChange={(e) => form.setData('position', e.target.value)}
            placeholder="Portero, defensa…"
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Anotarme
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function NewMatchDialog({ locations, onClose }: { locations: LocationOpt[]; onClose: () => void }) {
  const form = useForm({
    title: '',
    hostName: '',
    hostEmail: '',
    locationId: '',
    zona: '',
    date: '',
    startTime: '',
    endTime: '',
    level: 'mixto',
    spotsTotal: '4',
    notes: '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      ...d,
      locationId: d.locationId ? Number(d.locationId) : null,
      zona: d.zona || null,
      endTime: d.endTime || null,
      notes: d.notes || null,
      spotsTotal: Number(d.spotsTotal),
    }))
    form.post('/comunidad/partidos', { onSuccess: onClose })
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title="Publicar partido abierto"
      description="Invita jugadores a tu reta. Solo necesitas tu correo."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Título" error={form.errors.title}>
          <Input
            value={form.data.title}
            onChange={(e) => form.setData('title', e.target.value)}
            placeholder="Reta 5v5 — nos faltan 3"
            required
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tu nombre" error={form.errors.hostName}>
            <Input
              value={form.data.hostName}
              onChange={(e) => form.setData('hostName', e.target.value)}
              required
            />
          </Field>
          <Field label="Tu correo" error={form.errors.hostEmail}>
            <Input
              type="email"
              value={form.data.hostEmail}
              onChange={(e) => form.setData('hostEmail', e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sede" hint="Opcional" error={form.errors.locationId}>
            <Select
              value={form.data.locationId}
              onChange={(e) => form.setData('locationId', e.target.value)}
            >
              <option value="">Por definir</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Zona" hint="Ej. Zapopan" error={form.errors.zona}>
            <Input value={form.data.zona} onChange={(e) => form.setData('zona', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Día" error={form.errors.date}>
            <Input
              type="date"
              value={form.data.date}
              onChange={(e) => form.setData('date', e.target.value)}
              required
            />
          </Field>
          <Field label="Inicio" error={form.errors.startTime}>
            <Input
              type="time"
              value={form.data.startTime}
              onChange={(e) => form.setData('startTime', e.target.value)}
              required
            />
          </Field>
          <Field label="Fin" hint="Opcional" error={form.errors.endTime}>
            <Input
              type="time"
              value={form.data.endTime}
              onChange={(e) => form.setData('endTime', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nivel" error={form.errors.level}>
            <Select value={form.data.level} onChange={(e) => form.setData('level', e.target.value)}>
              {(['mixto', 'principiante', 'intermedio', 'avanzado'] as Level[]).map((lv) => (
                <option key={lv} value={lv}>
                  {LEVEL_LABEL[lv]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jugadores que faltan" error={form.errors.spotsTotal}>
            <Input
              type="number"
              min={1}
              max={22}
              value={form.data.spotsTotal}
              onChange={(e) => form.setData('spotsTotal', e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Notas" hint="Opcional" error={form.errors.notes}>
          <Textarea
            value={form.data.notes}
            onChange={(e) => form.setData('notes', e.target.value)}
            placeholder="Llevar jersey claro y oscuro…"
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Publicar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

/* ------------------------------- Jugadores ------------------------------ */

function NewPlayerDialog({ onClose }: { onClose: () => void }) {
  const form = useForm({
    name: '',
    email: '',
    position: '',
    level: 'intermedio',
    zona: '',
    phone: '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      ...d,
      position: d.position || null,
      zona: d.zona || null,
      phone: d.phone || null,
    }))
    form.post('/comunidad/jugadores', { onSuccess: onClose })
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title="Crear mi perfil de jugador"
      description="Aparece en la comunidad para que te inviten a jugar."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" error={form.errors.name}>
            <Input
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Correo" error={form.errors.email}>
            <Input
              type="email"
              value={form.data.email}
              onChange={(e) => form.setData('email', e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Posición" hint="Opcional" error={form.errors.position}>
            <Input
              value={form.data.position}
              onChange={(e) => form.setData('position', e.target.value)}
              placeholder="Delantero…"
            />
          </Field>
          <Field label="Nivel" error={form.errors.level}>
            <Select value={form.data.level} onChange={(e) => form.setData('level', e.target.value)}>
              {(['principiante', 'intermedio', 'avanzado'] as Level[]).map((lv) => (
                <option key={lv} value={lv}>
                  {LEVEL_LABEL[lv]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Zona" hint="Opcional" error={form.errors.zona}>
            <Input value={form.data.zona} onChange={(e) => form.setData('zona', e.target.value)} />
          </Field>
          <Field label="Teléfono" hint="Opcional" error={form.errors.phone}>
            <Input
              value={form.data.phone}
              onChange={(e) => form.setData('phone', e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Publicar perfil
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function PlayerCard({ p }: { p: PlayerRow }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-graphite text-sm font-semibold text-chalk">
        {p.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-graphite">{p.name}</p>
        <p className="truncate text-sm text-slate-6">
          {[p.position, LEVEL_LABEL[p.level], p.zona].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Card>
  )
}

/* -------------------------------- Equipos ------------------------------- */

function NewRecruitmentDialog({ onClose }: { onClose: () => void }) {
  const form = useForm({
    teamName: '',
    contactName: '',
    contactEmail: '',
    zona: '',
    level: 'mixto',
    positionsNeeded: '',
    notes: '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      ...d,
      zona: d.zona || null,
      positionsNeeded: d.positionsNeeded || null,
      notes: d.notes || null,
    }))
    form.post('/comunidad/equipos', { onSuccess: onClose })
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title="Mi equipo busca jugadores"
      description="Publica una convocatoria para reclutar refuerzos."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre del equipo" error={form.errors.teamName}>
          <Input
            value={form.data.teamName}
            onChange={(e) => form.setData('teamName', e.target.value)}
            required
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contacto" error={form.errors.contactName}>
            <Input
              value={form.data.contactName}
              onChange={(e) => form.setData('contactName', e.target.value)}
              required
            />
          </Field>
          <Field label="Correo" error={form.errors.contactEmail}>
            <Input
              type="email"
              value={form.data.contactEmail}
              onChange={(e) => form.setData('contactEmail', e.target.value)}
              placeholder="equipo@correo.com"
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Zona" hint="Opcional" error={form.errors.zona}>
            <Input value={form.data.zona} onChange={(e) => form.setData('zona', e.target.value)} />
          </Field>
          <Field label="Nivel" error={form.errors.level}>
            <Select value={form.data.level} onChange={(e) => form.setData('level', e.target.value)}>
              {(['mixto', 'principiante', 'intermedio', 'avanzado'] as Level[]).map((lv) => (
                <option key={lv} value={lv}>
                  {LEVEL_LABEL[lv]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Posiciones que buscan" hint="Opcional" error={form.errors.positionsNeeded}>
          <Input
            value={form.data.positionsNeeded}
            onChange={(e) => form.setData('positionsNeeded', e.target.value)}
            placeholder="Portero, defensa central…"
          />
        </Field>
        <Field label="Notas" hint="Opcional" error={form.errors.notes}>
          <Textarea
            value={form.data.notes}
            onChange={(e) => form.setData('notes', e.target.value)}
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Publicar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function RecruitmentCard({ r }: { r: Recruitment }) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime-mark/20 text-lime-deep">
          <Shield className="size-5" />
        </span>
        <p className="font-semibold text-graphite">{r.teamName}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip>{LEVEL_LABEL[r.level]}</Chip>
        {r.zona && (
          <Chip>
            <MapPin className="size-3.5" /> {r.zona}
          </Chip>
        )}
      </div>
      {r.positionsNeeded && (
        <p className="text-sm text-graphite">
          <span className="text-slate-6">Buscan: </span>
          {r.positionsNeeded}
        </p>
      )}
      {r.notes && <p className="text-sm text-slate-6">{r.notes}</p>}
      <a
        href={`mailto:${r.contactEmail}`}
        className="mt-1 text-sm font-medium text-lime-deep hover:underline"
      >
        Contactar a {r.contactName}
      </a>
    </Card>
  )
}

/* --------------------------------- Page --------------------------------- */

type Tab = 'partidos' | 'jugadores' | 'equipos'
const TABS: { key: Tab; label: string }[] = [
  { key: 'partidos', label: 'Partidos abiertos' },
  { key: 'jugadores', label: 'Jugadores' },
  { key: 'equipos', label: 'Equipos buscando' },
]

export default function Comunidad({
  matches,
  players,
  recruitments,
  locations,
}: {
  matches: MatchRow[]
  players: PlayerRow[]
  recruitments: Recruitment[]
  locations: LocationOpt[]
}) {
  const [tab, setTab] = useState<Tab>('partidos')
  const [joining, setJoining] = useState<MatchRow | null>(null)
  const [dialog, setDialog] = useState<'match' | 'player' | 'team' | null>(null)

  return (
    <>
      <Head title="Comunidad futbolera" />

      <section className="mb-7 overflow-hidden rounded-3xl bg-graphite p-7 text-chalk sm:p-9">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Comunidad futbolera</h1>
        <p className="mt-2 max-w-lg text-chalk/70">
          Arma partidos abiertos, encuentra jugadores y suma refuerzos a tu equipo. Sin cuenta: solo
          tu correo.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-2xl bg-bone-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-xl px-4 py-1.5 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-chalk text-graphite shadow-sm'
                  : 'text-slate-6 hover:text-graphite'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'partidos' && (
          <Button variant="lime" onClick={() => setDialog('match')}>
            <Plus /> Publicar partido
          </Button>
        )}
        {tab === 'jugadores' && (
          <Button variant="lime" onClick={() => setDialog('player')}>
            <UserPlus /> Crear mi perfil
          </Button>
        )}
        {tab === 'equipos' && (
          <Button variant="lime" onClick={() => setDialog('team')}>
            <Plus /> Publicar equipo
          </Button>
        )}
      </div>

      {tab === 'partidos' &&
        (matches.length === 0 ? (
          <EmptyState
            title="Aún no hay partidos abiertos"
            hint="Sé el primero en publicar una reta y arma partido."
            action={
              <Button variant="lime" onClick={() => setDialog('match')}>
                <Plus /> Publicar partido
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <MatchCard key={m.id} m={m} onJoin={setJoining} />
            ))}
          </div>
        ))}

      {tab === 'jugadores' &&
        (players.length === 0 ? (
          <EmptyState
            title="Aún no hay jugadores"
            hint="Crea tu perfil para que los equipos te encuentren."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => (
              <PlayerCard key={p.id} p={p} />
            ))}
          </div>
        ))}

      {tab === 'equipos' &&
        (recruitments.length === 0 ? (
          <EmptyState
            title="Ningún equipo busca jugadores aún"
            hint="Publica tu convocatoria y recluta refuerzos."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recruitments.map((r) => (
              <RecruitmentCard key={r.id} r={r} />
            ))}
          </div>
        ))}

      {joining && <JoinDialog match={joining} onClose={() => setJoining(null)} />}
      {dialog === 'match' && (
        <NewMatchDialog locations={locations} onClose={() => setDialog(null)} />
      )}
      {dialog === 'player' && <NewPlayerDialog onClose={() => setDialog(null)} />}
      {dialog === 'team' && <NewRecruitmentDialog onClose={() => setDialog(null)} />}
    </>
  )
}

Comunidad.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
