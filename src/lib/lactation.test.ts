import { describe, expect, it } from 'vitest'
import { fitWood, isPlausible, lactationPoints, rollingAverage, summarizeLactation, woodAt, type DayPoint } from './lactation'
import type { DayTotal, Lactation } from './milk'
import { toISODate, parseDate } from './dates'

// A typical Nigerian Dwarf-ish curve: peaks near 2.4 kg around DIM 55.
const TRUE = { a: 900, b: 0.3, c: 0.0055, r2: 1 }

const lactation: Lactation = {
  id: 'l1',
  herd_id: 'h',
  goat_id: 'g',
  lactation_number: 2,
  freshened_on: '2026-03-01',
  dried_off_on: null,
  notes: null,
  created_by: null,
  created_at: '',
}

function addDays(date: string, days: number) {
  const d = parseDate(date)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Day totals for DIM 1..upTo, with optional ±noise and skipped days. */
function dayTotals(upTo: number, { noise = 0, every = 1, seed = 1 } = {}): DayTotal[] {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1
  const rows: DayTotal[] = []
  for (let dim = 1; dim <= upTo; dim += every) {
    rows.push({
      herd_id: 'h',
      goat_id: 'g',
      milked_on: addDays(lactation.freshened_on, dim),
      total_g: Math.round(woodAt(TRUE, dim) * (1 + noise * rand())),
      is_day_total: false,
      has_am: true,
      has_pm: true,
      milkings: 2,
    })
  }
  return rows
}

const trueTotal = Array.from({ length: 305 }, (_, i) => woodAt(TRUE, i + 1)).reduce((a, b) => a + b, 0)

describe('fitWood', () => {
  it('recovers the parameters of a clean curve', () => {
    const points: DayPoint[] = Array.from({ length: 120 }, (_, i) => ({ dim: i + 1, grams: woodAt(TRUE, i + 1) }))
    const fit = fitWood(points)!
    expect(fit.a).toBeCloseTo(TRUE.a, 0)
    expect(fit.b).toBeCloseTo(TRUE.b, 4)
    expect(fit.c).toBeCloseTo(TRUE.c, 6)
    expect(fit.r2).toBeCloseTo(1, 6)
    expect(isPlausible(fit)).toBe(true)
  })

  it('rejects curves that never decline', () => {
    const rising: DayPoint[] = Array.from({ length: 30 }, (_, i) => ({ dim: i + 1, grams: 500 + i * 30 }))
    const fit = fitWood(rising)
    expect(fit === null || !isPlausible(fit)).toBe(true)
  })

  it('needs at least three usable days', () => {
    expect(fitWood([{ dim: 1, grams: 1000 }, { dim: 2, grams: 1100 }])).toBeNull()
  })
})

describe('summarizeLactation', () => {
  it('projects 305 days close to the true total from 100 days of noisy weigh-ins', () => {
    const summary = summarizeLactation(lactation, dayTotals(100, { noise: 0.08 }), addDays(lactation.freshened_on, 100))
    expect(summary.projected305G).not.toBeNull()
    expect(Math.abs(summary.projected305G! - trueTotal) / trueTotal).toBeLessThan(0.05)
    expect(summary.confidence).toBe('medium')
    expect(summary.currentDim).toBe(100)
  })

  it('is confident late in a well-recorded lactation', () => {
    const summary = summarizeLactation(lactation, dayTotals(200, { noise: 0.05 }), addDays(lactation.freshened_on, 200))
    expect(summary.confidence).toBe('high')
    expect(Math.abs(summary.projected305G! - trueTotal) / trueTotal).toBeLessThan(0.03)
  })

  it('works from weekly weigh-ins too', () => {
    const summary = summarizeLactation(lactation, dayTotals(120, { every: 7 }), addDays(lactation.freshened_on, 120))
    expect(summary.daysRecorded).toBe(18)
    expect(Math.abs(summary.projected305G! - trueTotal) / trueTotal).toBeLessThan(0.02)
  })

  it('finds the peak on the smoothed curve', () => {
    const summary = summarizeLactation(lactation, dayTotals(150), addDays(lactation.freshened_on, 150))
    const truePeakDim = TRUE.b / TRUE.c
    expect(Math.abs(summary.peak!.dim - truePeakDim)).toBeLessThanOrEqual(4)
  })

  it("won't project from too little data", () => {
    const summary = summarizeLactation(lactation, dayTotals(14), addDays(lactation.freshened_on, 14))
    expect(summary.projected305G).toBeNull()
    expect(summary.projectionNote).toMatch(/10 weigh-ins/)
    expect(summary.totalG).toBeGreaterThan(0)
  })

  it('uses only real milk once she has dried off', () => {
    const dried = { ...lactation, dried_off_on: addDays(lactation.freshened_on, 200) }
    const summary = summarizeLactation(dried, dayTotals(200), addDays(lactation.freshened_on, 260))
    expect(summary.currentDim).toBe(200)
    expect(summary.projected305G).toBe(summary.totalG)
  })
})

describe('lactationPoints', () => {
  it('drops days with a missing milking and days outside the lactation', () => {
    const rows = dayTotals(5)
    rows[1] = { ...rows[1]!, has_pm: false }
    rows.push({ ...rows[0]!, milked_on: '2026-02-01' })
    const points = lactationPoints(lactation, rows, '2026-12-31')
    expect(points.map((p) => p.dim)).toEqual([1, 3, 4, 5])
  })

  it('averages over a 7-day window', () => {
    const points = [1, 2, 3, 4, 5, 6, 7].map((dim) => ({ dim, grams: dim * 100 }))
    expect(rollingAverage(points)[3]).toEqual({ dim: 4, grams: 400 })
    expect(rollingAverage(points)[0]).toEqual({ dim: 1, grams: 250 })
  })
})
