// The test sheet: what gets written by hand on the lab's DHIR forms for one
// test day, worked out from the app's records. Any milking day works, whether
// or not a test has been recorded for it yet. See GLOSSARY.md (Milk tests)
// and docs/adr/0001-milking-times-from-entry-times.md.

import type { Json } from './database.types'
import { parseDate, toISODate } from './dates'
import type { MilkTest, MilkTestResult } from './dhia'
import { goatName, type Goat } from './goats'
import { AM, PM, lactationOn, type Lactation, type MilkRow } from './milk'

const GRAMS_PER_LB = 453.59237

/** 'YYYY-MM-DD' as the lab writes it: 11/15/26. */
export function formDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}/${y!.slice(2)}`
}

/** 'YYYY-MM-DD' as the enrollment section asks for it: 03-01-2024. */
export function formBirthDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${m}-${d}-${y}`
}

/** A weight as written on the barn sheet: pounds to one decimal. */
export function formPounds(grams: number): string {
  return (Math.round((grams / GRAMS_PER_LB) * 10) / 10).toFixed(1)
}

/** A moment as a 24-hour time on this phone's clock: 21:30. */
export function formTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export type ScheduleKey = 'previous' | '1' | '2'
export type MilkingTimes = Partial<Record<ScheduleKey, { start?: string; stop?: string }>>

const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/

/** A test's corrected times, ignoring anything that isn't a valid 'H:MM'. */
export function readMilkingTimes(json: Json): MilkingTimes {
  const out: MilkingTimes = {}
  if (!json || typeof json !== 'object' || Array.isArray(json)) return out
  for (const key of ['previous', '1', '2'] as const) {
    const v = json[key]
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    const start = typeof v.start === 'string' && TIME.test(v.start) ? v.start : undefined
    const stop = typeof v.stop === 'string' && TIME.test(v.stop) ? v.stop : undefined
    if (start || stop) out[key] = { ...(start && { start }), ...(stop && { stop }) }
  }
  return out
}

export function isFormTime(text: string): boolean {
  return TIME.test(text)
}

export interface SheetTime {
  value: string | null
  /** Where it came from: corrected on the test, worked out from entry times, or nothing to go on. */
  source: 'corrected' | 'entered' | 'none'
}

export interface ScheduleRow {
  key: ScheduleKey
  label: string
  start: SheetTime
  stop: SheetTime
}

export interface EnrollmentRow {
  goat: Goat
  birthDate: string
  barnName: string
  registration: string
  breed: string
  sire: { name: string; registration: string; breed: string }
  dam: { name: string; registration: string; breed: string }
  lactationNumber: number | null
}

export interface BarnRow {
  goat: Goat
  name: string
  sampleNumber: number | null
  first: string | null
  second: string | null
  third: string | null
  /** Only a whole-day total was entered, so there's no 1st or 2nd weight to write. */
  dayTotalOnly: boolean
  missing: ('AM' | 'PM')[]
}

export interface TestSheet {
  testDate: string
  schedule: ScheduleRow[]
  cowsInHerd: number
  newToTest: EnrollmentRow[]
  barn: BarnRow[]
  /** Some doe had an extra milking, so the 3rd column is needed. */
  hasThird: boolean
}

export interface SheetInput {
  /** The test day, 'YYYY-MM-DD'. */
  date: string
  /** Times corrected by hand for that day (milking_times.times), if any. */
  milkingTimes: Json
  /** Every test for the herd, to tell which does were on an earlier DHIR test. */
  tests: Pick<MilkTest, 'id' | 'tested_on' | 'kind'>[]
  results: Pick<MilkTestResult, 'test_id' | 'goat_id'>[]
  /** Every goat in the herd, reference goats included (sires and dams). */
  goats: Goat[]
  lactations: Lactation[]
  /** Milk weights for the test day and for the day before. */
  dayRows: MilkRow[]
  previousDayRows: MilkRow[]
}

const nameOf = (g: Goat) => g.barn_name?.trim() || goatName(g)

/** The lab's barn sheet order: DHIR sample number, then name for does without one. */
export function byBarnSheetOrder(a: Goat, b: Goat): number {
  return (
    (a.dhir_sample_number ?? Number.MAX_SAFE_INTEGER) - (b.dhir_sample_number ?? Number.MAX_SAFE_INTEGER) ||
    nameOf(a).localeCompare(nameOf(b))
  )
}

const inHerd = (g: Goat) => g.status === 'active' || g.status === 'for_sale'

