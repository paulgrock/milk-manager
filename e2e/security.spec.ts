import { readFileSync } from 'node:fs'
import { addDoeInMilk } from './seed.ts'
import { expect, test } from './fixtures.ts'
import { env } from './env.ts'

// The live site's Content Security Policy, from netlify.toml, with the hosted
// Supabase address swapped for the local one. Every page must work under it.
const policy = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')
  .match(/Content-Security-Policy = "([^"]+)"/)![1]!
  .replaceAll('https://dofoputbvkufewcglkop.supabase.co', env.apiUrl)
  .replaceAll('wss://dofoputbvkufewcglkop.supabase.co', env.apiUrl.replace(/^http/, 'ws'))

// Serving the page through page.route makes Chrome treat it as public, and
// its local-network protection then blocks calls to the local Supabase stack.
test.use({ launchOptions: { args: ['--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] } })

test('every page works under the Content Security Policy', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Ina')
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const response = await route.fetch()
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy } })
  })
  const blocked: string[] = []
  const iconFetches: string[] = []
  page.on('request', (r) => {
    if (/iconify|simplesvg|unisvg/.test(new URL(r.url()).hostname)) iconFetches.push(r.url())
  })
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) blocked.push(m.text())
  })

  for (const path of ['/', '/goats', `/goats/${goat.slug}`, '/milk', '/cheese', '/milk/production', '/milk/tests', '/breeding', '/health', '/calendar', '/finances', '/settings']) {
    await page.goto(path)
    await expect(page.getByRole('main')).toBeVisible()
    await page.waitForLoadState('networkidle')
  }
  expect(blocked).toEqual([])
  // Icons are built into the app, so they show with no signal: none are fetched.
  expect(iconFetches).toEqual([])
  await expect(page.getByRole('navigation').locator('svg').first()).toBeVisible()
})
