import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import PublicLayout, { AccessDialog } from '~/layouts/public'
import { Button, Card, Photo } from '~/components/ui'
import { cn } from '~/lib/utils'
import { money } from '~/lib/format'
import { buildSlots, type Range } from '~/lib/slots'
import { spaceImage } from '~/lib/stock'

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
type Occupied = {
  bookings: Range[]
  blocks: Range[]
  events: (Range & { name: string })[]
  matches: (Range & { name: string })[]
}
type SharedUser = { id: number; role: string } | null

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }
const hhmm = (t: string) => (t ?? '').slice(0, 5)

export default function PublicSpace({
  space,
  date,
  occupied,
}: {
  space: Space
  date: string
  occupied: Occupied
}) {
  const user = usePage<{ user: SharedUser }>().props.user
  const [access, setAccess] = useState(false)

  const ranges: Range[] = [
    ...occupied.bookings,
    ...occupied.blocks,
    ...occupied.events,
    ...occupied.matches,
  ]
  const slots = buildSlots(hhmm(space.openTime), hhmm(space.closeTime), ranges)

  const changeDate = (d: string) =>
    router.get(`/espacios/${space.id}`, { date: d }, { preserveScroll: true, preserveState: true })

  const reserve = () => {
    if (user) router.visit(`/app/spaces/${space.id}`)
    else setAccess(true)
  }

  return (
    <>
      <Head title={space.name} />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-6 hover:text-graphite"
      >
        <ArrowLeft className="size-4" /> Espacios
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Photo
            src={spaceImage(space)}
            alt={space.name}
            className="aspect-video w-full rounded-3xl"
          />
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-bone-2 px-2.5 py-1 text-xs font-semibold text-slate-6">
              {TYPE_LABEL[space.type]}
              {space.type === 'cancha' && space.size ? ` · Fútbol ${space.size}` : ''}
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-graphite">
              {space.name}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-6">
              <MapPin className="size-3.5" /> {space.location}
              {space.address ? ` · ${space.address}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-6">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {hhmm(space.openTime)}–{hhmm(space.closeTime)}
              </span>
              {space.capacity ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {space.capacity} personas
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-lg text-graphite">
              <span className="font-bold">{money(space.pricePerHour)}</span>
              <span className="text-slate-6"> MXN / hora</span>
            </p>
          </div>
        </div>

        {/* Schedule (read-only) */}
        <Card className="h-fit p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-graphite">
              <CalendarDays className="size-4" /> Horarios
            </h2>
            <input
              type="date"
              value={date}
              onChange={(e) => changeDate(e.target.value)}
              className="h-9 rounded-lg border border-bone-3 bg-bone-1 px-2.5 text-sm text-graphite"
            />
          </div>

          {space.status !== 'active' ? (
            <p className="text-sm text-rose-mark">Este espacio no está disponible actualmente.</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-6">Sin horario configurado.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <span
                  key={s.start}
                  className={cn(
                    'rounded-lg px-2 py-1.5 text-center text-xs font-medium tabular-nums',
                    s.free
                      ? 'bg-emerald-mark/10 text-emerald-mark'
                      : 'bg-bone-2 text-slate-6 line-through'
                  )}
                  title={s.free ? 'Libre' : 'Ocupado'}
                >
                  {s.start}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 flex items-center gap-3 text-[11px] text-slate-6">
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-emerald-mark/30" /> Libre
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-bone-3" /> Ocupado
            </span>
          </p>

          <Button
            variant="lime"
            className="mt-5 w-full"
            onClick={reserve}
            disabled={space.status !== 'active'}
          >
            {user ? 'Reservar' : 'Entrar para reservar'}
          </Button>
        </Card>
      </div>

      {access && <AccessDialog onClose={() => setAccess(false)} />}
    </>
  )
}

PublicSpace.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
