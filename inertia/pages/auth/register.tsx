import { Head, Link, useForm } from '@inertiajs/react'
import { Button, Field, FlashToasts, Input, Select } from '~/components/ui'
import { Logo } from '~/components/logo'

export default function Register() {
  const form = useForm({ fullName: '', email: '', password: '', renterType: 'particular' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/auth/register')
  }

  return (
    <>
      <Head title="Crear cuenta" />
      <FlashToasts />
      <div className="flex min-h-screen items-center justify-center bg-graphite px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo tone="light" size="lg" />
            <p className="text-sm text-chalk/55">Crea tu cuenta para reservar</p>
          </div>

          <div className="rounded-2xl border border-graphite-3/40 bg-chalk p-6 shadow-xl">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Nombre completo" error={form.errors.fullName}>
                <Input
                  value={form.data.fullName}
                  onChange={(e) => form.setData('fullName', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
              </Field>
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
              <Field label="Contraseña" error={form.errors.password} hint="Mínimo 6 caracteres">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.data.password}
                  onChange={(e) => form.setData('password', e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field label="Tipo de rentador" error={form.errors.renterType}>
                <Select
                  value={form.data.renterType}
                  onChange={(e) => form.setData('renterType', e.target.value)}
                >
                  <option value="particular">Particular</option>
                  <option value="liga">Liga</option>
                  <option value="empresa">Empresa</option>
                  <option value="evento">Evento</option>
                  <option value="otro">Otro</option>
                </Select>
              </Field>
              <Button type="submit" variant="lime" className="mt-1 w-full" disabled={form.processing}>
                {form.processing ? 'Creando…' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-graphite hover:underline">
                Entra
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
