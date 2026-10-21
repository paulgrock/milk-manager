/** Dates are stored as 'YYYY-MM-DD'. Parse them as local dates so they never shift a day across time zones. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return parseDate(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Whole calendar months and leftover days from `from` to `to`. */
export function monthsAndDaysBetween(from: string, to: string): { months: number; days: number } {
  const a = parseDate(from)
  const b = parseDate(to)
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  if (b.getDate() < a.getDate()) months -= 1
  const anchor = new Date(a.getFullYear(), a.getMonth() + months, a.getDate())
  const days = Math.round((b.getTime() - anchor.getTime()) / 86_400_000)
  return { months, days }
}

/** "today", "in 3 days", "5 days ago". */
export function relativeDays(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  return days > 0 ? `in ${days} days` : `${-days} days ago`
}

/** 'YYYY-MM-DD' shifted by whole months (clamped to the month's last day). */
export function addMonths(iso: string, months: number): string {
  const d = parseDate(iso)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return toISODate(d)
}
