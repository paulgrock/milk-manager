import { describe, expect, it } from 'vitest'
import { DEFAULT_TABS, placeTab, sectionsFor, tabPaths } from './nav'

const owner = sectionsFor(true)
const helper = sectionsFor(false)

describe('sectionsFor', () => {
  it('leaves Finances out for helpers', () => {
    expect(owner.map((s) => s.to)).toContain('/finances')
    expect(helper.map((s) => s.to)).not.toContain('/finances')
  })
})

describe('tabPaths', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(tabPaths(null, owner)).toEqual(DEFAULT_TABS)
  })

  it('keeps the saved tabs in their order', () => {
    expect(tabPaths(['/health', '/', '/cheese', '/finances'], owner)).toEqual(['/health', '/', '/cheese', '/finances'])
  })

  it('fills a slot a helper can’t open from the defaults', () => {
    expect(tabPaths(['/finances', '/health', '/', '/milk'], helper)).toEqual(['/health', '/', '/milk', '/goats'])
  })

  it('skips sections that no longer exist, and repeats', () => {
    expect(tabPaths(['/old', '/milk', '/milk'], owner)).toEqual(['/milk', '/', '/goats', '/chores'])
  })

  it('fills from the rest of the list once the defaults are used up', () => {
    expect(tabPaths(['/', '/milk', '/goats', '/old'], owner)).toEqual(['/', '/milk', '/goats', '/chores'])
    expect(tabPaths(['/chores', '/milk', '/goats', '/'], owner)).toEqual(['/chores', '/milk', '/goats', '/'])
  })
})

describe('placeTab', () => {
  it('puts a section in a slot', () => {
    expect(placeTab(['/', '/milk', '/goats', '/chores'], 1, '/health')).toEqual(['/', '/health', '/goats', '/chores'])
  })

  it('swaps when the section is already in another slot', () => {
    expect(placeTab(['/', '/milk', '/goats', '/chores'], 0, '/chores')).toEqual(['/chores', '/milk', '/goats', '/'])
  })
})
