import { describe, expect, it } from 'vitest'
import { formatMoney, parseMoney, toCsv, yearSummary, type FinanceEntry } from './finances'

const entry = (over: Partial<FinanceEntry>): FinanceEntry => ({
  id: crypto.randomUUID(),
  herd_id: 'h',
  kind: 'expense',
  category: 'feed',
  occurred_on: '2026-03-10',
  amount_cents: 2500,
  description: null,
  party: null,
  goat_id: null,
  breeding_id: null,
  notes: null,
  created_by: null,
  created_at: '',
  ...over,
})

describe('money', () => {
  it('reads what people type', () => {
    expect(parseMoney('75')).toBe(7500)
    expect(parseMoney('75.5')).toBe(7550)
    expect(parseMoney('$1,200.00')).toBe(120000)
    expect(parseMoney('  ')).toBeNull()
    expect(parseMoney('12.345')).toBe('invalid')
    expect(parseMoney('abc')).toBe('invalid')
    expect(parseMoney('0')).toBe('invalid')
  })

  it('formats as dollars', () => {
    expect(formatMoney(120050)).toBe('$1,200.50')
  })
})

describe('yearSummary', () => {
  const entries = [
    entry({ kind: 'income', category: 'kid_sale', occurred_on: '2026-05-01', amount_cents: 45000 }),
    entry({ kind: 'income', category: 'milk', occurred_on: '2026-05-20', amount_cents: 12000 }),
    entry({ kind: 'expense', category: 'feed', occurred_on: '2026-01-15', amount_cents: 30000 }),
    entry({ kind: 'expense', category: 'feed', occurred_on: '2026-05-15', amount_cents: 20000 }),
    entry({ kind: 'expense', category: 'vet', occurred_on: '2025-12-31', amount_cents: 99900 }),
  ]

  it('totals the year and leaves out other years', () => {
    const s = yearSummary(entries, 2026)
    expect([s.income, s.expense, s.net]).toEqual([57000, 50000, 7000])
  })

  it('breaks it down by category and month', () => {
    const s = yearSummary(entries, 2026)
    expect(s.byCategory).toEqual([
      { kind: 'income', category: 'kid_sale', cents: 45000 },
      { kind: 'income', category: 'milk', cents: 12000 },
      { kind: 'expense', category: 'feed', cents: 50000 },
    ])
    expect(s.byMonth[0]).toEqual({ month: 1, income: 0, expense: 30000 })
    expect(s.byMonth[4]).toEqual({ month: 5, income: 57000, expense: 20000 })
  })
})

describe('toCsv', () => {
  it('writes a spreadsheet-safe file with signed amounts', () => {
    const csv = toCsv(
      [
        entry({ kind: 'income', category: 'kid_sale', occurred_on: '2026-05-01', amount_cents: 45000, goat_id: 'ivy', description: 'Doeling, "Ivy"', party: 'Smith, J' }),
        entry({ occurred_on: '2026-01-15', amount_cents: 30000, notes: 'line one\nline two' }),
      ],
      (id) => (id === 'ivy' ? 'Ivy' : undefined),
    )
    expect(csv.split('\r\n')).toEqual([
      'Date,Type,Category,Amount,Signed amount,Description,Paid to / from,Goat,Notes',
      '2026-01-15,Expense,Feed,300.00,-300.00,,,,"line one\nline two"',
      '2026-05-01,Income,Kid sales,450.00,450.00,"Doeling, ""Ivy""","Smith, J",Ivy,',
      '',
    ])
  })
})
