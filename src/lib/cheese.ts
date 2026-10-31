// Cheese makes: ready dates, status and monthly totals.
import type { Database } from './database.types'
import { addMonths } from './dates'

type Tables = Database['public']['Tables']
export type CheeseType = Tables['cheese_types']['Row']
export type CheeseMake = Tables['cheese_makes']['Row']

/** Goat milk weighs about this much per US gallon. */
export const LB_PER_GALLON = 8.6

/** The made date plus the type's aging time; fresh cheese (0 months) is ready the same day. */
export function readyDate(madeOn: string, agingMonths: number): string {
  return agingMonths > 0 ? addMonths(madeOn, agingMonths) : madeOn
}

export type MakeStatus = 'aging' | 'ready' | 'finished'

export function makeStatus(make: Pick<CheeseMake, 'ready_on' | 'finished_on'>, today: string): MakeStatus {
  if (make.finished_on) return 'finished'
  return make.ready_on <= today ? 'ready' : 'aging'
}

export const STATUS_LABELS: Record<MakeStatus, string> = { aging: 'Aging', ready: 'Ready', finished: 'Finished' }

export interface MonthTotal {
  /** 'YYYY-MM' */
  month: string
  makes: number
  gallons: number
  /** Rough pounds of milk, from the gallons. */
  milkLb: number
}

/** Makes per month (by made date), newest month first. */
export function monthlyTotals(makes: Pick<CheeseMake, 'made_on' | 'milk_gallons'>[]): MonthTotal[] {
  const months = new Map<string, MonthTotal>()
  for (const m of makes) {
    const month = m.made_on.slice(0, 7)
    const t = months.get(month) ?? { month, makes: 0, gallons: 0, milkLb: 0 }
    t.makes += 1
    t.gallons += Number(m.milk_gallons ?? 0)
    months.set(month, t)
  }
  for (const t of months.values()) t.milkLb = t.gallons * LB_PER_GALLON
  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month))
}

/** Reads a gallons box: blank is none; "2.5" or "2,5". */
export function parseGallons(text: string): { ok: true; value: number | null } | { ok: false; message: string } {
  const t = text.trim().replace(',', '.')
  if (!t) return { ok: true, value: null }
  const value = Number(t)
  if (!/^\d*\.?\d+$/.test(t) || !(value > 0) || value > 1000) return { ok: false, message: 'Gallons must be a number above 0' }
  return { ok: true, value: Math.round(value * 100) / 100 }
}
