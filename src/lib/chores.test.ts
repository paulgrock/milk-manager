import { describe, expect, it } from 'vitest'
import { choreStatus, repeatLabel, sortByDue, type Chore, type ChoreDone } from './chores'

const chore = (over: Partial<Chore> = {}): Chore => ({
  id: 'water',
  herd_id: 'h',
  name: 'Fill waterers',
  interval_days: 14,
  hidden: false,
  sort_order: 1,
  created_by: null,
  created_at: '',
  ...over,
})
const done = (done_on: string, over: Partial<ChoreDone> = {}): ChoreDone => ({
  id: done_on,
  herd_id: 'h',
  chore_id: 'water',
  done_on,
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})

describe('choreStatus', () => {
  it('is due its repeat time after the last time it was done', () => {
    const s = choreStatus(chore(), [done('2026-10-01'), done('2026-10-20'), done('2026-10-10')], '2026-10-31')
    expect(s.last?.done_on).toBe('2026-10-20')
    expect(s.nextDue).toBe('2026-11-03')
    expect(s.daysUntilDue).toBe(3)
    expect(s.state).toBe('due')
  })

  it('is due soon a quarter of its repeat time ahead', () => {
    const weekly = chore({ interval_days: 7 })
    expect(choreStatus(weekly, [done('2026-10-26')], '2026-10-31').state).toBe('ok')
    expect(choreStatus(weekly, [done('2026-10-26')], '2026-11-01').state).toBe('due')
    expect(choreStatus(weekly, [done('2026-10-26')], '2026-11-03').state).toBe('overdue')
  })

  it('is not recorded yet when never done, and ignores other chores', () => {
    expect(choreStatus(chore(), [done('2026-10-30', { chore_id: 'coop' })], '2026-10-31')).toEqual({ chore: chore(), state: 'never' })
  })
})

describe('sortByDue', () => {
  it('puts overdue first, then due soon, then by due date, then not recorded yet', () => {
    const chores = [chore({ id: 'never', name: 'Never' }), chore({ id: 'ok' }), chore({ id: 'late' }), chore({ id: 'soon' })]
    const log = [done('2026-10-25', { chore_id: 'ok' }), done('2026-10-01', { chore_id: 'late' }), done('2026-10-19', { chore_id: 'soon' })]
    expect(sortByDue(chores.map((c) => choreStatus(c, log, '2026-10-31'))).map((s) => s.chore.id)).toEqual(['late', 'soon', 'ok', 'never'])
  })
})

describe('repeatLabel', () => {
  it('says weeks when it can', () => {
    expect(repeatLabel(7)).toBe('every week')
    expect(repeatLabel(14)).toBe('every other week')
    expect(repeatLabel(21)).toBe('every 3 weeks')
    expect(repeatLabel(30)).toBe('every 30 days')
    expect(repeatLabel(1)).toBe('every day')
  })
})
