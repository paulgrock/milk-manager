import { describe, expect, it } from 'vitest'
import { defaultSeason, inLine, kidFits, reservationProgress, seasonKids, type Reservation, type Sale } from './sales'
import type { BreedingData, Kid, Kidding } from './breeding'
import type { Goat } from './goats'

const none: BreedingData = { heats: [], breedings: [], checks: [], kiddings: [] }
const kidding = (id: string, doe_id: string, kidded_on: string) => ({ id, herd_id: 'h', doe_id, breeding_id: null, kidded_on, difficulty: 'unassisted', notes: null, created_by: null, created_at: '' }) as Kidding
const kid = (id: string, kidding_id: string, sex: 'doe' | 'buck', over: Partial<Kid> = {}) =>
  ({ id, herd_id: 'h', kidding_id, sex, birth_weight_g: null, outcome: 'alive', goat_id: null, notes: null, ...over }) as Kid
const reservation = (id: string, over: Partial<Reservation> = {}) =>
  ({ id, position: 0, created_at: id, kid_count: 1, ...over }) as Reservation

describe('kidFits', () => {
  it('matches doelings to does, bucklings and wethers to bucks, and either to any', () => {
    expect(kidFits({ sex: 'doe' }, 'doeling')).toBe(true)
    expect(kidFits({ sex: 'buck' }, 'doeling')).toBe(false)
    expect(kidFits({ sex: 'buck' }, 'wether')).toBe(true)
    expect(kidFits({ sex: 'doe' }, 'any')).toBe(true)
  })
})

describe('defaultSeason', () => {
  it('is the year a bred doe is due', () => {
    const breeding = { ...none, breedings: [{ id: 'b', herd_id: 'h', doe_id: 'clover', buck_id: null, method: 'hand', bred_on: '2026-10-01', exposure_end: null, service_fee_cents: null, notes: null, created_by: null, created_at: '' }] } as BreedingData
    expect(defaultSeason('clover', breeding, '2026-10-20')).toBe(2027)
  })
  it('is next spring from June on, this spring before', () => {
    expect(defaultSeason(null, none, '2026-10-20')).toBe(2027)
    expect(defaultSeason(null, none, '2026-02-01')).toBe(2026)
  })
})

describe('seasonKids', () => {
  const clover = { id: 'clover', barn_name: 'Clover' } as Goat
  const pip = { id: 'pip', barn_name: 'Pip' } as Goat
  const goats = new Map([['clover', clover], ['pip', pip]])

  it("names live kids by their goat record, or as the dam's doeling or buckling", () => {
    const kiddings = [kidding('k1', 'clover', '2027-02-20'), kidding('k0', 'clover', '2026-03-01')]
    const kids = [kid('a', 'k1', 'doe'), kid('b', 'k1', 'doe'), kid('c', 'k1', 'buck', { goat_id: 'pip' }), kid('d', 'k1', 'buck', { outcome: 'stillborn' }), kid('e', 'k0', 'doe')]
    expect(seasonKids(kiddings, kids, goats, 2027).map((k) => k.label)).toEqual([
      "Clover's doeling 1 (Feb 20, 2027)",
      "Clover's doeling 2 (Feb 20, 2027)",
      'Pip',
    ])
  })
})

describe('inLine', () => {
  it('orders by place in line, then when the reservation was made', () => {
    const line = [reservation('2026-02', { position: 2 }), reservation('2026-03', { position: 1 }), reservation('2026-01', { position: 2 })]
    expect(inLine(line).map((r) => r.id)).toEqual(['2026-03', '2026-01', '2026-02'])
  })
})

describe('reservationProgress', () => {
  it('counts kids matched and sold against how many were asked for', () => {
    const sales = [{ reservation_id: 'r', sold_on: '2027-04-01' }, { reservation_id: 'r', sold_on: null }, { reservation_id: 'x', sold_on: null }] as Sale[]
    expect(reservationProgress(reservation('r', { kid_count: 3 }), sales)).toEqual({ matched: 2, sold: 1, open: 1 })
  })
})
