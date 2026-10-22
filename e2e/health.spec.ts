import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, isoDate } from './seed.ts'

const shown = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function careTypeId(herdId: string, name: string) {
  const { data } = await admin.from('care_types').select('id').eq('herd_id', herdId).eq('name', name).single()
  return data!.id
}

test('a new herd has the usual routine, and care can be logged for everyone at once', async ({ page, owner, herd }) => {
  for (const barn_name of ['Ina', 'Clover']) await addGoat(owner, herd.id, { barn_name, sex: 'doe' })
  await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })

  await page.goto('/health')
  await expect(page.getByText('Never recorded for 3: Clover, Ina, Rex').first()).toBeVisible()
  for (const name of ['Hoof trim', 'Replamin Gel Plus', 'Copper bolus', 'CDT vaccine', "CAE, CL, OPP & Johne's test"]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Log care' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log care' })
  await dialog.getByRole('button', { name: 'Everyone' }).click()
  await dialog.getByRole('button', { name: 'Log for 3' }).click()
  await expect(page.getByText('Hoof trim logged for 3 goats').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hoof trim', exact: true })).toBeHidden()

  await expect
    .poll(async () => (await admin.from('care_events').select('id').eq('herd_id', herd.id).eq('done_on', isoDate())).data?.length)
    .toBe(3)
})

test('overdue care shows up and can be logged for just the goats that are due', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  const clover = await addGoat(owner, herd.id, { barn_name: 'Clover', sex: 'doe' })
  const hoof = await careTypeId(herd.id, 'Hoof trim')
  await admin.from('care_events').insert([
    { herd_id: herd.id, goat_id: ina.id, care_type_id: hoof, done_on: isoDate(-60) },
    { herd_id: herd.id, goat_id: clover.id, care_type_id: hoof, done_on: isoDate(-10) },
  ])

  await page.goto('/health')
  await expect(page.getByText('Ina · 4 days overdue')).toBeVisible()
  await expect(page.getByText(/Clover ·/)).toBeHidden()
  await page.getByRole('button', { name: 'Log for these 1' }).click()
  await expect(page.getByRole('dialog').getByRole('checkbox', { name: 'Ina' })).toBeChecked()
  await expect(page.getByRole('dialog').getByRole('checkbox', { name: 'Clover' })).not.toBeChecked()
  await page.getByRole('dialog').getByRole('button', { name: 'Log for 1' }).click()
  await expect(page.getByText('Ina · 4 days overdue')).toBeHidden()
})

test('a copper bolus records its dose and shows on the goat', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)
  await page.getByRole('button', { name: 'Log care' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log care' })
  await dialog.getByRole('combobox', { name: 'What was done' }).click()
  await page.getByRole('option', { name: 'Copper bolus' }).click()
  await dialog.getByLabel('Dose (g)').fill('4')
  await dialog.getByRole('button', { name: 'Log for 1' }).click()
  await expect(page.getByText('Copper bolus · 4 g')).toBeVisible()
  await expect(page.getByText(`Last ${shown(isoDate())} · next in 180 days`)).toBeVisible()
})

test('a treatment withholds her milk: banner on her page, badge on milk entry, withheld total', async ({ page, owner, herd }) => {
  const { goat: ina } = await addDoeInMilk(owner, herd.id, 'Ina')
  const through = isoDate(10)

  await page.goto(`/goats/${ina.id}`)
  await page.getByRole('button', { name: 'Treatment' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add treatment' })
  await dialog.getByLabel('Medication').fill('Penicillin')
  await dialog.getByLabel('For').fill('Mastitis')
  await dialog.getByLabel('Dose', { exact: true }).fill('5 ml')
  await dialog.getByLabel('Lot #').fill('LOT-42')
  await dialog.getByRole('spinbutton', { name: 'Milk withdrawal (days)' }).fill('10')
  await page.keyboard.press('Tab')
  await expect(dialog.getByText(`Withhold milk through ${shown(through)}`)).toBeVisible()
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText(`Milk withheld through ${shown(through)}`).first()).toBeVisible()
  await expect(page.getByText('Penicillin for Mastitis')).toBeVisible()

  await page.goto('/milk')
  await expect(page.getByText(`Withhold · through ${shown(through)}`)).toBeVisible()
  await page.getByRole('tab', { name: 'AM' }).click()
  await page.getByLabel('Ina AM').fill('48')
  await page.keyboard.press('Tab')
  await expect(page.getByText('Withheld', { exact: true })).toBeVisible()
  await expect(page.getByText('3 lb').last()).toBeVisible()

  await page.goto('/health')
  await expect(page.getByRole('link', { name: new RegExp(`Ina.*Penicillin.*${shown(through)}`) })).toBeVisible()

  const saved = await admin.from('treatments').select('medication, reason, dose, lot_number, milk_withdrawal_days').eq('goat_id', ina.id).single()
  expect(saved.data).toEqual({ medication: 'Penicillin', reason: 'Mastitis', dose: '5 ml', lot_number: 'LOT-42', milk_withdrawal_days: 10 })
})

test('disease testing is logged as routine care, due again in a year', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByRole('button', { name: 'Check', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Test', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Log care' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log care' })
  await dialog.getByRole('combobox', { name: 'What was done' }).click()
  await page.getByRole('option', { name: "CAE, CL, OPP & Johne's test" }).click()
  await dialog.getByLabel('Notes').fill('All negative, WADDL')
  await dialog.getByRole('button', { name: 'Log for 1' }).click()
  await expect(page.getByText("CAE, CL, OPP & Johne's test · All negative, WADDL")).toBeVisible()
  await expect(page.getByText(`Last ${shown(isoDate())} · next in 365 days`)).toBeVisible()

  await page.goto('/health')
  await expect(page.getByRole('button', { name: 'Health check' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Recent tests' })).toHaveCount(0)
})

test('owners set the care routine; helpers only see it', async ({ page, browser, herd }) => {
  await page.goto('/health')
  await page.getByPlaceholder('Deworming, BoSe…').fill('Deworming')
  await page.getByRole('spinbutton', { name: 'Every (days)' }).fill('30')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByText('Deworming', { exact: true })).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Hoof trim every how many days' }).fill('42')
  await page.getByRole('spinbutton', { name: 'Hoof trim every how many days' }).blur()
  await expect.poll(async () => (await admin.from('care_types').select('interval_days').eq('herd_id', herd.id).eq('name', 'Hoof trim').single()).data?.interval_days).toBe(42)

  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const helperPage = await ctx.newPage()
    await helperPage.goto('/health')
    await expect(helperPage.getByText('Only owners can change this.')).toBeVisible()
    await expect(helperPage.getByText('every 42 days')).toBeVisible()
    await expect(helperPage.getByPlaceholder('Deworming, BoSe…')).toHaveCount(0)
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('care logged with no signal is kept on the phone and sent later', async ({ page, context, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByText('Never recorded').first()).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready)

  await context.setOffline(true)
  await page.getByRole('button', { name: 'Log care' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Log for 1' }).click()
  await expect(page.getByText(`Last ${shown(isoDate())} · next in 56 days`)).toBeVisible()

  await page.goto('/health')
  await expect(page.getByText('1 care log is saved on this phone')).toBeVisible()
  await page.reload()
  await expect(page.getByText('1 care log is saved on this phone')).toBeVisible()

  await context.setOffline(false)
  await expect
    .poll(async () => (await admin.from('care_events').select('done_on').eq('goat_id', ina.id)).data, { timeout: 30_000 })
    .toEqual([{ done_on: isoDate() }])
  await expect(page.getByText('saved on this phone')).toBeHidden({ timeout: 10_000 })
})
