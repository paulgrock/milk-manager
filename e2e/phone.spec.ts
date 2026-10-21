// Runs in the "phone" project (Pixel 7): pages fit the screen with no sideways scrolling.
import { expect, test } from './fixtures.ts'
import { addDoeInMilk, addMilkCurve } from './seed.ts'

test('main pages fit a phone screen', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover', 60)
  await addMilkCurve(herd.id, goat.id, 60)

  for (const path of ['/', '/goats', `/goats/${goat.id}`, `/goats/${goat.id}/edit`, '/milk', '/milk/history', '/milk/production', '/settings']) {
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
