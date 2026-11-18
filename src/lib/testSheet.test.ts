import { describe, expect, it } from 'vitest'
import type { Goat } from './goats'
import type { Lactation, MilkRow } from './milk'
import {
  buildTestSheet,
  dayBefore,
  formBirthDate,
  formDate,
  formPounds,
  formTime,
  readMilkingTimes,
  type SheetInput,
} from './testSheet'

const LB = 453.59237

function goat(id: string, overrides: Partial<Goat> = {}): Goat {
  return {
    id,
    herd_id: 'h',
    slug: id,
    registered_name: null,
    barn_name: id,
    title_prefix: null,
    title_suffix: null,
    sex: 'doe',
    breed: null,
    breed_category: null,
    birth_date: null,
    color_markings: null,
    horn_status: 'unknown',
    registry: null,
    registration_number: null,
    pedigree_url: null,
    tattoo_left: null,
    tattoo_right: null,
    scrapie_tag: null,
    microchip: null,
    sire_id: null,
    dam_id: null,
    status: 'active',
    left_herd_on: null,
    left_herd_reason: null,
    notes: null,
    milking_position: null,
    dhir_sample_number: null,
    created_by: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function lactation(goatId: string, freshened_on: string, overrides: Partial<Lactation> = {}): Lactation {
  return {
    id: `l-${goatId}-${freshened_on}`,
    herd_id: 'h',
    goat_id: goatId,
    lactation_number: 1,
    freshened_on,
    dried_off_on: null,
    notes: null,
    created_by: null,
    created_at: '',
    official_305_fat_g: null,
    official_305_milk_g: null,
    official_305_protein_g: null,
    official_days: null,
    official_fat_g: null,
    official_milk_g: null,
    official_protein_g: null,
    ...overrides,
  }
}

/** A time on this computer's clock, as the phone would have saved it. */
const at = (date: string, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(`${date}T00:00:00`)
  d.setHours(h!, m!)
  return d.toISOString()
}

function weight(goatId: string, milked_on: string, milking: number, lb: number, entered = '00:00'): MilkRow {
  return {
    id: `${goatId}-${milked_on}-${milking}`,
    herd_id: 'h',
    goat_id: goatId,
    milked_on,
    milking,
    weight_g: Math.round(lb * LB),
    portions_g: null,
    note: null,
    recorded_by: null,
    recorded_at: '',
    entered_at: at(milked_on, entered),
  }
}

const DAY = '2026-11-15'
const PREV = '2026-11-14'

function input(overrides: Partial<SheetInput> = {}): SheetInput {
  return {
    test: { id: 't', tested_on: DAY, milking_times: {} },
    tests: [{ id: 't', tested_on: DAY, kind: 'dhir' }],
    results: [],
    goats: [],
    lactations: [],
    dayRows: [],
    previousDayRows: [],
    ...overrides,
  }
}

describe('formats', () => {
  it('writes dates, weights and times the way the forms do', () => {
    expect(formDate('2026-11-15')).toBe('11/15/26')
    expect(formDate('2026-09-05')).toBe('9/5/26')
    expect(formBirthDate('2024-03-01')).toBe('03-01-2024')
    expect(formBirthDate(null)).toBe('')
    expect(formPounds(Math.round(1.3 * LB))).toBe('1.3')
    expect(formPounds(Math.round(0.76 * LB))).toBe('0.8')
    expect(formPounds(Math.round(1.04 * LB))).toBe('1.0')
    expect(formTime(at(DAY, '21:05'))).toBe('21:05')
    expect(formTime(at(DAY, '09:00'))).toBe('9:00')
    expect(dayBefore('2026-11-01')).toBe('2026-10-31')
  })

  it('reads corrected times and ignores anything malformed', () => {
    expect(readMilkingTimes({ previous: { start: '20:00', stop: 'late' }, '1': { stop: '9:45' }, x: 1 })).toEqual({
      previous: { start: '20:00' },
      '1': { stop: '9:45' },
    })
    expect(readMilkingTimes([])).toEqual({})
    expect(readMilkingTimes(null)).toEqual({})
  })
})

describe('buildTestSheet', () => {
  it('takes milking start and stop from the first and last weight entered', () => {
    const sheet = buildTestSheet(
      input({
        dayRows: [
          weight('a', DAY, 1, 1.3, '9:05'),
          weight('b', DAY, 1, 1.2, '9:40'),
          weight('a', DAY, 2, 1.3, '21:35'),
        ],
        previousDayRows: [
          weight('a', PREV, 1, 1, '8:00'),
          weight('a', PREV, 2, 1, '20:10'),
          weight('b', PREV, 2, 1, '20:55'),
        ],
      }),
    )
    expect(sheet.testDate).toBe('11/15/26')
    expect(sheet.schedule.map((s) => [s.key, s.start.value, s.stop.value])).toEqual([
      ['previous', '20:10', '20:55'],
      ['1', '9:05', '9:40'],
      ['2', '21:35', '21:35'],
    ])
    expect(sheet.schedule[0]!.start.source).toBe('entered')
  })

  it('prefers times corrected on the test, and leaves a milking with no weights blank', () => {
    const sheet = buildTestSheet(
      input({
        test: { id: 't', tested_on: DAY, milking_times: { '1': { start: '9:00' } } },
        dayRows: [weight('a', DAY, 1, 1.3, '9:05'), weight('a', DAY, 1, 1.3, '9:05')],
      }),
    )
    const [previous, first, second] = sheet.schedule
    expect(first!.start).toEqual({ value: '9:00', source: 'corrected' })
    expect(first!.stop).toEqual({ value: '9:05', source: 'entered' })
    expect(previous!.start).toEqual({ value: null, source: 'none' })
    expect(second!.stop.source).toBe('none')
  })

  it('counts every doe in the herd that has freshened, milking or dry', () => {
    const sheet = buildTestSheet(
      input({
        goats: [
          goat('milking'),
          goat('dry'),
          goat('doeling'),
          goat('sold', { status: 'sold' }),
          goat('buck', { sex: 'buck' }),
          goat('later'),
        ],
        lactations: [
          lactation('milking', '2026-03-01'),
          lactation('dry', '2025-03-01', { dried_off_on: '2025-12-01' }),
          lactation('sold', '2026-03-01'),
          lactation('later', '2026-11-20'),
        ],
      }),
    )
    expect(sheet.cowsInHerd).toBe(2)
  })

  it('lists the barn sheet in sample number order with 1st AM and 2nd PM in pounds', () => {
    const sheet = buildTestSheet(
      input({
        goats: [goat('Bea', { dhir_sample_number: 2 }), goat('Ada'), goat('Cy', { dhir_sample_number: 1 })],
        lactations: [lactation('Bea', '2026-03-01'), lactation('Ada', '2026-03-01'), lactation('Cy', '2026-03-01')],
        dayRows: [
          weight('Cy', DAY, 1, 1.3),
          weight('Cy', DAY, 2, 1.25),
          weight('Bea', DAY, 1, 0.8),
          weight('Ada', DAY, 0, 2),
        ],
      }),
    )
    expect(sheet.barn.map((r) => [r.name, r.sampleNumber, r.first, r.second, r.missing])).toEqual([
      ['Cy', 1, '1.3', '1.3', []],
      ['Bea', 2, '0.8', null, ['PM']],
      ['Ada', null, null, null, []],
    ])
    expect(sheet.barn[2]!.dayTotalOnly).toBe(true)
    expect(sheet.hasThird).toBe(false)
  })

  it('adds extra milkings into the 3rd column', () => {
    const sheet = buildTestSheet(
      input({
        goats: [goat('a')],
        lactations: [lactation('a', '2026-03-01')],
        dayRows: [weight('a', DAY, 1, 1), weight('a', DAY, 2, 1), weight('a', DAY, 3, 0.5), weight('a', DAY, 4, 0.5)],
      }),
    )
    expect(sheet.barn[0]!.third).toBe('1.0')
    expect(sheet.hasThird).toBe(true)
  })

  it('enrolls does in milk that were on no earlier DHIR test, with their sire and dam', () => {
    const sheet = buildTestSheet(
      input({
        tests: [
          { id: 'old', tested_on: '2026-09-25', kind: 'dhir' },
          { id: 'own', tested_on: '2026-10-01', kind: 'owner' },
          { id: 't', tested_on: DAY, kind: 'dhir' },
        ],
        results: [
          { test_id: 'old', goat_id: 'old-hand' },
          { test_id: 'own', goat_id: 'first-freshener' },
        ],
        goats: [
          goat('old-hand'),
          goat('first-freshener', {
            birth_date: '2025-02-10',
            registration_number: 'D2500001',
            breed: 'Nigerian Dwarf',
            sire_id: 'sire',
            dam_id: 'dam',
          }),
          goat('sire', {
            sex: 'buck',
            status: 'reference',
            registered_name: 'Algedi Farm Buck',
            barn_name: null,
            registration_number: 'N1',
            breed: 'Nigerian Dwarf',
          }),
          goat('dam', { barn_name: 'Mama', registration_number: 'D1', breed: 'Nigerian Dwarf' }),
        ],
        lactations: [
          lactation('old-hand', '2026-03-01', { lactation_number: 3 }),
          lactation('first-freshener', '2026-10-30'),
        ],
      }),
    )
    expect(sheet.newToTest).toHaveLength(1)
    expect(sheet.newToTest[0]).toMatchObject({
      barnName: 'first-freshener',
      birthDate: '02-10-2025',
      registration: 'D2500001',
      breed: 'Nigerian Dwarf',
      sire: { name: 'Algedi Farm Buck', registration: 'N1', breed: 'Nigerian Dwarf' },
      dam: { name: 'Mama', registration: 'D1', breed: 'Nigerian Dwarf' },
      lactationNumber: 1,
    })
  })
})
