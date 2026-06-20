import { cn } from '~/lib/utils'

/**
 * Futhub brand lockup — the FORMA interlocking monogram (ink/green on light,
 * white/green on dark) plus the "Futhub" wordmark. `tone="light"` is for dark
 * surfaces (sidebar, footer, hero, auth). Marks are pre-coloured per surface,
 * so no filters are applied.
 */

const SIZES = {
  sm: { mark: 'size-7', text: 'text-base' },
  md: { mark: 'size-9', text: 'text-lg' },
  lg: { mark: 'size-11', text: 'text-2xl' },
  xl: { mark: 'size-14', text: 'text-4xl' },
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

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src={light ? '/logo-white.svg' : '/logo-gray.svg'}
        alt="Futhub"
        className={cn('shrink-0 object-contain', SIZES[size].mark)}
      />
      {showText && (
        <span
          className={cn(
            'font-display font-semibold leading-none tracking-tight',
            SIZES[size].text,
            light ? 'text-chalk' : 'text-graphite'
          )}
        >
          Fut<span className={light ? 'text-slate-3' : 'text-slate-6'}>hub</span>
        </span>
      )}
    </span>
  )
}
