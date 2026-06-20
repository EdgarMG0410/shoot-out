import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { CommunityPhoto } from '~/lib/community'

/* ------------------------------- Reveal ---------------------------------- */

/** Fades/slides children in once they scroll into view. Custom-eased via CSS. */
export function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.15,
}: {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('reveal', shown && 'reveal-in', className)}
    >
      {children}
    </div>
  )
}

/* ------------------------------- CountUp --------------------------------- */

/** Animates a number from 0 → value when it first scrolls into view. */
export function CountUp({
  value,
  duration = 1300,
  className,
  format,
}: {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        io.disconnect()
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setN(Math.round(value * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {format ? format(n) : n}
    </span>
  )
}

/* ------------------------------- Marquee --------------------------------- */

/** Seamless infinite horizontal scroll; children are duplicated internally. */
export function Marquee({
  children,
  speed = 46,
  reverse = false,
  className,
}: {
  children: ReactNode
  speed?: number
  reverse?: boolean
  className?: string
}) {
  return (
    <div className={cn('marquee', className)} data-reverse={reverse}>
      <div className="marquee-track" style={{ '--marquee-duration': `${speed}s` } as CSSProperties}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Magnetic --------------------------------- */

/** Pulls its child toward the cursor on hover — a subtle magnetic micro-interaction. */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transform = `translate(${x}px, ${y}px)`
    },
    [strength]
  )

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('inline-block [transition:transform_400ms_var(--ease-expo)]', className)}
    >
      {children}
    </span>
  )
}

/* -------------------------- Community gallery ---------------------------- */

/** Photo masonry (gap-free CSS columns) with a fullscreen, keyboard-navigable lightbox. */
export function CommunityGallery({ photos }: { photos: CommunityPhoto[] }) {
  const [idx, setIdx] = useState<number | null>(null)
  const open = idx !== null

  const close = useCallback(() => setIdx(null), [])
  const step = useCallback(
    (dir: number) => setIdx((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Ver foto: ${p.alt}`}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-bone-2 ring-1 ring-bone-3 transition-transform duration-300 ease-(--ease-quart) hover:-translate-y-0.5 hover:shadow-xl"
          >
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 ease-(--ease-quart) group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-graphite/0 transition-colors duration-300 group-hover:bg-graphite/25" />
            <span className="absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-chalk/95 text-graphite opacity-0 shadow-md backdrop-blur transition-all duration-300 ease-(--ease-expo) group-hover:translate-y-0 group-hover:opacity-100">
              <Plus className="size-4.5" strokeWidth={2.25} />
            </span>
          </button>
        ))}
      </div>

      {open &&
        idx !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Galería de la comunidad"
            onClick={close}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-graphite/95 p-2 backdrop-blur-md motion-safe:animate-[fade-in_250ms_var(--ease-quart)_both] sm:p-4"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-chalk/10 text-chalk ring-1 ring-chalk/20 transition-colors hover:bg-chalk/20"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
              aria-label="Anterior"
              className="absolute left-3 grid size-12 place-items-center rounded-full bg-chalk/10 text-chalk ring-1 ring-chalk/20 transition-colors hover:bg-chalk/20 sm:left-6"
            >
              <ChevronLeft className="size-6" />
            </button>

            <figure
              className="flex max-h-full w-full max-w-[96vw] flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[idx].src}
                alt={photos[idx].alt}
                className="max-h-[88vh] w-auto max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-chalk/10"
              />
              <figcaption className="mt-4 flex items-center gap-3 text-sm text-chalk/70">
                <span className="tabular-nums">
                  {idx + 1} / {photos.length}
                </span>
                <span className="h-3 w-px bg-chalk/25" />
                <span>{photos[idx].alt}</span>
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
              aria-label="Siguiente"
              className="absolute right-3 grid size-12 place-items-center rounded-full bg-chalk/10 text-chalk ring-1 ring-chalk/20 transition-colors hover:bg-chalk/20 sm:right-6"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
