// Everything with a date, gathered from breeding, health and milk records.
// Nothing here is stored: upcoming events are worked out from the records,
// so recording a kidding or a hoof trim updates the calendar by itself.

import { HEAT_CYCLE_DAYS, addDays, breedingStatus, doeBreedingState, dueWindow, type BreedingData } from './breeding'
import { careStatus, withholdThrough, type CareEvent, type CareType, type Treatment } from './health'
import { STANDARD_DAYS } from './lactation'
import { lactationOn, type Lactation } from './milk'
import { CURRENT_STATUSES, goatName, type Goat } from './goats'
import type { MilkTest } from './dhia'
import { formatDate } from './dates'

export type EventKind =
  | 'kidding-due'
  | 'dry-off'
  | 'heat'
  | 'preg-check'
  | 'care-due'
  | 'withdrawal-ends'
  | 'dim-305'
  | 'kidded'
  | 'bred'
  | 'care-done'
  | 'treated'
  | 'test-day'

export type EventGroup = 'breeding' | 'health' | 'milk'

export interface CalendarEvent {
  date: string
  kind: EventKind
  group: EventGroup
  goatId?: string
  title: string
  detail?: string
  /** Already happened (a record), as opposed to coming up. */
  done: boolean
  /** Coming-up event whose date has passed without being dealt with. */
  overdue?: boolean
  href: string
}

export const GROUP_LABELS: Record<EventGroup, string> = { breeding: 'Breeding', health: 'Health', milk: 'Milk' }

/** A blood test is reliable about 30 days after breeding. */
export const PREG_CHECK_AFTER_DAYS = 30
export const PREG_CHECK_UNTIL_DAYS = 60

export interface CalendarInput {
  goats: Goat[]
  breeding: BreedingData
  careTypes: CareType[]
  careEvents: CareEvent[]
  treatments: Treatment[]
  lactations: Lactation[]
  tests: MilkTest[]
  today: string
}

