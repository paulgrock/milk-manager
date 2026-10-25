// The barn case: milk entered with bad or no signal must never be lost.
import { env } from './env.ts'
import { expect, test } from './fixtures.ts'
import { addDoeInMilk, isoDate, milkRows, ozToGrams } from './seed.ts'

const today = isoDate()
const apiRoutes = `${env.apiUrl}/**`

/** Waits until the app has written its cache to the device (writes are throttled to 1s). */
async function waitForSavedCache(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const open = indexedDB.open('keyval-store')
            open.onsuccess = () => {
              const get = open.result.transaction('keyval').objectStore('keyval').get('milk-manager-cache')
              get.onsuccess = () => resolve(get.result ? JSON.parse(get.result).clientState.queries.length : 0)
              get.onerror = () => resolve(0)
            }
            open.onerror = () => resolve(0)
          }),
      ),
    )
    .toBeGreaterThan(3)
}

test('weak signal: a save that keeps failing survives a reload and uploads later', async ({ page, context, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  await page.getByRole('tab', { name: 'PM' }).click()
  await expect(page.getByLabel('Clover PM')).toBeVisible()
  await waitForSavedCache(page)

  // The phone says it's online, but every request to the server fails.
  await context.route(apiRoutes, (route) => route.abort('internetdisconnected'))

  await page.getByLabel('Clover PM').fill('46')
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible({ timeout: 20_000 })

  // Close and reopen the app while the server is still unreachable.
  await page.reload()
  await page.getByRole('tab', { name: 'PM' }).click()
  await expect(page.getByLabel('Clover PM')).toHaveValue('46')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible()
  expect(await milkRows(goat.id, today)).toEqual([])

  // Signal comes back.
  await context.unroute(apiRoutes)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 40_000 })
    .toEqual([{ milking: 2, weight_g: ozToGrams(46), portions_g: null }])
  await expect(page.getByText('saved on this phone')).toBeHidden({ timeout: 10_000 })
})

test('no signal at all: the app opens from the device, queues the weight, and sends it on reconnect', async ({
  page,
  context,
  owner,
  herd,
}) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Pepper')
  await page.goto('/milk')
  await expect(page.getByLabel(/Pepper/)).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready)
  await waitForSavedCache(page)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('Offline')).toBeVisible()
  await page.getByRole('tab', { name: 'AM' }).click()
  // The milk line comes from the cache saved on the device.
  await page.getByLabel('Pepper AM').fill('50')
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible()
  await expect(page.getByText('They will upload automatically when you have signal.')).toBeVisible()

  await context.setOffline(false)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 30_000 })
    .toEqual([{ milking: 1, weight_g: ozToGrams(50), portions_g: null }])
})

test('a correction made offline lands after the original weight, not before', async ({ page, context, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  await page.getByRole('tab', { name: 'AM' }).click()
  await expect(page.getByLabel('Clover AM')).toBeVisible()

  await context.setOffline(true)
  await page.getByLabel('Clover AM').fill('48')
  await page.keyboard.press('Tab')
  await page.getByLabel('Clover AM').fill('56')
  await page.keyboard.press('Tab')
  await expect(page.getByText('2 weights are saved on this phone')).toBeVisible()

  await context.setOffline(false)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 30_000 })
    .toEqual([{ milking: 1, weight_g: ozToGrams(56), portions_g: null }])
})

test('goat photos seen once still show with no signal, and are cleared on sign-out', async ({ page, context, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Ina')
  await page.goto(`/goats/${goat.slug}`)
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 300
    c.getContext('2d')!.fillRect(0, 0, 300, 300)
    return c.toDataURL('image/png').split(',')[1]!
  })
  await page.locator('input[type=file]').setInputFiles({ name: 'ina.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  const shown = (p: typeof page) => p.getByRole('img', { name: 'Ina', exact: true })
  await expect(shown(page)).toBeVisible()
  await page.goto('/milk')
  await expect(shown(page)).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready)
  await waitForSavedCache(page)

  // No signal at all, and the app reopened.
  await context.setOffline(true)
  for (const path of ['/milk', '/goats', `/goats/${goat.slug}`]) {
    await page.goto(path)
    await expect(page.getByText('Offline')).toBeVisible()
    const img = shown(page)
    await expect(img).toBeVisible()
    // The picture actually drew, from the copy saved on the device.
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
    await expect(img).toHaveAttribute('src', /^blob:/)
  }
  // The gallery on her page too.
  await expect(page.getByRole('img', { name: /^Ina, / })).toBeVisible()

  await context.setOffline(false)
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
  expect(await page.evaluate(() => caches.keys())).not.toContain('goat-photos-v1')
})
