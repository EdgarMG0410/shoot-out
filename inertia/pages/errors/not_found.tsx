import { Head, Link } from '@inertiajs/react'
import { Logo } from '~/components/logo'

export default function NotFound() {
  return (
    <>
      <Head title="Página no encontrada" />
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-graphite px-6 text-center text-chalk">
        <Logo tone="light" size="lg" />
        <div>
          <p className="text-5xl font-bold tracking-tight">404</p>
          <p className="mt-3 text-lg font-medium">Esta página no existe</p>
          <p className="mt-1 text-sm text-chalk/60">
            Puede que el enlace esté roto o que la página se haya movido.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-lime-mark px-5 py-2.5 text-sm font-semibold text-graphite transition-colors hover:bg-lime-deep"
        >
          Volver al inicio
        </Link>
      </div>
    </>
  )
}
