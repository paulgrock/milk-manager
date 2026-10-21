// The barn case: milk entered with bad or no signal must never be lost.
import { env } from './env.ts'
import { expect, test } from './fixtures.ts'
import { addDoeInMilk, isoDate, lbToGrams, milkRows } from './seed.ts'

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

  await page.getByLabel('Clover PM').fill('2.9')
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible({ timeout: 20_000 })

  // Close and reopen the app while the server is still unreachable.
  await page.reload()
  await page.getByRole('tab', { name: 'PM' }).click()
  await expect(page.getByLabel('Clover PM')).toHaveValue('2.9')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible()
  expect(await milkRows(goat.id, today)).toEqual([])

  // Signal comes back.
  await context.unroute(apiRoutes)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 40_000 })
    .toEqual([{ milking: 2, weight_g: lbToGrams(2.9), portions_g: null }])
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
  await page.getByLabel('Pepper AM').fill('3.1')
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 weight is saved on this phone')).toBeVisible()
  await expect(page.getByText('They will upload automatically when you have signal.')).toBeVisible()

  await context.setOffline(false)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 30_000 })
    .toEqual([{ milking: 1, weight_g: lbToGrams(3.1), portions_g: null }])
})

test('a correction made offline lands after the original weight, not before', async ({ page, context, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  await page.getByRole('tab', { name: 'AM' }).click()
  await expect(page.getByLabel('Clover AM')).toBeVisible()

  await context.setOffline(true)
  await page.getByLabel('Clover AM').fill('3')
  await page.keyboard.press('Tab')
  await page.getByLabel('Clover AM').fill('3.5')
  await page.keyboard.press('Tab')
  await expect(page.getByText('2 weights are saved on this phone')).toBeVisible()

  await context.setOffline(false)
  await expect
    .poll(() => milkRows(goat.id, today), { timeout: 30_000 })
    .toEqual([{ milking: 1, weight_g: lbToGrams(3.5), portions_g: null }])
})
