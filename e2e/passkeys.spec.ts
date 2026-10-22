import type { Page } from '@playwright/test'
import { admin, expect, test } from './fixtures.ts'

/** A simulated Face ID / fingerprint device that approves every prompt. */
async function addVirtualAuthenticator(page: Page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })
  return { cdp, authenticatorId }
}

test('add a passkey in Settings, then sign in with it instead of an email code', async ({ page, owner, herd }) => {
  await addVirtualAuthenticator(page)
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Add a passkey on this device' }).click()
  await expect(page.getByText('Passkey added').first()).toBeVisible()
  const passkeyRow = page.getByRole('listitem').filter({ has: page.getByRole('button', { name: /^Remove / }) })
  await expect(passkeyRow).toHaveCount(1)
  await expect(passkeyRow).toContainText(/Added/)

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText(`Owner of ${herd.name}`)).toBeVisible()

  // One passkey on her account, on the server.
  const { data } = await admin.auth.admin.passkey.listPasskeys({ userId: owner.id })
  expect(data).toHaveLength(1)
})

test('rename and remove a passkey', async ({ page, herd }) => {
  void herd // the herd fixture signs the page in
  await addVirtualAuthenticator(page)
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Add a passkey on this device' }).click()
  await expect(page.getByText('Passkey added').first()).toBeVisible()

  await page.getByRole('button', { name: 'Rename' }).click()
  await page.getByLabel('Passkey name').fill('Barn phone')
  await page.getByRole('button', { name: 'Save', exact: true }).last().click()
  await expect(page.getByText('Barn phone')).toBeVisible()

  await page.getByRole('button', { name: 'Remove Barn phone' }).click()
  await expect(page.getByText('Barn phone')).toBeHidden()
})

test('with no passkey on the device, sign-in says to use an email code', async ({ page }) => {
  await addVirtualAuthenticator(page)
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await expect(page.getByText(/Cancelled, or there is no passkey for Milk Manager on this device/)).toBeVisible({ timeout: 20_000 })
  await expect(page).toHaveURL(/\/login/)
})
