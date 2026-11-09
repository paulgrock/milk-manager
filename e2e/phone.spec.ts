// Runs in the "phone" project (Pixel 7): pages fit the screen with no sideways scrolling.
import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addMilkCurve, isoDate } from './seed.ts'

test('main pages fit a phone screen', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover', 60)
  await addMilkCurve(herd.id, goat.id, 60)
  const { data: feta } = await admin.from('cheese_types').select('id').eq('herd_id', herd.id).eq('name', 'Feta').single()
  const { data: make } = await admin
    .from('cheese_makes')
    .insert({ herd_id: herd.id, cheese_type_id: feta!.id, made_on: isoDate(-2), ready_on: isoDate(58), milk_gallons: 3, notes: 'A long note about the brine and the salt that should wrap on a small screen' })
    .select('id')
    .single()

  for (const path of ['/', '/goats', `/goats/${goat.id}`, `/goats/${goat.id}/edit`, '/milk', '/milk/history', '/milk/production', '/cheese', `/cheese/types/${feta!.id}`, `/cheese/makes/${make!.id}`, '/breeding/adoptions', '/breeding', `/breeding/kidding?doe=${goat.id}`, '/health', '/chores', '/milk/tests', '/milk/tests/new', '/calendar', '/finances', '/settings']) {
    await page.goto(path)
    await expect(page.getByRole('main')).toBeVisible()
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `${path} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0)
  }
})

test('milk entry boxes open the number keypad', async ({ page, owner, herd }) => {
  await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  await expect(page.getByLabel(/^Clover /)).toHaveAttribute('inputmode', 'decimal')
})
