import { useMemo, useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeft, CalendarRange, Clock, MapPin, Pencil, Plus, Trash2, Trophy } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Button, Card, Dialog, EmptyState, Field, Input, Select, Textarea } from '~/components/ui'
import { ImageUpload } from '~/components/image-upload'
import { cn } from '~/lib/utils'
import { formatDate, timeRange } from '~/lib/format'

type Player = { id: number; name: string; number: number | null }
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
    form
      .transform((d) => ({
        name: d.name,
        description: d.description || null,
        seasonStart: d.seasonStart || null,
        seasonEnd: d.seasonEnd || null,
        status: d.status,
      }))
      .put(`/dashboard/leagues/${league.id}`, { onSuccess: onClose, preserveScroll: true })
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

function TeamCard({ team, onEdit }: { team: Team; onEdit: () => void }) {
  const form = useForm({ name: '', number: '' })
  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    form
      .transform((d) => ({ name: d.name, number: d.number ? Number(d.number) : null }))
      .post(`/dashboard/teams/${team.id}/players`, {
        preserveScroll: true,
        onSuccess: () => form.reset('name', 'number'),
      })
  }
  const removePlayer = (id: number) =>
    router.delete(`/dashboard/players/${id}`, { preserveScroll: true })
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
              className="flex items-center gap-2.5 rounded-lg bg-bone-2 px-3 py-2 text-sm"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-chalk text-xs font-semibold tabular-nums text-slate-6">
                {p.number ?? '–'}
              </span>
              <span className="flex-1 truncate text-graphite">{p.name}</span>
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

      <form onSubmit={addPlayer} className="mt-4 flex items-end gap-2 border-t border-bone-2 pt-4">
        <div className="w-14">
          <Input
            type="number"
            min="0"
            value={form.data.number}
            onChange={(e) => form.setData('number', e.target.value)}
            placeholder="#"
            aria-label="Número"
          />
        </div>
        <div className="flex-1">
          <Input
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            placeholder="Nombre del jugador"
            required
            aria-label="Jugador"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          disabled={form.processing}
          aria-label="Agregar jugador"
        >
          <Plus className="size-4" />
        </Button>
      </form>
    </Card>
  )
}

/* -------------------------------- Matches -------------------------------- */

function MatchDialog({
  leagueId,
  teams,
  spaces,
  match,
  onClose,
}: {
  leagueId: number
  teams: Team[]
  spaces: SpaceOpt[]
  match: Match | 'new'
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
        <Field label="Fecha" error={form.errors.date}>
          <Input
            type="date"
            value={form.data.date}
            onChange={(e) => form.setData('date', e.target.value)}
            required
          />
        </Field>
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
    form
      .transform((d) => ({
        spaceIds: d.spaceIds,
        startDate: d.startDate,
        firstTime: d.firstTime,
        matchDuration: Number(d.matchDuration),
        gap: Number(d.gap),
        replace: d.replace,
      }))
      .post(`/dashboard/leagues/${leagueId}/matches/generate`, {
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
  goal: '⚽ Gol',
  yellow: '🟨 Amarilla',
  red: '🟥 Roja',
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
  const form = useForm({
    teamId: String(match.homeTeamId),
    playerId: '',
    type: 'goal' as EventType,
    minute: '',
  })
  const roster = teamById.get(Number(form.data.teamId))?.players ?? []

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    form
      .transform((d) => ({
        teamId: Number(d.teamId),
        playerId: d.playerId ? Number(d.playerId) : null,
        type: d.type,
        minute: d.minute ? Number(d.minute) : null,
      }))
      .post(`/dashboard/matches/${match.id}/events`, {
        preserveScroll: true,
        onSuccess: () => form.reset('playerId', 'minute'),
      })
  }
  const removeEvent = (id: number) =>
    router.delete(`/dashboard/match-events/${id}`, { preserveScroll: true })

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Minuta · ${match.homeTeam} ${match.homeGoals}–${match.awayGoals} ${match.awayTeam}`}
      description={`${formatDate(match.date)} · ${timeRange(match.startTime, match.endTime)} · ${match.spaceName}`}
    >
      <div className="flex flex-col gap-4">
        <ul className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {match.events.length === 0 ? (
            <li className="text-sm text-slate-6">Sin eventos registrados.</li>
          ) : (
            match.events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-2 rounded-lg bg-bone-2 px-2.5 py-1.5 text-sm"
              >
                <span className="w-8 shrink-0 text-center tabular-nums text-slate-6">
                  {ev.minute != null ? `${ev.minute}'` : '—'}
                </span>
                <span className="shrink-0">{EVENT_LABEL[ev.type]}</span>
                <span className="flex-1 truncate text-graphite">
                  {ev.playerName ?? 'Sin asignar'}
                  <span className="text-slate-6">
                    {' '}
                    · {ev.teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeEvent(ev.id)}
                  aria-label="Quitar"
                  className="text-slate-6 hover:text-rose-mark"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))
          )}
        </ul>

        <form onSubmit={add} className="flex flex-col gap-3 border-t border-bone-3 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Equipo" error={form.errors.teamId}>
              <Select
                value={form.data.teamId}
                onChange={(e) =>
                  form.setData({ ...form.data, teamId: e.target.value, playerId: '' })
                }
              >
                <option value={match.homeTeamId}>{match.homeTeam}</option>
                <option value={match.awayTeamId}>{match.awayTeam}</option>
              </Select>
            </Field>
            <Field label="Tipo" error={form.errors.type}>
              <Select
                value={form.data.type}
                onChange={(e) => form.setData('type', e.target.value as EventType)}
              >
                <option value="goal">⚽ Gol</option>
                <option value="yellow">🟨 Amarilla</option>
                <option value="red">🟥 Roja</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <Field label="Jugador" error={form.errors.playerId}>
              <Select
                value={form.data.playerId}
                onChange={(e) => form.setData('playerId', e.target.value)}
              >
                <option value="">Sin asignar</option>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number != null ? `${p.number} · ` : ''}
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Min" error={form.errors.minute}>
              <Input
                type="number"
                min="0"
                value={form.data.minute}
                onChange={(e) => form.setData('minute', e.target.value)}
                placeholder="45"
              />
            </Field>
          </div>
          <Button type="submit" variant="lime" disabled={form.processing}>
            <Plus className="size-4" /> Agregar a la minuta
          </Button>
        </form>
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

  const enoughTeams = teams.length >= 2
  const hasPlayed = standings.some((s) => s.played > 0)

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
            <p className="text-sm text-slate-6">
              {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
            </p>
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
          ) : (
            <div className="space-y-4">
              {matches.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-6">
                    <span className="font-medium text-graphite">{formatDate(m.date)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {timeRange(m.startTime, m.endTime)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {m.spaceName}
                    </span>
                    <span
                      className={cn(
                        'inline-flex h-5 items-center rounded-md px-2 text-[11px] font-semibold',
                        MATCH_STATUS[m.status].cls
                      )}
                    >
                      {MATCH_STATUS[m.status].label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                    <span className="truncate text-right font-semibold text-graphite">
                      {m.homeTeam}
                    </span>
                    <span className="rounded-xl bg-bone-2 px-4 py-1.5 text-lg font-bold tabular-nums text-graphite">
                      {m.homeGoals}–{m.awayGoals}
                    </span>
                    <span className="truncate font-semibold text-graphite">{m.awayTeam}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-bone-2 pt-4">
                    <Button variant="secondary" size="sm" onClick={() => setMinuta(m)}>
                      Minuta
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          match={minuta}
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
