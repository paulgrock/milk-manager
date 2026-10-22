import { describe, expect, it } from 'vitest'
import { careStatus, withdrawalOn, withholdThrough, type CareEvent, type CareType, type Treatment } from './health'

const type = (over: Partial<CareType> = {}): CareType => ({
  id: 'hoof',
  herd_id: 'h',
  name: 'Hoof trim',
  interval_days: 56,
  dose_unit: null,
  sort_order: 1,
  archived: false,
  created_at: '',
  ...over,
})
const event = (done_on: string, over: Partial<CareEvent> = {}): CareEvent => ({
  id: done_on,
  herd_id: 'h',
  goat_id: 'ina',
  care_type_id: 'hoof',
  done_on,
  dose: null,
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})
const treatment = (over: Partial<Treatment> = {}): Treatment => ({
  id: 't',
  herd_id: 'h',
  goat_id: 'ina',
  started_on: '2026-10-10',
  ended_on: null,
  reason: null,
  medication: 'Penicillin',
  dose: null,
  route: null,
  lot_number: null,
  milk_withdrawal_days: 10,
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})

describe('careStatus', () => {
  it('counts from the most recent time it was done', () => {
    const status = careStatus('ina', type(), [event('2026-06-01'), event('2026-09-01'), event('2026-07-15')], '2026-10-20')
    expect(status.last?.done_on).toBe('2026-09-01')
    expect(status.nextDue).toBe('2026-10-27')
    expect(status.daysUntilDue).toBe(7)
    expect(status.state).toBe('due')
  })

  it('is overdue, ok or never done', () => {
    expect(careStatus('ina', type(), [event('2026-08-01')], '2026-10-20').state).toBe('overdue')
    expect(careStatus('ina', type(), [event('2026-10-01')], '2026-10-20').state).toBe('ok')
    expect(careStatus('ina', type(), [], '2026-10-20').state).toBe('never')
  })

  it('ignores other goats and other care', () => {
    const events = [event('2026-10-01', { goat_id: 'clover' }), event('2026-10-01', { care_type_id: 'copper' })]
    expect(careStatus('ina', type(), events, '2026-10-20').state).toBe('never')
  })

  it('has no due date for as-needed care', () => {
    expect(careStatus('ina', type({ interval_days: null }), [event('2026-10-01')], '2026-10-20')).toMatchObject({ state: 'as-needed' })
  })
})

describe('milk withdrawal', () => {
  it('runs from the first dose through the last dose plus the withdrawal days', () => {
    expect(withholdThrough(treatment())).toBe('2026-10-20')
    expect(withholdThrough(treatment({ ended_on: '2026-10-14' }))).toBe('2026-10-24')
    expect(withholdThrough(treatment({ milk_withdrawal_days: 0 }))).toBeNull()
  })

  it('withholds milk on the right days only', () => {
    const treatments = [treatment({ ended_on: '2026-10-14' })]
    expect(withdrawalOn('ina', treatments, '2026-10-09')).toBeNull()
    expect(withdrawalOn('ina', treatments, '2026-10-10')?.through).toBe('2026-10-24')
    expect(withdrawalOn('ina', treatments, '2026-10-24')?.through).toBe('2026-10-24')
    expect(withdrawalOn('ina', treatments, '2026-10-25')).toBeNull()
    expect(withdrawalOn('clover', treatments, '2026-10-12')).toBeNull()
  })

  it('uses the longest of overlapping treatments', () => {
    const treatments = [treatment({ id: 'a' }), treatment({ id: 'b', started_on: '2026-10-12', milk_withdrawal_days: 30 })]
    const w = withdrawalOn('ina', treatments, '2026-10-15')!
    expect(w.through).toBe('2026-11-11')
    expect(w.treatments).toHaveLength(2)
  })
})
