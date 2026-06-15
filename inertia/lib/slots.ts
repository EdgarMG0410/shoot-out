/**
 * Time-slot helpers for the booking picker. All times are 'HH:mm' (tolerant of
 * 'HH:mm:ss' coming from the DB). A space can only be booked within its
 * [open, close) window, on a discrete grid, never across an occupied block.
 */

export type Range = { startTime: string; endTime: string }

export const STEP_MIN = 30

export function toMin(t: string): number {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

export function toTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type Slot = { start: string; end: string; free: boolean }

/** Discrete unit slots within [open, close), each flagged free or occupied. */
export function buildSlots(
  open: string,
  close: string,
  occupied: Range[],
  step = STEP_MIN
): Slot[] {
  const o = toMin(open)
  const c = toMin(close)
  const slots: Slot[] = []
  for (let t = o; t + step <= c; t += step) {
    const start = toTime(t)
    const end = toTime(t + step)
    const free = !occupied.some((r) => t < toMin(r.endTime) && toMin(r.startTime) < t + step)
    slots.push({ start, end, free })
  }
  return slots
}

/** Free start times the user may pick. */
export function startOptions(slots: Slot[]): string[] {
  return slots.filter((s) => s.free).map((s) => s.start)
}

/**
 * Valid end times for a chosen start: extend contiguously over free unit slots
 * until the first occupied slot or the close time. Empty if start is invalid.
 */
export function endOptions(slots: Slot[], start: string): string[] {
  const i = slots.findIndex((s) => s.start === start)
  if (i < 0 || !slots[i].free) return []
  const ends: string[] = []
  for (let j = i; j < slots.length && slots[j].free; j++) ends.push(slots[j].end)
  return ends
}
