import { useMemo, useRef, useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import {
  ArrowLeft,
  CalendarRange,
  Fingerprint,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import {
  Accordion,
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  Photo,
  Select,
  Textarea,
} from '~/components/ui'
import { ImageUpload } from '~/components/image-upload'
import { cn } from '~/lib/utils'
import { formatDate, timeRange } from '~/lib/format'

type Player = {
  id: number
  name: string
  number: number | null
  firstName: string | null
  paternalSurname: string | null
  maternalSurname: string | null
  birthdate: string | null
  photoUrl: string | null
  phone: string | null
  playerKey: string | null
}
type Team = { id: number; name: string; logoUrl: string | null; players: Player[] }
type EventType = 'goal' | 'yellow' | 'red'
type MatchEvent = {
  id: number
  teamId: number
  playerId: number | null
  playerName: string | null
  type: EventType
  minute: number | null
}
type MatchStatus = 'scheduled' | 'played' | 'cancelled'
type Match = {
  id: number
  spaceId: number
  spaceName: string
  date: string
  startTime: string
  endTime: string
  status: MatchStatus
  round: number | null
  cedulaImageUrl: string | null
  homeTeamId: number
  homeTeam: string
  awayTeamId: number
  awayTeam: string
  homeGoals: number
  awayGoals: number
  events: MatchEvent[]
}
type Standing = {
  teamId: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}
type Scorer = { player: string; team: string; goals: number }
type CardRow = { player: string; team: string; yellow: number; red: number }
type League = {
  id: number
  name: string
  description: string | null
  locationId: number
  locationName: string
  seasonStart: string | null
  seasonEnd: string | null
  status: 'active' | 'finished'
}
type SpaceOpt = { id: number; name: string }

type Props = {
  league: League
  spaces: SpaceOpt[]
  teams: Team[]
  matches: Match[]
  standings: Standing[]
  scorers: Scorer[]
  cards: CardRow[]
}

const MATCH_STATUS: Record<MatchStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Programado', cls: 'bg-amber-mark/15 text-amber-mark' },
  played: { label: 'Jugado', cls: 'bg-emerald-mark/15 text-emerald-mark' },
  cancelled: { label: 'Cancelado', cls: 'bg-rose-mark/15 text-rose-mark' },
}

/* ------------------------------- League edit ------------------------------ */

function LeagueEditDialog({ league, onClose }: { league: League; onClose: () => void }) {
  const form = useForm({
    name: league.name,
    description: league.description ?? '',
    seasonStart: league.seasonStart ?? '',
    seasonEnd: league.seasonEnd ?? '',
    status: league.status,
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      name: d.name,
      description: d.description || null,
      seasonStart: d.seasonStart || null,
      seasonEnd: d.seasonEnd || null,
      status: d.status,
    }))
    form.put(`/dashboard/leagues/${league.id}`, { onSuccess: onClose, preserveScroll: true })
  }
  return (
    <Dialog open onClose={onClose} title="Editar liga">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            required
          />
        </Field>
        <Field label="Descripción" error={form.errors.description} hint="Opcional">
          <Textarea
            value={form.data.description}
            onChange={(e) => form.setData('description', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Inicio temporada" error={form.errors.seasonStart}>
            <Input
              type="date"
              value={form.data.seasonStart}
              onChange={(e) => form.setData('seasonStart', e.target.value)}
            />
          </Field>
          <Field label="Fin temporada" error={form.errors.seasonEnd}>
            <Input
              type="date"
              value={form.data.seasonEnd}
              onChange={(e) => form.setData('seasonEnd', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Estado" error={form.errors.status}>
          <Select
            value={form.data.status}
            onChange={(e) => form.setData('status', e.target.value as League['status'])}
          >
            <option value="active">Activa</option>
            <option value="finished">Finalizada</option>
          </Select>
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Guardar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

/* --------------------------------- Teams --------------------------------- */

function TeamDialog({
  leagueId,
  team,
  onClose,
}: {
  leagueId: number
  team: Team | 'new'
  onClose: () => void
}) {
  const isEdit = team !== 'new'
  const form = useForm({
    name: isEdit ? team.name : '',
    logoUrl: isEdit ? (team.logoUrl ?? '') : '',
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({ name: d.name, logoUrl: d.logoUrl || null }))
    const opts = { onSuccess: onClose, preserveScroll: true }
    if (isEdit) form.put(`/dashboard/teams/${team.id}`, opts)
    else form.post(`/dashboard/leagues/${leagueId}/teams`, opts)
  }
  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Editar equipo' : 'Nuevo equipo'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre" error={form.errors.name}>
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Halcones"
            required
          />
        </Field>
        <Field label="Logo" error={form.errors.logoUrl} hint="Opcional">
          <ImageUpload
            value={form.data.logoUrl || null}
            onChange={(url) => form.setData('logoUrl', url ?? '')}
            folder="teams"
            aspect="square"
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            {isEdit ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const VOWELS = 'AEIOU'
const COMPOUND = new Set(['JOSE', 'MARIA', 'MA', 'J'])

/** Strip accents, uppercase, keep letters and spaces. Mirror of the server. */
function cleanName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()
}

/**
 * Client preview of the 10-char mini-CURP base (server appends a 3-char
 * homoclave on save). Purely informational so the user sees an ID forming.
 */
function miniCurpPreview(
  paterno: string,
  materno: string,
  nombre: string,
  birthdate: string
): string | null {
  if (!paterno || !nombre || !DATE_ONLY.test(birthdate)) return null
  const p = cleanName(paterno)
  const m = cleanName(materno) || 'X'
  const nParts = cleanName(nombre).split(/\s+/).filter(Boolean)
  const n = nParts.length > 1 && COMPOUND.has(nParts[0]) ? nParts[1] : nParts[0]
  if (!p || !n) return null
  let innerVowel = 'X'
  for (let i = 1; i < p.length; i++) {
    if (VOWELS.includes(p[i])) {
      innerVowel = p[i]
      break
    }
  }
  const [y, mo, d] = birthdate.split('-')
  return p[0] + innerVowel + m[0] + n[0] + y.slice(2) + mo + d
}

function PlayerDialog({
  teamId,
  player,
  onClose,
}: {
  teamId: number
  player?: Player
  onClose: () => void
}) {
  const isEdit = !!player
  const form = useForm({
    firstName: player?.firstName ?? '',
    paternalSurname: player?.paternalSurname ?? '',
    maternalSurname: player?.maternalSurname ?? '',
    birthdate: player?.birthdate ?? '',
    photoUrl: player?.photoUrl ?? '',
    phone: player?.phone ?? '',
    number: player?.number != null ? String(player.number) : '',
  })

  const previewKey = useMemo(
    () =>
      miniCurpPreview(
        form.data.paternalSurname,
        form.data.maternalSurname,
        form.data.firstName,
        form.data.birthdate
      ),
    [
      form.data.paternalSurname,
      form.data.maternalSurname,
      form.data.firstName,
      form.data.birthdate,
    ]
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      firstName: d.firstName,
      paternalSurname: d.paternalSurname,
      maternalSurname: d.maternalSurname || null,
      birthdate: d.birthdate,
      photoUrl: d.photoUrl,
      phone: d.phone || null,
      number: d.number ? Number(d.number) : null,
    }))
    const opts = { preserveScroll: true, onSuccess: onClose }
    if (isEdit) form.put(`/dashboard/players/${player!.id}`, opts)
    else form.post(`/dashboard/teams/${teamId}/players`, opts)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={isEdit ? 'Editar jugador' : 'Nuevo jugador'}
      description="Foto de cara, nombre completo y fecha de nacimiento."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Foto de cara" error={form.errors.photoUrl} hint="Rostro visible, de frente">
          <ImageUpload
            value={form.data.photoUrl || null}
            onChange={(url) => form.setData('photoUrl', url ?? '')}
            folder="players"
            aspect="square"
          />
        </Field>

        <div className="grid grid-cols-[1fr_4.5rem] gap-3">
          <Field label="Nombre(s)" error={form.errors.firstName}>
            <Input
              value={form.data.firstName}
              onChange={(e) => form.setData('firstName', e.target.value)}
              placeholder="Juan"
              required
            />
          </Field>
          <Field label="Número" hint="Opc." error={form.errors.number}>
            <Input
              type="number"
              min="0"
              value={form.data.number}
              onChange={(e) => form.setData('number', e.target.value)}
              placeholder="#"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Apellido paterno" error={form.errors.paternalSurname}>
            <Input
              value={form.data.paternalSurname}
              onChange={(e) => form.setData('paternalSurname', e.target.value)}
              placeholder="Pérez"
              required
            />
          </Field>
          <Field label="Apellido materno" hint="Opcional" error={form.errors.maternalSurname}>
            <Input
              value={form.data.maternalSurname}
              onChange={(e) => form.setData('maternalSurname', e.target.value)}
              placeholder="García"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de nacimiento" error={form.errors.birthdate}>
            <Input
              type="date"
              value={form.data.birthdate}
              onChange={(e) => form.setData('birthdate', e.target.value)}
              required
            />
          </Field>
          <Field
            label="Teléfono"
            hint="Opcional · identificador"
            error={form.errors.phone}
          >
            <Input
              type="tel"
              inputMode="numeric"
              value={form.data.phone}
              onChange={(e) => form.setData('phone', e.target.value)}
              placeholder="33 1234 5678"
            />
          </Field>
        </div>

        {(() => {
          // On edit show the real stored key (unless it's a backfill placeholder
          // and a birthdate is now set — then preview the about-to-be-minted one).
          const placeholder = player?.playerKey && player.playerKey.slice(4, 10) === '000000'
          const showStored = isEdit && player?.playerKey && !(placeholder && previewKey)
          const value = showStored ? player!.playerKey : previewKey
          if (!value) return null
          return (
            <div className="flex items-center gap-2 rounded-xl bg-bone-2 px-3.5 py-2.5 text-xs text-slate-6">
              <Fingerprint className="size-4 shrink-0 text-lime-deep" />
              <span>
                ID del jugador:{' '}
                <span className="font-mono font-semibold text-graphite">{value}</span>
                {!showStored && (
                  <>
                    <span className="text-slate-6/60">···</span>{' '}
                    <span className="text-slate-6/80">(se confirma al guardar)</span>
                  </>
                )}
              </span>
            </div>
          )
        })()}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            {isEdit ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function TeamCard({ team, onEdit }: { team: Team; onEdit: () => void }) {
  const [dialog, setDialog] = useState<'new' | Player | null>(null)
  const removePlayer = (id: number) => {
    if (confirm('¿Quitar a este jugador del roster?')) {
      router.delete(`/dashboard/players/${id}`, { preserveScroll: true })
    }
  }
  const removeTeam = () => {
    if (confirm(`¿Eliminar "${team.name}"? Se borra su roster.`)) {
      router.delete(`/dashboard/teams/${team.id}`, { preserveScroll: true })
    }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-graphite">{team.name}</h4>
          <p className="text-xs text-slate-6">
            {team.players.length} {team.players.length === 1 ? 'jugador' : 'jugadores'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar equipo">
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="danger" size="icon" onClick={removeTeam} aria-label="Eliminar equipo">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {team.players.length === 0 ? (
          <li className="rounded-lg bg-bone-2 px-3 py-2.5 text-sm text-slate-6">
            Sin jugadores aún.
          </li>
        ) : (
          team.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2.5 rounded-lg bg-bone-2 px-2.5 py-2 text-sm"
            >
              <Photo
                src={p.photoUrl}
                alt={p.name}
                className="size-9 shrink-0 rounded-md border border-bone-3"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-graphite">{p.name}</p>
                {p.playerKey && (
                  <p className="truncate font-mono text-[10px] uppercase tracking-wide text-slate-6">
                    {p.playerKey}
                  </p>
                )}
              </div>
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-chalk text-xs font-semibold tabular-nums text-slate-6">
                {p.number ?? '–'}
              </span>
              <button
                type="button"
                onClick={() => setDialog(p)}
                aria-label="Editar jugador"
                className="text-slate-6 transition-colors hover:text-graphite"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removePlayer(p.id)}
                aria-label="Quitar"
                className="text-slate-6 transition-colors hover:text-rose-mark"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>

      <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setDialog('new')}>
        <Plus className="size-4" /> Agregar jugador
      </Button>

      {dialog && (
        <PlayerDialog
          teamId={team.id}
          player={dialog === 'new' ? undefined : dialog}
          onClose={() => setDialog(null)}
        />
      )}
    </Card>
  )
}

/* -------------------------------- Matches -------------------------------- */

function MatchDialog({
  leagueId,
  teams,
  spaces,
  match,
  nextRound,
  onClose,
}: {
  leagueId: number
  teams: Team[]
  spaces: SpaceOpt[]
  match: Match | 'new'
  nextRound: number
  onClose: () => void
}) {
  const isEdit = match !== 'new'
  const form = useForm({
    homeTeamId: String(isEdit ? match.homeTeamId : (teams[0]?.id ?? '')),
    awayTeamId: String(isEdit ? match.awayTeamId : (teams[1]?.id ?? '')),
    spaceId: String(isEdit ? match.spaceId : (spaces[0]?.id ?? '')),
    date: isEdit ? match.date : '',
    startTime: isEdit ? match.startTime : '',
    endTime: isEdit ? match.endTime : '',
    status: isEdit ? match.status : 'scheduled',
    round: String(isEdit ? (match.round ?? '') : nextRound),
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      homeTeamId: Number(d.homeTeamId),
      awayTeamId: Number(d.awayTeamId),
      spaceId: Number(d.spaceId),
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      round: d.round ? Number(d.round) : null,
      ...(isEdit ? { status: d.status } : {}),
    }))
    const opts = { onSuccess: onClose, preserveScroll: true }
    if (isEdit) form.put(`/dashboard/matches/${match.id}`, opts)
    else form.post(`/dashboard/leagues/${leagueId}/matches`, opts)
  }
  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Editar partido' : 'Programar partido'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Local" error={form.errors.homeTeamId}>
            <Select
              value={form.data.homeTeamId}
              onChange={(e) => form.setData('homeTeamId', e.target.value)}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Visitante" error={form.errors.awayTeamId}>
            <Select
              value={form.data.awayTeamId}
              onChange={(e) => form.setData('awayTeamId', e.target.value)}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Cancha" error={form.errors.spaceId}>
          <Select
            value={form.data.spaceId}
            onChange={(e) => form.setData('spaceId', e.target.value)}
            required
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha" error={form.errors.date}>
            <Input
              type="date"
              value={form.data.date}
              onChange={(e) => form.setData('date', e.target.value)}
              required
            />
          </Field>
          <Field label="Jornada" error={form.errors.round} hint="Opcional">
            <Input
              type="number"
              min={1}
              value={form.data.round}
              onChange={(e) => form.setData('round', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Inicio" error={form.errors.startTime}>
            <Input
              type="time"
              value={form.data.startTime}
              onChange={(e) => form.setData('startTime', e.target.value)}
              required
            />
          </Field>
          <Field label="Fin" error={form.errors.endTime}>
            <Input
              type="time"
              value={form.data.endTime}
              onChange={(e) => form.setData('endTime', e.target.value)}
              required
            />
          </Field>
        </div>
        {isEdit && (
          <Field label="Estado" error={form.errors.status}>
            <Select
              value={form.data.status}
              onChange={(e) => form.setData('status', e.target.value as MatchStatus)}
            >
              <option value="scheduled">Programado</option>
              <option value="played">Jugado</option>
              <option value="cancelled">Cancelado</option>
            </Select>
          </Field>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            {isEdit ? 'Guardar' : 'Programar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function GenerateFixturesDialog({
  leagueId,
  spaces,
  seasonStart,
  hasMatches,
  onClose,
}: {
  leagueId: number
  spaces: SpaceOpt[]
  seasonStart: string | null
  hasMatches: boolean
  onClose: () => void
}) {
  const form = useForm({
    spaceIds: spaces.map((s) => s.id),
    startDate: seasonStart ?? '',
    firstTime: '09:00',
    matchDuration: '60',
    gap: '0',
    replace: hasMatches,
  })

  const toggleCourt = (id: number) =>
    form.setData(
      'spaceIds',
      form.data.spaceIds.includes(id)
        ? form.data.spaceIds.filter((x) => x !== id)
        : [...form.data.spaceIds, id]
    )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({
      spaceIds: d.spaceIds,
      startDate: d.startDate,
      firstTime: d.firstTime,
      matchDuration: Number(d.matchDuration),
      gap: Number(d.gap),
      replace: d.replace,
    }))
    form.post(`/dashboard/leagues/${leagueId}/matches/generate`, {
      onSuccess: onClose,
      preserveScroll: true,
    })
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Generar calendario"
      description="Round-robin (todos contra todos), una jornada por semana desde la fecha de inicio."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Inicio del calendario" error={form.errors.startDate}>
          <Input
            type="date"
            value={form.data.startDate}
            onChange={(e) => form.setData('startDate', e.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Primer partido" error={form.errors.firstTime}>
            <Input
              type="time"
              value={form.data.firstTime}
              onChange={(e) => form.setData('firstTime', e.target.value)}
              required
            />
          </Field>
          <Field label="Duración (min)" error={form.errors.matchDuration}>
            <Input
              type="number"
              min="15"
              step="5"
              value={form.data.matchDuration}
              onChange={(e) => form.setData('matchDuration', e.target.value)}
              required
            />
          </Field>
          <Field label="Descanso (min)" error={form.errors.gap}>
            <Input
              type="number"
              min="0"
              step="5"
              value={form.data.gap}
              onChange={(e) => form.setData('gap', e.target.value)}
              required
            />
          </Field>
        </div>
        <Field
          label="Canchas"
          error={form.errors.spaceIds}
          hint="Los partidos se reparten entre las canchas elegidas"
        >
          <div className="flex flex-wrap gap-2">
            {spaces.map((s) => {
              const on = form.data.spaceIds.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleCourt(s.id)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
                    on
                      ? 'border-lime-deep bg-lime-mark/20 text-graphite'
                      : 'border-bone-3 bg-bone-1 text-slate-6 hover:bg-bone-2'
                  )}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-6">
          <input
            type="checkbox"
            checked={form.data.replace}
            onChange={(e) => form.setData('replace', e.target.checked)}
            className="size-4 rounded border-bone-3"
          />
          Reemplazar partidos programados existentes
        </label>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="lime"
            disabled={form.processing || form.data.spaceIds.length === 0}
          >
            Generar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

const EVENT_LABEL: Record<EventType, string> = {
  goal: 'Gol',
  yellow: 'Amarilla',
  red: 'Roja',
}
const EVENT_CLS: Record<EventType, string> = {
  goal: 'bg-graphite text-chalk',
  yellow: 'bg-amber-mark/20 text-graphite',
  red: 'bg-rose-mark/15 text-rose-mark',
}

/** Small count badge that sits on the corner of an action icon. */
function Tally({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-graphite px-1 text-[10px] font-bold leading-none tabular-nums text-chalk ring-2 ring-bone-2">
      {n}
    </span>
  )
}

function MinutaDialog({
  match,
  teams,
  onClose,
}: {
  match: Match
  teams: Team[]
  onClose: () => void
}) {
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])
  const playerNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const t of teams) for (const p of t.players) m.set(p.id, p.name)
    return m
  }, [teams])

  // Cambios en cola en el navegador hasta tocar "Actualizar".
  type Pending = { tempId: number; teamId: number; playerId: number | null; type: EventType }
  type Row = {
    id: number
    teamId: number
    playerId: number | null
    playerName: string | null
    type: EventType
    minute: number | null
    pending: boolean
  }
  const [adds, setAdds] = useState<Pending[]>([])
  const [removes, setRemoves] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const tempId = useRef(-1)
  const dirty = adds.length > 0 || removes.length > 0

  // Eventos efectivos = guardados (menos los borrados) + los encolados.
  const events = useMemo<Row[]>(() => {
    const base = match.events
      .filter((e) => !removes.includes(e.id))
      .map((e) => ({ ...e, pending: false }))
    const queued = adds.map((a) => ({
      id: a.tempId,
      teamId: a.teamId,
      playerId: a.playerId,
      playerName: a.playerId != null ? (playerNameById.get(a.playerId) ?? null) : null,
      type: a.type,
      minute: null,
      pending: true,
    }))
    return [...base, ...queued]
  }, [match.events, removes, adds, playerNameById])

  const goalsOf = (teamId: number) =>
    events.filter((e) => e.type === 'goal' && e.teamId === teamId).length
  const homeGoals = goalsOf(match.homeTeamId)
  const awayGoals = goalsOf(match.awayTeamId)
  const countFor = (playerId: number, type: EventType) =>
    events.filter((e) => e.type === type && e.playerId === playerId).length

  const addEvent = (teamId: number, playerId: number | null, type: EventType) =>
    setAdds((prev) => [...prev, { tempId: tempId.current--, teamId, playerId, type }])
  const removeRow = (row: Row) => {
    if (row.pending) setAdds((prev) => prev.filter((a) => a.tempId !== row.id))
    else setRemoves((prev) => (prev.includes(row.id) ? prev : [...prev, row.id]))
  }
  // Quita el último gol del equipo — prioriza los sin jugador asignado.
  const removeLastGoal = (teamId: number) => {
    const goals = events.filter((e) => e.type === 'goal' && e.teamId === teamId)
    const target = [...goals].reverse().find((e) => e.playerId == null) ?? goals[goals.length - 1]
    if (target) removeRow(target)
  }

  const save = () => {
    if (!dirty || saving) return
    setSaving(true)
    router.post(
      `/dashboard/matches/${match.id}/cedula`,
      {
        adds: adds.map(({ teamId, playerId, type }) => ({ teamId, playerId, type, minute: null })),
        removes,
      },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['matches', 'standings', 'scorers', 'cards'],
        onSuccess: () => {
          setAdds([])
          setRemoves([])
        },
        onFinish: () => setSaving(false),
      }
    )
  }
  const handleClose = () => {
    if (dirty && !confirm('Tienes cambios sin guardar. ¿Descartarlos?')) return
    onClose()
  }

  // Marcador: toque = +1, mantener = −1 (sin jugador).
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressed = useRef(false)
  const startPress = (teamId: number) => {
    longPressed.current = false
    pressTimer.current = setTimeout(() => {
      longPressed.current = true
      removeLastGoal(teamId)
    }, 500)
  }
  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }
  const tapScore = (teamId: number) => {
    if (longPressed.current) {
      longPressed.current = false
      return
    }
    addEvent(teamId, null, 'goal')
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      title={`Cédula · ${match.homeTeam} ${homeGoals}–${awayGoals} ${match.awayTeam}`}
      description={`${formatDate(match.date)} · ${timeRange(match.startTime, match.endTime)} · ${match.spaceName}`}
    >
      <div className="flex flex-col gap-4">
        {/* Marcador — toca un lado para sumar un gol sin jugador asignado */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {[
            { id: match.homeTeamId, name: match.homeTeam, goals: homeGoals },
            { id: match.awayTeamId, name: match.awayTeam, goals: awayGoals },
          ].map((team, i) => (
            <div key={team.id} className="contents">
              {i === 1 && (
                <span className="px-1 font-mono text-xs font-bold uppercase text-slate-6">vs</span>
              )}
              <button
                type="button"
                onClick={() => tapScore(team.id)}
                onPointerDown={() => startPress(team.id)}
                onPointerUp={endPress}
                onPointerLeave={endPress}
                onContextMenu={(e) => e.preventDefault()}
                aria-label={`Gol de ${team.name} (mantén para restar)`}
                className="flex select-none flex-col items-center gap-0.5 rounded-2xl bg-bone-1 px-2 py-3 transition-colors hover:bg-lime-mark/40 active:bg-lime-mark/70"
              >
                <span className="line-clamp-2 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-6">
                  {team.name}
                </span>
                <span className="font-display text-4xl font-bold tabular-nums text-graphite">
                  {team.goals}
                </span>
              </button>
            </div>
          ))}
        </div>

        <ul className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {events.length === 0 ? (
            <li className="text-sm text-slate-6">Sin eventos registrados.</li>
          ) : (
            events.map((ev) => (
              <li
                key={ev.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm',
                  ev.pending ? 'bg-lime-mark/20 ring-1 ring-lime-deep/30' : 'bg-bone-2'
                )}
              >
                <span className="w-8 shrink-0 text-center tabular-nums text-slate-6">
                  {ev.minute != null ? `${ev.minute}'` : '—'}
                </span>
                <span
                  className={cn(
                    'inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] font-semibold',
                    EVENT_CLS[ev.type]
                  )}
                >
                  {EVENT_LABEL[ev.type]}
                </span>
                <span className="flex-1 truncate text-graphite">
                  {ev.playerName ?? 'Sin asignar'}
                  <span className="text-slate-6">
                    {' '}
                    · {ev.teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(ev)}
                  aria-label="Quitar"
                  className="text-slate-6 hover:text-rose-mark"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Roster (acordeón por equipo): un clic anota gol; el menú (⋮) registra tarjetas */}
        <div className="flex flex-col gap-2 border-t border-bone-3 pt-4">
          {[
            { id: match.homeTeamId, name: match.homeTeam, goals: homeGoals },
            { id: match.awayTeamId, name: match.awayTeam, goals: awayGoals },
          ].map((team, i) => {
            const roster = teamById.get(team.id)?.players ?? []
            return (
              <Accordion
                key={team.id}
                defaultOpen={i === 0}
                title={<span className="truncate">{team.name}</span>}
                right={
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-graphite px-1.5 text-xs font-bold tabular-nums text-chalk">
                    {team.goals}
                  </span>
                }
              >
                {roster.length === 0 ? (
                  <p className="text-xs text-slate-6">Sin jugadores en el roster.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {roster.map((p) => {
                      const goals = countFor(p.id, 'goal')
                      const yellows = countFor(p.id, 'yellow')
                      const reds = countFor(p.id, 'red')
                      return (
                        <li
                          key={p.id}
                          className="flex items-center gap-2 rounded-lg bg-bone-2 px-2.5 py-1.5"
                        >
                          {p.number != null && (
                            <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-slate-6">
                              {p.number}
                            </span>
                          )}
                          <span className="flex-1 truncate text-sm text-graphite">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => addEvent(team.id, p.id, 'goal')}
                            aria-label={`Gol de ${p.name}`}
                            title="Gol"
                            className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-lg transition-colors hover:bg-lime-mark"
                          >
                            ⚽
                            {goals > 0 && <Tally n={goals} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => addEvent(team.id, p.id, 'yellow')}
                            aria-label={`Tarjeta amarilla a ${p.name}`}
                            title="Amarilla"
                            className="relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-bone-3"
                          >
                            <span className="inline-block h-5 w-3.5 rounded-[2px] bg-amber-mark" />
                            {yellows > 0 && <Tally n={yellows} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => addEvent(team.id, p.id, 'red')}
                            aria-label={`Tarjeta roja a ${p.name}`}
                            title="Roja"
                            className="relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-bone-3"
                          >
                            <span className="inline-block h-5 w-3.5 rounded-[2px] bg-rose-mark" />
                            {reds > 0 && <Tally n={reds} />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Accordion>
            )
          })}
        </div>

        {/* Imagen de la cédula (opcional, solo admin) */}
        <div className="border-t border-bone-3 pt-4">
          <Accordion
            title="Foto de la cédula"
            defaultOpen={!!match.cedulaImageUrl}
            right={<span className="text-[11px] font-medium">Opcional</span>}
          >
            <ImageUpload
              value={match.cedulaImageUrl}
              folder="misc"
              aspect="video"
              onChange={(url) =>
                router.put(
                  `/dashboard/matches/${match.id}`,
                  { cedulaImageUrl: url },
                  { preserveScroll: true, preserveState: true, only: ['matches'] }
                )
              }
            />
          </Accordion>
        </div>

        {/* Guardar en lote todos los cambios encolados */}
        <div className="sticky bottom-0 -mx-6 border-t border-bone-3 bg-chalk/95 px-6 py-3 backdrop-blur">
          <Button variant="lime" className="w-full" onClick={save} disabled={!dirty || saving}>
            {saving
              ? 'Guardando…'
              : dirty
                ? `Actualizar (${adds.length + removes.length})`
                : 'Sin cambios'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

/* --------------------------------- Page ---------------------------------- */

type Tab = 'tabla' | 'calendario' | 'equipos'

export default function LeagueShow({
  league,
  spaces,
  teams,
  matches,
  standings,
  scorers,
  cards,
}: Props) {
  const [tab, setTab] = useState<Tab>('tabla')
  const [editLeague, setEditLeague] = useState(false)
  const [teamDialog, setTeamDialog] = useState<Team | 'new' | null>(null)
  const [matchDialog, setMatchDialog] = useState<Match | 'new' | null>(null)
  const [generating, setGenerating] = useState(false)
  const [minuta, setMinuta] = useState<Match | null>(null)
  const [jornada, setJornada] = useState<string>('all')

  const enoughTeams = teams.length >= 2
  const hasPlayed = standings.some((s) => s.played > 0)

  // Distinct jornadas present, plus a bucket for matches without one.
  const rounds = useMemo(
    () => [...new Set(matches.map((m) => m.round).filter((r): r is number => r != null))].sort((a, b) => a - b),
    [matches]
  )
  const hasNoRound = matches.some((m) => m.round == null)
  const nextRound = rounds.length ? rounds[rounds.length - 1] + 1 : 1
  const visibleMatches = useMemo(() => {
    if (jornada === 'all') return matches
    if (jornada === 'none') return matches.filter((m) => m.round == null)
    return matches.filter((m) => m.round === Number(jornada))
  }, [matches, jornada])

  const removeMatch = (m: Match) => {
    if (confirm('¿Eliminar este partido?'))
      router.delete(`/dashboard/matches/${m.id}`, { preserveScroll: true })
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'tabla', label: 'Tabla' },
    { key: 'calendario', label: 'Calendario' },
    { key: 'equipos', label: 'Equipos' },
  ]

  return (
    <>
      <Head title={league.name} />

      <Link
        href="/dashboard/leagues"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-6 hover:text-graphite"
      >
        <ArrowLeft className="size-4" /> Ligas
      </Link>

      {/* Header */}
      <Card className="mb-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-lime-deep" />
              <h2 className="text-xl font-semibold tracking-tight text-graphite">{league.name}</h2>
              <span
                className={cn(
                  'inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold',
                  league.status === 'active'
                    ? 'bg-emerald-mark/15 text-emerald-mark'
                    : 'bg-bone-2 text-slate-6'
                )}
              >
                {league.status === 'active' ? 'Activa' : 'Finalizada'}
              </span>
            </div>
            {league.description && (
              <p className="mt-1 text-sm text-slate-6">{league.description}</p>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-6">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {league.locationName}
              </span>
              {(league.seasonStart || league.seasonEnd) && (
                <span>
                  {league.seasonStart ? formatDate(league.seasonStart) : '—'} –{' '}
                  {league.seasonEnd ? formatDate(league.seasonEnd) : '—'}
                </span>
              )}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditLeague(true)}>
            <Pencil className="size-3.5" /> Editar liga
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-3 gap-1 rounded-2xl bg-bone-2 p-1 sm:inline-flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-xl px-5 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-chalk text-graphite shadow-sm'
                : 'text-slate-6 hover:text-graphite'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {tab === 'tabla' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-bone-3 px-5 py-4">
              <h3 className="text-sm font-semibold text-graphite">Tabla de posiciones</h3>
              <span className="text-xs text-slate-6">{standings.length} equipos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bone-3 text-left text-xs font-medium uppercase tracking-wide text-slate-6">
                    <th className="py-3 pl-5 pr-2 font-medium">#</th>
                    <th className="py-3 pr-4 font-medium">Equipo</th>
                    <th className="px-3 py-3 text-center font-medium">PJ</th>
                    <th className="px-3 py-3 text-center font-medium">G</th>
                    <th className="px-3 py-3 text-center font-medium">E</th>
                    <th className="px-3 py-3 text-center font-medium">P</th>
                    <th className="px-3 py-3 text-center font-medium">GF</th>
                    <th className="px-3 py-3 text-center font-medium">GC</th>
                    <th className="px-3 py-3 text-center font-medium">DIF</th>
                    <th className="py-3 pl-3 pr-5 text-center font-bold text-graphite">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-10 text-center text-sm text-slate-6">
                        Agrega equipos para ver la tabla.
                      </td>
                    </tr>
                  ) : (
                    standings.map((s, i) => (
                      <tr
                        key={s.teamId}
                        className="border-t border-bone-2 transition-colors hover:bg-bone-1/70"
                      >
                        <td className="py-3.5 pl-5 pr-2">
                          <span
                            className={cn(
                              'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                              i < 3 ? 'bg-lime-mark/30 text-graphite' : 'text-slate-6'
                            )}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-graphite">{s.team}</td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.played}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.won}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.drawn}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.lost}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.goalsFor}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.goalsAgainst}
                        </td>
                        <td className="px-3 py-3.5 text-center tabular-nums text-slate-6">
                          {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-center font-bold tabular-nums text-graphite">
                          {s.points}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {hasPlayed && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-graphite">
                  ⚽ Goleadores
                </h3>
                {scorers.length === 0 ? (
                  <p className="text-sm text-slate-6">Sin goles aún.</p>
                ) : (
                  <ul className="-my-2 divide-y divide-bone-2 text-sm">
                    {scorers.map((s, i) => (
                      <li key={i} className="flex items-center gap-3 py-2.5">
                        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-slate-6">
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate text-graphite">
                          {s.player} <span className="text-slate-6">· {s.team}</span>
                        </span>
                        <span className="font-bold tabular-nums text-graphite">{s.goals}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-graphite">Tarjetas</h3>
                {cards.length === 0 ? (
                  <p className="text-sm text-slate-6">Sin tarjetas.</p>
                ) : (
                  <ul className="-my-2 divide-y divide-bone-2 text-sm">
                    {cards.map((c, i) => (
                      <li key={i} className="flex items-center gap-3 py-2.5">
                        <span className="flex-1 truncate text-graphite">
                          {c.player} <span className="text-slate-6">· {c.team}</span>
                        </span>
                        {c.yellow > 0 && <span className="tabular-nums">🟨 {c.yellow}</span>}
                        {c.red > 0 && <span className="tabular-nums">🟥 {c.red}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Calendario */}
      {tab === 'calendario' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {(rounds.length > 0 || hasNoRound) && (
                <Select
                  className="w-auto"
                  value={jornada}
                  onChange={(e) => setJornada(e.target.value)}
                >
                  <option value="all">Todas las jornadas</option>
                  {rounds.map((r) => (
                    <option key={r} value={String(r)}>
                      Jornada {r}
                    </option>
                  ))}
                  {hasNoRound && <option value="none">Sin jornada</option>}
                </Select>
              )}
              <p className="text-sm text-slate-6">
                {visibleMatches.length} {visibleMatches.length === 1 ? 'partido' : 'partidos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!enoughTeams || spaces.length === 0}
                onClick={() => setGenerating(true)}
              >
                <CalendarRange className="size-4" /> Generar calendario
              </Button>
              <Button
                variant="lime"
                size="sm"
                disabled={!enoughTeams}
                onClick={() => setMatchDialog('new')}
              >
                <Plus className="size-4" /> Programar partido
              </Button>
            </div>
          </div>
          {!enoughTeams && (
            <p className="text-sm text-slate-6">
              Necesitas al menos 2 equipos para programar partidos.
            </p>
          )}
          {enoughTeams && spaces.length === 0 && (
            <p className="text-sm text-slate-6">No hay canchas en la locación de la liga.</p>
          )}

          {matches.length === 0 ? (
            <EmptyState title="Sin partidos" hint="Programa el primer partido del calendario." />
          ) : visibleMatches.length === 0 ? (
            <EmptyState title="Sin partidos" hint="No hay partidos en esta jornada." />
          ) : (
            <div className="space-y-4">
              {visibleMatches.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-medium uppercase tracking-wide text-slate-6">
                      {m.round != null && `J${m.round} · `}
                      {formatDate(m.date)} · {m.startTime}
                    </p>
                    <span
                      className={cn(
                        'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold',
                        MATCH_STATUS[m.status].cls
                      )}
                    >
                      {MATCH_STATUS[m.status].label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'truncate font-display text-xl font-bold uppercase tracking-tight sm:text-2xl',
                          m.status === 'played' && m.awayGoals > m.homeGoals
                            ? 'text-slate-6'
                            : 'text-graphite'
                        )}
                      >
                        {m.homeTeam}
                      </span>
                      {m.status === 'played' && (
                        <span className="shrink-0 font-display text-xl font-bold tabular-nums text-graphite sm:text-2xl">
                          {m.homeGoals}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold uppercase text-rose-mark">
                        vs
                      </span>
                      <span className="h-px flex-1 bg-bone-3" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'truncate font-display text-xl font-bold uppercase tracking-tight sm:text-2xl',
                          m.status === 'played' && m.homeGoals > m.awayGoals
                            ? 'text-slate-6'
                            : 'text-graphite'
                        )}
                      >
                        {m.awayTeam}
                      </span>
                      {m.status === 'played' && (
                        <span className="shrink-0 font-display text-xl font-bold tabular-nums text-graphite sm:text-2xl">
                          {m.awayGoals}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-bone-2 pt-3 text-sm text-slate-6">
                    <MapPin className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{m.spaceName}</span>
                    <Button variant="secondary" size="sm" onClick={() => setMinuta(m)}>
                      Cédula
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMatchDialog(m)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => removeMatch(m)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipos */}
      {tab === 'equipos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-6">
              {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'}
            </p>
            <Button variant="lime" size="sm" onClick={() => setTeamDialog('new')}>
              <Plus className="size-4" /> Nuevo equipo
            </Button>
          </div>
          {teams.length === 0 ? (
            <EmptyState title="Sin equipos" hint="Agrega equipos y su roster de jugadores." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => (
                <TeamCard key={t.id} team={t} onEdit={() => setTeamDialog(t)} />
              ))}
            </div>
          )}
        </div>
      )}

      {editLeague && <LeagueEditDialog league={league} onClose={() => setEditLeague(false)} />}
      {teamDialog && (
        <TeamDialog
          key={teamDialog === 'new' ? 'new' : teamDialog.id}
          leagueId={league.id}
          team={teamDialog}
          onClose={() => setTeamDialog(null)}
        />
      )}
      {matchDialog && (
        <MatchDialog
          key={matchDialog === 'new' ? 'new' : matchDialog.id}
          leagueId={league.id}
          teams={teams}
          spaces={spaces}
          match={matchDialog}
          nextRound={nextRound}
          onClose={() => setMatchDialog(null)}
        />
      )}
      {generating && (
        <GenerateFixturesDialog
          leagueId={league.id}
          spaces={spaces}
          seasonStart={league.seasonStart}
          hasMatches={matches.length > 0}
          onClose={() => setGenerating(false)}
        />
      )}
      {minuta && (
        <MinutaDialog
          key={minuta.id}
          match={matches.find((m) => m.id === minuta.id) ?? minuta}
          teams={teams}
          onClose={() => setMinuta(null)}
        />
      )}
    </>
  )
}

LeagueShow.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Liga" subtitle="Equipos, calendario y estadísticas">
    {page}
  </DashboardLayout>
)
