import { cn } from '~/lib/utils'

/**
 * Futhub brand lockup — the brand mark (public/logo.svg) plus the "Fut·hub"
 * wordmark. `tone="light"` flips the mark to white (filter) and the wordmark to
 * chalk for use on dark surfaces (sidebar, footer, hero, auth screens).
 */

const SIZES = {
  sm: { mark: 'size-7', text: 'text-base' },
  md: { mark: 'size-8', text: 'text-lg' },
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
  const futTone = light ? 'text-chalk' : 'text-graphite'
  const hubTone = light ? 'text-slate-3' : 'text-slate-6'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src="/logo.svg"
        alt="Futhub"
        className={cn('shrink-0 object-contain', SIZES[size].mark, light && 'brightness-0 invert')}
      />
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
