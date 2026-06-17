import { useState } from 'react'
import { cn } from '~/lib/utils'

/**
 * Brand logo. Renders the Futhub mark (public/logo.png) next to the "Futhub"
 * wordmark, and gracefully falls back to an inline SVG mark if the file is ever
 * missing, so it never shows a broken image. `tone` flips colors for use on
 * dark surfaces: the mark is gray-on-transparent, so on dark we force it white.
 */

const SIZES = {
  sm: { svg: 'size-7', img: 'h-7', text: 'text-base' },
  md: { svg: 'size-8', img: 'h-8', text: 'text-lg' },
  lg: { svg: 'size-11', img: 'h-11', text: 'text-2xl' },
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
  const [failed, setFailed] = useState(false)
  const text = tone === 'light' ? 'text-chalk' : 'text-graphite'

  const wordmark = showText && (
    <span className={cn('font-semibold tracking-tight', SIZES[size].text, text)}>Futhub</span>
  )

  if (!failed) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <img
          src="/logo.png"
          alt="Futhub"
          onError={() => setFailed(true)}
          // Mark is gray on transparent: on dark surfaces force it to crisp white.
          className={cn(
            'w-auto shrink-0',
            SIZES[size].img,
            tone === 'light' && 'brightness-0 invert'
          )}
        />
        {wordmark}
      </span>
    )
  }

  // Fallback: self-contained SVG mark (a soft tile + ball, brand-neutral).
  const tile = tone === 'light' ? 'fill-chalk' : 'fill-graphite'
  const ball = tone === 'light' ? 'stroke-graphite' : 'stroke-lime-mark'
  const patch = tone === 'light' ? 'fill-graphite' : 'fill-lime-mark'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className={cn('shrink-0', SIZES[size].svg)} aria-hidden="true">
        <rect width="32" height="32" rx="9" className={tile} />
        <circle cx="16" cy="16" r="8" fill="none" strokeWidth="1.6" className={ball} />
        <path d="M16 13 L18.85 15.07 L17.76 18.43 L14.24 18.43 L13.15 15.07 Z" className={patch} />
      </svg>
      {wordmark}
    </span>
  )
}
