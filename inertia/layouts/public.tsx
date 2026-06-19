import { useState, type ReactNode } from 'react'
import { Link, router, useForm, usePage } from '@inertiajs/react'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button, Dialog, Field, FlashToasts, Input } from '~/components/ui'
import { Logo } from '~/components/logo'

type SharedUser = { id: number; fullName: string | null; email: string; role: string } | null

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/ligas', label: 'Ligas' },
  { href: '/comunidad', label: 'Comunidad' },
]

/** Passwordless access — renter enters just their email. */
export function AccessDialog({ onClose }: { onClose: () => void }) {
  const form = useForm({ email: '', fullName: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.transform((d) => ({ email: d.email, fullName: d.fullName || null }))
    form.post('/acceso')
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title="Entrar para reservar"
      description="Solo necesitas tu correo. Lo usamos para identificar tus reservas."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Correo" error={form.errors.email}>
          <Input
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            placeholder="tu@correo.com"
            required
            autoFocus
          />
        </Field>
        <Field label="Nombre" hint="Opcional" error={form.errors.fullName}>
          <Input
            value={form.data.fullName}
            onChange={(e) => form.setData('fullName', e.target.value)}
            placeholder="Tu nombre"
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="lime" disabled={form.processing}>
            Continuar
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function PublicLayout({
  title,
  subtitle,
  bleed = false,
  children,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  /** Full-width pages (e.g. the landing) manage their own section widths. */
  bleed?: boolean
  children: ReactNode
}) {
  const page = usePage<{ user: SharedUser }>()
  const user = page.props.user
  const url = page.url
  const [access, setAccess] = useState(false)

  const isActive = (href: string) => (href === '/' ? url === '/' : url.startsWith(href))

  return (
    <div className="min-h-screen bg-bone-1 text-graphite">
      <FlashToasts />

      <header className="sticky top-0 z-30 border-b border-bone-3 bg-bone-1/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3 sm:px-8">
          <Link href="/" className="shrink-0" aria-label="Futhub — inicio">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive(n.href)
                    ? 'bg-graphite text-chalk'
                    : 'text-slate-6 hover:bg-bone-2 hover:text-graphite'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/dashboard' : '/app'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite"
                >
                  <LayoutDashboard className="size-3.5" />{' '}
                  {user.role === 'admin' ? 'Dashboard' : 'Mi cuenta'}
                </Link>
                <button
                  type="button"
                  onClick={() => router.post('/auth/logout')}
                  className="hidden items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite sm:inline-flex"
                  aria-label="Salir"
                >
                  <LogOut className="size-3.5" /> Salir
                </button>
              </>
            ) : (
              <Button variant="lime" size="sm" onClick={() => setAccess(true)}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {bleed ? (
        <main className="page-enter">{children}</main>
      ) : (
        <main className="page-enter mx-auto max-w-5xl px-5 pb-16 pt-7 sm:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="title-page">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-slate-6">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      )}

      {access && <AccessDialog onClose={() => setAccess(false)} />}
    </div>
  )
}
