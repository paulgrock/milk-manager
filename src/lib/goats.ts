import type { Database } from './database.types'
import { monthsAndDaysBetween, todayISO } from './dates'

type Tables = Database['public']['Tables']
export type Goat = Tables['goats']['Row']
export type GoatInsert = Tables['goats']['Insert']
export type Appraisal = Tables['linear_appraisals']['Row']
export type GoatPhoto = Tables['goat_photos']['Row']
export type GoatSex = Database['public']['Enums']['goat_sex']
export type GoatStatus = Database['public']['Enums']['goat_status']
export type HornStatus = Database['public']['Enums']['horn_status']

export const SEX_LABELS: Record<GoatSex, string> = { doe: 'Doe', buck: 'Buck', wether: 'Wether' }

export const STATUS_LABELS: Record<GoatStatus, string> = {
  active: 'In herd',
  for_sale: 'For sale',
  sold: 'Sold',
  deceased: 'Deceased',
  reference: 'Reference',
}

export const HORN_LABELS: Record<HornStatus, string> = {
  disbudded: 'Disbudded',
  polled: 'Polled',
  horned: 'Horned',
  unknown: 'Unknown',
}

export const BREED_CATEGORY_LABELS: Record<string, string> = {
  purebred: 'Purebred',
  american: 'American',
  experimental: 'Experimental',
  recorded_grade: 'Recorded Grade',
}

export const APPRAISAL_CODES = ['E', 'V', 'G', 'A', 'F', 'P'] as const
export const APPRAISAL_CODE_LABELS: Record<(typeof APPRAISAL_CODES)[number], string> = {
  E: 'Excellent',
  V: 'Very Good',
  G: 'Good Plus',
  A: 'Acceptable',
  F: 'Fair',
  P: 'Poor',
}

/** Statuses that count as "the herd" in the default list view. */
export const CURRENT_STATUSES: GoatStatus[] = ['active', 'for_sale']

type Named = Pick<Goat, 'registered_name' | 'barn_name'>
type Titled = Named & Pick<Goat, 'title_prefix' | 'title_suffix'>

/** Short name for lists and pickers: registered name, else barn name. */
export function goatName(goat: Named): string {
  return goat.registered_name?.trim() || goat.barn_name?.trim() || 'Unnamed'
}

/** Name with titles, the way it's written on a pedigree: "GCH Some Farm Ocean Flower 6*M *D". */
export function goatFullName(goat: Titled): string {
  return [goat.title_prefix, goatName(goat), goat.title_suffix]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

/** "VVEV 88". Bucks have no mammary score, so theirs is three letters. */
export function appraisalSummary(
  a: Pick<Appraisal, 'general_appearance' | 'dairy_strength' | 'body_capacity' | 'mammary_system' | 'final_score'>,
): string {
  const codes = [a.general_appearance, a.dairy_strength, a.body_capacity, a.mammary_system].filter(Boolean).join('')
  return `${codes} ${a.final_score}`
}

/** Most recent appraisal per goat. */
export function latestAppraisals(appraisals: Appraisal[]): Map<string, Appraisal> {
  const latest = new Map<string, Appraisal>()
  for (const a of appraisals) {
    const current = latest.get(a.goat_id)
    if (!current || a.appraised_on > current.appraised_on) latest.set(a.goat_id, a)
  }
  return latest
}

/** "3 yr 2 mo", "5 mo", "12 days". */
export function formatAge(birthDate: string | null, asOf: string = todayISO()): string {
  if (!birthDate || birthDate > asOf) return ''
  const { months, days } = monthsAndDaysBetween(birthDate, asOf)
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years > 0) return rest ? `${years} yr ${rest} mo` : `${years} yr`
  if (months > 0) return `${months} mo`
  return days === 1 ? '1 day' : `${days} days`
}

/** Whole years old on a date, e.g. the age at an appraisal ("@ 2 yo"). */
export function ageInYears(birthDate: string | null, on: string): number | null {
  if (!birthDate || birthDate > on) return null
  return Math.floor(monthsAndDaysBetween(birthDate, on).months / 12)
}

export interface PedigreeNode {
  goat: Goat | null
  sire: PedigreeNode | null
  dam: PedigreeNode | null
}

/**
 * Ancestors of a goat, `generations` deep (1 = parents only). Missing parents
 * are null nodes so the chart keeps its shape.
 */
export function buildPedigree(goat: Goat, byId: Map<string, Goat>, generations = 2): PedigreeNode {
  const node = (g: Goat | null, depth: number): PedigreeNode => ({
    goat: g,
    sire: depth < generations ? node(g?.sire_id ? (byId.get(g.sire_id) ?? null) : null, depth + 1) : null,
    dam: depth < generations ? node(g?.dam_id ? (byId.get(g.dam_id) ?? null) : null, depth + 1) : null,
  })
  return node(goat, 0)
}

export interface GoatFilters {
  search: string
  statuses: GoatStatus[]
  sex: GoatSex | null
  breed: string | null
}

const normalize = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()

export function filterGoats(goats: Goat[], filters: GoatFilters): Goat[] {
  const q = normalize(filters.search)
  return goats
    .filter((g) => filters.statuses.length === 0 || filters.statuses.includes(g.status))
    .filter((g) => !filters.sex || g.sex === filters.sex)
    .filter((g) => !filters.breed || g.breed === filters.breed)
    .filter((g) => {
      if (!q) return true
      return [g.registered_name, g.barn_name, g.registration_number, g.tattoo_left, g.tattoo_right, g.scrapie_tag]
        .some((field) => normalize(field).includes(q))
    })
    .sort((a, b) => goatName(a).localeCompare(goatName(b)))
}

/** Goats that list this one as sire or dam, youngest first. */
export function offspringOf(goatId: string, goats: Goat[]): Goat[] {
  return goats
    .filter((g) => g.sire_id === goatId || g.dam_id === goatId)
    .sort((a, b) => (b.birth_date ?? '').localeCompare(a.birth_date ?? ''))
}
