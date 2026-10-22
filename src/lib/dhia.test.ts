import { describe, expect, it } from 'vitest'
import { componentGrams, componentPctOn, dhirRequirement, formatScc, isMiniature, oneDayPoints, parseScc, productionOver, starOutlook } from './dhia'

const lb = (n: number) => Math.round(n * 453.59237)

describe('components', () => {
  it('works out butterfat and protein from the milk weight', () => {
    expect(componentGrams(lb(6), 6.5)).toBe(Math.round((lb(6) * 6.5) / 100))
    expect(componentGrams(null, 6.5)).toBeNull()
    expect(componentGrams(2000, null)).toBeNull()
  })
})

describe('ADGA one-day star points', () => {
  it('scores a standard-breed doe', () => {
    // 8.0 lb milk at 4% fat = 0.32 lb fat = 6.4 pts; 95 days = 9 tens = 0.9 pts.
    const p = oneDayPoints({ milkG: lb(8), butterfatPct: 4, dim: 95, miniature: false })
    expect(p).toEqual({ milk: 8, butterfat: 6.4, daysInMilk: 0.9, total: 15.3, needed: 18, earned: false })
  })

  it('caps days in milk at 3.6 points for standard breeds', () => {
    const p = oneDayPoints({ milkG: lb(10), butterfatPct: 3.5, dim: 400, miniature: false })
    expect(p.daysInMilk).toBe(3.6)
    expect(p.total).toBe(20.6)
    expect(p.earned).toBe(true)
  })

  it('scores a Nigerian Dwarf against 7 points, with the smaller days-in-milk credit', () => {
    // 3.0 lb at 6.5% = 0.195 lb fat = 3.9 pts; 120 days = 12 tens × 0.04 = 0.48.
    const p = oneDayPoints({ milkG: lb(3), butterfatPct: 6.5, dim: 120, miniature: true })
    expect(p).toEqual({ milk: 3, butterfat: 3.9, daysInMilk: 0.48, total: 7.4, needed: 7, earned: true })
    expect(oneDayPoints({ milkG: lb(3), butterfatPct: 6.5, dim: 900, miniature: true }).daysInMilk).toBe(1.44)
  })

  it('treats only Nigerian Dwarf as miniature', () => {
    expect(isMiniature('Nigerian Dwarf')).toBe(true)
    expect(isMiniature('Mini LaMancha')).toBe(false)
    expect(isMiniature(null)).toBe(false)
  })
})

describe('somatic cell count', () => {
  it('reads lab-style numbers', () => {
    expect(parseScc('450')).toBe(450_000)
    expect(parseScc('450k')).toBe(450_000)
    expect(parseScc('1.2M')).toBe(1_200_000)
    expect(parseScc('1,250,000')).toBe(1_250_000)
    expect(parseScc('')).toBeNull()
    expect(parseScc('lots')).toBe('invalid')
  })

  it('shows them short', () => {
    expect(formatScc(450_000)).toBe('450k')
    expect(formatScc(1_200_000)).toBe('1.2M')
    expect(formatScc(2_000_000)).toBe('2M')
  })
})

describe('DHIR star requirements (ADGA rule 19a)', () => {
  it('is the base amount for a doe kidding at two or younger', () => {
    expect(dhirRequirement({ breed: 'Alpine', birthDate: '2024-03-01', freshenedOn: '2026-02-15' })).toMatchObject({
      milkLb: 1500,
      butterfatLb: 52.5,
      proteinLb: 45,
      miniature: false,
    })
    expect(dhirRequirement({ breed: 'Nigerian Dwarf', birthDate: '2024-03-01', freshenedOn: '2026-03-01' })).toMatchObject({
      milkLb: 600,
      butterfatLb: 21,
      proteinLb: 18,
      miniature: true,
    })
  })

  it('goes up for every day past two, until five', () => {
    // Kidding at exactly 3: 365 days past 2 (2025 isn't a leap year... 2026-03-01 to 2027-03-01 is 365 days).
    const three = dhirRequirement({ breed: 'Alpine', birthDate: '2024-03-01', freshenedOn: '2027-03-01' })!
    expect(three.milkLb).toBe(1573)
    expect(three.butterfatLb).toBe(55.1) // 52.5 + 2.555
    expect(three.proteinLb).toBe(47.2) // 45 + 2.19
    expect(three.ageAtKidding).toEqual({ years: 3, months: 0 })
    // Capped at five years (1096 days from 2026-03-01 to 2029-03-01, with a leap day).
    const old = dhirRequirement({ breed: 'Nigerian Dwarf', birthDate: '2024-03-01', freshenedOn: '2033-03-01' })!
    expect(old.milkLb).toBe(Math.round((600 + 0.08 * 1096) * 10) / 10)
  })

  it('needs a birth date', () => {
    expect(dhirRequirement({ breed: 'Alpine', birthDate: null, freshenedOn: '2026-03-01' })).toBeNull()
  })

  it('fills in component % between test days', () => {
    const tests = [
      { dim: 30, butterfatPct: 6, proteinPct: 4 },
      { dim: 60, butterfatPct: 7, proteinPct: null },
    ]
    expect(componentPctOn(10, tests, 'butterfatPct')).toBe(6)
    expect(componentPctOn(45, tests, 'butterfatPct')).toBe(6.5)
    expect(componentPctOn(90, tests, 'butterfatPct')).toBe(7)
    expect(componentPctOn(90, tests, 'proteinPct')).toBe(4)
  })

  it('totals milk and components, and says whether the star is earned or on track', () => {
    const req = dhirRequirement({ breed: 'Nigerian Dwarf', birthDate: '2024-03-01', freshenedOn: '2026-03-01' })!
    // 100 days of 4 lb at 6.5% fat.
    const days = Array.from({ length: 100 }, (_, i) => ({ dim: i + 1, grams: lb(4) }))
    const prod = productionOver(days, [{ dim: 50, butterfatPct: 6.5, proteinPct: null }])
    // Weights are stored in whole grams, so 4 lb a day adds up to a hair under 400.
    expect(prod.milkLb).toBeCloseTo(400, 0)
    expect(prod.butterfatLb).toBeCloseTo(26, 0) // 400 × 6.5% = 26 lb, over the 21 lb requirement
    expect(prod.proteinLb).toBeNull()
    expect(starOutlook(req, prod, null)).toBe('earned')

    const milkOnly = productionOver(days, [])
    expect(starOutlook(req, milkOnly, { milkLb: 950, butterfatLb: null, proteinLb: null })).toBe('on-track')
    expect(starOutlook(req, milkOnly, { milkLb: 550, butterfatLb: null, proteinLb: null })).toBe('short')
    expect(starOutlook(req, milkOnly, null)).toBe('unknown')
  })
})
