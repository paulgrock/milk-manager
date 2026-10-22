import { describe, expect, it } from 'vitest'
import {
  AM,
  DAY_TOTAL,
  PM,
  applyRecord,
  dayStatus,
  daysInMilk,
  defaultMilking,
  formatWeight,
  formatWeightInput,
  lactationOn,
  milkingLabel,
  nextLactationNumber,
  parseWeightInput,
  toGrams,
  type Lactation,
  type MilkRow,
} from './milk'

function row(milking: number, weight_g: number, extra: Partial<MilkRow> = {}): MilkRow {
  return {
    id: `r${milking}`,
    herd_id: 'h',
    goat_id: 'g',
    milked_on: '2026-10-21',
    milking,
    weight_g,
    portions_g: null,
    note: null,
    recorded_by: null,
    recorded_at: '',
    ...extra,
  }
}

describe('units', () => {
  it('round-trips pounds through grams', () => {
    expect(toGrams(3.4, 'lb')).toBe(1542)
    expect(formatWeight(1542, 'lb')).toBe('3.4')
    expect(formatWeight(1542, 'kg', true)).toBe('1.54 kg')
  })

  it('uses fewer decimals for bigger numbers', () => {
    expect(formatWeight(toGrams(12.63, 'lb'), 'lb')).toBe('12.6')
    expect(formatWeight(toGrams(856.88, 'lb'), 'lb', true)).toBe('857 lb')
    expect(formatWeight(toGrams(1280.19, 'lb'), 'lb')).toBe('1,280')
  })

  it('keeps two decimals in input boxes even for big milkings', () => {
    expect(formatWeightInput({ weight_g: toGrams(10.25, 'lb'), portions_g: null }, 'lb')).toBe('10.25')
  })

  it('labels milkings', () => {
    expect([0, 1, 2, 3, 4].map(milkingLabel)).toEqual(['Day total', 'AM', 'PM', 'Extra', 'Extra 2'])
  })
})

describe('parseWeightInput', () => {
  it('treats blank as clearing the milking', () => {
    expect(parseWeightInput('  ', 'lb')).toEqual({ kind: 'empty' })
  })

  it('reads a single weight, allowing a comma decimal', () => {
    expect(parseWeightInput('3.4', 'lb')).toEqual({ kind: 'ok', grams: 1542, portions: null })
    expect(parseWeightInput('1,5', 'kg')).toEqual({ kind: 'ok', grams: 1500, portions: null })
    expect(parseWeightInput('.5', 'kg')).toEqual({ kind: 'ok', grams: 500, portions: null })
  })

  it('adds up parts and keeps them, exactly', () => {
    const parsed = parseWeightInput('2.1 + 1.3', 'lb')
    expect(parsed).toEqual({ kind: 'ok', grams: 953 + 590, portions: [953, 590] })
  })

  it('rejects junk and impossible weights', () => {
    expect(parseWeightInput('abc', 'lb').kind).toBe('invalid')
    expect(parseWeightInput('2 +', 'lb').kind).toBe('invalid')
    expect(parseWeightInput('-1', 'lb').kind).toBe('invalid')
    expect(parseWeightInput('60', 'lb').kind).toBe('invalid')
  })

  it('takes a different limit for other weights', () => {
    expect(parseWeightInput('62', 'lb', { grams: 200_000, message: 'too heavy' })).toEqual({ kind: 'ok', grams: toGrams(62, 'lb'), portions: null })
    expect(parseWeightInput('30', 'lb', { grams: 10_000, message: 'too heavy' })).toEqual({ kind: 'invalid', message: 'too heavy' })
  })

  it('shows saved parts back the way they were typed', () => {
    expect(formatWeightInput({ weight_g: 1543, portions_g: [953, 590] }, 'lb')).toBe('2.1 + 1.3')
    expect(formatWeightInput({ weight_g: 1542, portions_g: null }, 'lb')).toBe('3.4')
  })
})

describe('applyRecord (mirrors record_milking)', () => {
  const input = (milking: number, grams: number) => ({ goatId: 'g', milkedOn: '2026-10-21', milking, grams, portions: null })
  const summary = (rows: MilkRow[]) => rows.map((r) => `${r.milking}:${r.weight_g}`).join(' ')

  it('adds and replaces milkings', () => {
    expect(summary(applyRecord([], input(AM, 1500)))).toBe('1:1500')
    expect(summary(applyRecord([row(AM, 1500), row(PM, 1200)], input(AM, 1600)))).toBe('1:1600 2:1200')
  })

  it('splits a day total when AM or PM is recorded', () => {
    expect(summary(applyRecord([row(DAY_TOTAL, 3000)], input(PM, 1300)))).toBe('1:1700 2:1300')
  })

  it('refuses what the server would refuse', () => {
    expect(() => applyRecord([row(AM, 1500)], input(DAY_TOTAL, 3000))).toThrow('already has separate milkings')
    expect(() => applyRecord([row(DAY_TOTAL, 3000)], input(3, 500))).toThrow('Split the day total')
    expect(() => applyRecord([row(DAY_TOTAL, 3000)], input(AM, 3500))).toThrow('more than the day total')
  })
})

describe('dayStatus', () => {
  it('sums the day and spots a missing milking', () => {
    expect(dayStatus([row(AM, 1500), row(PM, 1200)])).toEqual({ totalG: 2700, isDayTotal: false, missing: null })
    expect(dayStatus([row(AM, 1500)]).missing).toBe('PM')
    expect(dayStatus([row(PM, 1500)]).missing).toBe('AM')
    expect(dayStatus([row(DAY_TOTAL, 3000)])).toEqual({ totalG: 3000, isDayTotal: true, missing: null })
    expect(dayStatus([]).missing).toBeNull()
  })
})

describe('lactations', () => {
  const lact = (n: number, from: string, to: string | null): Lactation => ({
    id: `l${n}`,
    herd_id: 'h',
    goat_id: 'g',
    lactation_number: n,
    freshened_on: from,
    dried_off_on: to,
    notes: null,
    created_by: null,
    created_at: '',
  })
  const all = [lact(1, '2025-03-01', '2025-12-31'), lact(2, '2026-03-01', null)]

  it('finds the lactation covering a date, inclusive', () => {
    expect(lactationOn(all, 'g', '2025-12-31')?.lactation_number).toBe(1)
    expect(lactationOn(all, 'g', '2026-01-15')).toBeUndefined()
    expect(lactationOn(all, 'g', '2026-10-21')?.lactation_number).toBe(2)
    expect(lactationOn(all, 'other', '2026-10-21')).toBeUndefined()
  })

  it('numbers the next lactation', () => {
    expect(nextLactationNumber(all, 'g')).toBe(3)
    expect(nextLactationNumber(all, 'new')).toBe(1)
  })

  it('counts days in milk from freshening, across DST', () => {
    expect(daysInMilk('2026-03-01', '2026-03-01')).toBe(0)
    expect(daysInMilk('2026-03-01', '2026-03-31')).toBe(30)
    expect(daysInMilk('2026-03-01', '2026-11-15')).toBe(259)
  })

  it('picks AM before noon', () => {
    expect(defaultMilking(new Date(2026, 9, 21, 6))).toBe(AM)
    expect(defaultMilking(new Date(2026, 9, 21, 17))).toBe(PM)
  })
})
