import { cn } from '~/lib/utils'

/**
 * Futhub brand lockup — a monochrome "FH" monogram: a bold graphite F
 * interlocking with a gray H, joined by a white "hub" node at their crossing
 * (the hub in Fut·hub). Self-contained SVG stays crisp at any size. `tone`
 * flips the mark + wordmark colors for use on dark surfaces (e.g. the sidebar).
 */

const SIZES = {
  sm: { svg: 'size-7', text: 'text-base' },
  md: { svg: 'size-8', text: 'text-lg' },
  lg: { svg: 'size-11', text: 'text-2xl' },
  xl: { svg: 'size-14', text: 'text-4xl' },
} as const

export function Logo({
  className,
  tone = 'dark',
  size = 'md',
  showText = true,
}: {
  className?: string
  tone?: 'dark' | 'light'
  size?: keyof typeof SIZES
  showText?: boolean
}) {
  const light = tone === 'light'
  // Mark fills — on light surfaces the F is near-black; on dark surfaces it
  // flips to chalk so it stays legible. The H is always a mid gray a step away.
  const fInk = light ? 'fill-chalk' : 'fill-graphite'
  const hInk = light ? 'fill-slate-3' : 'fill-slate-6'
  const hubRing = light ? 'fill-graphite' : 'fill-chalk'

  // Wordmark — "Fut" in the ink tone, "hub" a step lighter to echo the F/H split.
  const futTone = light ? 'text-chalk' : 'text-graphite'
  const hubTone = light ? 'text-slate-3' : 'text-slate-6'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        className={cn('shrink-0', SIZES[size].svg)}
        role="img"
        aria-label="Futhub"
      >
        {/* H (gray) — drawn first so the F and hub node sit on top */}
        <g className={hInk}>
          <rect x="27.5" y="8" width="5.5" height="24" rx="2.6" />
          <rect x="20.5" y="17.25" width="12.5" height="5.5" rx="2.6" />
          <rect x="20.5" y="22" width="5.5" height="10" rx="2.6" />
        </g>
        {/* F (graphite) */}
        <g className={fInk}>
          <rect x="7" y="8" width="5.5" height="24" rx="2.6" />
          <rect x="7" y="8" width="16" height="5.5" rx="2.6" />
          <rect x="7" y="17.25" width="12" height="5.5" rx="2.6" />
        </g>
        {/* Hub node at the F/H crossing — white ring + dark center */}
        <circle cx="20" cy="20" r="4.6" className={hubRing} />
        <circle cx="20" cy="20" r="2.7" className={fInk} />
      </svg>
      {showText && (
        <span
          className={cn(
            'font-display font-semibold leading-none tracking-tight',
            SIZES[size].text,
            futTone
          )}
        >
          Fut<span className={hubTone}>hub</span>
        </span>
      )}
    </span>
  )
}
