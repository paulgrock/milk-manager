// Lactation curve math: smoothing, Wood's curve fit and the 305-day projection.
//
// Wood's curve models daily yield at day t in milk as y = a * t^b * e^(-c*t):
// a sets the overall level, b the climb to peak and c the decline after it.
// Taking logs makes it linear, ln y = ln a + b ln t - c t, so it fits with
// ordinary least squares.

import { daysInMilk, type DayTotal, type Lactation } from './milk'

export const STANDARD_DAYS = 305

export interface DayPoint {
  dim: number
  grams: number
}

export interface WoodFit {
  a: number
  b: number
  c: number
  /** R² of the fit in log space: how closely the curve follows the weigh-ins. */
  r2: number
}

export type Confidence = 'low' | 'medium' | 'high'

export interface LactationSummary {
  points: DayPoint[]
  /** 7-day rolling average, one value per recorded day. */
  smoothed: DayPoint[]
  fit: WoodFit | null
  currentDim: number
  totalG: number
  daysRecorded: number
  avgG: number
  peak: DayPoint | null
  /** Recorded milk plus the fitted curve for the remaining days up to 305. */
  projected305G: number | null
  confidence: Confidence | null
  /** Why there's no projection, when there isn't one. */
  projectionNote: string | null
}

/** Day totals inside a lactation, as days in milk. Days with a missing milking are left out: they undercount. */
export function lactationPoints(lactation: Lactation, dayTotals: DayTotal[], today: string): DayPoint[] {
  const end = lactation.dried_off_on && lactation.dried_off_on < today ? lactation.dried_off_on : today
  return dayTotals
    .filter((d) => d.goat_id === lactation.goat_id && d.milked_on! >= lactation.freshened_on && d.milked_on! <= end)
    .filter((d) => d.is_day_total || d.has_am === d.has_pm)
    .map((d) => ({ dim: daysInMilk(lactation.freshened_on, d.milked_on!), grams: d.total_g ?? 0 }))
    .sort((a, b) => a.dim - b.dim)
}

/** Average of the recorded days within 3 days either side. */
export function rollingAverage(points: DayPoint[], halfWindow = 3): DayPoint[] {
  return points.map((p) => {
    const near = points.filter((q) => Math.abs(q.dim - p.dim) <= halfWindow)
    return { dim: p.dim, grams: near.reduce((s, q) => s + q.grams, 0) / near.length }
  })
}

/** Least-squares Wood's curve. Null when the data can't support a curve. */
export function fitWood(points: DayPoint[]): WoodFit | null {
  const usable = points.filter((p) => p.dim >= 1 && p.grams > 0)
  if (usable.length < 3) return null

  // Solve [n Σx1 Σx2; Σx1 Σx1² Σx1x2; Σx2 Σx1x2 Σx2²] · [k b -c] = [Σy Σx1y Σx2y]
  // with x1 = ln t, x2 = t, y = ln yield.
  let n = 0, s1 = 0, s2 = 0, s11 = 0, s12 = 0, s22 = 0, sy = 0, s1y = 0, s2y = 0
  for (const p of usable) {
    const x1 = Math.log(p.dim)
    const x2 = p.dim
    const y = Math.log(p.grams)
    n += 1
    s1 += x1
    s2 += x2
    s11 += x1 * x1
    s12 += x1 * x2
    s22 += x2 * x2
    sy += y
    s1y += x1 * y
    s2y += x2 * y
  }
  const m = [
    [n, s1, s2, sy],
    [s1, s11, s12, s1y],
    [s2, s12, s22, s2y],
  ]
  const solved = solve3(m)
  if (!solved) return null
  const [k, b, negC] = solved
  const a = Math.exp(k)
  const c = -negC

  const meanY = sy / n
  let ssTot = 0
  let ssRes = 0
  for (const p of usable) {
    const y = Math.log(p.grams)
    const predicted = k + b * Math.log(p.dim) + negC * p.dim
    ssTot += (y - meanY) ** 2
    ssRes += (y - predicted) ** 2
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  if (![a, b, c, r2].every(Number.isFinite)) return null
  return { a, b, c, r2 }
}

/** Gaussian elimination for a 3×3 augmented matrix. */
function solve3(m: number[][]): [number, number, number] | null {
  const rows = m.map((r) => [...r])
  for (let col = 0; col < 3; col++) {
    let pivot = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(rows[r]![col]!) > Math.abs(rows[pivot]![col]!)) pivot = r
    if (Math.abs(rows[pivot]![col]!) < 1e-12) return null
    ;[rows[col], rows[pivot]] = [rows[pivot]!, rows[col]!]
    for (let r = 0; r < 3; r++) {
      if (r === col) continue
      const f = rows[r]![col]! / rows[col]![col]!
      for (let k = col; k < 4; k++) rows[r]![k]! -= f * rows[col]![k]!
    }
  }
  return [rows[0]![3]! / rows[0]![0]!, rows[1]![3]! / rows[1]![1]!, rows[2]![3]! / rows[2]![2]!]
}

