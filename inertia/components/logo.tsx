import { cn } from '~/lib/utils'

/**
 * Futhub brand lockup — a crisp, self-contained SVG mark (lime tile + bold "F"
 * + ball) next to a two-tone "Futhub" wordmark. Vector mark stays sharp at any
 * size. `tone` flips the wordmark colors for use on dark surfaces.
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
  const fut = tone === 'light' ? 'text-chalk' : 'text-graphite'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        className={cn('shrink-0', SIZES[size].svg)}
        role="img"
        aria-label="Futhub"
      >
        <rect width="40" height="40" rx="12" className="fill-lime-mark" />
        <path
          d="M13.5 10.5 H27 V15.5 H18.5 V18.6 H25 V23.4 H18.5 V30 H13.5 Z"
          className="fill-graphite"
        />
        <circle cx="26.6" cy="27.4" r="3.6" className="fill-graphite" />
      </svg>
      {showText && (
        <span
          className={cn(
            'font-display font-semibold leading-none tracking-tight',
            SIZES[size].text,
            fut
          )}
        >
          Fut<span className="text-lime-deep">hub</span>
        </span>
      )}
    </span>
  )
}
