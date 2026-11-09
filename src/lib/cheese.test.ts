import { describe, expect, it } from 'vitest'
import { agingLabel, isReadySoon, milkLabel, makeStatus, monthlyTotals, parseGallons, readyDate, readyLabel } from './cheese'

describe('readyDate', () => {
  it('adds the aging time in days', () => {
    expect(readyDate('2026-10-30', 21)).toBe('2026-11-20')
    expect(readyDate('2026-10-30', 60)).toBe('2026-12-29')
  })
  it('fresh cheese is ready the day it is made', () => {
    expect(readyDate('2026-10-30', 0)).toBe('2026-10-30')
  })
})

describe('agingLabel', () => {
  it('reads as fresh or a number of days', () => {
    expect(agingLabel(0)).toBe('fresh')
    expect(agingLabel(1)).toBe('1 day')
    expect(agingLabel(45)).toBe('45 days')
  })
})

describe('makeStatus', () => {
  const today = '2026-10-30'
  it('is aging until the ready date, then ready', () => {
    expect(makeStatus({ made_on: '2026-10-01', ready_on: '2026-12-30', finished_on: null }, today)).toBe('aging')
    expect(makeStatus({ made_on: '2026-10-01', ready_on: today, finished_on: null }, today)).toBe('ready')
    expect(makeStatus({ made_on: '2026-07-01', ready_on: '2026-09-01', finished_on: null }, today)).toBe('ready')
  })
  it('cheese ready the day it is made is fresh, not ready', () => {
    expect(makeStatus({ made_on: today, ready_on: today, finished_on: null }, today)).toBe('fresh')
    expect(makeStatus({ made_on: '2026-10-20', ready_on: '2026-10-20', finished_on: null }, today)).toBe('fresh')
  })
  it('a finished make stays finished, ready or not', () => {
    expect(makeStatus({ made_on: '2026-10-01', ready_on: '2026-12-30', finished_on: '2026-10-30' }, today)).toBe('finished')
    expect(makeStatus({ made_on: today, ready_on: today, finished_on: today }, today)).toBe('finished')
  })
})

describe('monthlyTotals', () => {
  it('adds up each month, newest first, with a rough pounds of milk', () => {
    const totals = monthlyTotals([
      { made_on: '2026-09-12', milk_gallons: 2 },
      { made_on: '2026-10-02', milk_gallons: 3 },
      { made_on: '2026-10-20', milk_gallons: 2.5 },
      { made_on: '2026-10-25', milk_gallons: null },
    ])
    expect(totals.map((t) => t.month)).toEqual(['2026-10', '2026-09'])
    expect(totals[0]).toMatchObject({ makes: 3, gallons: 5.5 })
    expect(totals[0]!.milkLb).toBeCloseTo(47.3, 1)
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

describe('isReadySoon', () => {
  const today = '2026-11-09'
  const make = (made_on: string, ready_on: string, finished_on: string | null = null) => ({ made_on, ready_on, finished_on })
  it('is coming ready today or in the next week', () => {
    expect(isReadySoon(make('2026-08-01', today), today)).toBe(true)
    expect(isReadySoon(make('2026-08-01', '2026-11-16'), today)).toBe(true)
    expect(isReadySoon(make('2026-08-01', '2026-11-17'), today)).toBe(false)
  })
  it('leaves out makes already ready, and ones just made that are a long way off', () => {
    expect(isReadySoon(make('2026-08-01', '2026-11-08'), today)).toBe(false)
    expect(isReadySoon(make('2026-11-08', '2027-03-01'), today)).toBe(false)
  })
  it('never lists fresh cheese', () => {
    expect(isReadySoon(make(today, today), today)).toBe(false)
  })
  it('never lists a finished make', () => {
    expect(isReadySoon(make('2026-08-01', '2026-11-10', '2026-11-09'), today)).toBe(false)
  })
})

describe('readyLabel', () => {
  const today = '2026-11-09'
  const made_on = '2026-09-01'
  it('counts down, then says since when', () => {
    expect(readyLabel({ made_on, ready_on: '2026-11-12', finished_on: null }, today)).toBe('Ready in 3 days')
    expect(readyLabel({ made_on, ready_on: today, finished_on: null }, today)).toBe('Ready today')
    expect(readyLabel({ made_on, ready_on: '2026-11-01', finished_on: null }, today)).toMatch(/^Ready since /)
    expect(readyLabel({ made_on, ready_on: '2026-11-01', finished_on: '2026-11-05' }, today)).toMatch(/^Finished /)
  })
  it('fresh cheese just says fresh', () => {
    expect(readyLabel({ made_on: today, ready_on: today, finished_on: null }, today)).toBe('Fresh')
  })
})

describe('milkLabel', () => {
  it('gives the gallons, with raw or pasteurized when noted', () => {
    expect(milkLabel({ milk_gallons: 4, milk_treatment: 'raw' })).toBe('4 gal (raw)')
    expect(milkLabel({ milk_gallons: 2.5, milk_treatment: 'pasteurized' })).toBe('2.5 gal (pasteurized)')
    expect(milkLabel({ milk_gallons: 4, milk_treatment: null })).toBe('4 gal')
    expect(milkLabel({ milk_gallons: null, milk_treatment: 'raw' })).toBe('raw milk')
    expect(milkLabel({ milk_gallons: null, milk_treatment: null })).toBe('')
  })
})
