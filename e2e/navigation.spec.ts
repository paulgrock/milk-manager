import { expect, test } from './fixtures.ts'

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

  await sidebar.getByRole('link', { name: 'Health' }).click()
  await expect(page).toHaveURL(/\/health$/)
  await expect(page.getByRole('heading', { name: 'Health' })).toBeVisible()
})
