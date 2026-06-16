import { useEffect, useState, type ReactNode } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { cn } from '~/lib/utils'
import { FlashToasts } from '~/components/ui'
import { Logo } from '~/components/logo'

type SharedProps = {
  user: { id: number; fullName: string | null; email: string; role: string } | null
}

const NAV = [
  { href: '/app', label: 'Explorar' },
  { href: '/app/bookings', label: 'Mis reservas' },
  { href: '/ligas', label: 'Ligas' },
]

export default function ClientLayout({
  title,
  subtitle,
  children,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
}) {
  const page = usePage<SharedProps>()
  const user = page.props.user
  const url = page.url
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [url])

  const isActive = (href: string) => url === href || (href !== '/app' && url.startsWith(href))
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-bone-1 text-graphite">
      <FlashToasts />

      <header className="sticky top-0 z-30 border-b border-bone-3 bg-bone-1/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-5 px-5 py-3 sm:px-8">
          <Link href="/app" className="shrink-0" aria-label="Shootout — inicio">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive(n.href) ? 'bg-graphite text-chalk' : 'text-slate-6 hover:bg-bone-2 hover:text-graphite'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-6 sm:block">{user?.fullName ?? user?.email}</span>
            {isAdmin && (
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite sm:inline-flex"
              >
                <LayoutDashboard className="size-3.5" /> Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => router.post('/auth/logout')}
              className="hidden items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite sm:inline-flex"
            >
              <LogOut className="size-3.5" /> Salir
            </button>

            {/* Burger (mobile only) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-bone-3 bg-chalk text-graphite transition-colors hover:bg-bone-2 sm:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 top-[57px] z-20 bg-graphite/20 sm:hidden" onClick={() => setMenuOpen(false)} />
            <nav className="page-enter relative z-30 border-t border-bone-3 bg-bone-1 px-5 py-3 sm:hidden">
              <div className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(n.href) ? 'bg-graphite text-chalk' : 'text-slate-6 hover:bg-bone-2 hover:text-graphite'
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite"
                  >
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-bone-3 pt-3">
                <span className="truncate text-sm text-slate-6">{user?.fullName ?? user?.email}</span>
                <button
                  type="button"
                  onClick={() => router.post('/auth/logout')}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite"
                >
                  <LogOut className="size-3.5" /> Salir
                </button>
              </div>
            </nav>
          </>
        )}
      </header>

      <main className="page-enter mx-auto max-w-5xl px-5 pb-16 pt-7 sm:px-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h1 className="title-page">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-slate-6">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
