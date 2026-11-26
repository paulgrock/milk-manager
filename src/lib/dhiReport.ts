// Reads a DHI doe report PDF (AgriTech Analytics' doe pages, one doe per
// page) into numbers the milk test form can fill in. Works from the PDF's own
// text, so it needs a PDF saved or printed from the report, not a scan.
//
// Each page has the doe's identity near the top, then a TEST DAY DATA table:
// one line per test with milk, fat %, protein %, SNF %, SCC, days in milk,
// lactation-to-date pounds and projected 305-day pounds. Numbers are matched
// to the column heading above them by position, so a blank cell can't shift
// the rest of the line.

export interface PdfTextItem {
  str: string
  /** Left edge, in PDF points. */
  x: number
  /** Baseline, in PDF points from the bottom of the page. */
  y: number
  width: number
}

export interface ReportYields {
  milkLb: number | null
  fatLb: number | null
  proteinLb: number | null
  snfLb: number | null
}

export interface ReportTestDay {
  /** YYYY-MM-DD */
  date: string
  milkLb: number | null
  fatPct: number | null
  proteinPct: number | null
  snfPct: number | null
  /** Cells per mL (the report prints thousands). */
  scc: number | null
  dim: number | null
  toDate: ReportYields
  projected305: ReportYields
}

export interface ReportDoe {
  doeNumber: number | null
  name: string
  /** The registration's number, e.g. 2111884 from "ND USA 2111884". */
  registration: string | null
  tests: ReportTestDay[]
}

export interface DhiReport {
  /** The report's own test date, YYYY-MM-DD. */
  testDate: string | null
  does: ReportDoe[]
}

const DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/

/** "9/25/26" → "2026-09-25". */
export function reportDate(text: string): string | null {
  const m = DATE.exec(text.trim())
  if (!m) return null
  const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3])
  return `${year}-${m[1]!.padStart(2, '0')}-${m[2]!.padStart(2, '0')}`
}

/** A registration number's digits without leading zeros, for matching "D002111884" to "ND USA 2111884". */
export function registrationDigits(text: string | null | undefined): string | null {
  const digits = (text ?? '').replace(/\D/g, '').replace(/^0+/, '')
  return digits || null
}

const center = (it: PdfTextItem) => it.x + it.width / 2
const sameLine = (a: PdfTextItem, b: PdfTextItem) => Math.abs(a.y - b.y) <= 3
const num = (text: string | undefined): number | null => {
  if (text === undefined) return null
  const n = Number(text.replace(/,/g, ''))
  return text.trim() && Number.isFinite(n) ? n : null
}

type Column =
  | 'milk'
  | 'fat'
  | 'protein'
  | 'snf'
  | 'scc'
  | 'dim'
  | 'ltdMilk'
  | 'ltdFat'
  | 'ltdProtein'
  | 'ltdSnf'
  | 'projMilk'
  | 'projFat'
  | 'projProtein'
  | 'projSnf'

/** Where each column's heading sits across the page. */
function columnsOf(items: PdfTextItem[], top: number, bottom: number): Map<Column, number> | null {
  const band = items.filter((it) => it.y < top && it.y > bottom)
  const byLabel = (label: string) =>
    band
      .filter((it) => it.str.trim() === label)
      .map(center)
      .sort((a, b) => a - b)
  const milk = byLabel('MILK')
  const fat = byLabel('FAT')
  const protein = byLabel('PROT')
  const snf = byLabel('SNF')
  const scc = byLabel('SCC')[0]
  const dim = byLabel('DAYS')[0]
  // Test day, lactation to date, projected 305 day (and herdmate comparison, unused).
  if (milk.length < 3 || fat.length < 3 || protein.length < 3 || scc === undefined || dim === undefined) return null
  const cols = new Map<Column, number>([
    ['milk', milk[0]!],
    ['fat', fat[0]!],
    ['protein', protein[0]!],
    ['scc', scc],
    ['dim', dim],
    ['ltdMilk', milk[1]!],
    ['ltdFat', fat[1]!],
    ['ltdProtein', protein[1]!],
    ['projMilk', milk[2]!],
    ['projFat', fat[2]!],
    ['projProtein', protein[2]!],
  ])
  if (snf.length >= 3) {
    cols.set('snf', snf[0]!)
    cols.set('ltdSnf', snf[1]!)
    cols.set('projSnf', snf[2]!)
  }
  return cols
}

/** Each number on a test line, under the heading it sits nearest. */
function readLine(line: PdfTextItem[], cols: Map<Column, number>): Map<Column, number | null> {
  const out = new Map<Column, number | null>()
  const positions = [...cols]
  for (const it of line) {
    const value = num(it.str)
    if (value === null) continue
    const c = center(it)
    let best: [Column, number] | null = null
    for (const [col, x] of positions) {
      const d = Math.abs(c - x)
      if (d <= 12 && (!best || d < best[1])) best = [col, d]
    }
    if (best && !out.has(best[0])) out.set(best[0], value)
  }
  return out
}

