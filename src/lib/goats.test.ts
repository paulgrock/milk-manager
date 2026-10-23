import { describe, expect, it } from 'vitest'
import {
  ageInYears,
  appraisalSummary,
  buildPedigree,
  filterGoats,
  formatAge,
  goatFullName,
  goatName,
  inHerdOn,
  latestAppraisals,
  offspringOf,
  type Appraisal,
  type Goat,
} from './goats'

let n = 0
function goat(overrides: Partial<Goat>): Goat {
  n += 1
  return {
    id: `g${n}`,
    slug: `g${n}`,
    herd_id: 'h1',
    registered_name: null,
    barn_name: null,
    title_prefix: null,
    title_suffix: null,
    sex: 'doe',
    breed: null,
    breed_category: null,
    birth_date: null,
    color_markings: null,
    horn_status: 'unknown',
    registry: null,
    registration_number: null,
    pedigree_url: null,
    tattoo_left: null,
    tattoo_right: null,
    scrapie_tag: null,
    microchip: null,
    sire_id: null,
    dam_id: null,
    status: 'active',
    left_herd_on: null,
    left_herd_reason: null,
    notes: null,
    created_by: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('names', () => {
  it('prefers the registered name and falls back to the barn name', () => {
    expect(goatName(goat({ registered_name: "Bird's Eye Farm Ina May", barn_name: 'Ina' }))).toBe("Bird's Eye Farm Ina May")
    expect(goatName(goat({ registered_name: '  ', barn_name: 'Ina' }))).toBe('Ina')
  })

  it('wraps the name in titles', () => {
    const g = goat({ title_prefix: 'GCH', registered_name: 'Algedi Farm RB Ocean Flower', title_suffix: '6*M *D' })
    expect(goatFullName(g)).toBe('GCH Algedi Farm RB Ocean Flower 6*M *D')
  })
})

describe('appraisals', () => {
  const base = { general_appearance: 'V', dairy_strength: 'V', body_capacity: 'E', final_score: 88 }

  it('formats a doe appraisal like a pedigree does', () => {
    expect(appraisalSummary({ ...base, mammary_system: 'V' })).toBe('VVEV 88')
  })

  it('leaves out the mammary score for bucks', () => {
    expect(appraisalSummary({ ...base, mammary_system: null })).toBe('VVE 88')
  })

  it('keeps the newest appraisal per goat', () => {
    const a = (goat_id: string, appraised_on: string) => ({ goat_id, appraised_on }) as Appraisal
    const latest = latestAppraisals([a('x', '2021-06-01'), a('x', '2023-06-01'), a('x', '2022-06-01'), a('y', '2020-01-01')])
    expect(latest.get('x')?.appraised_on).toBe('2023-06-01')
    expect(latest.get('y')?.appraised_on).toBe('2020-01-01')
  })
})

describe('age', () => {
  it('reads naturally at each scale', () => {
    expect(formatAge('2019-05-08', '2026-10-21')).toBe('7 yr 5 mo')
    expect(formatAge('2025-10-21', '2026-10-21')).toBe('1 yr')
    expect(formatAge('2026-05-21', '2026-10-21')).toBe('5 mo')
    expect(formatAge('2026-10-09', '2026-10-21')).toBe('12 days')
    expect(formatAge('2026-10-20', '2026-10-21')).toBe('1 day')
  })

  it('does not count a month until the day comes around', () => {
    expect(formatAge('2026-01-31', '2026-02-28')).toBe('28 days')
  })

  it('is blank without a birth date or for future dates', () => {
    expect(formatAge(null, '2026-10-21')).toBe('')
    expect(formatAge('2027-01-01', '2026-10-21')).toBe('')
  })

  it('gives whole years at a date', () => {
    expect(ageInYears('2019-05-08', '2021-05-07')).toBe(1)
    expect(ageInYears('2019-05-08', '2021-05-08')).toBe(2)
  })
})

describe('pedigree', () => {
  const ss = goat({ registered_name: 'Curbstone Valley Sheldon', sex: 'buck' })
  const sd = goat({ registered_name: 'Algedi Farm RB Ocean Flower' })
  const sire = goat({ registered_name: 'Curbstone Valley Tigris', sex: 'buck', sire_id: ss.id, dam_id: sd.id })
  const dam = goat({ registered_name: 'Harley Hillside Dime Piece' })
  const kid = goat({ registered_name: 'Ina May', sire_id: sire.id, dam_id: dam.id })
  const byId = new Map([ss, sd, sire, dam, kid].map((g) => [g.id, g]))

  it('fills in known ancestors and leaves gaps as empty nodes', () => {
    const tree = buildPedigree(kid, byId)
    expect(tree.sire?.goat?.id).toBe(sire.id)
    expect(tree.sire?.sire?.goat?.id).toBe(ss.id)
    expect(tree.sire?.dam?.goat?.id).toBe(sd.id)
    expect(tree.dam?.goat?.id).toBe(dam.id)
    expect(tree.dam?.sire?.goat).toBeNull()
    expect(tree.dam?.dam?.goat).toBeNull()
  })

  it('stops at the requested depth', () => {
    const tree = buildPedigree(kid, byId, 1)
    expect(tree.sire?.goat?.id).toBe(sire.id)
    expect(tree.sire?.sire).toBeNull()
  })

  it('lists offspring youngest first', () => {
    const older = goat({ barn_name: 'Older', dam_id: dam.id, birth_date: '2020-03-01' })
    const younger = goat({ barn_name: 'Younger', dam_id: dam.id, birth_date: '2023-03-01' })
    expect(offspringOf(dam.id, [kid, older, younger, sire]).map((g) => g.barn_name ?? g.registered_name)).toEqual([
      'Younger',
      'Older',
      'Ina May',
    ])
  })
})

describe('filterGoats', () => {
  const goats = [
    goat({ registered_name: 'Zinnia', sex: 'doe', breed: 'Nigerian Dwarf', tattoo_left: 'BEF', tattoo_right: 'S12' }),
    goat({ registered_name: 'Apollo', sex: 'buck', breed: 'Nigerian Dwarf' }),
    goat({ barn_name: 'Old Sally', sex: 'doe', breed: 'LaMancha', status: 'sold' }),
  ]
  const none = { search: '', statuses: [], sex: null, breed: null }

  it('sorts by name', () => {
    expect(filterGoats(goats, none).map(goatName)).toEqual(['Apollo', 'Old Sally', 'Zinnia'])
  })

  it('filters by status, sex and breed', () => {
    expect(filterGoats(goats, { ...none, statuses: ['active'] }).map(goatName)).toEqual(['Apollo', 'Zinnia'])
    expect(filterGoats(goats, { ...none, sex: 'doe' }).map(goatName)).toEqual(['Old Sally', 'Zinnia'])
    expect(filterGoats(goats, { ...none, breed: 'LaMancha' }).map(goatName)).toEqual(['Old Sally'])
  })

  it('searches names and tattoos, ignoring case and extra spaces', () => {
    expect(filterGoats(goats, { ...none, search: 's12' }).map(goatName)).toEqual(['Zinnia'])
    expect(filterGoats(goats, { ...none, search: ' old   sally ' }).map(goatName)).toEqual(['Old Sally'])
  })
})

describe('inHerdOn', () => {
  it('keeps a goat on days up to and including the day she left', () => {
    const chimi = goat({ status: 'deceased', left_herd_on: '2025-05-01' })
    expect(inHerdOn(chimi, '2025-04-30')).toBe(true)
    expect(inHerdOn(chimi, '2025-05-01')).toBe(true)
    expect(inHerdOn(chimi, '2025-05-02')).toBe(false)
  })

  it('treats a goat sold with no date as gone, and outside goats as never in the herd', () => {
    expect(inHerdOn(goat({ status: 'sold' }), '2020-01-01')).toBe(false)
    expect(inHerdOn(goat({ status: 'reference' }), '2026-01-01')).toBe(false)
    expect(inHerdOn(goat({ status: 'for_sale' }), '2026-01-01')).toBe(true)
  })
})
