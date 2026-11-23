// Runs in the "phone" project (Pixel 7): pages fit the screen with no sideways scrolling.
import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, addMilkCurve, isoDate } from './seed.ts'

test('main pages fit a phone screen', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover', 60)
  await addMilkCurve(herd.id, goat.id, 60)
  const { data: feta } = await admin
    .from('cheese_types')
    .select('id')
    .eq('herd_id', herd.id)
    .eq('name', 'Feta')
    .single()
  const { data: make } = await admin
    .from('cheese_makes')
    .insert({
      herd_id: herd.id,
      cheese_type_id: feta!.id,
      made_on: isoDate(-2),
      ready_on: isoDate(58),
      milk_gallons: 3,
      notes: 'A long note about the brine and the salt that should wrap on a small screen',
    })
    .select('id')
    .single()

  for (const path of [
    '/',
    '/goats',
    `/goats/${goat.id}`,
    `/goats/${goat.id}/edit`,
    '/milk',
    '/milk/history',
    '/milk/production',
    '/cheese',
    `/cheese/types/${feta!.id}`,
    `/cheese/makes/${make!.id}`,
    '/breeding/adoptions',
    '/breeding',
    `/breeding/kidding?doe=${goat.id}`,
    '/health',
    '/chores',
    '/milk/tests',
    '/milk/tests/new',
    '/calendar',
    '/finances',
    '/settings',
  ]) {
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

test('the calendar shows a compact month with a dot per event, and a tap jumps to that day', async ({
  page,
  owner,
  herd,
}) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  // Both land on today: a breeding done today, and a hoof trim that's overdue (overdue moves to today).
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: ina.id, buck_id: rex.id, bred_on: isoDate() })
  const { data: hoof } = await admin
    .from('care_types')
    .select('id')
    .eq('herd_id', herd.id)
    .eq('name', 'Hoof trim')
    .single()
  await admin
    .from('care_events')
    .insert({ herd_id: herd.id, goat_id: ina.id, care_type_id: hoof!.id, done_on: isoDate(-70) })

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

test('the tab bar keeps the daily sections a tap away and the rest under More', async ({ page, herd }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toContainText(herd.name)
  const tabs = page.getByRole('navigation', { name: 'Main' })
  for (const name of ['Today', 'Milk', 'Goats', 'Chores']) await expect(tabs.getByRole('link', { name })).toBeVisible()
  await expect(tabs.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page')
  await expect(tabs.getByRole('link', { name: 'Health' })).toHaveCount(0)
  // Tinted so it stands apart from the page.
  const bg = (el: Element) => getComputedStyle(el).backgroundColor
  expect(await tabs.evaluate(bg)).not.toBe(await page.locator('body').evaluate(bg))

  const z = (el: Element) => Number(getComputedStyle(el).zIndex) || 0
  const tabsZ = await tabs.evaluate(z)

  await tabs.getByRole('button', { name: 'More' }).click()
  const more = page.getByRole('navigation', { name: 'More' })
  for (const name of ['Cheese', 'Breeding', 'Health', 'Calendar', 'Finances', 'Settings'])
    await expect(more.getByRole('link', { name })).toBeVisible()
  // The sheet is drawn over the tab bar, so its last item (Settings) isn't hidden behind it.
  const sheetZ = await page.getByRole('dialog').evaluate(z)
  expect(sheetZ).toBeGreaterThan(tabsZ)

  await more.getByRole('link', { name: 'Health' }).click()
  await expect(page).toHaveURL(/\/health$/)
  await expect(more).toBeHidden()
  await expect(tabs.getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current', 'page')

  // The tab bar stays put while the page scrolls under it.
  await expect(tabs).toBeInViewport()
  const box = (await tabs.boundingBox())!
  expect(box.y + box.height).toBeCloseTo(page.viewportSize()!.height, 0)
})

test('helpers don’t see Finances under More', async ({ browser, herd }) => {
  const helper = await createUser('helper')
  try {
    await admin
      .from('herd_members')
      .insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext({ ...test.info().project.use })
    await signInContext(ctx, helper)
    const page = await ctx.newPage()
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'More' }).click()
    const more = page.getByRole('navigation', { name: 'More' })
    await expect(more.getByRole('link', { name: 'Calendar' })).toBeVisible()
    await expect(more.getByRole('link', { name: 'Finances' })).toHaveCount(0)
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('people pick their own tabs in Settings, and keep them on another device', async ({
  page,
  browser,
  owner,
  herd,
}) => {
  await page.goto('/settings')
  await expect(page.getByRole('banner')).toContainText(herd.name)
  const tabs = page.getByRole('navigation', { name: 'Main' })
  const card = page.getByRole('region', { name: 'Tab bar' })

  // Health in the second slot, where Milk was.
  await card.getByRole('combobox', { name: 'Tab 2' }).click()
  await page.getByRole('option', { name: 'Health' }).click()
  await expect(tabs.getByRole('link', { name: 'Health' })).toBeVisible()
  await expect(tabs.getByRole('link', { name: 'Milk' })).toHaveCount(0)

  // Picking one that's already a tab swaps the two.
  await card.getByRole('combobox', { name: 'Tab 1' }).click()
  await page.getByRole('option', { name: 'Chores' }).click()
  await expect(tabs.getByRole('link')).toHaveText(['Chores', 'Health', 'Goats', 'Today'])

  // Milk moved under More.
  await tabs.getByRole('button', { name: 'More' }).click()
  await expect(page.getByRole('navigation', { name: 'More' }).getByRole('link', { name: 'Milk' })).toBeVisible()
  await page.keyboard.press('Escape')

  // Saved to their account, so it's the same after a reload and on another phone.
  await expect
    .poll(async () => (await admin.from('user_preferences').select('nav_tabs').eq('user_id', owner.id).single()).data)
    .toEqual({ nav_tabs: ['/chores', '/health', '/goats', '/'] })
  const ctx = await browser.newContext({ ...test.info().project.use })
  await signInContext(ctx, owner)
  const other = await ctx.newPage()
  await other.goto('/')
  await expect(other.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveText([
    'Chores',
    'Health',
    'Goats',
    'Today',
  ])
  await ctx.close()

  await card.getByRole('button', { name: 'Back to the usual tabs' }).click()
  await expect(tabs.getByRole('link')).toHaveText(['Today', 'Milk', 'Goats', 'Chores'])
  await expect(card.getByRole('button', { name: 'Back to the usual tabs' })).toHaveCount(0)
})

test('a helper who picked Finances in another herd gets a usual tab in its place', async ({ browser, herd }) => {
  const helper = await createUser('helper')
  try {
    await admin
      .from('herd_members')
      .insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    await admin
      .from('user_preferences')
      .insert({ user_id: helper.id, nav_tabs: ['/finances', '/health', '/', '/milk'] })
    const ctx = await browser.newContext({ ...test.info().project.use })
    await signInContext(ctx, helper)
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveText([
      'Health',
      'Today',
      'Milk',
      'Goats',
    ])
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('the milk totals sit just above the tab bar', async ({ page, owner, herd }) => {
  await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  const totals = page.getByText('Day total').locator('xpath=ancestor::div[contains(@class,"fixed")]')
  const tabs = page.getByRole('navigation', { name: 'Main' })
  await expect(totals).toBeVisible()
  const t = (await totals.boundingBox())!
  const n = (await tabs.boundingBox())!
  expect(t.y + t.height).toBeCloseTo(n.y, 0)
})
