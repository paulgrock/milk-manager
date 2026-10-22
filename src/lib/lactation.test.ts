import { describe, expect, it } from 'vitest'
import { dailySeries, fitWood, isPlausible, lactationPoints, rollingAverage, summarizeLactation, woodAt, type DayPoint } from './lactation'
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
  official_days: null,
  official_milk_g: null,
  official_fat_g: null,
  official_protein_g: null,
  official_305_milk_g: null,
  official_305_fat_g: null,
  official_305_protein_g: null,
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

// Test days from AgriTech Analytics DHIR doe pages (9/25/26) for does tested
// only on test day: [day in milk, test-day lb, DHI's own lactation-to-date lb].
const REPORT: Record<string, { lactationNumber: number; tests: [number, number, number][] }> = {
  Ina: { lactationNumber: 3, tests: [[28, 4.8, 117], [70, 4.0, 298], [109, 3.6, 448], [160, 2.8, 607]] },
  Nib: { lactationNumber: 2, tests: [[39, 5.2, 170], [81, 4.2, 361], [120, 3.2, 502], [171, 2.8, 654]] },
  Giana: { lactationNumber: 1, tests: [[46, 3.5, 136], [88, 3.0, 268], [127, 2.0, 360], [178, 2.1, 471]] },
  Masha: { lactationNumber: 1, tests: [[41, 3.2, 115], [80, 2.0, 205], [131, 1.8, 309]] },
  Vanilla: { lactationNumber: 1, tests: [[22, 3.0, 59], [73, 2.9, 206]] },
}
const LB = 453.59237

describe('dailySeries (milk between test days)', () => {
  it("lands close to DHI's own lactation-to-date figures", () => {
    for (const [name, { lactationNumber, tests }] of Object.entries(REPORT)) {
      const points = tests.map(([dim, lb]) => ({ dim, grams: lb * LB }))
      for (const [dim, , official] of tests) {
        const estimate = dailySeries(points, dim, { lactationNumber, carryToEnd: false }).reduce((s, d) => s + d.grams, 0) / LB
        expect(Math.abs(estimate - official) / official, `${name} day ${dim}: ${estimate.toFixed(0)} vs ${official}`).toBeLessThan(0.06)
      }
    }
  })

  it('draws straight lines between recordings and keeps recorded days as they are', () => {
    const series = dailySeries([{ dim: 10, grams: 1000 }, { dim: 20, grams: 2000 }], 20, { lactationNumber: 2, carryToEnd: false })
    expect(series).toHaveLength(20)
    expect(series[9]).toEqual({ dim: 10, grams: 1000 })
    expect(series[14]).toEqual({ dim: 15, grams: 1500 })
    expect(series[0]!.grams).toBeLessThan(1000) // the climb toward peak
  })

  it('carries the last weight to dry-off for a finished lactation, and stops at the last weight otherwise', () => {
    const points = [{ dim: 5, grams: 1000 }]
    expect(dailySeries(points, 10, { lactationNumber: 2, carryToEnd: true }).at(-1)).toEqual({ dim: 10, grams: 1000 })
    expect(dailySeries(points, 10, { lactationNumber: 2, carryToEnd: false })).toHaveLength(5)
  })
})

describe('summarizeLactation with official DHI figures', () => {
  const freshened = lactation.freshened_on
  const testDay = (dim: number, lb: number) => ({
    herd_id: 'h', goat_id: 'g', milked_on: addDays(freshened, dim), total_g: Math.round(lb * LB), is_day_total: true, has_am: false, has_pm: false, milkings: 1,
  })

  it("uses the report's lactation to date and projected 305 as printed", () => {
    const totals = [testDay(28, 4.8), testDay(70, 4.0)] as DayTotal[]
    const s = summarizeLactation(lactation, totals, addDays(freshened, 75), {
      test: { dim: 70, ltdMilkG: 298 * LB, ltdFatG: null, ltdProteinG: null, proj305MilkG: 1066 * LB, proj305FatG: null, proj305ProteinG: null },
    })
    expect(s.totalSource).toBe('official')
    expect(s.totalG).toBeCloseTo(298 * LB, 0)
    expect(s.totalAsOfDim).toBe(70)
    expect(s.projectedSource).toBe('official')
    expect(s.projected305G).toBeCloseTo(1066 * LB, 0)
  })

  it('adds weigh-ins after the test on top of the official figure', () => {
    const totals = [testDay(70, 4.0), testDay(72, 4.0)] as DayTotal[]
    const s = summarizeLactation(lactation, totals, addDays(freshened, 72), {
      test: { dim: 70, ltdMilkG: Math.round(298 * LB), ltdFatG: null, ltdProteinG: null, proj305MilkG: 1066 * LB, proj305FatG: null, proj305ProteinG: null },
    })
    expect(s.totalG).toBe(Math.round(298 * LB) + 2 * Math.round(4.0 * LB))
    expect(s.totalAsOfDim).toBe(72)
  })

  it("uses a finished lactation's official record", () => {
    const dried = { ...lactation, dried_off_on: addDays(freshened, 379) }
    const s = summarizeLactation(dried, [testDay(350, 1.0)] as DayTotal[], addDays(freshened, 400), {
      complete: { days: 379, milkG: 791 * LB, fatG: 47 * LB, proteinG: 37 * LB, r305MilkG: 713 * LB, r305FatG: 42 * LB, r305ProteinG: 32 * LB },
    })
    expect(s.totalG).toBeCloseTo(791 * LB, 0)
    expect(s.projected305G).toBeCloseTo(713 * LB, 0)
    expect(s.projectedSource).toBe('official')
  })
})