function timesFor(rows: MilkRow[], corrected: MilkingTimes[ScheduleKey]): Pick<ScheduleRow, 'start' | 'stop'> {
  const entered = rows.map((r) => r.entered_at).filter((t) => !Number.isNaN(new Date(t).getTime()))
  entered.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  const pick = (fixed: string | undefined, at: string | undefined): SheetTime =>
    fixed
      ? { value: fixed, source: 'corrected' }
      : at
        ? { value: formTime(at), source: 'entered' }
        : { value: null, source: 'none' }
  return { start: pick(corrected?.start, entered[0]), stop: pick(corrected?.stop, entered.at(-1)) }
}

export function buildTestSheet(input: SheetInput): TestSheet {
  const { date, goats, lactations, dayRows, previousDayRows } = input
  const byId = new Map(goats.map((g) => [g.id, g]))
  const corrected = readMilkingTimes(input.milkingTimes)

  // The previous milking is the last one the evening before.
  const lastPrevious = Math.max(0, ...previousDayRows.map((r) => r.milking))
  const schedule: ScheduleRow[] = [
    {
      key: 'previous',
      label: 'Previous milking',
      ...timesFor(lastPrevious ? previousDayRows.filter((r) => r.milking === lastPrevious) : [], corrected.previous),
    },
    {
      key: '1',
      label: 'Milking 1',
      ...timesFor(
        dayRows.filter((r) => r.milking === AM),
        corrected['1'],
      ),
    },
    {
      key: '2',
      label: 'Milking 2',
      ...timesFor(
        dayRows.filter((r) => r.milking === PM),
        corrected['2'],
      ),
    },
  ]

  const cowsInHerd = goats.filter(
    (g) => g.sex === 'doe' && inHerd(g) && lactations.some((l) => l.goat_id === g.id && l.freshened_on <= date),
  ).length

  // On test: every doe in milk that day, and any doe with a weight that day.
  const onTest = new Set(
    goats
      .filter((g) => g.sex === 'doe' && g.status !== 'reference' && lactationOn(lactations, g.id, date))
      .map((g) => g.id),
  )
  for (const r of dayRows) onTest.add(r.goat_id)
  const does = [...onTest]
    .map((id) => byId.get(id))
    .filter((g): g is Goat => !!g)
    .sort(byBarnSheetOrder)

  const barn: BarnRow[] = does.map((g) => {
    const rows = dayRows.filter((r) => r.goat_id === g.id)
    const grams = (pick: (m: number) => boolean) => {
      const found = rows.filter((r) => pick(r.milking))
      return found.length ? formPounds(found.reduce((s, r) => s + r.weight_g, 0)) : null
    }
    const dayTotalOnly = rows.some((r) => r.milking === 0)
    const first = grams((m) => m === AM)
    const second = grams((m) => m === PM)
    const missing: BarnRow['missing'] = []
    if (!dayTotalOnly && lactationOn(lactations, g.id, date)) {
      if (!first) missing.push('AM')
      if (!second) missing.push('PM')
    }
    return {
      goat: g,
      name: nameOf(g),
      sampleNumber: g.dhir_sample_number,
      first,
      second,
      third: grams((m) => m > PM),
      dayTotalOnly,
      missing,
    }
  })

  // New to test: no result on any earlier DHIR test.
  const earlier = new Set(input.tests.filter((t) => t.kind === 'dhir' && t.tested_on < date).map((t) => t.id))
  const tested = new Set(input.results.filter((r) => earlier.has(r.test_id)).map((r) => r.goat_id))
  const parent = (id: string | null) => {
    const p = id ? byId.get(id) : undefined
    return { name: p ? nameOf(p) : '', registration: p?.registration_number ?? '', breed: p?.breed ?? '' }
  }
  const newToTest: EnrollmentRow[] = does
    .filter((g) => !tested.has(g.id))
    .map((g) => ({
      goat: g,
      birthDate: formBirthDate(g.birth_date),
      barnName: nameOf(g),
      registration: g.registration_number ?? '',
      breed: g.breed ?? '',
      sire: parent(g.sire_id),
      dam: parent(g.dam_id),
      lactationNumber: lactationOn(lactations, g.id, date)?.lactation_number ?? null,
    }))

  return {
    testDate: formDate(date),
    schedule,
    cowsInHerd,
    newToTest,
    barn,
    hasThird: barn.some((r) => r.third),
  }
}

/** The day before a 'YYYY-MM-DD' date. */
export function dayBefore(iso: string): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() - 1)
  return toISODate(d)
}
