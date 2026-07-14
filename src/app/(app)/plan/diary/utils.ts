import type { MealType } from './types'

export function inferMealType(): MealType {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 16) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isSameOrFutureDay(dateISO: string): boolean {
  return dateISO >= todayISODate()
}

/** Combines a calendar date with the current wall-clock time so backfilled
 * entries land on the right day while keeping a sensible ordering timestamp. */
export function loggedAtForDate(dateISO: string): string {
  return `${dateISO}T${new Date().toISOString().slice(11)}`
}
