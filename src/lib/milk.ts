import type { Database } from './database.types'
import { parseDate } from './dates'

type Tables = Database['public']['Tables']
export type MilkRow = Tables['milk_weights']['Row']
export type Lactation = Tables['lactations']['Row']
export type DayTotal = Database['public']['Views']['milk_day_totals']['Row']
export type WeightUnit = Database['public']['Enums']['weight_unit']

export const DAY_TOTAL = 0
export const AM = 1
export const PM = 2

const GRAMS_PER: Record<WeightUnit, number> = { lb: 453.59237, kg: 1000 }

export function toGrams(value: number, unit: WeightUnit): number {
  return Math.round(value * GRAMS_PER[unit])
}

export function fromGrams(grams: number, unit: WeightUnit): number {
  return grams / GRAMS_PER[unit]
}

/**
 * "3.4", "12.6" or "1,281 lb": no trailing zeros, and fewer decimals as the
 * number grows (two under 10, one under 100, none above) so totals stay
 * readable.
 */
export function formatWeight(grams: number | null | undefined, unit: WeightUnit, withUnit = false): string {
  if (grams === null || grams === undefined) return ''
  const value = fromGrams(grams, unit)
  const decimals = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2
  const text = value.toLocaleString(undefined, { maximumFractionDigits: decimals })
  return withUnit ? `${text} ${unit}` : text
}

/** A weight as typed into a box: always up to two decimals, so editing never loses precision. */
function formatInputWeight(grams: number, unit: WeightUnit): string {
  return String(Math.round(fromGrams(grams, unit) * 100) / 100)
}

export function milkingLabel(milking: number): string {
  if (milking === DAY_TOTAL) return 'Day total'
  if (milking === AM) return 'AM'
  if (milking === PM) return 'PM'
  return milking === 3 ? 'Extra' : `Extra ${milking - 2}`
}

export type ParsedWeight =
  | { kind: 'empty' }
  | { kind: 'invalid'; message: string }
  | { kind: 'ok'; grams: number; portions: number[] | null }

const MAX_GRAMS = 20000

/**
 * Reads what was typed into a weight box. "3.4" is one weight; "2.1 + 1.3"
 * is a milking weighed in parts, which are kept and added up.
 */
export function parseWeightInput(text: string, unit: WeightUnit): ParsedWeight {
  const trimmed = text.trim()
  if (!trimmed) return { kind: 'empty' }
  const parts = trimmed.split('+').map((p) => p.trim().replace(',', '.'))
  if (parts.some((p) => !/^\d*\.?\d+$/.test(p))) {
    return { kind: 'invalid', message: 'Use numbers like 3.4, or 2.1 + 1.3 for parts' }
  }
  if (parts.length > 20) return { kind: 'invalid', message: 'Too many parts' }
  // Round each part first so the stored parts always add up to the total exactly.
  const grams = parts.map((p) => toGrams(Number(p), unit))
  const total = grams.reduce((a, b) => a + b, 0)
  if (total > MAX_GRAMS) return { kind: 'invalid', message: 'That is more than a goat gives in one milking' }
  return { kind: 'ok', grams: total, portions: grams.length > 1 ? grams : null }
}

/** What to show in a weight box for a saved milking. */
export function formatWeightInput(row: Pick<MilkRow, 'weight_g' | 'portions_g'>, unit: WeightUnit): string {
  return row.portions_g?.length
    ? row.portions_g.map((g) => formatInputWeight(g, unit)).join(' + ')
    : formatInputWeight(row.weight_g, unit)
}

export interface RecordInput {
  goatId: string
  milkedOn: string
  milking: number
  grams: number
  portions: number[] | null
  note?: string | null
}

/**
 * The same rules as the record_milking database function, applied to a
 * doe's rows for one day. Used to show a save straight away, before the
 * server confirms it. Throws with the same message the server would.
 */
export function applyRecord(dayRows: MilkRow[], input: RecordInput, now = new Date().toISOString()): MilkRow[] {
  const base = {
    herd_id: dayRows[0]?.herd_id ?? '',
    goat_id: input.goatId,
    milked_on: input.milkedOn,
    recorded_by: null,
    recorded_at: now,
    portions_g: null,
    note: null,
  }
  let rows = [...dayRows]
  const dayTotal = rows.find((r) => r.milking === DAY_TOTAL)

  if (input.milking === DAY_TOTAL) {
    if (rows.some((r) => r.milking > 0)) throw new Error('This day already has separate milkings; edit those instead')
  } else if (dayTotal) {
    if (input.milking !== AM && input.milking !== PM) {
      throw new Error('Split the day total into AM and PM before adding an extra milking')
    }
    if (input.grams > dayTotal.weight_g) throw new Error('That is more than the day total')
    rows = rows.filter((r) => r !== dayTotal)
    rows.push({
      ...base,
      id: `pending-${input.goatId}-${input.milkedOn}-${input.milking === AM ? PM : AM}`,
      milking: input.milking === AM ? PM : AM,
      weight_g: dayTotal.weight_g - input.grams,
    })
  }

  const existing = rows.find((r) => r.milking === input.milking)
  const updated: MilkRow = {
    ...base,
    ...existing,
    id: existing?.id ?? `pending-${input.goatId}-${input.milkedOn}-${input.milking}`,
    milking: input.milking,
    weight_g: input.grams,
    portions_g: input.portions,
    note: input.note?.trim() || null,
    recorded_at: now,
  }
  return [...rows.filter((r) => r.milking !== input.milking), updated].sort((a, b) => a.milking - b.milking)
}

export interface DayStatus {
  totalG: number
  isDayTotal: boolean
  /** A regular milking with nothing recorded while the other one has a weight. */
  missing: 'AM' | 'PM' | null
}

export function dayStatus(rows: Pick<MilkRow, 'milking' | 'weight_g'>[]): DayStatus {
  const totalG = rows.reduce((sum, r) => sum + r.weight_g, 0)
  const isDayTotal = rows.some((r) => r.milking === DAY_TOTAL)
  const hasAm = rows.some((r) => r.milking === AM)
  const hasPm = rows.some((r) => r.milking === PM)
  let missing: DayStatus['missing'] = null
  if (!isDayTotal && hasAm !== hasPm) missing = hasAm ? 'PM' : 'AM'
  return { totalG, isDayTotal, missing }
}

/** The lactation covering a date, if the doe was in milk then. */
export function lactationOn(lactations: Lactation[], goatId: string, date: string): Lactation | undefined {
  return lactations.find(
    (l) => l.goat_id === goatId && l.freshened_on <= date && (!l.dried_off_on || l.dried_off_on >= date),
  )
}

export function nextLactationNumber(lactations: Lactation[], goatId: string): number {
  return Math.max(0, ...lactations.filter((l) => l.goat_id === goatId).map((l) => l.lactation_number)) + 1
}

/** Days in milk: 0 on the day she freshened. */
export function daysInMilk(freshenedOn: string, date: string): number {
  return Math.round((parseDate(date).getTime() - parseDate(freshenedOn).getTime()) / 86_400_000)
}

/** Which milking to show first: AM until noon, then PM. */
export function defaultMilking(now = new Date()): typeof AM | typeof PM {
  return now.getHours() < 12 ? AM : PM
}
