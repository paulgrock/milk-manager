import { test as base } from '@playwright/test'
import { admin, createUser, deleteUser, expect, latestCode, signInContext, test } from './fixtures.ts'

base('signs in with an emailed code and creates a herd', async ({ page }) => {
  const email = `newcomer-${crypto.randomUUID().slice(0, 8)}@example.test`
  try {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)

    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByText(`We sent a 6-digit code to ${email}`)).toBeVisible()

    await page.getByLabel('pin input 1 of 6').click()
    await page.keyboard.type(await latestCode(email))
    await expect(page).toHaveURL(/\/welcome/)

    await page.getByLabel('Herd or farm name').fill('Sunny Acres')
    await page.getByRole('button', { name: 'Create herd' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await expect(page.getByText('Owner of Sunny Acres')).toBeVisible()
  } finally {
    const member = await admin.from('herd_members').select('user_id').eq('email', email).maybeSingle()
    if (member.data) await deleteUser({ id: member.data.user_id } as never)
  }
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
