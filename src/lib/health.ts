// Routine care due dates and milk withdrawal.
import type { Database } from './database.types'
import { addDays, daysBetween } from './breeding'

type Tables = Database['public']['Tables']
export type CareType = Tables['care_types']['Row']
export type CareEvent = Tables['care_events']['Row']
export type Treatment = Tables['treatments']['Row']
export type HealthObservation = Tables['health_observations']['Row']
export type DiseaseTest = Tables['disease_tests']['Row']
export type TreatmentRoute = Database['public']['Enums']['treatment_route']

/** Care coming up within this many days counts as "due". */
export const DUE_SOON_DAYS = 7

export const ROUTE_LABELS: Record<TreatmentRoute, string> = {
  oral: 'Oral',
  subq: 'Under the skin (SubQ)',
  im: 'In the muscle (IM)',
  iv: 'In the vein (IV)',
  topical: 'On the skin',
  intramammary: 'In the udder',
  other: 'Other',
}

export type CareState = 'overdue' | 'due' | 'ok' | 'never' | 'as-needed'

export interface CareStatus {
  type: CareType
  last?: CareEvent
  nextDue?: string
  /** Negative when overdue. */
  daysUntilDue?: number
  state: CareState
}

export function careStatus(goatId: string, type: CareType, events: CareEvent[], today: string): CareStatus {
  const last = events
    .filter((e) => e.goat_id === goatId && e.care_type_id === type.id)
    .reduce<CareEvent | undefined>((best, e) => (!best || e.done_on > best.done_on ? e : best), undefined)
  if (!type.interval_days) return { type, last, state: 'as-needed' }
  if (!last) return { type, state: 'never' }
  const nextDue = addDays(last.done_on, type.interval_days)
  const daysUntilDue = daysBetween(today, nextDue)
  const state: CareState = daysUntilDue < 0 ? 'overdue' : daysUntilDue <= DUE_SOON_DAYS ? 'due' : 'ok'
  return { type, last, nextDue, daysUntilDue, state }
}

/** Last day milk must be withheld: the last dose plus the withdrawal days. Null if there's no withdrawal. */
export function withholdThrough(t: Pick<Treatment, 'started_on' | 'ended_on' | 'milk_withdrawal_days'>): string | null {
  if (!t.milk_withdrawal_days) return null
  return addDays(t.ended_on ?? t.started_on, t.milk_withdrawal_days)
}

/**
 * Whether a doe's milk must be withheld on a date, and until when. Milk is
 * withheld from the first dose through the end of the withdrawal.
 */
export function withdrawalOn(goatId: string, treatments: Treatment[], date: string): { through: string; treatments: Treatment[] } | null {
  const active = treatments.filter((t) => {
    if (t.goat_id !== goatId) return false
    const through = withholdThrough(t)
    return !!through && t.started_on <= date && date <= through
  })
  if (!active.length) return null
  const through = active.map((t) => withholdThrough(t)!).sort().at(-1)!
  return { through, treatments: active }
}

export interface LatestMeasures {
  famacha?: { value: number; on: string }
  bodyCondition?: { value: number; on: string }
  weightG?: { value: number; on: string }
}

export function latestMeasures(goatId: string, observations: HealthObservation[]): LatestMeasures {
  const mine = observations.filter((o) => o.goat_id === goatId).sort((a, b) => b.observed_on.localeCompare(a.observed_on))
  const first = <K extends 'famacha' | 'body_condition' | 'weight_g'>(key: K) => {
    const o = mine.find((x) => x[key] !== null)
    return o ? { value: Number(o[key]), on: o.observed_on } : undefined
  }
  return { famacha: first('famacha'), bodyCondition: first('body_condition'), weightG: first('weight_g') }
}

/** FAMACHA 4–5 means anemic enough to deworm; 3 is borderline. */
export function famachaConcern(score: number): 'ok' | 'watch' | 'treat' {
  return score >= 4 ? 'treat' : score === 3 ? 'watch' : 'ok'
}