function parsePage(items: PdfTextItem[]): { doe: ReportDoe | null; testDate: string | null } {
  const find = (label: string) => items.find((it) => it.str.trim() === label)

  // The report's own test date: on the line under TYPE OF TEST / TEST DATE.
  let testDate: string | null = null
  const kind = items.find((it) => /\bDHIR\b/.test(it.str))
  if (kind) {
    const date = items.find((it) => sameLine(it, kind) && DATE.test(it.str.trim()))
    if (date) testDate = reportDate(date.str)
  }

  // The doe: the first line of values under DOE NO. / NAME / IDENTIFICATION.
  const header = items.filter((it) => it.str.trim() === 'DOE NO.').sort((a, b) => a.x - b.x)[0]
  const sire = items.filter((it) => it.str.trim() === 'CODE/NAME').sort((a, b) => a.x - b.x)[0]
  if (!header) return { doe: null, testDate }
  const below = items.filter((it) => it.y < header.y - 3 && it.y > header.y - 25)
  const rowY = Math.max(...below.map((it) => it.y))
  const row = below.filter((it) => Math.abs(it.y - rowY) <= 3 && (!sire || it.x < sire.x - 5)).sort((a, b) => a.x - b.x)
  // "2 ZORA ND USA 2111884 5/01/19": read from the joined text, however the PDF split it up.
  const text = row
    .map((it) => it.str.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
  const m = /^(?:(\d+)\s+)?(.*?)\s*\b[A-Z]{1,3}\s*USA\s*0*(\d+)\b/.exec(text)
  const doeNumber = m?.[1] ? Number(m[1]) : null
  const name = (m ? m[2]! : text.replace(/^\d+\s+/, '').replace(/\s*\d{1,2}\/\d{1,2}\/\d{2,4}.*$/, '')).trim()
  const registration = m?.[3] ?? null

  // The test lines: between the TEST DAY DATA heading and the AVG. line.
  const tests: ReportTestDay[] = []
  const tableTop = find('TEST DAY DATA')
  if (tableTop) {
    const avg = items.find((it) => it.str.trim() === 'AVG.' && it.y < tableTop.y)
    const bottom = avg ? avg.y - 1 : -Infinity
    const starts = items
      .filter((it) => it.y < tableTop.y && it.y > bottom && DATE.test(it.str.trim()) && it.x < 60)
      .sort((a, b) => b.y - a.y)
    const firstRow = starts[0]
    const cols = firstRow ? columnsOf(items, tableTop.y + 1, firstRow.y + 3) : null
    if (cols) {
      for (const start of starts) {
        const line = items.filter((it) => sameLine(it, start) && it !== start)
        const v = readLine(line, cols)
        const g = (c: Column) => v.get(c) ?? null
        const scc = g('scc')
        tests.push({
          date: reportDate(start.str)!,
          milkLb: g('milk'),
          fatPct: g('fat'),
          proteinPct: g('protein'),
          snfPct: g('snf'),
          scc: scc === null ? null : Math.round(scc * 1000),
          dim: g('dim'),
          toDate: { milkLb: g('ltdMilk'), fatLb: g('ltdFat'), proteinLb: g('ltdProtein'), snfLb: g('ltdSnf') },
          projected305: {
            milkLb: g('projMilk'),
            fatLb: g('projFat'),
            proteinLb: g('projProtein'),
            snfLb: g('projSnf'),
          },
        })
      }
    }
  }

  if (!registration && !name) return { doe: null, testDate }
  return { doe: { doeNumber, name, registration, tests }, testDate }
}

/** Every doe in the report, one per page; a doe on several pages has her tests joined. */
export function parseDhiReport(pages: PdfTextItem[][]): DhiReport {
  const does: ReportDoe[] = []
  let testDate: string | null = null
  for (const items of pages) {
    const page = parsePage(items)
    testDate ??= page.testDate
    if (!page.doe) continue
    const same = does.find((d) =>
      page.doe!.registration ? d.registration === page.doe!.registration : d.name === page.doe!.name,
    )
    if (same) same.tests.push(...page.doe.tests.filter((t) => !same.tests.some((s) => s.date === t.date)))
    else does.push(page.doe)
  }
  return { testDate, does }
}

/** The text on each page of a PDF, with positions. Loads pdf.js only when it's needed. */
export async function readPdfText(data: ArrayBuffer): Promise<PdfTextItem[][]> {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  }
  const task = pdfjs.getDocument({ data: new Uint8Array(data) })
  const doc = await task.promise
  try {
    const pages: PdfTextItem[][] = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      pages.push(
        content.items
          .filter((it) => 'str' in it && it.str.trim())
          .map((it) => {
            const t = it as { str: string; transform: number[]; width: number }
            return { str: t.str, x: t.transform[4]!, y: t.transform[5]!, width: t.width }
          }),
      )
    }
    return pages
  } finally {
    await task.destroy()
  }
}