/** Events between `from` and `to` (inclusive). Overdue items are kept on `today` so they aren't missed. */
export function buildEvents(input: CalendarInput, from: string, to: string): CalendarEvent[] {
  const { today } = input
  const byId = new Map(input.goats.map((g) => [g.id, g]))
  const pathOf = (id: string) => `/goats/${byId.get(id)?.slug ?? id}`
  const name = (id: string) => {
    const g = byId.get(id)
    return g ? g.barn_name || goatName(g) : 'Unknown goat'
  }
  const herd = input.goats.filter((g) => CURRENT_STATUSES.includes(g.status))
  const events: CalendarEvent[] = []
  const add = (e: CalendarEvent) => {
    // Something overdue shows on today, the day it still needs doing.
    const date = e.overdue && e.date < today ? today : e.date
    if (date >= from && date <= to) events.push({ ...e, date })
  }

  // --- Coming up ----------------------------------------------------------------

  for (const goat of herd.filter((g) => g.sex === 'doe')) {
    const state = doeBreedingState(goat.id, input.breeding, today)
    const goatHref = pathOf(goat.id)
    if (state.current) {
      const { due, breeding, status } = state.current
      add({
        date: due.expected,
        kind: 'kidding-due',
        group: 'breeding',
        goatId: goat.id,
        title: `${name(goat.id)} due to kid`,
        detail: `Could be ${formatDate(due.earliest)} – ${formatDate(due.latest)}`,
        done: false,
        overdue: status === 'overdue',
        href: goatHref,
      })
      if (lactationOn(input.lactations, goat.id, today)) {
        add({
          date: state.current.dryOffBy,
          kind: 'dry-off',
          group: 'milk',
          goatId: goat.id,
          title: `Dry off ${name(goat.id)}`,
          detail: 'About 60 days before she kids',
          done: false,
          overdue: state.current.dryOffBy < today,
          href: goatHref,
        })
      }
      // Ask for a check from day 30; after two months it's obvious either way.
      if (status === 'bred' && today <= addDays(breeding.exposure_end ?? breeding.bred_on, PREG_CHECK_UNTIL_DAYS)) {
        add({
          date: addDays(breeding.exposure_end ?? breeding.bred_on, PREG_CHECK_AFTER_DAYS),
          kind: 'preg-check',
          group: 'breeding',
          goatId: goat.id,
          title: `Pregnancy check ${name(goat.id)}`,
          detail: '30+ days after breeding, for a blood test',
          done: false,
          overdue: addDays(breeding.exposure_end ?? breeding.bred_on, PREG_CHECK_AFTER_DAYS) < today,
          href: goatHref,
        })
      }
    }
    if (state.nextHeat) {
      // Her cycle repeats; show every expected heat in the range.
      const repeats = state.nextHeat.reason === 'cycle'
      for (let date = state.nextHeat.date; date <= to; date = addDays(date, HEAT_CYCLE_DAYS)) {
        add({
          date,
          kind: 'heat',
          group: 'breeding',
          goatId: goat.id,
          title: state.nextHeat.reason === 'return' ? `${name(goat.id)}: back in heat?` : `${name(goat.id)} heat expected`,
          detail: state.nextHeat.reason === 'return' ? 'If she comes back into heat, she didn\'t settle' : undefined,
          done: false,
          href: goatHref,
        })
        if (!repeats) break
      }
    }
    const lactation = lactationOn(input.lactations, goat.id, today)
    if (lactation && !lactation.dried_off_on) {
      add({
        date: addDays(lactation.freshened_on, STANDARD_DAYS),
        kind: 'dim-305',
        group: 'milk',
        goatId: goat.id,
        title: `${name(goat.id)} reaches 305 days in milk`,
        detail: 'End of the DHIR star period',
        done: false,
        href: goatHref,
      })
    }
  }

  for (const goat of herd) {
    for (const type of input.careTypes.filter((t) => !t.archived && t.interval_days)) {
      const s = careStatus(goat.id, type, input.careEvents, today)
      if (!s.nextDue) continue
      add({
        date: s.nextDue,
        kind: 'care-due',
        group: 'health',
        goatId: goat.id,
        title: `${type.name}: ${name(goat.id)}`,
        done: false,
        overdue: s.state === 'overdue',
        href: pathOf(goat.id),
      })
    }
  }

  for (const t of input.treatments) {
    const through = withholdThrough(t)
    if (!through || through < addDays(today, -1)) continue
    add({
      date: addDays(through, 1),
      kind: 'withdrawal-ends',
      group: 'milk',
      goatId: t.goat_id,
      title: `${name(t.goat_id)}'s milk OK again`,
      detail: `Withdrawal for ${t.medication} ends`,
      done: false,
      href: pathOf(t.goat_id),
    })
  }

  // --- Already happened -------------------------------------------------------------

  for (const k of input.breeding.kiddings) {
    add({ date: k.kidded_on, kind: 'kidded', group: 'breeding', goatId: k.doe_id, title: `${name(k.doe_id)} kidded`, done: true, href: pathOf(k.doe_id) })
  }
  for (const b of input.breeding.breedings) {
    const buck = b.buck_id ? name(b.buck_id) : undefined
    add({
      date: b.bred_on,
      kind: 'bred',
      group: 'breeding',
      goatId: b.doe_id,
      title: `${name(b.doe_id)} bred${buck ? ` to ${buck}` : ''}`,
      detail: breedingStatus(b, input.breeding, today) === 'kidded' ? undefined : `Due ${formatDate(dueWindow(b).expected)}`,
      done: true,
      href: pathOf(b.doe_id),
    })
  }
  const typeNames = new Map(input.careTypes.map((t) => [t.id, t.name]))
  // Care is often logged for many goats at once: one event per type per day.
  const careDays = new Map<string, { date: string; type: string; goats: string[] }>()
  for (const e of input.careEvents) {
    const key = `${e.done_on}|${e.care_type_id}`
    const entry = careDays.get(key) ?? { date: e.done_on, type: typeNames.get(e.care_type_id) ?? 'Care', goats: [] }
    entry.goats.push(name(e.goat_id))
    careDays.set(key, entry)
  }
  for (const c of careDays.values()) {
    add({
      date: c.date,
      kind: 'care-done',
      group: 'health',
      title: c.goats.length === 1 ? `${c.type}: ${c.goats[0]}` : `${c.type}: ${c.goats.length} goats`,
      detail: c.goats.length > 1 ? c.goats.sort().join(', ') : undefined,
      done: true,
      href: '/health',
    })
  }
  for (const t of input.treatments) {
    add({ date: t.started_on, kind: 'treated', group: 'health', goatId: t.goat_id, title: `${name(t.goat_id)}: ${t.medication}`, detail: t.reason ?? undefined, done: true, href: pathOf(t.goat_id) })
  }
  for (const t of input.tests) {
    add({ date: t.tested_on, kind: 'test-day', group: 'milk', title: 'Milk test day', done: true, href: `/milk/tests/${t.id}` })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || Number(b.overdue ?? false) - Number(a.overdue ?? false) || a.title.localeCompare(b.title))
}

/** Things to deal with now: overdue, or due today. */
export function needsAttention(events: CalendarEvent[], today: string): CalendarEvent[] {
  return events.filter((e) => !e.done && (e.overdue || e.date === today))
}
