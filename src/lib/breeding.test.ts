import { describe, expect, it } from 'vitest'
import { breedingStatus, doeBreedingState, dryOffBy, dueWindow, kiddingFor, type Breeding, type BreedingData, type Kidding, type PregnancyCheck } from './breeding'

const breeding = (over: Partial<Breeding> = {}): Breeding => ({
  id: 'b1',
  herd_id: 'h',
  doe_id: 'ina',
  buck_id: 'rex',
  method: 'hand',
  bred_on: '2026-03-01',
  exposure_end: null,
  service_fee_cents: null,
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})
const check = (result: PregnancyCheck['result'], checked_on: string, breeding_id = 'b1'): PregnancyCheck => ({
  id: `c-${checked_on}`,
  herd_id: 'h',
  breeding_id,
  checked_on,
  method: 'blood',
  result,
  notes: null,
  created_by: null,
  created_at: '',
})
const kidding = (kidded_on: string, over: Partial<Kidding> = {}): Kidding => ({
  id: `k-${kidded_on}`,
  herd_id: 'h',
  doe_id: 'ina',
  breeding_id: null,
  kidded_on,
  difficulty: 'unassisted',
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})
const empty: BreedingData = { heats: [], breedings: [], checks: [], kiddings: [] }

describe('due dates', () => {
  it('is 150 days after a hand breeding, give or take 5', () => {
    expect(dueWindow(breeding())).toEqual({ earliest: '2026-07-24', expected: '2026-07-29', latest: '2026-08-03' })
  })

  it('spans the whole exposure for a pen breeding', () => {
    expect(dueWindow(breeding({ method: 'pen', bred_on: '2026-03-01', exposure_end: '2026-03-21' }))).toEqual({
      earliest: '2026-07-24',
      expected: '2026-08-08',
      latest: '2026-08-23',
    })
  })

  it('suggests drying off 60 days before the due date', () => {
    expect(dryOffBy(dueWindow(breeding()))).toBe('2026-05-30')
  })
})

describe('breedingStatus', () => {
  it('goes from bred to confirmed to kidded', () => {
    const b = breeding()
    expect(breedingStatus(b, empty, '2026-03-20')).toBe('bred')
    expect(breedingStatus(b, { ...empty, checks: [check('pregnant', '2026-04-05')] }, '2026-04-10')).toBe('confirmed')
    expect(breedingStatus(b, { checks: [], kiddings: [kidding('2026-07-28', { breeding_id: 'b1' })] }, '2026-08-01')).toBe('kidded')
  })

  it('uses the latest check', () => {
    const checks = [check('pregnant', '2026-04-05'), check('open', '2026-05-10')]
    expect(breedingStatus(breeding(), { checks, kiddings: [] }, '2026-05-11')).toBe('open')
  })

  it('is overdue after the latest possible due date', () => {
    expect(breedingStatus(breeding(), empty, '2026-08-04')).toBe('overdue')
  })

  it("counts a kidding that wasn't linked if the timing fits", () => {
    expect(kiddingFor(breeding(), [kidding('2026-07-30')])).toBeDefined()
    expect(kiddingFor(breeding(), [kidding('2026-04-01')])).toBeUndefined()
    expect(kiddingFor(breeding(), [kidding('2026-07-30', { doe_id: 'clover' })])).toBeUndefined()
  })
})

describe('doeBreedingState', () => {
  it('tracks a current pregnancy with due date and dry-off date', () => {
    const state = doeBreedingState('ina', { ...empty, breedings: [breeding()], checks: [check('pregnant', '2026-04-05')] }, '2026-06-29')
    expect(state.current?.status).toBe('confirmed')
    expect(state.current?.due.expected).toBe('2026-07-29')
    expect(state.current?.daysToDue).toBe(30)
    expect(state.current?.dryOffBy).toBe('2026-05-30')
    expect(state.nextHeat).toBeUndefined()
  })

  it('says to watch for a return to heat 21 days after an unconfirmed breeding', () => {
    const state = doeBreedingState('ina', { ...empty, breedings: [breeding()] }, '2026-03-19')
    expect(state.nextHeat).toEqual({ date: '2026-03-22', reason: 'return' })
  })

  it('stops expecting a return once that window has passed', () => {
    const state = doeBreedingState('ina', { ...empty, breedings: [breeding()] }, '2026-04-01')
    expect(state.nextHeat).toBeUndefined()
    expect(state.current?.status).toBe('bred')
  })

  it("projects an open doe's cycle from her last heat", () => {
    const heats = [{ id: 'h1', herd_id: 'h', goat_id: 'ina', observed_on: '2026-09-01', signs: null, created_by: null, created_at: '' }]
    expect(doeBreedingState('ina', { ...empty, heats }, '2026-09-10').nextHeat).toEqual({ date: '2026-09-22', reason: 'cycle' })
    // Skips cycles that already went by.
    expect(doeBreedingState('ina', { ...empty, heats }, '2026-10-20').nextHeat).toEqual({ date: '2026-11-03', reason: 'cycle' })
  })

  it('treats a doe confirmed open as cycling from that breeding', () => {
    const data = { ...empty, breedings: [breeding()], checks: [check('open', '2026-04-05')] }
    const state = doeBreedingState('ina', data, '2026-04-06')
    expect(state.current).toBeUndefined()
    expect(state.nextHeat?.reason).toBe('cycle')
  })

  it('has nothing to say about a doe with no records', () => {
    expect(doeBreedingState('ina', empty, '2026-04-06')).toEqual({ lastKidding: undefined })
  })
})

describe('addMonths', () => {
  it('clamps to the end of shorter months', async () => {
    const { addMonths } = await import('./dates')
    expect(addMonths('2026-08-31', -6)).toBe('2026-02-28')
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-15')
  })
})
