import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { isoDate } from './seed.ts'

async function choreId(herdId: string, name: string) {
  const { data } = await admin.from('chores').select('id').eq('herd_id', herdId).eq('name', name).single()
  return data!.id
}
async function doneOn(herdId: string) {
  const { data } = await admin.from('chores_done').select('done_on, notes, chores(name)').eq('herd_id', herdId).order('done_on')
  return data ?? []
}
async function displayName(herdId: string, userId: string) {
  const { data } = await admin.from('herd_members').select('display_name').eq('herd_id', herdId).eq('user_id', userId).single()
  return data!.display_name
}
const row = (page: import('@playwright/test').Page, name: string) => page.getByRole('listitem').filter({ has: page.getByRole('button', { name: new RegExp(`^${name}`) }) })

test('a new herd starts with the farm’s chores, not recorded yet and off Today', async ({ page, herd }) => {
  await page.goto('/chores')
  for (const name of ['Clean milking equipment', 'Fill waterers', 'Refill mineral feeder', 'Clean stalls', 'Clean coop']) {
    await expect(row(page, name)).toContainText('Not recorded yet')
  }
  await expect(row(page, 'Fill waterers')).toContainText('every other week')

  await page.goto('/')
  await expect(page.getByText('Nothing overdue. Nice.')).toBeVisible()
  await expect(page.getByRole('link', { name: /Clean coop/ })).toHaveCount(0)
  expect(await doneOn(herd.id)).toEqual([])
})

test('one tap marks a chore done today, with who did it, and can be undone', async ({ page, owner, herd }) => {
  await page.goto('/chores')
  const equipment = row(page, 'Clean milking equipment')
  await equipment.getByRole('button', { name: 'Done today' }).click()
  const who = await displayName(herd.id, owner.id)
  await expect(equipment).toContainText(`Last done today by ${who} · every week`)
  await expect(equipment).toContainText('Due in 7 days')
  await expect(equipment.getByRole('button', { name: 'Done', exact: true })).toBeDisabled()
  await expect.poll(() => doneOn(herd.id)).toEqual([{ done_on: isoDate(), notes: null, chores: { name: 'Clean milking equipment' } }])

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(equipment).toContainText('Not recorded yet')
  await expect.poll(() => doneOn(herd.id)).toEqual([])
})

