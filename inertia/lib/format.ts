export function money(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount || 0)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value || 0)
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(d)
}

export function timeRange(start: string, end: string): string {
  return `${(start ?? '').slice(0, 5)} – ${(end ?? '').slice(0, 5)}`
}
