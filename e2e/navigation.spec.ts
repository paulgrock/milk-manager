import { expect, test } from './fixtures.ts'
import { addDoeInMilk } from './seed.ts'

test('a wide screen lists every section in a sidebar, with no tab bar', async ({ page, herd }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toContainText(herd.name)
  const sidebar = page.getByRole('navigation', { name: 'Main' })
  await expect(sidebar).toHaveCount(1)
  for (const name of [
    'Today',
    'Goats',
    'Milk',
    'Cheese',
    'Breeding',
    'Health',
    'Chores',
    'Calendar',
    'Finances',
    'Settings',
  ])
    await expect(sidebar.getByRole('link', { name })).toBeVisible()
  await expect(page.getByRole('button', { name: 'More' })).toHaveCount(0)

  // The sidebar sits beside the page, not above it.
  const nav = (await sidebar.boundingBox())!
  const main = (await page.getByRole('main').boundingBox())!
  expect(nav.x + nav.width).toBeLessThanOrEqual(main.x)

  // Tinted so it stands apart from the page, and runs the full height of the window below the header.
  const bg = (el: Element) => getComputedStyle(el).backgroundColor
  const panel = page.locator('aside')
  expect(await panel.evaluate(bg)).not.toBe(await page.locator('body').evaluate(bg))
  const p = (await panel.boundingBox())!
  const header = (await page.getByRole('banner').boundingBox())!
  expect(p.y + p.height).toBeCloseTo(page.viewportSize()!.height, 0)
  expect(p.y).toBeCloseTo(header.y + header.height, 0)

  await sidebar.getByRole('link', { name: 'Health' }).click()
  await expect(page).toHaveURL(/\/health$/)
  await expect(page.getByRole('heading', { name: 'Health' })).toBeVisible()
})

test('the milk totals start where the sidebar ends', async ({ page, owner, herd }) => {
  await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  const totals = page.getByText('Day total').locator('xpath=ancestor::div[contains(@class,"fixed")]')
  await expect(totals).toBeVisible()
  const t = (await totals.boundingBox())!
  const a = (await page.locator('aside').boundingBox())!
  expect(t.x).toBeCloseTo(a.x + a.width, 0)
})
