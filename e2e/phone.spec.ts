// Runs in the "phone" project (Pixel 7): pages fit the screen with no sideways scrolling.
import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, addMilkCurve, isoDate } from './seed.ts'

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

test('the calendar shows a compact month with a dot per event, and a tap jumps to that day', async ({ page, owner, herd }) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  // Both land on today: a breeding done today, and a hoof trim that's overdue (overdue moves to today).
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: ina.id, buck_id: rex.id, bred_on: isoDate() })
  const { data: hoof } = await admin.from('care_types').select('id').eq('herd_id', herd.id).eq('name', 'Hoof trim').single()
  await admin.from('care_events').insert({ herd_id: herd.id, goat_id: ina.id, care_type_id: hoof!.id, done_on: isoDate(-70) })

  await page.goto('/calendar')
  const month = page.getByRole('group', { name: 'Month' })
  await expect(month).toBeVisible()
  // Only days with something on them can be tapped: one button per day in the list.
  // (How many depends on the date: the breeding also adds a "back in heat?" check 21 days on.)
  const listDays = await page.getByRole('heading', { level: 2 }).count()
  await expect(month.getByRole('button')).toHaveCount(listDays)
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const today = month.getByRole('button', { name: `${todayLabel}, 2 events` })
  await expect(today.locator('span[aria-hidden] > span')).toHaveCount(2)
  await expect(today.locator('.bg-warning')).toHaveCount(1)

  await today.click()
  await expect(today).toHaveAttribute('aria-pressed', 'true')
  const section = page.locator('section[data-selected]')
  await expect(section).toContainText(/Hoof trim: Ina/)
  await expect(section).toBeInViewport()
})
