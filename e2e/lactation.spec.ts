import { expect, test } from './fixtures.ts'
import { addDoeInMilk, addMilkCurve } from './seed.ts'

test('a doe page shows her lactation curve, a projected 305-day total and comparisons', async ({ page, owner, herd }) => {
  const { goat: ina } = await addDoeInMilk(owner, herd.id, 'Ina', 120)
  await addMilkCurve(herd.id, ina.id, 120, { a: 1150, b: 0.26, c: 0.005 })
  const { goat: clover } = await addDoeInMilk(owner, herd.id, 'Clover', 90)
  await addMilkCurve(herd.id, clover.id, 90, { a: 950, b: 0.28, c: 0.0055 })

  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByRole('heading', { name: 'Lactation curve' })).toBeVisible()

  // The chart actually draws (it once rendered at 0px tall).
  const chart = page.getByRole('img', { name: /^Lactation curve/ })
  await expect(chart.locator('svg path').first()).toBeAttached()
  expect((await chart.boundingBox())!.height).toBeGreaterThan(150)

  const projected = page.locator('div').filter({ has: page.getByText('Projected 305-day', { exact: true }) }).last()
  await expect(projected).toContainText(/\d[\d,]* lb/)
  await expect(projected.getByText('Medium confidence')).toBeVisible()
  await expect(page.getByText('Estimated · to day 119 · DIM 120')).toBeVisible()
  // Weighed daily, so the last week's average shows.
  await expect(page.getByText('Last 7 days', { exact: true })).toBeVisible()
  await expect(page.getByText('6 days weighed')).toBeVisible()

  await page.getByText('Earlier lactations or other does').click()
  await page.getByRole('option', { name: /Clover · L1/ }).click()
  await page.keyboard.press('Escape')
  await expect(chart.getByText('Clover · L1')).toBeVisible()
  await expect(chart.getByText('Lactation 1')).toBeVisible()

  await page.getByRole('button', { name: 'Show as table' }).click()
  const table = page.getByRole('table')
  await expect(table.getByRole('columnheader', { name: /Clover · L1/ })).toBeVisible()
  await expect(table.getByRole('row').filter({ hasText: /^\s*14–20/ })).toBeVisible()
})

test('too few weigh-ins means no projection, with a reason', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Pepper', 8)
  await addMilkCurve(herd.id, goat.id, 8)
  await page.goto(`/goats/${goat.id}`)
  await expect(page.getByText('Needs at least 10 weigh-ins over 3 weeks')).toBeVisible()
})

test('the production page ranks does and totals the herd', async ({ page, owner, herd }) => {
  const { goat: ina } = await addDoeInMilk(owner, herd.id, 'Ina', 100)
  await addMilkCurve(herd.id, ina.id, 100, { a: 1150, b: 0.26, c: 0.005 })
  const { goat: pepper } = await addDoeInMilk(owner, herd.id, 'Pepper', 100)
  await addMilkCurve(herd.id, pepper.id, 100, { a: 800, b: 0.3, c: 0.006 })

  await page.goto('/milk/production')
  await expect(page.getByRole('img', { name: /Herd milk per day/ }).locator('svg path').first()).toBeAttached()
  const ranked = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('link') })
  await expect(ranked).toHaveCount(2)
  await expect(ranked.nth(0)).toContainText('Ina')
  await expect(ranked.nth(1)).toContainText('Pepper')
  await expect(page.getByText('Does in milk', { exact: true }).first()).toBeVisible()
})
