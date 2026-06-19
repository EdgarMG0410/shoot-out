import { useState, type ReactNode } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import {
  Building2,
  CalendarCheck2,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Menu,
  PartyPopper,
  Trophy,
  X,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { Logo } from '~/components/logo'
import { FlashToasts } from '~/components/ui'

type SharedUser = { id: number; fullName: string | null; email: string; role: string } | null
type SharedProps = {
  user: SharedUser
  flash: { success: string | null; error: string | null }
}

const NAV = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/locations', label: 'Locaciones', icon: Building2 },
  { href: '/dashboard/spaces', label: 'Espacios', icon: LandPlot },
  { href: '/dashboard/leagues', label: 'Ligas', icon: Trophy },
  { href: '/dashboard/events', label: 'Eventos', icon: PartyPopper },
  { href: '/dashboard/bookings', label: 'Reservas', icon: CalendarCheck2 },
]

function initials(user: SharedUser): string {
  if (!user) return '??'
  const source = user.fullName ?? user.email
  const [a, b] = source.split(/[\s@.]+/)
  return `${a?.[0] ?? ''}${b?.[0] ?? ''}`.toUpperCase() || source.slice(0, 2).toUpperCase()
}

function NavLinks({ url, onNavigate }: { url: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = url === item.href || (item.href !== '/dashboard' && url.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-graphite-2 text-chalk'
                : 'text-chalk/55 hover:bg-graphite-2/60 hover:text-chalk'
            )}
          >
            <span
              className={cn(
                'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-lime-mark transition-opacity',
                active ? 'opacity-100' : 'opacity-0'
              )}
            />
            <Icon className="size-[18px] shrink-0" strokeWidth={1.85} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({ user, url, onNavigate }: { user: SharedUser; url: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center px-2 pt-2">
        <Logo tone="light" />
      </Link>

      <NavLinks url={url} onNavigate={onNavigate} />

      <div className="rounded-2xl bg-graphite-2/60 p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-lime-mark text-sm font-bold text-graphite">
            {initials(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-chalk">{user?.fullName ?? 'Admin'}</p>
            <p className="truncate text-xs text-chalk/50">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.post('/auth/logout')}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-chalk/10 px-3 py-2 text-xs font-medium text-chalk/70 transition-colors hover:bg-graphite-3/50 hover:text-chalk"
        >
          <LogOut className="size-3.5" /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  const page = usePage<SharedProps>()
  const { user } = page.props
  const url = page.url
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bone-1 text-graphite">
      <FlashToasts />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-graphite lg:block">
        <SidebarBody user={user} url={url} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-graphite/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[248px] bg-graphite">
            <SidebarBody user={user} url={url} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-bone-3 bg-bone-1/85 backdrop-blur">
          <div className="flex items-center gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl border border-bone-3 bg-chalk text-graphite lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="title-page truncate text-graphite">{title}</h1>
              {subtitle && <p className="mt-0.5 truncate text-sm text-slate-6">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="page-enter flex-1 px-5 pb-16 pt-6 sm:px-8 lg:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  )
}

export { X }
