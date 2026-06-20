import { useEffect, useState, type ReactNode } from 'react'
import { Link, router, useForm, usePage } from '@inertiajs/react'
import { LayoutDashboard, LogOut, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button, Dialog, Field, FlashToasts, Input } from '~/components/ui'
import { Logo } from '~/components/logo'

type SharedUser = { id: number; fullName: string | null; email: string; role: string } | null

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/ligas', label: 'Torneos' },
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

/** Entry gate — choose to continue as a player or an admin. */
function EntryChoiceDialog({
  onJugador,
  onAdmin,
  onClose,
}: {
  onJugador: () => void
  onAdmin: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="¿Cómo quieres entrar?"
      description="Elige cómo vas a usar Futhub."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onJugador}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-bone-3 bg-chalk p-5 text-left transition-all duration-300 ease-(--ease-quart) hover:-translate-y-0.5 hover:border-lime-deep hover:shadow-md"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-lime-mark/20 text-lime-deep transition-colors group-hover:bg-lime-mark group-hover:text-graphite">
            <Users className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-graphite">Soy jugador</p>
            <p className="mt-0.5 text-sm text-slate-6">
              Reserva canchas y arma retas con tu correo.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onAdmin}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-bone-3 bg-chalk p-5 text-left transition-all duration-300 ease-(--ease-quart) hover:-translate-y-0.5 hover:border-graphite hover:shadow-md"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-bone-2 text-graphite transition-colors group-hover:bg-graphite group-hover:text-chalk">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-graphite">Soy admin</p>
            <p className="mt-0.5 text-sm text-slate-6">Administra canchas, torneos y reservas.</p>
          </div>
        </button>
      </div>
    </Dialog>
  )
}

/* Brand-icon SVGs (lucide ships no social marks). Update hrefs when links land. */
const SOCIALS: { name: string; href: string; path: string }[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/hubfutbolerodigital',
    path: 'M7.03 2C4.26 2 2 4.26 2 7.03v9.94C2 19.74 4.26 22 7.03 22h9.94C19.74 22 22 19.74 22 16.97V7.03C22 4.26 19.74 2 16.97 2H7.03Zm9.97 3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/hubfutbolero/',
    path: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@futhubdigital',
    path: 'M16.5 2c.36 2.2 1.6 3.78 3.8 4v2.62c-1.27.12-2.5-.2-3.6-.83v6.04a5.94 5.94 0 1 1-5.94-5.94c.3 0 .6.02.9.07v2.7a3.25 3.25 0 1 0 2.34 3.12V2h2.5Z',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@FutHubDigital',
    path: 'M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5ZM9.6 15.5v-7l6.5 3.5-6.5 3.5Z',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/523326014934',
    path: 'M12.04 2A9.93 9.93 0 0 0 2.1 11.94c0 1.75.46 3.46 1.34 4.97L2 22l5.23-1.37a9.9 9.9 0 0 0 4.8 1.22h.01a9.94 9.94 0 0 0 9.93-9.93A9.93 9.93 0 0 0 12.04 2Zm5.8 14.04c-.25.7-1.44 1.33-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37l.57.01c.18 0 .43-.07.67.51.25.6.84 2.05.91 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5l-.45.52c-.15.15-.31.32-.13.62.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.35.07.12.07.72-.18 1.42Z',
  },
]

function Footer() {
  return (
    <footer className="mt-12 bg-graphite text-chalk">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.6fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-chalk/60">
            El marketplace del fútbol amateur en Guadalajara. Reserva canchas, arma retas y
            administra torneos.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-chalk/10 text-chalk ring-1 ring-chalk/15 transition-colors duration-300 ease-(--ease-quart) hover:bg-lime-mark hover:text-graphite"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-chalk/40">Explorar</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-chalk/70 transition-colors hover:text-chalk">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-chalk/40">Contacto</p>
          <ul className="mt-4 space-y-2.5 text-sm text-chalk/70">
            <li>
              <a
                href="mailto:hola@futhub.mx"
                className="flex items-center gap-2 transition-colors hover:text-chalk"
              >
                <Mail className="size-4 shrink-0" /> hola@futhub.mx
              </a>
            </li>
            <li>
              <a
                href="tel:+523311112222"
                className="flex items-center gap-2 transition-colors hover:text-chalk"
              >
                <Phone className="size-4 shrink-0" /> 33 1111 2222
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" /> Guadalajara, Jalisco
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-chalk/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-chalk/45 sm:flex-row sm:px-8">
          <p>© 2026 Futhub. Todos los derechos reservados.</p>
          <p>Hecho en Guadalajara para la comunidad futbolera.</p>
        </div>
      </div>
    </footer>
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
  const [entry, setEntry] = useState<'choice' | 'access' | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => (href === '/' ? url === '/' : url.startsWith(href))

  return (
    <div className="min-h-screen bg-bone-1 text-graphite">
      <FlashToasts />

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 px-4 transition-all duration-300 ease-(--ease-quart)',
          scrolled ? 'pt-2' : 'pt-4'
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-center gap-3 rounded-full border backdrop-blur-md transition-all duration-300 ease-(--ease-quart)',
            scrolled
              ? 'max-w-3xl border-bone-3 bg-bone-1/85 px-2.5 py-1.5 shadow-lg shadow-graphite/5'
              : 'max-w-5xl border-transparent bg-bone-1/70 px-3.5 py-2'
          )}
        >
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" aria-label="Futhub — inicio" className="inline-flex items-center">
              <Logo size="sm" />
            </Link>
          </div>

          <nav className="hidden shrink-0 items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive(n.href)
                    ? 'bg-graphite text-chalk'
                    : 'text-slate-6 hover:bg-bone-2 hover:text-graphite'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/dashboard' : '/app'}
                  className="inline-flex items-center gap-1.5 rounded-full border border-bone-3 bg-chalk px-3.5 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite"
                >
                  <LayoutDashboard className="size-3.5" />{' '}
                  {user.role === 'admin' ? 'Dashboard' : 'Mi cuenta'}
                </Link>
                <button
                  type="button"
                  onClick={() => router.post('/auth/logout')}
                  className="hidden items-center gap-1.5 rounded-full border border-bone-3 bg-chalk px-3 py-1.5 text-sm text-slate-6 transition-colors hover:bg-bone-2 hover:text-graphite sm:inline-flex"
                  aria-label="Salir"
                >
                  <LogOut className="size-3.5" /> Salir
                </button>
              </>
            ) : (
              <Button
                variant="lime"
                size="sm"
                className="rounded-full"
                onClick={() => setEntry('choice')}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {bleed ? (
        <main className="page-enter">{children}</main>
      ) : (
        <main className="page-enter mx-auto max-w-5xl px-5 pb-16 pt-24 sm:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="title-page">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-slate-6">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      )}

      <Footer />

      {entry === 'choice' && (
        <EntryChoiceDialog
          onJugador={() => setEntry('access')}
          onAdmin={() => {
            setEntry(null)
            router.visit('/auth/login')
          }}
          onClose={() => setEntry(null)}
        />
      )}
      {entry === 'access' && <AccessDialog onClose={() => setEntry(null)} />}
    </div>
  )
}
