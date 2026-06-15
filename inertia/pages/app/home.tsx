import { useCallback, useEffect, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Clock, Heart, MapPin } from 'lucide-react'
import ClientLayout from '~/layouts/client'
import { Photo } from '~/components/ui'
import { cn } from '~/lib/utils'
import { money } from '~/lib/format'

type Space = {
  id: number
  name: string
  type: 'cancha' | 'terraza' | 'otro'
  size: string | null
  pricePerHour: number
  photoUrl: string | null
  openTime: string
  closeTime: string
}
type Loc = { id: number; name: string; address: string; phone: string | null; photoUrl: string | null; spaces: Space[] }

const TYPE_LABEL: Record<string, string> = { cancha: 'Cancha', terraza: 'Terraza', otro: 'Otro' }
const hhmm = (t: string) => (t ?? '').slice(0, 5)
const FAV_KEY = 'shootout:favs'

/** Local favorites (heart), persisted to localStorage — purely client-side. */
function useFavorites() {
  const [favs, setFavs] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY)
      if (raw) setFavs(new Set(JSON.parse(raw) as number[]))
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback((id: number) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { favs, toggle }
}

function SpaceCard({ space, fav, onFav }: { space: Space; fav: boolean; onFav: (id: number) => void }) {
  return (
    <Link href={`/app/spaces/${space.id}`} className="group block">
      <div className="relative">
        <Photo
          src={space.photoUrl}
          alt={space.name}
          className="aspect-square w-full rounded-2xl"
          overlay={
            <>
              <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-chalk/90 px-2.5 py-1 text-xs font-semibold text-graphite shadow-sm backdrop-blur">
                {TYPE_LABEL[space.type]}
                {space.type === 'cancha' && space.size ? ` ${space.size}` : ''}
              </span>
              <button
                type="button"
                aria-label={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onFav(space.id)
                }}
                className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-chalk transition-transform active:scale-90"
              >
                <Heart className={cn('size-6 drop-shadow', fav ? 'fill-rose-mark text-rose-mark' : 'fill-graphite/30 text-chalk')} />
              </button>
            </>
          }
        />
      </div>

      <div className="mt-2.5">
        <p className="truncate font-medium text-graphite">{space.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
          <Clock className="size-3.5 shrink-0" /> {hhmm(space.openTime)}–{hhmm(space.closeTime)}
        </p>
        <p className="mt-1 text-sm text-graphite">
          <span className="font-semibold">{money(space.pricePerHour)}</span>
          <span className="text-slate-6"> MXN / hora</span>
        </p>
      </div>
    </Link>
  )
}

export default function Home({ locations }: { locations: Loc[] }) {
  const { favs, toggle } = useFavorites()

  return (
    <>
      <Head title="Explorar" />
      <div className="space-y-9">
        {locations.length === 0 && (
          <p className="text-sm text-slate-6">No hay locaciones disponibles por ahora.</p>
        )}

        {locations.map((loc) => (
          <section key={loc.id}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-graphite">{loc.name}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-6">
                <MapPin className="size-3.5 shrink-0" /> {loc.address}
              </p>
            </div>

            {loc.spaces.length === 0 ? (
              <p className="text-sm text-slate-6">Sin espacios disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                {loc.spaces.map((s) => (
                  <SpaceCard key={s.id} space={s} fav={favs.has(s.id)} onFav={toggle} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}

Home.layout = (page: React.ReactNode) => (
  <ClientLayout title="Explorar espacios" subtitle="Elige una locación y aparta tu horario">
    {page}
  </ClientLayout>
)
