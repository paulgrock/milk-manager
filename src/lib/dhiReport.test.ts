import { describe, expect, it } from 'vitest'
import { parseDhiReport, registrationDigits, reportDate } from './dhiReport'
import { layoutReport, type LayoutDoe } from './dhiReportLayout'

const bramble: LayoutDoe = {
  doeNumber: 1,
  name: 'BRAMBLE',
  identification: 'ND USA 1111111',
  birthDate: '4/02/22',
  tests: [
    {
      date: '8/05/26',
      milk: '3.4',
      fat: '5.80',
      protein: '3.86',
      snf: '9.61',
      scc: '43',
      ls: '1.8',
      days: '120',
      ltd: ['502', '30', '19', '48'],
      proj: ['1013', '60', '41', '99'],
    },
    {
      date: '9/25/26',
      milk: '2.8',
      fat: '5.95',
      protein: '4.28',
      snf: '10.03',
      scc: '2442',
      ls: '7.6',
      days: '171',
      ltd: ['654', '39', '25', '63'],
      proj: ['973', '58', '40', '96'],
      event: 'BREED',
    },
  ],
}

describe('parseDhiReport', () => {
  it("reads each doe's identity and test lines", () => {
    const report = parseDhiReport(layoutReport('TEST FARM', '9/25/26', [bramble]))
    expect(report.testDate).toBe('2026-09-25')
    expect(report.does).toHaveLength(1)
    const doe = report.does[0]!
    expect(doe).toMatchObject({ doeNumber: 1, name: 'BRAMBLE', registration: '1111111' })
    expect(doe.tests).toEqual([
      {
        date: '2026-08-05',
        milkLb: 3.4,
        fatPct: 5.8,
        proteinPct: 3.86,
        snfPct: 9.61,
        scc: 43_000,
        dim: 120,
        toDate: { milkLb: 502, fatLb: 30, proteinLb: 19, snfLb: 48 },
        projected305: { milkLb: 1013, fatLb: 60, proteinLb: 41, snfLb: 99 },
      },
      {
        date: '2026-09-25',
        milkLb: 2.8,
        fatPct: 5.95,
        proteinPct: 4.28,
        snfPct: 10.03,
        scc: 2_442_000,
        dim: 171,
        toDate: { milkLb: 654, fatLb: 39, proteinLb: 25, snfLb: 63 },
        projected305: { milkLb: 973, fatLb: 58, proteinLb: 40, snfLb: 96 },
      },
    ])
  })

  it('leaves a blank cell blank instead of shifting the rest of the line', () => {
    const doe: LayoutDoe = {
      ...bramble,
      tests: [{ date: '9/25/26', milk: '2.8', fat: '5.95', scc: '21', days: '171', ltd: ['654', '39', '', ''] }],
    }
    const t = parseDhiReport(layoutReport('TEST FARM', '9/25/26', [doe])).does[0]!.tests[0]!
    expect(t).toMatchObject({ milkLb: 2.8, fatPct: 5.95, proteinPct: null, snfPct: null, scc: 21_000, dim: 171 })
    expect(t.toDate).toEqual({ milkLb: 654, fatLb: 39, proteinLb: null, snfLb: null })
    expect(t.projected305).toEqual({ milkLb: null, fatLb: null, proteinLb: null, snfLb: null })
  })

  it('reads one doe per page, with multi-word names', () => {
    const clem: LayoutDoe = { ...bramble, doeNumber: 12, name: 'CLEM JR', identification: 'LM USA 0022222' }
    const report = parseDhiReport(layoutReport('TEST FARM', '9/25/26', [bramble, clem]))
    expect(report.does.map((d) => [d.doeNumber, d.name, d.registration])).toEqual([
      [1, 'BRAMBLE', '1111111'],
      [12, 'CLEM JR', '22222'],
    ])
  })

  it('finds no does on pages that are not doe reports', () => {
    expect(parseDhiReport([[{ str: 'Invoice', x: 10, y: 500, width: 30 }]]).does).toEqual([])
  })
})

describe('helpers', () => {
  it('reads report dates', () => {
    expect(reportDate('9/25/26')).toBe('2026-09-25')
    expect(reportDate('12/01/2024')).toBe('2024-12-01')
    expect(reportDate('AVG.')).toBeNull()
  })

  it('matches registration numbers however they are written', () => {
    expect(registrationDigits('D002111884')).toBe('2111884')
    expect(registrationDigits('ND USA 2111884')).toBe('2111884')
    expect(registrationDigits('')).toBeNull()
  })
})