export function woodAt(fit: WoodFit, dim: number): number {
  return fit.a * dim ** fit.b * Math.exp(-fit.c * dim)
}

/**
 * Whether a fit has the shape of a real lactation: it declines after peak
 * (c > 0), doesn't fall from day one (b >= 0), and peaks somewhere sensible.
 */
export function isPlausible(fit: WoodFit): boolean {
  if (fit.c <= 0 || fit.b < 0) return false
  const peakDim = fit.b / fit.c
  return peakDim <= 200
}

function confidenceFor(points: DayPoint[], currentDim: number, fit: WoodFit): Confidence {
  // A curve fitted to the first few weeks is mostly a guess about the decline.
  if (currentDim >= 150 && points.length >= 60 && fit.r2 >= 0.5) return 'high'
  if (currentDim >= 60 && points.length >= 20 && fit.r2 >= 0.3) return 'medium'
  return 'low'
}

export function summarizeLactation(lactation: Lactation, dayTotals: DayTotal[], today: string): LactationSummary {
  const points = lactationPoints(lactation, dayTotals, today)
  const dried = !!lactation.dried_off_on && lactation.dried_off_on <= today
  const currentDim = daysInMilk(lactation.freshened_on, dried ? lactation.dried_off_on! : today)
  const totalG = points.reduce((s, p) => s + p.grams, 0)
  const smoothed = rollingAverage(points)
  const peak = smoothed.reduce<DayPoint | null>((best, p) => (!best || p.grams > best.grams ? p : best), null)

  const base = {
    points,
    smoothed,
    currentDim,
    totalG,
    daysRecorded: points.length,
    avgG: points.length ? totalG / points.length : 0,
    peak,
  }

  const spanDays = points.length ? points[points.length - 1]!.dim - points[0]!.dim : 0
  if (points.length < 10 || spanDays < 21) {
    return { ...base, fit: null, projected305G: null, confidence: null, projectionNote: 'Needs at least 10 weigh-ins over 3 weeks' }
  }

  const fit = fitWood(points)
  if (!fit || !isPlausible(fit)) {
    return { ...base, fit: null, projected305G: null, confidence: null, projectionNote: "These weights don't follow a normal lactation curve yet" }
  }

  // Recorded days count as recorded; every other day up to 305 uses the
  // curve, unless she has dried off, when those days were simply not milked.
  const recorded = new Map(points.map((p) => [p.dim, p.grams]))
  const lastDim = dried ? Math.min(currentDim, STANDARD_DAYS) : STANDARD_DAYS
  let projected = 0
  for (let dim = 1; dim <= lastDim; dim++) projected += recorded.get(dim) ?? woodAt(fit, dim)

  return {
    ...base,
    fit,
    projected305G: Math.round(projected),
    confidence: confidenceFor(points, currentDim, fit),
    projectionNote: null,
  }
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
}
