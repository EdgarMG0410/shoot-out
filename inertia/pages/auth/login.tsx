import { Head, Link, useForm } from '@inertiajs/react'
import { Button, Field, FlashToasts, Input } from '~/components/ui'
import { Logo } from '~/components/logo'

export default function Login() {
  const form = useForm({ email: '', password: '' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/auth/login')
  }

  return (
    <>
      <Head title="Entrar" />
      <FlashToasts />
      <div className="flex min-h-screen items-center justify-center bg-graphite px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo tone="light" size="lg" />
            <p className="text-sm text-chalk/55">Reserva tu cancha</p>
          </div>

          <div className="rounded-2xl border border-graphite-3/40 bg-chalk p-6 shadow-xl">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Correo" error={form.errors.email}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.data.email}
                  onChange={(e) => form.setData('email', e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </Field>
              <Field label="Contraseña" error={form.errors.password}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={form.data.password}
                  onChange={(e) => form.setData('password', e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Button type="submit" variant="lime" className="mt-1 w-full" disabled={form.processing}>
                {form.processing ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-6">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="font-medium text-graphite hover:underline">
                Crea una
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
