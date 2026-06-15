import { useState } from 'react'
import { cn } from '~/lib/utils'

/**
 * Brand logo. Renders the Shootout lockup (public/shootout.png) and gracefully
 * falls back to an inline SVG mark + wordmark if the file is ever missing, so
 * it never shows a broken image. `tone` only affects the fallback colors.
 */

const SIZES = {
  sm: { svg: 'size-7', img: 'h-6', text: 'text-base' },
  md: { svg: 'size-8', img: 'h-8', text: 'text-lg' },
  lg: { svg: 'size-11', img: 'h-12', text: 'text-2xl' },
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

  if (!failed) {
    return (
      <img
        src="/shootout.png"
        alt="Shootout"
        onError={() => setFailed(true)}
        // Logo art is black: on dark surfaces force it to crisp white.
        className={cn('w-auto', SIZES[size].img, tone === 'light' && 'brightness-0 invert', className)}
      />
    )
  }

  // Fallback: self-contained SVG mark.
  const tile = tone === 'light' ? 'fill-chalk' : 'fill-graphite'
  const ball = tone === 'light' ? 'stroke-graphite' : 'stroke-lime-mark'
  const patch = tone === 'light' ? 'fill-graphite' : 'fill-lime-mark'
  const text = tone === 'light' ? 'text-chalk' : 'text-graphite'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className={cn('shrink-0', SIZES[size].svg)} aria-hidden="true">
        <rect width="32" height="32" rx="9" className={tile} />
        <circle cx="16" cy="16" r="8" fill="none" strokeWidth="1.6" className={ball} />
        <path d="M16 13 L18.85 15.07 L17.76 18.43 L14.24 18.43 L13.15 15.07 Z" className={patch} />
      </svg>
      {showText && (
        <span className={cn('font-semibold tracking-tight', SIZES[size].text, text)}>Shootout</span>
      )}
    </span>
  )
}
