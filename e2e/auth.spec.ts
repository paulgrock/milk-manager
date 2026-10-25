import { test as base } from '@playwright/test'
import { admin, createUser, deleteUser, expect, latestCode, signInContext, test } from './fixtures.ts'

test('an invited newcomer signs in with an emailed code and joins the herd', async ({ browser, herd }) => {
  const email = `newcomer-${crypto.randomUUID().slice(0, 8)}@example.test`
  await admin.from('herd_invites').insert({ herd_id: herd.id, email })
  // A fresh browser: the newcomer, not the owner.
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)

    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByText(`We sent a 6-digit code to ${email}`)).toBeVisible()
    // Locally, emails only reach the Mailpit inbox; the screen says so and links to it.
    await expect(page.getByRole('link', { name: 'Open local inbox' })).toHaveAttribute('href', 'http://127.0.0.1:54324')

    await page.getByLabel('pin input 1 of 6').click()
    await page.keyboard.type(await latestCode(email))
    await expect(page).toHaveURL(/\/welcome/)
    await expect(page.getByText(`You're invited to ${herd.name}`)).toBeVisible()
    await page.getByRole('button', { name: 'Join' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  } finally {
    await context.close()
    const { data } = await admin.auth.admin.listUsers()
    const user = data.users.find((u) => u.email === email)
    if (user) await deleteUser({ id: user.id } as never)
  }
})

base("an email that wasn't invited can't make an account", async ({ page }) => {
  const email = `stranger-${crypto.randomUUID().slice(0, 8)}@example.test`
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await expect(page.getByText("This email hasn't been invited. Ask a herd owner to invite you, then sign in with the same email.")).toBeVisible()
  await expect(page.getByText('We sent a 6-digit code')).toHaveCount(0)
  const { data } = await admin.auth.admin.listUsers()
  expect(data.users.some((u) => u.email === email)).toBe(false)
})

test('an invited helper joins and gets a read-only view of herd settings', async ({ page, browser, herd }) => {
  const helper = await createUser('helper')
  try {
    await page.goto('/settings')
    await page.getByRole('textbox', { name: 'Email' }).fill(helper.email)
    await page.getByRole('button', { name: 'Invite', exact: true }).click()
    await expect(page.getByText(`Ask ${helper.email} to sign in`)).toBeVisible()
    await expect(page.getByText('Helper · pending')).toBeVisible()

    const helperContext = await browser.newContext()
    await signInContext(helperContext, helper)
    const helperPage = await helperContext.newPage()
    await helperPage.goto('/')
    await expect(helperPage).toHaveURL(/\/welcome/)
    await expect(helperPage.getByText(`You're invited to ${herd.name}`)).toBeVisible()
    await helperPage.getByRole('button', { name: 'Join' }).click()
    await expect(helperPage).toHaveURL(/\/$/)
    await expect(helperPage.getByText(`Helper of ${herd.name}`)).toBeVisible()

    await helperPage.goto('/settings')
    await expect(helperPage.getByLabel('Herd or farm name')).toBeDisabled()
    await expect(helperPage.getByText('Only owners can change herd details.')).toBeVisible()
    await expect(helperPage.getByRole('button', { name: 'Invite', exact: true })).toHaveCount(0)

    const role = await admin.from('herd_members').select('role').eq('herd_id', herd.id).eq('user_id', helper.id).single()
    expect(role.data?.role).toBe('helper')
    await helperContext.close()
  } finally {
    await deleteUser(helper)
  }
})

test('owner renames the herd and switches milk units', async ({ page, herd }) => {
  await page.goto('/settings')
  await page.getByLabel('Herd or farm name').fill(`${herd.name} Renamed`)
  await page.getByRole('combobox', { name: 'Milk weight unit' }).click()
  await page.getByRole('option', { name: 'Kilograms (kg)' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Herd saved').first()).toBeVisible()
  await expect(page.getByRole('banner').getByText(`${herd.name} Renamed`)).toBeVisible()

  const saved = await admin.from('herds').select('name, weight_unit').eq('id', herd.id).single()
  expect(saved.data).toEqual({ name: `${herd.name} Renamed`, weight_unit: 'kg' })
})

base('someone with an account and no herd yet can start one', async ({ browser }) => {
  const user = await createUser('founder')
  const context = await browser.newContext()
  try {
    await signInContext(context, user)
    const page = await context.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/welcome/)
    await page.getByLabel('Herd or farm name').fill('Sunny Acres')
    await page.getByRole('button', { name: 'Create herd' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Owner of Sunny Acres')).toBeVisible()
  } finally {
    await context.close()
    await deleteUser(user)
  }
})

test('an owner sets a herd logo for the header, and can remove it', async ({ page, browser, herd }) => {
  await page.goto('/settings')
  const header = page.locator('header img')
  await expect(header).toHaveAttribute('src', '/favicon.svg')

  // A wide picture: it's fitted inside the square.
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = 600
    c.height = 300
    const g = c.getContext('2d')!
    g.fillStyle = '#1d4ed8'
    g.fillRect(0, 0, 600, 300)
    return c.toDataURL('image/png').split(',')[1]!
  })
  await page.getByLabel('Logo file').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await expect(page.getByText('Logo updated').first()).toBeVisible()
  const logo = page.getByRole('banner').getByRole('img', { name: `${herd.name} logo` })
  await expect(logo).toHaveAttribute('src', /^data:image\/png;base64,/)
  expect(await logo.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight])).toEqual([192, 192])

  // Helpers see it but can't change it.
  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const helperPage = await ctx.newPage()
    await helperPage.goto('/settings')
    await expect(helperPage.getByRole('banner').getByRole('img', { name: `${herd.name} logo` })).toBeVisible()
    await expect(helperPage.getByRole('button', { name: 'Change' })).toHaveCount(0)
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }

  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByText('Logo removed').first()).toBeVisible()
  await expect(header).toHaveAttribute('src', '/favicon.svg')
})

test('an SVG logo works too: empty margins trimmed, then fitted whole rather than cropped', async ({ page, herd }) => {
  await page.goto('/settings')
  // Portrait, with a viewBox but no width or height and empty space around the
  // drawing (like most exported logos): purple at the top, green at the bottom.
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect x="100" y="100" width="600" height="400" fill="#7c3aed"/><rect x="100" y="500" width="600" height="400" fill="#16a34a"/></svg>'
  await page.getByLabel('Logo file').setInputFiles({ name: 'logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  await expect(page.getByText('Logo updated').first()).toBeVisible()
  const logo = page.getByRole('banner').getByRole('img', { name: `${herd.name} logo` })
  await expect(logo).toHaveAttribute('src', /^data:image\/png;base64,/)

  const pixels = await logo.evaluate(async (img: HTMLImageElement) => {
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0)
    const at = (x: number, y: number) => [...g.getImageData(x, y, 1, 1).data]
    return { size: [c.width, c.height], side: at(2, 96), top: at(96, 4), bottom: at(96, 188) }
  })
  expect(pixels.size).toEqual([192, 192])
  expect(pixels.side[3]).toBe(0) // see-through either side of a tall logo
  // The empty margins are gone: the drawing reaches the top and bottom edges.
  expect(pixels.top.slice(0, 3)).toEqual([124, 58, 237]) // the top of the drawing is kept…
  expect(pixels.bottom.slice(0, 3)).toEqual([22, 163, 74]) // …and the bottom
})
