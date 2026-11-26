// Test support: lays out made-up DHI doe pages the way AgriTech's PDF does
// (positions in PDF points, measured from a real report), so the parser can
// be tested without a real herd's report. The e2e tests also render this to
// HTML and print it to a PDF.

// The parser's PdfTextItem, repeated so the e2e tests (Node module rules) can import this file.
interface PdfTextItem {
  str: string
  x: number
  y: number
  width: number
}

export interface LayoutTest {
  /** As printed, e.g. "9/25/26". */
  date: string
  /** Blank cells are left out, as on a real report. */
  milk?: string
  fat?: string
  protein?: string
  snf?: string
  scc?: string
  ls?: string
  days?: string
  ltd?: [string, string, string, string]
  proj?: [string, string, string, string]
  event?: string
}

export interface LayoutDoe {
  doeNumber: number
  name: string
  /** e.g. "ND USA 2111884" */
  identification: string
  birthDate: string
  tests: LayoutTest[]
}

// Each column's right edge, where its numbers line up.
const RIGHT = {
  p: 56,
  t: 73,
  milk: 96,
  fat: 118,
  protein: 139,
  snf: 165,
  scc: 190,
  ls: 206,
  xs: 218,
  days: 299,
  ltd: [327, 349, 372, 396],
  proj: [427, 449, 472, 496],
} as const

const CHAR = 3.4
const item = (str: string, x: number, y: number): PdfTextItem => ({ str, x, y, width: str.length * CHAR })
const right = (str: string, edge: number, y: number) => item(str, edge - str.length * CHAR, y)

function page(farm: string, reportDate: string, doe: LayoutDoe): PdfTextItem[] {
  const out: PdfTextItem[] = [
    item('92 81 5103', 12, 570),
    item(farm, 88, 570),
    item('TYPE OF TEST', 32, 541),
    item('TEST DATE', 115, 541),
    item('20 DHIR', 14, 524),
    item(reportDate, 117, 524),
    item('DOE', 120, 494),
    item('SIRE', 376, 494),
    item('DAM', 634, 494),
    item('DOE NO.', 19, 481),
    item('NAME/EARTAG', 56, 481),
    item('IDENTIFICATION', 134, 481),
    item('BIRTH DATE', 218, 481),
    item('CODE/NAME', 306, 481),
    item('IDENTIFICATION', 425, 481),
    item('DOE NO.', 537, 481),
    item(String(doe.doeNumber), 29, 469),
    item(doe.name, 67, 469),
    item(doe.identification, 123, 469),
    item(doe.birthDate, 221, 469),
    item('SIRENAME', 310, 469),
    item('ND USA 1000001', 413, 469),
    item('TEST DAY DATA', 119, 388),
    item('LACTATION TO DATE', 305, 388),
    item('PROJECTED 305 DAY', 414, 388),
    item('HERDMATE COMPARISON', 519, 388),
    item('MANAGEMENT EVENTS', 662, 388),
    item('DAYS', 712, 382),
  ]
  // Column headings: test day, lactation to date, projected 305 day, herdmates.
  const heads: [string, number][] = [
    ['STRING', 52],
    ['MILK', 83],
    ['FAT', 106],
    ['PROT', 124],
    ['SNF', 149],
    ['CELLS', 178],
    ['MILK', 310],
    ['FAT', 337],
    ['PROT', 356],
    ['SNF', 382],
    ['MILK', 408],
    ['FAT', 437],
    ['PROT', 456],
    ['SNF', 482],
    ['MILK', 509],
    ['FAT', 540],
    ['PROT', 560],
    ['SNF', 588],
  ]
  for (const [label, x] of heads) out.push(item(label, x, 380))
  out.push(item('TEST DATE', 13, 376), item('COMMENT', 242, 376), item('DAYS', 283, 376), item('EVENT', 638, 376))
  out.push(item('P', 51, 371), item('T', 69, 371), item('SCC', 173, 371), item('LS', 197, 371))

  let y = 362
  for (const t of doe.tests) {
    out.push(item(t.date, 20, y), right('0', RIGHT.p, y), right('1', RIGHT.t, y))
    const cells: [string | undefined, number][] = [
      [t.milk, RIGHT.milk],
      [t.fat, RIGHT.fat],
      [t.protein, RIGHT.protein],
      [t.snf, RIGHT.snf],
      [t.scc, RIGHT.scc],
      [t.ls, RIGHT.ls],
      ['2', RIGHT.xs],
      [t.days, RIGHT.days],
      ...(t.ltd ?? []).map((v, i) => [v, RIGHT.ltd[i]!] as [string, number]),
      ...(t.proj ?? []).map((v, i) => [v, RIGHT.proj[i]!] as [string, number]),
      // Herdmate comparison and relative value, which aren't read.
      ['-21', 528],
      ['2', 552],
      ['79', 623],
    ]
    for (const [v, edge] of cells) if (v) out.push(right(v, edge, y))
    if (t.event) out.push(item(t.event, 634, y))
    y -= 9
  }
  out.push(item('AVG.', 26, y - 9), item('COMPLETE', 235, y - 9))
  // Her lactation history, which also has dates and MILK/FAT headings.
  out.push(item('LACTATION', 26, 177), item('MILK', 197, 169), item('FAT', 223, 169))
  out.push(item('1', 16, 150), item('6/07/22', 32, 150), item('533', 176, 150))
  return out
}

export function layoutReport(farm: string, reportDate: string, does: LayoutDoe[]): PdfTextItem[][] {
  return does.map((d) => page(farm, reportDate, d))
}

/** The pages as HTML at the same positions, for printing to a PDF (letter, landscape). */
export function reportHtml(pages: PdfTextItem[][]): string {
  const PAGE_H = 612
  const FONT = 6
  const body = pages
    .map(
      (items) =>
        `<section>${items
          .map(
            (it) =>
              `<span style="left:${it.x}pt;top:${PAGE_H - it.y - FONT}pt">${it.str.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`,
          )
          .join('')}</section>`,
    )
    .join('')
  return `<!doctype html><html><head><style>
    @page { size: 792pt 612pt; margin: 0 }
    body { margin: 0 }
    section { position: relative; width: 792pt; height: 612pt; page-break-after: always; overflow: hidden }
    span { position: absolute; font: ${FONT}pt Helvetica, Arial, sans-serif; white-space: pre; line-height: 1 }
  </style></head><body>${body}</body></html>`
}
