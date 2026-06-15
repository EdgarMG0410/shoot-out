import { useEffect, useMemo } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeft, CalendarDays, Clock, MapPin } from 'lucide-react'
import ClientLayout from '~/layouts/client'
import { Button, Card, Field, Photo, Select } from '~/components/ui'
import { money, timeRange } from '~/lib/format'
import { buildSlots, endOptions, startOptions } from '~/lib/slots'

type Occupied = {
  bookings: { id: number; startTime: string; endTime: string }[]
  blocks: { id: number; startTime: string; endTime: string; reason: string | null }[]
  events: { id: number; name: string; startTime: string; endTime: string }[]
  matches: { id: number; name: string; startTime: string; endTime: string }[]
}
type Space = {
  id: number
  name: string
  type: 'cancha' | 'terraza' | 'otro'
  size: string | null
  pricePerHour: number
  capacity: number | null
  photoUrl: string | null
  openTime: string
  closeTime: string
  location: string
  address: string | null
  status: 'active' | 'blocked'
}

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }
const hhmm = (t: string) => (t ?? '').slice(0, 5)
const toMin = (t: string) => {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

export default function SpacePage({ space, date, occupied }: { space: Space; date: string; occupied: Occupied }) {
  const form = useForm({ spaceId: space.id, date, startTime: '', endTime: '' })

  // Discrete free/occupied grid within the space's business hours.
  const slots = useMemo(
    () =>
      buildSlots(space.openTime, space.closeTime, [
        ...occupied.bookings,
        ...occupied.blocks,
        ...occupied.events,
        ...occupied.matches,
      ]),
    [space.openTime, space.closeTime, occupied]
  )
  const starts = useMemo(() => startOptions(slots), [slots])
  const ends = useMemo(() => (form.data.startTime ? endOptions(slots, form.data.startTime) : []), [slots, form.data.startTime])

  // Reset the picked range whenever the day changes (slots differ per date).
  useEffect(() => {
    form.setData('startTime', '')
    form.setData('endTime', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const hours = useMemo(() => {
    if (!form.data.startTime || !form.data.endTime) return 0
    const d = (toMin(form.data.endTime) - toMin(form.data.startTime)) / 60
    return d > 0 ? d : 0
  }, [form.data.startTime, form.data.endTime])

  const pickStart = (v: string) => {
    const ed = v ? endOptions(slots, v) : []
    form.setData({ ...form.data, startTime: v, endTime: ed[0] ?? '' })
  }

  const occupiedSlots = [
    ...occupied.events.map((e) => ({ tone: 'event' as const, label: e.name, range: timeRange(e.startTime, e.endTime) })),
    ...occupied.matches.map((m) => ({ tone: 'match' as const, label: m.name, range: timeRange(m.startTime, m.endTime) })),
    ...occupied.bookings.map((b) => ({ tone: 'booking' as const, label: 'Reservada', range: timeRange(b.startTime, b.endTime) })),
    ...occupied.blocks.map((b) => ({ tone: 'block' as const, label: b.reason ?? 'Bloqueada', range: timeRange(b.startTime, b.endTime) })),
  ].sort((a, b) => a.range.localeCompare(b.range))

  const changeDate = (d: string) => router.get(`/app/spaces/${space.id}`, { date: d }, { preserveScroll: true })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/app/bookings')
  }

  const TONE: Record<string, string> = {
    event: 'bg-lime-mark/20 text-graphite',
    match: 'bg-graphite/10 text-graphite',
    booking: 'bg-amber-mark/15 text-amber-mark',
    block: 'bg-rose-mark/15 text-rose-mark',
  }

  const bookable = space.status === 'active'

  return (
    <>
      <Head title={space.name} />
      <Link href="/app" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-6 hover:text-graphite">
        <ArrowLeft className="size-4" /> Volver
      </Link>

      {/* Hero */}
      <Card className="mb-5 overflow-hidden sm:mb-6">
        <Photo
          src={space.photoUrl}
          alt={space.name}
          className="h-44 w-full sm:h-64"
          overlay={
            <>
              <div className="absolute inset-0 bg-linear-to-t from-graphite/85 via-graphite/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-chalk sm:p-6">
                <span className="inline-flex items-center rounded-md bg-chalk/90 px-2 py-0.5 text-xs font-semibold text-graphite">
                  {TYPE_LABEL[space.type]}
                  {space.type === 'cancha' && space.size ? ` ${space.size}` : ''}
                </span>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{space.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-chalk/85">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {space.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {hhmm(space.openTime)}–{hhmm(space.closeTime)}
                  </span>
                </p>
              </div>
            </>
          }
        />
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
        {/* Availability */}
        <Card className="p-5 sm:p-6">
          <p className="text-sm text-slate-6">
            <span className="text-xl font-bold tabular-nums text-graphite">{money(space.pricePerHour)}</span> / hora
            {space.capacity ? <span className="ml-3">· cupo {space.capacity}</span> : null}
          </p>

          <div className="mt-5 border-t border-bone-3 pt-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-graphite">Disponibilidad del día</h3>
              <label className="inline-flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-slate-6" />
                <input
                  type="date"
                  value={date}
                  aria-label="Fecha"
                  onChange={(e) => changeDate(e.target.value)}
                  className="h-9 rounded-lg border border-bone-3 bg-bone-1 px-3 text-sm"
                />
              </label>
            </div>
            {occupiedSlots.length === 0 ? (
              <p className="rounded-lg bg-emerald-mark/10 px-3 py-2.5 text-sm font-medium text-emerald-mark">
                Libre todo el día dentro del horario 🎉
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {occupiedSlots.map((s, i) => (
                  <li key={i} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${TONE[s.tone]}`}>
                    <span className="tabular-nums">{s.range}</span> · {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Booking */}
        <Card className="p-5 sm:p-6 lg:sticky lg:top-20">
          <h3 className="text-base font-semibold text-graphite">Reservar</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-6">
            <Clock className="size-3.5" /> Horario {hhmm(space.openTime)}–{hhmm(space.closeTime)}
          </p>

          {!bookable ? (
            <p className="mt-4 rounded-lg bg-rose-mark/10 px-3 py-2.5 text-sm font-medium text-rose-mark">
              Este espacio no está disponible.
            </p>
          ) : starts.length === 0 ? (
            <p className="mt-4 rounded-lg bg-bone-2 px-3 py-2.5 text-sm font-medium text-slate-6">
              Sin horarios disponibles este día. Prueba otra fecha.
            </p>
          ) : (
            <form id="booking-form" onSubmit={submit} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Inicio" error={form.errors.startTime}>
                  <Select value={form.data.startTime} onChange={(e) => pickStart(e.target.value)} required>
                    <option value="" disabled>
                      Hora…
                    </option>
                    {starts.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fin" error={form.errors.endTime}>
                  <Select
                    value={form.data.endTime}
                    onChange={(e) => form.setData('endTime', e.target.value)}
                    disabled={!form.data.startTime}
                    required
                  >
                    <option value="" disabled>
                      Hora…
                    </option>
                    {ends.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Desktop: total + CTA live inside the card. Mobile uses the sticky bar below. */}
              <div className="hidden flex-col gap-4 lg:flex">
                <div className="flex items-center justify-between rounded-lg bg-bone-2 px-3.5 py-2.5 text-sm">
                  <span className="text-slate-6">{hours > 0 ? `${hours} h` : 'Total'}</span>
                  <span className="font-bold tabular-nums text-graphite">{money(hours * space.pricePerHour)}</span>
                </div>
                <Button type="submit" variant="lime" disabled={form.processing || hours <= 0}>
                  {form.processing ? 'Reservando…' : 'Reservar'}
                </Button>
                <p className="text-center text-xs text-slate-6">Apartas ahora, pagas para confirmar.</p>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Mobile sticky booking bar — total + CTA always reachable at the bottom */}
      {bookable && starts.length > 0 && (
        <>
          <div className="h-24 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bone-3 bg-bone-1/95 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex-1 leading-tight">
                <p className="text-[11px] text-slate-6">{hours > 0 ? `${hours} h · total` : 'Elige tu horario'}</p>
                <p className="text-lg font-bold tabular-nums text-graphite">{money(hours * space.pricePerHour)}</p>
              </div>
              <Button
                type="submit"
                form="booking-form"
                variant="lime"
                disabled={form.processing || hours <= 0}
                className="px-8"
              >
                {form.processing ? 'Reservando…' : 'Reservar'}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

SpacePage.layout = (page: React.ReactNode) => <ClientLayout>{page}</ClientLayout>