test('overdue chores show on Today and on the calendar; doing them clears Today', async ({ page, herd }) => {
  await admin.from('chores_done').insert([
    { herd_id: herd.id, chore_id: await choreId(herd.id, 'Fill waterers'), done_on: isoDate(-20) },
    // Every 30 days, due in 5: due soon (within 7 days).
    { herd_id: herd.id, chore_id: await choreId(herd.id, 'Clean stalls'), done_on: isoDate(-25) },
    // Every 14 days, due in 5: not due soon yet (that's 3 days ahead).
    { herd_id: herd.id, chore_id: await choreId(herd.id, 'Refill mineral feeder'), done_on: isoDate(-9) },
  ])

  await page.goto('/chores')
  await expect(row(page, 'Fill waterers')).toContainText('6 days overdue')
  await expect(row(page, 'Clean stalls')).toContainText('Due in 5 days')
  await expect(row(page, 'Refill mineral feeder')).toContainText('Due in 5 days')
  // Most pressing first.
  await expect(page.getByRole('main').getByRole('listitem').first()).toContainText('Fill waterers')

  await page.goto('/')
  const attention = page.getByRole('main').locator('section, div').filter({ has: page.getByRole('heading', { name: 'Needs attention' }) }).first()
  await expect(attention.getByRole('link', { name: /Fill waterers.*Overdue/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Clean stalls' })).toBeVisible()

  await page.goto('/calendar')
  await expect(page.getByRole('link', { name: /Fill waterers.*Overdue/ })).toBeVisible()
  await page.getByRole('button', { name: 'Chores' }).click()
  await expect(page.getByRole('link', { name: /Fill waterers/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Chores' }).click()

  await page.getByRole('link', { name: /Fill waterers.*Overdue/ }).click()
  await expect(page).toHaveURL(/\/chores$/)
  await row(page, 'Fill waterers').getByRole('button', { name: 'Done today' }).click()
  await expect(row(page, 'Fill waterers')).toContainText('Due in 14 days')
  await expect.poll(async () => (await doneOn(herd.id)).filter((d) => d.done_on === isoDate()).length).toBe(1)
  await page.getByRole('link', { name: 'Today' }).click()
  await expect(page.getByText('Nothing overdue. Nice.')).toBeVisible()
})

test('a past date and a note can be entered, and shows in the history', async ({ page, owner, herd }) => {
  await page.goto('/chores')
  await row(page, 'Clean coop').getByRole('button', { name: 'Enter last done' }).click()
  const dialog = page.getByRole('dialog', { name: 'Clean coop' })
  await expect(dialog.getByText('Not recorded yet.')).toBeVisible()
  await dialog.getByLabel('Done on').fill(isoDate(-10))
  await dialog.getByLabel('Notes').fill('New shavings')
  await dialog.getByRole('button', { name: 'Mark done' }).click()
  await expect(dialog).toBeHidden()
  await expect(row(page, 'Clean coop')).toContainText('Due in 20 days')

  await row(page, 'Clean coop').getByRole('button', { name: /^Clean coop/ }).click()
  await expect(dialog.getByText('New shavings')).toBeVisible()
  await expect(dialog.getByText(await displayName(herd.id, owner.id))).toBeVisible()
  expect(await doneOn(herd.id)).toEqual([{ done_on: isoDate(-10), notes: 'New shavings', chores: { name: 'Clean coop' } }])

  await dialog.getByRole('button', { name: /^Delete/ }).click()
  await expect(dialog.getByText('Not recorded yet.')).toBeVisible()
  await expect.poll(() => doneOn(herd.id)).toEqual([])
})

test('owners rename, change and hide chores; helpers can add and mark done', async ({ page, browser, herd }) => {
  await page.goto('/chores')
  await page.getByRole('spinbutton', { name: 'Clean coop every how many days' }).fill('21')
  await page.getByRole('spinbutton', { name: 'Clean coop every how many days' }).blur()
  await expect.poll(async () => (await admin.from('chores').select('interval_days').eq('herd_id', herd.id).eq('name', 'Clean coop').single()).data?.interval_days).toBe(21)
  await page.getByLabel('Clean stalls name').fill('Muck out stalls')
  await page.getByLabel('Clean stalls name').blur()
  await expect(row(page, 'Muck out stalls')).toBeVisible()
  await page.getByRole('listitem').filter({ has: page.getByLabel('Refill mineral feeder name') }).getByRole('button', { name: 'Hide' }).click()
  await expect(row(page, 'Refill mineral feeder')).toHaveCount(0)

  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'Sam', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const helperPage = await ctx.newPage()
    await helperPage.goto('/chores')
    await expect(helperPage.getByText('Only owners can rename, change or hide these.')).toBeVisible()
    await expect(helperPage.getByText('every 3 weeks', { exact: true })).toBeVisible()
    await expect(helperPage.getByLabel('Clean coop name')).toHaveCount(0)

    await helperPage.getByPlaceholder('Check fences, spread manure…').fill('Check fences')
    await helperPage.getByRole('spinbutton', { name: 'Every (days)' }).fill('30')
    await helperPage.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(row(helperPage, 'Check fences')).toContainText('Not recorded yet')
    await row(helperPage, 'Check fences').getByRole('button', { name: 'Done today' }).click()
    await expect(row(helperPage, 'Check fences')).toContainText('Last done today by Sam')
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('a chore marked done with no signal is kept on the phone and sent later', async ({ page, context, herd }) => {
  await page.goto('/chores')
  await expect(row(page, 'Fill waterers')).toContainText('Not recorded yet')
  await page.evaluate(() => navigator.serviceWorker.ready)

  await context.setOffline(true)
  await row(page, 'Fill waterers').getByRole('button', { name: 'Done today' }).click()
  await expect(row(page, 'Fill waterers')).toContainText('Due in 14 days')
  await expect(page.getByText('1 chore is saved on this phone')).toBeVisible()
  await page.reload()
  await expect(page.getByText('1 chore is saved on this phone')).toBeVisible()
  await expect(row(page, 'Fill waterers')).toContainText('Due in 14 days')

  await context.setOffline(false)
  await expect
    .poll(() => doneOn(herd.id), { timeout: 30_000 })
    .toEqual([{ done_on: isoDate(), notes: null, chores: { name: 'Fill waterers' } }])
  await expect(page.getByText('saved on this phone')).toBeHidden({ timeout: 10_000 })
})
