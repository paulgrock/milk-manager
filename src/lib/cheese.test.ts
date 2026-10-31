import { describe, expect, it } from 'vitest'
import { makeStatus, monthlyTotals, parseGallons, readyDate, yieldPerGallon } from './cheese'

const lb = (n: number) => Math.round(n * 453.59237)

describe('readyDate', () => {
  it('adds the aging time in months', () => {
    expect(readyDate('2026-10-30', 2)).toBe('2026-12-30')
    expect(readyDate('2026-10-30', 6)).toBe('2027-04-30')
  })
  it('keeps to the end of a shorter month', () => {
    expect(readyDate('2026-08-31', 6)).toBe('2027-02-28')
  })
  it('fresh cheese is ready the day it is made', () => {
    expect(readyDate('2026-10-30', 0)).toBe('2026-10-30')
  })
})

describe('makeStatus', () => {
  const today = '2026-10-30'
  it('is aging until the ready date, then ready', () => {
    expect(makeStatus({ ready_on: '2026-12-30', finished_on: null }, today)).toBe('aging')
    expect(makeStatus({ ready_on: today, finished_on: null }, today)).toBe('ready')
    expect(makeStatus({ ready_on: '2026-09-01', finished_on: null }, today)).toBe('ready')
  })
  it('a finished make stays finished, ready or not', () => {
    expect(makeStatus({ ready_on: '2026-12-30', finished_on: '2026-10-30' }, today)).toBe('finished')
  })
})

describe('yieldPerGallon', () => {
  it('is pounds of cheese per gallon of milk', () => {
    expect(yieldPerGallon({ milk_gallons: 4, cheese_weight_g: lb(4) })).toBeCloseTo(1, 3)
  })
  it('needs both the milk and the cheese', () => {
    expect(yieldPerGallon({ milk_gallons: null, cheese_weight_g: lb(4) })).toBeNull()
    expect(yieldPerGallon({ milk_gallons: 4, cheese_weight_g: null })).toBeNull()
  })
})

describe('monthlyTotals', () => {
  it('adds up each month, newest first, with a rough pounds of milk', () => {
    const totals = monthlyTotals([
      { made_on: '2026-09-12', milk_gallons: 2, cheese_weight_g: lb(1.5) },
      { made_on: '2026-10-02', milk_gallons: 3, cheese_weight_g: null },
      { made_on: '2026-10-20', milk_gallons: 2.5, cheese_weight_g: lb(2.5) },
    ])
    expect(totals.map((t) => t.month)).toEqual(['2026-10', '2026-09'])
    expect(totals[0]).toMatchObject({ makes: 2, gallons: 5.5 })
    expect(totals[0]!.milkLb).toBeCloseTo(47.3, 1)
    expect(totals[0]!.cheeseLb).toBeCloseTo(2.5, 3)
  })
})

describe('parseGallons', () => {
  it('reads gallons, blank as none', () => {
    expect(parseGallons('2.5')).toEqual({ ok: true, value: 2.5 })
    expect(parseGallons('2,5')).toEqual({ ok: true, value: 2.5 })
    expect(parseGallons('  ')).toEqual({ ok: true, value: null })
  })
  it('rejects anything else', () => {
    expect(parseGallons('two').ok).toBe(false)
    expect(parseGallons('0').ok).toBe(false)
  })
})
