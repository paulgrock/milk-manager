// Income and expense categories, money parsing and formatting, the yearly
// summary and CSV export.
import type { Database } from './database.types'

export type FinanceEntry = Database['public']['Tables']['finance_entries']['Row']
export type FinanceKind = Database['public']['Enums']['finance_kind']

export const CATEGORIES: Record<FinanceKind, Record<string, string>> = {
  income: {
    milk: 'Milk sales',
    kid_sale: 'Kid sales',
    goat_sale: 'Goat sales',
    stud_service: 'Stud service',
    other_income: 'Other income',
  },
  expense: {
    feed: 'Feed',
    vet: 'Vet and medicine',
    minerals: 'Minerals and supplements',
    registration: 'Registration and testing',
    equipment: 'Equipment',
    stud_fee: 'Stud fees',
    other_expense: 'Other expense',
  },
}

export const categoryLabel = (kind: FinanceKind, category: string) => CATEGORIES[kind][category] ?? category

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const formatMoney = (cents: number) => money.format(cents / 100)

/** Reads "75", "75.5", "$1,200.00" as cents. Null when blank, 'invalid' when not money. */
export function parseMoney(text: string): number | null | 'invalid' {
  const t = text.trim().replace(/[$,\s]/g, '')
  if (!t) return null
  if (!/^\d*(\.\d{0,2})?$/.test(t) || t === '.') return 'invalid'
  const cents = Math.round(Number(t) * 100)
  return cents > 0 ? cents : 'invalid'
}

export interface YearSummary {
  income: number
  expense: number
  net: number
  byCategory: { kind: FinanceKind; category: string; cents: number }[]
  byMonth: { month: number; income: number; expense: number }[]
}

export function yearSummary(entries: FinanceEntry[], year: number): YearSummary {
  const inYear = entries.filter((e) => Number(e.occurred_on.slice(0, 4)) === year)
  const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }))
  const byCategory = new Map<string, { kind: FinanceKind; category: string; cents: number }>()
  let income = 0
  let expense = 0
  for (const e of inYear) {
    const month = byMonth[Number(e.occurred_on.slice(5, 7)) - 1]!
    month[e.kind] += e.amount_cents
    if (e.kind === 'income') income += e.amount_cents
    else expense += e.amount_cents
    const key = `${e.kind}|${e.category}`
    const c = byCategory.get(key) ?? { kind: e.kind, category: e.category, cents: 0 }
    c.cents += e.amount_cents
    byCategory.set(key, c)
  }
  return {
    income,
    expense,
    net: income - expense,
    byCategory: [...byCategory.values()].sort((a, b) => a.kind.localeCompare(b.kind) * -1 || b.cents - a.cents),
    byMonth,
  }
}

const csvCell = (value: string | number | null | undefined) => {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** One row per entry, for a spreadsheet or the tax preparer. Expenses are negative in the signed column. */
export function toCsv(entries: FinanceEntry[], goatName: (id: string) => string | undefined): string {
  const header = ['Date', 'Type', 'Category', 'Amount', 'Signed amount', 'Description', 'Paid to / from', 'Goat', 'Notes']
  const rows = [...entries]
    .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
    .map((e) => [
      e.occurred_on,
      e.kind === 'income' ? 'Income' : 'Expense',
      categoryLabel(e.kind, e.category),
      (e.amount_cents / 100).toFixed(2),
      ((e.kind === 'income' ? 1 : -1) * e.amount_cents / 100).toFixed(2),
      e.description,
      e.party,
      e.goat_id ? goatName(e.goat_id) : '',
      e.notes,
    ])
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
