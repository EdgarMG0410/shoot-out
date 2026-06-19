import { Head, Link, router } from '@inertiajs/react'
import ClientLayout from '~/layouts/client'
import { Button, Card, EmptyState, StatusPill } from '~/components/ui'
import { formatDate, money, timeRange } from '~/lib/format'

type BookingRow = {
  id: number
  space: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  paid: boolean
}

export default function MyBookings({ bookings }: { bookings: BookingRow[] }) {
  const pay = (id: number) => router.post(`/app/bookings/${id}/pay`, {}, { preserveScroll: true })

  return (
    <>
      <Head title="Mis reservas" />
      {bookings.length === 0 ? (
        <EmptyState
          title="Aún no tienes reservas"
          hint="Explora las canchas y aparta tu horario."
          action={
            <Link href="/app">
              <Button variant="lime">Explorar canchas</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-medium text-graphite">{b.space}</p>
                <p className="text-sm text-slate-6">
                  {formatDate(b.date)} ·{' '}
                  <span className="tabular-nums">{timeRange(b.startTime, b.endTime)}</span>
                </p>
              </div>
              <StatusPill status={b.status} />
              <p className="font-semibold tabular-nums text-graphite sm:w-24 sm:text-right">
                {money(b.totalPrice)}
              </p>
              {!b.paid && b.status !== 'cancelled' && (
                <Button variant="lime" size="sm" onClick={() => pay(b.id)}>
                  Pagar
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

MyBookings.layout = (page: React.ReactNode) => (
  <ClientLayout title="Mis reservas" subtitle="Tus apartados y su estado">
    {page}
  </ClientLayout>
)
