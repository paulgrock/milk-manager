// Reads a linear appraisal written after a goat's name, the way pedigrees
// and farm websites show it: "5*M (pending) VVEV 88", "*B VGV 85",
// "GGVG 82 (@ 2 yo)", "3*M +EEE89". No imports, so the import scripts can use
// it directly.

export interface AppraisalText {
  general_appearance: string
  dairy_strength: string
  body_capacity: string
  /** Null for bucks, who aren't scored on mammary. */
  mammary_system: string | null
  final_score: number
  /** Age at appraisal when given, e.g. "@ 2 yo" or "@ < 2 yo". */
  age: string | null
}

const SCORE = /(^|\s)([EVGAFP+]{3,4})\s*(\d{2})(?=\s|$)/
const AGE = /\s*\(@\s*([^)]*?)\s*\)/

/** Splits the appraisal out of the titles after a name; the titles are what's left. */
export function splitAppraisal(suffix: string | null): { titles: string | null; appraisal: AppraisalText | null } {
  if (!suffix) return { titles: null, appraisal: null }
  const m = suffix.match(SCORE)
  const score = m ? Number(m[3]) : NaN
  if (!m || score < 50 || score > 99) return { titles: suffix, appraisal: null }
  // "+" is the older way of writing Good Plus, recorded as G.
  const codes = m[2]!.replace(/\+/g, 'G').split('')
  const ageMatch = suffix.match(AGE)
  const titles = suffix.replace(m[0], ' ').replace(AGE, ' ').replace(/\s+/g, ' ').trim()
  return {
    titles: titles || null,
    appraisal: {
      general_appearance: codes[0]!,
      dairy_strength: codes[1]!,
      body_capacity: codes[2]!,
      mammary_system: codes[3] ?? null,
      final_score: score,
      age: ageMatch ? `@ ${ageMatch[1]}` : null,
    },
  }
}
