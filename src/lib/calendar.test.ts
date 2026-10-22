import { describe, expect, it } from 'vitest'
import { buildEvents, needsAttention, type CalendarInput } from './calendar'
import type { Goat } from './goats'

const goat = (id: string, over: Partial<Goat> = {}): Goat =>
  ({ id, herd_id: 'h', barn_name: id, registered_name: null, sex: 'doe', status: 'active', birth_date: null, ...over }) as Goat

const base: CalendarInput = {
  goats: [goat('Ina'), goat('Clover'), goat('Rex', { sex: 'buck' }), goat('Sold', { status: 'sold' })],
  breeding: { heats: [], breedings: [], checks: [], kiddings: [] },
  careTypes: [{ id: 'hoof', herd_id: 'h', name: 'Hoof trim', interval_days: 56, dose_unit: null, sort_order: 1, archived: false, created_at: '' }],
  careEvents: [],
  treatments: [],
  lactations: [],
  tests: [],
  today: '2026-10-21',
}
const breeding = (doe_id: string, bred_on: string) =>
  ({ id: `b-${doe_id}`, herd_id: 'h', doe_id, buck_id: 'Rex', method: 'hand', bred_on, exposure_end: null, service_fee_cents: null, notes: null, created_by: null, created_at: '' }) as const
const lactation = (goat_id: string, freshened_on: string) =>
  ({ id: `l-${goat_id}`, herd_id: 'h', goat_id, lactation_number: 1, freshened_on, dried_off_on: null, notes: null, created_by: null, created_at: '' })

const summary = (events: ReturnType<typeof buildEvents>) => events.map((e) => `${e.date} ${e.kind} ${e.title}${e.overdue ? ' (overdue)' : ''}`)

describe('buildEvents', () => {
  it('shows a pregnancy: check, dry-off, due date, and the 305-day mark', () => {
    const input = {
      ...base,
      breeding: { ...base.breeding, breedings: [breeding('Ina', '2026-10-01')] },
      lactations: [lactation('Ina', '2026-03-01')],
    }
    expect(summary(buildEvents(input, '2026-10-01', '2027-03-31'))).toEqual([
      '2026-10-01 bred Ina bred to Rex',
      '2026-10-22 heat Ina: back in heat?',
      '2026-10-31 preg-check Pregnancy check Ina',
      '2026-12-30 dry-off Dry off Ina',
      '2026-12-31 dim-305 Ina reaches 305 days in milk',
      '2027-02-28 kidding-due Ina due to kid',
    ])
  })

  it('stops asking for a pregnancy check two months after breeding', () => {
    const input = { ...base, breeding: { ...base.breeding, breedings: [breeding('Ina', '2026-07-01')] } }
    expect(buildEvents(input, '2026-10-01', '2026-10-31').map((e) => e.kind)).not.toContain('preg-check')
  })

  it('brings overdue things forward to today', () => {
    const input = {
      ...base,
      careEvents: [{ id: 'c', herd_id: 'h', goat_id: 'Clover', care_type_id: 'hoof', done_on: '2026-08-01', dose: null, notes: null, created_by: null, created_at: '' }],
    }
    const events = buildEvents(input, '2026-10-21', '2026-10-31')
    expect(summary(events)).toEqual(['2026-10-21 care-due Hoof trim: Clover (overdue)'])
    expect(needsAttention(events, '2026-10-21')).toHaveLength(1)
  })

  it("repeats an open doe's heat cycle across the range", () => {
    const input = { ...base, breeding: { ...base.breeding, heats: [{ id: 'h1', herd_id: 'h', goat_id: 'Ina', observed_on: '2026-10-10', signs: null, created_by: null, created_at: '' }] } }
    expect(buildEvents(input, '2026-10-21', '2026-12-31').filter((e) => e.kind === 'heat').map((e) => e.date)).toEqual([
      '2026-10-31',
      '2026-11-21',
      '2026-12-12',
    ])
  })

  it('says when withheld milk is OK again', () => {
    const input = {
      ...base,
      treatments: [{ id: 't', herd_id: 'h', goat_id: 'Ina', started_on: '2026-10-20', ended_on: null, reason: 'Mastitis', medication: 'Penicillin', dose: null, route: null, lot_number: null, milk_withdrawal_days: 5, notes: null, created_by: null, created_at: '' }],
    }
    const events = buildEvents(input, '2026-10-20', '2026-10-31')
    expect(summary(events)).toEqual(['2026-10-20 treated Ina: Penicillin', "2026-10-26 withdrawal-ends Ina's milk OK again"])
  })

  it('groups care logged for many goats on one day', () => {
    const careEvents = ['Ina', 'Clover', 'Rex'].map((goat_id) => ({ id: goat_id, herd_id: 'h', goat_id, care_type_id: 'hoof', done_on: '2026-10-15', dose: null, notes: null, created_by: null, created_at: '' }))
    const done = buildEvents({ ...base, careEvents }, '2026-10-15', '2026-10-15')
    expect(done).toHaveLength(1)
    expect(done[0]).toMatchObject({ title: 'Hoof trim: 3 goats', detail: 'Clover, Ina, Rex', done: true })
  })

  it('leaves out goats no longer in the herd', () => {
    const careEvents = [{ id: 'c', herd_id: 'h', goat_id: 'Sold', care_type_id: 'hoof', done_on: '2026-10-01', dose: null, notes: null, created_by: null, created_at: '' }]
    expect(buildEvents({ ...base, careEvents }, '2026-10-02', '2027-01-01').filter((e) => e.kind === 'care-due')).toEqual([])
  })
})
