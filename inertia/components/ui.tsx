import { forwardRef, useEffect, useState, type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { ImageOff, X } from 'lucide-react'
import { cn } from '~/lib/utils'

/* ----------------------------- FlashToasts ------------------------------ */

export function FlashToasts() {
  const flash = (usePage().props as { flash?: { success: string | null; error: string | null } })
    .flash
  const [items, setItems] = useState<{ tone: 'success' | 'error'; text: string }[]>([])

  useEffect(() => {
    const next: { tone: 'success' | 'error'; text: string }[] = []
    if (flash?.success) next.push({ tone: 'success', text: flash.success })
    if (flash?.error) next.push({ tone: 'error', text: flash.error })
    if (!next.length) return
    setItems(next)
    const t = setTimeout(() => setItems([]), 3800)
    return () => clearTimeout(t)
  }, [flash?.success, flash?.error])

  if (!items.length) return null
  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'page-enter rounded-lg border px-4 py-2 text-sm font-medium shadow-sm',
            item.tone === 'success'
              ? 'border-emerald-mark/30 bg-emerald-mark/10 text-emerald-mark'
              : 'border-rose-mark/30 bg-rose-mark/10 text-rose-mark'
          )}
        >
          {item.text}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------- Button -------------------------------- */

type ButtonVariant = 'primary' | 'lime' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon'

const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-[background-color,transform,border-color,color] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-[0.8rem]',
  md: 'h-10 px-5 text-sm',
  icon: 'size-9',
}

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-graphite text-chalk hover:bg-graphite-2',
  lime: 'bg-lime-mark text-graphite font-semibold hover:bg-lime-deep',
  secondary: 'bg-chalk text-graphite border border-bone-3 hover:bg-bone-2',
  ghost: 'text-slate-6 hover:text-graphite hover:bg-bone-2',
  danger: 'bg-rose-mark/10 text-rose-mark hover:bg-rose-mark/20',
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(function Button({ className, variant = 'primary', size = 'md', ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(BTN_BASE, BTN_SIZES[size], BTN_VARIANTS[variant], className)}
      {...props}
    />
  )
})

/* -------------------------------- Photo -------------------------------- */

/**
 * Responsive cover image with a graceful fallback when the URL is missing or
 * fails to load (broken link, offline). Wrap in a sized, overflow-hidden box.
 */
export function Photo({
  src,
  alt,
  className,
  overlay,
}: {
  src?: string | null
  alt: string
  className?: string
  overlay?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  const show = src && !failed
  return (
    <div className={cn('relative isolate overflow-hidden bg-bone-2', className)}>
      {show ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-bone-2 to-bone-3 text-slate-6/50">
          <ImageOff className="size-7" />
        </div>
      )}
      {overlay}
    </div>
  )
}

/* -------------------------------- Card --------------------------------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl border border-bone-3 bg-chalk', className)} {...props} />
}

/* ------------------------------ StatusPill ------------------------------ */

const TONE: Record<string, string> = {
  pending: 'bg-amber-mark/15 text-amber-mark',
  confirmed: 'bg-emerald-mark/15 text-emerald-mark',
  cancelled: 'bg-rose-mark/15 text-rose-mark',
  active: 'bg-emerald-mark/15 text-emerald-mark',
  blocked: 'bg-rose-mark/15 text-rose-mark',
  inactive: 'bg-bone-2 text-slate-6',
  scheduled: 'bg-emerald-mark/15 text-emerald-mark',
  fake_paid: 'bg-emerald-mark/15 text-emerald-mark',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  active: 'Activa',
  blocked: 'Bloqueada',
  inactive: 'Inactiva',
  scheduled: 'Programado',
  fake_paid: 'Pagado',
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold capitalize',
        TONE[status] ?? 'bg-bone-2 text-slate-6',
        className
      )}
    >
      {STATUS_LABEL[status] ?? status.replace('_', ' ')}
    </span>
  )
}

/* ------------------------------ Form fields ----------------------------- */

const FIELD_CONTROL =
  'h-10 w-full rounded-xl border border-bone-3 bg-bone-1 px-3.5 text-sm text-graphite placeholder:text-slate-6/60 transition-colors focus-visible:border-lime-deep'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(FIELD_CONTROL, className)} {...props} />
  }
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(FIELD_CONTROL, 'pr-8', className)} {...props}>
        {children}
      </select>
    )
  }
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(FIELD_CONTROL, 'h-auto min-h-[72px] py-2.5', className)}
      {...props}
    />
  )
})

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-6">{label}</span>
      {children}
      {hint && !error && <span className="text-[11px] text-slate-6/80">{hint}</span>}
      {error && <span className="text-[11px] font-medium text-rose-mark">{error}</span>}
    </label>
  )
}

/* -------------------------------- Dialog -------------------------------- */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-graphite/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-bone-3 bg-chalk p-6 shadow-[0_24px_60px_-15px_oklch(20%_0.01_250/0.35)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-graphite">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-6">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------ EmptyState ------------------------------ */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-bone-3 bg-chalk px-6 py-14 text-center">
      <p className="text-sm font-medium text-graphite">{title}</p>
      {hint && <p className="max-w-sm text-sm text-slate-6">{hint}</p>}
      {action}
    </div>
  )
}
