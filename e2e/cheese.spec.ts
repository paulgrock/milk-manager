import { addMonths } from '../src/lib/dates.ts'
import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { isoDate } from './seed.ts'

const lbToGrams = (lb: number) => Math.round(lb * 453.59237)

async function typeId(herdId: string, name: string) {
  const { data } = await admin.from('cheese_types').select('id').eq('herd_id', herdId).eq('name', name).single()
  return data!.id
}
async function makes(herdId: string) {
  const { data } = await admin
    .from('cheese_makes')
    .select('made_on, ready_on, milk_gallons, pieces, cheese_weight_g, notes, finished_on, cheese_types(name)')
    .eq('herd_id', herdId)
  return data ?? []
}

test('a make gets its ready date from the cheese, and shows as aging', async ({ page, herd }) => {
  await page.goto('/cheese')
  await expect(page.getByText('No cheese aging.')).toBeVisible()
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await dialog.getByRole('combobox', { name: 'Cheese' }).click()
  await page.getByRole('option', { name: /Tomme/ }).click()
  // Tomme ages 4 months.
  await expect(dialog.getByLabel('Ready')).toHaveValue(addMonths(isoDate(), 4))
  await dialog.getByLabel('Milk used').fill('2.5')
  await dialog.getByRole('spinbutton', { name: 'Wheels or pieces' }).fill('4')
  await dialog.getByLabel('Cheese weight').fill('2.5')
  await dialog.getByLabel('Notes').fill('First tomme of fall')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByRole('heading', { name: 'Aging (1)' })).toBeVisible()
  const make = page.getByRole('button', { name: /Tomme · made/ })
  await expect(make).toContainText('2.5 gal · 4 pieces · 2.5 lb · 1.00 lb/gal')
  await expect(make).toContainText(/Ready in \d+ days/)
  await expect(page.getByRole('row', { name: /2\.5 gal ≈ 22 lb/ })).toBeVisible()

  expect(await makes(herd.id)).toEqual([
    {
      made_on: isoDate(),
      ready_on: addMonths(isoDate(), 4),
      milk_gallons: 2.5,
      pieces: 4,
      cheese_weight_g: lbToGrams(2.5),
      notes: 'First tomme of fall',
      finished_on: null,
      cheese_types: { name: 'Tomme' },
    },
  ])
})

test('a cheese not in the list can be added from the dropdown', async ({ page, herd }) => {
  await page.goto('/cheese')
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await dialog.getByRole('combobox', { name: 'Cheese' }).fill('Gouda')
  await page.getByRole('option', { name: /Create "Gouda"/ }).click()
  await expect(dialog.getByText('Add Gouda to your cheeses')).toBeVisible()
  await dialog.getByRole('spinbutton', { name: 'Usually ages (months)' }).fill('3')
  await dialog.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(dialog.getByLabel('Ready')).toHaveValue(addMonths(isoDate(), 3))
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText('Gouda').first()).toBeVisible()
  const { data } = await admin.from('cheese_types').select('aging_months').eq('herd_id', herd.id).eq('name', 'Gouda').single()
  expect(data?.aging_months).toBe(3)
})

test('a ready make can be marked finished, and leaves the main list', async ({ page, herd }) => {
  await admin.from('cheese_makes').insert({
    herd_id: herd.id,
    cheese_type_id: await typeId(herd.id, 'Feta'),
    made_on: isoDate(-70),
    ready_on: isoDate(-9),
  })
  await page.goto('/cheese')
  await expect(page.getByRole('heading', { name: 'Ready (1)' })).toBeVisible()
  const make = page.getByRole('button', { name: /Feta · made/ })
  await expect(make).toContainText(/Ready since/)
  await make.click()
  const dialog = page.getByRole('dialog', { name: 'Edit make' })
  await dialog.getByRole('checkbox', { name: /Finished/ }).check()
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText('No cheese aging.')).toBeVisible()
  await page.getByRole('button', { name: 'Finished (1)' }).click()
  await expect(page.getByRole('button', { name: /Feta · made/ })).toBeVisible()
  expect((await makes(herd.id))[0]?.finished_on).toBe(isoDate())
})

test('helpers can add a cheese but only owners rename, re-time or hide one', async ({ page, browser, herd }) => {
  // The owner sees the controls.
  await page.goto('/cheese')
  await page.getByRole('spinbutton', { name: 'Feta aging months' }).fill('3')
  await page.getByRole('spinbutton', { name: 'Feta aging months' }).blur()
  await expect.poll(async () => (await admin.from('cheese_types').select('aging_months').eq('id', await typeId(herd.id, 'Feta')).single()).data?.aging_months).toBe(3)

  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const helperPage = await ctx.newPage()
    await helperPage.goto('/cheese')
    await expect(helperPage.getByText('Only owners can rename or hide these.')).toBeVisible()
    await expect(helperPage.getByRole('spinbutton', { name: 'Feta aging months' })).toHaveCount(0)
    await helperPage.getByPlaceholder('Gouda, ricotta…').fill('Ricotta')
    await helperPage.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(helperPage.getByText('Ricotta', { exact: true })).toBeVisible()
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('cheese coming ready shows on the calendar and Today; cheese sales are a finance category', async ({ page, herd }) => {
  await admin.from('cheese_makes').insert({
    herd_id: herd.id,
    cheese_type_id: await typeId(herd.id, 'Valençay'),
    made_on: isoDate(-27),
    ready_on: isoDate(3),
  })
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Valençay \(.+\) ready/ })).toBeVisible()

  await page.goto('/calendar')
  await expect(page.getByRole('button', { name: 'Cheese' })).toHaveAttribute('aria-pressed', 'true')
  if (isoDate(3).slice(0, 7) !== isoDate().slice(0, 7)) await page.getByRole('button', { name: 'Next month' }).click()
  await expect(page.getByText(/Valençay \(.+\) ready/).first()).toBeVisible()
  await page.getByRole('button', { name: 'Cheese' }).click()
  await expect(page.getByText(/Valençay \(.+\) ready/)).toHaveCount(0)

  await page.goto('/finances')
  await page.getByRole('button', { name: 'Income' }).click()
  await page.getByRole('dialog').getByRole('combobox', { name: 'Category' }).click()
  await expect(page.getByRole('option', { name: 'Cheese sales' })).toBeVisible()
})
