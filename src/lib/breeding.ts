// Breeding dates: due dates, heat cycles and dry-off planning.
import type { Database } from './database.types'
import { parseDate, toISODate } from './dates'

type Tables = Database['public']['Tables']
export type Heat = Tables['heats']['Row']
export type Breeding = Tables['breedings']['Row']
export type PregnancyCheck = Tables['pregnancy_checks']['Row']
export type Kidding = Tables['kiddings']['Row']
export type Kid = Tables['kids']['Row']
export type BreedingMethod = Database['public']['Enums']['breeding_method']

/** Goat gestation: about 150 days, normally 145–155. */
export const GESTATION_DAYS = 150
export const GESTATION_EARLY = 145
export const GESTATION_LATE = 155
/** A doe that doesn't settle comes back into heat about every 21 days (18–24). */
export const HEAT_CYCLE_DAYS = 21
export const HEAT_WINDOW = 3
/** Dry off about two months before kidding. */
export const DRY_OFF_DAYS_BEFORE = 60

export const METHOD_LABELS: Record<BreedingMethod, string> = { hand: 'Hand bred', pen: 'Pen bred', ai: 'AI' }

export function addDays(date: string, days: number): string {
  const d = parseDate(date)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000)
}

export interface DueWindow {
  earliest: string
  expected: string
  latest: string
}

/** When she should kid. A pen breeding could have happened any day the buck was in. */
export function dueWindow(b: Pick<Breeding, 'bred_on' | 'exposure_end'>): DueWindow {
  const lastDay = b.exposure_end ?? b.bred_on
  const middle = addDays(b.bred_on, Math.round(daysBetween(b.bred_on, lastDay) / 2))
  return {
    earliest: addDays(b.bred_on, GESTATION_EARLY),
    expected: addDays(middle, GESTATION_DAYS),
    latest: addDays(lastDay, GESTATION_LATE),
  }
}

export function dryOffBy(due: DueWindow): string {
  return addDays(due.expected, -DRY_OFF_DAYS_BEFORE)
}

export type BreedingStatus = 'bred' | 'confirmed' | 'open' | 'kidded' | 'overdue'

export const STATUS_LABELS: Record<BreedingStatus, string> = {
  bred: 'Bred',
  confirmed: 'Confirmed pregnant',
  open: 'Open',
  kidded: 'Kidded',
  overdue: 'Overdue',
}

export interface BreedingData {
  heats: Heat[]
  breedings: Breeding[]
  checks: PregnancyCheck[]
  kiddings: Kidding[]
}

/** The kidding that came from a breeding: linked directly, or hers at the right time. */
export function kiddingFor(b: Breeding, kiddings: Kidding[]): Kidding | undefined {
  const linked = kiddings.find((k) => k.breeding_id === b.id)
  if (linked) return linked
  const due = dueWindow(b)
  return kiddings.find(
    (k) => !k.breeding_id && k.doe_id === b.doe_id && k.kidded_on >= addDays(b.bred_on, 100) && k.kidded_on <= addDays(due.latest, 30),
  )
}

export function breedingStatus(b: Breeding, data: Pick<BreedingData, 'checks' | 'kiddings'>, today: string): BreedingStatus {
  if (kiddingFor(b, data.kiddings)) return 'kidded'
  const latestCheck = data.checks
    .filter((c) => c.breeding_id === b.id)
    .sort((x, y) => y.checked_on.localeCompare(x.checked_on))[0]
  if (latestCheck?.result === 'open') return 'open'
  if (today > dueWindow(b).latest) return 'overdue'
  return latestCheck?.result === 'pregnant' ? 'confirmed' : 'bred'
}

export interface DoeBreedingState {
  /** Her most recent breeding that may still be a pregnancy. */
  current?: { breeding: Breeding; status: BreedingStatus; due: DueWindow; dryOffBy: string; daysToDue: number }
  /** When to watch her for heat next. */
  nextHeat?: { date: string; reason: 'return' | 'cycle' }
  lastKidding?: Kidding
}

const ACTIVE: BreedingStatus[] = ['bred', 'confirmed', 'overdue']

export function doeBreedingState(doeId: string, data: BreedingData, today: string): DoeBreedingState {
  const breedings = data.breedings.filter((b) => b.doe_id === doeId).sort((a, b) => b.bred_on.localeCompare(a.bred_on))
  const lastKidding = data.kiddings.filter((k) => k.doe_id === doeId).sort((a, b) => b.kidded_on.localeCompare(a.kidded_on))[0]
  const state: DoeBreedingState = { lastKidding }

  const latest = breedings[0]
  if (latest) {
    const status = breedingStatus(latest, data, today)
    if (ACTIVE.includes(status)) {
      const due = dueWindow(latest)
      state.current = { breeding: latest, status, due, dryOffBy: dryOffBy(due), daysToDue: daysBetween(today, due.expected) }
      // Not confirmed yet: watch for her coming back into heat ~21 days after.
      if (status === 'bred') {
        const returnDate = addDays(latest.exposure_end ?? latest.bred_on, HEAT_CYCLE_DAYS)
        if (returnDate >= addDays(today, -HEAT_WINDOW)) state.nextHeat = { date: returnDate, reason: 'return' }
      }
      return state
    }
  }

  // Open: project her cycle forward from the last heat or breeding we know of.
  const lastHeat = data.heats.filter((h) => h.goat_id === doeId).map((h) => h.observed_on).sort().at(-1)
  const lastSign = [lastHeat, latest?.exposure_end ?? latest?.bred_on].filter((d): d is string => !!d).sort().at(-1)
  if (lastSign && (!lastKidding || lastSign > lastKidding.kidded_on)) {
    let next = addDays(lastSign, HEAT_CYCLE_DAYS)
    while (next < addDays(today, -HEAT_WINDOW)) next = addDays(next, HEAT_CYCLE_DAYS)
    state.nextHeat = { date: next, reason: 'cycle' }
  }
  return state
}
