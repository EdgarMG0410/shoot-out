import { Head, Link } from '@inertiajs/react'
import { Logo } from '~/components/logo'

export default function ServerError({ error }: { error?: { message?: string } }) {
  return (
    <>
      <Head title="Algo salió mal" />
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-graphite px-6 text-center text-chalk">
        <Logo tone="light" size="lg" />
        <div className="max-w-md">
          <p className="text-5xl font-bold tracking-tight">500</p>
          <p className="mt-3 text-lg font-medium">Algo salió mal</p>
          <p className="mt-1 text-sm text-chalk/60">
            Tuvimos un problema procesando tu solicitud. Intenta de nuevo en un momento.
          </p>
          {error?.message && (
            <p className="mt-4 rounded-lg border border-chalk/15 bg-chalk/5 px-3 py-2 text-left text-xs text-chalk/70">
              {error.message}
            </p>
          )}
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
