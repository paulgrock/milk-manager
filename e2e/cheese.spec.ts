import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { isoDate } from './seed.ts'

async function typeId(herdId: string, name: string) {
  const { data } = await admin.from('cheese_types').select('id').eq('herd_id', herdId).eq('name', name).single()
  return data!.id
}
async function makes(herdId: string) {
  const { data } = await admin
    .from('cheese_makes')
    .select('made_on, ready_on, milk_gallons, milk_treatment, notes, finished_on, cheese_types(name)')
    .eq('herd_id', herdId)
  return data ?? []
}

test('a make gets its ready date from the cheese, and shows under its cheese', async ({ page, herd }) => {
  await page.goto('/cheese')
  await expect(page.getByText('Nothing coming ready in the next week')).toBeVisible()
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await dialog.getByRole('combobox', { name: 'Cheese' }).click()
  await page.getByRole('option', { name: /Tomme/ }).click()
  // Tomme ages 120 days.
  await expect(dialog.getByLabel('Ready')).toHaveValue(isoDate(120))
  await dialog.getByLabel('Milk used').fill('2.5')
  await dialog.getByRole('radio', { name: 'Raw' }).check()
  await dialog.getByLabel('Notes').fill('First tomme of fall')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  // Not ready for months, so it's not on the main page; Tomme's page lists it with date and milk, but no notes.
  await expect(page.getByRole('row', { name: /2\.5 gal ≈ 22 lb/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Made / })).toHaveCount(0)
  await page.getByRole('link', { name: /Tomme\s*1 make/ }).click()
  const make = page.getByRole('main').getByRole('listitem').filter({ hasText: '2.5 gal (raw)' })
  await expect(make).toContainText('Aging')
  await expect(page.getByText('First tomme of fall')).toHaveCount(0)

  // The notes are on the make's own page.
  await make.click()
  await expect(page.getByRole('heading', { name: 'Tomme' })).toBeVisible()
  await expect(page.getByText('First tomme of fall')).toBeVisible()
  await expect(page.getByText('2.5 gal (raw) ≈ 22 lb')).toBeVisible()

  expect(await makes(herd.id)).toEqual([
    {
      made_on: isoDate(),
      ready_on: isoDate(120),
      milk_gallons: 2.5,
      milk_treatment: 'raw',
      notes: 'First tomme of fall',
      finished_on: null,
      cheese_types: { name: 'Tomme' },
    },
  ])
})

test('the main page keeps to cheese coming ready this week; a cheese’s page lists all its makes', async ({ page, herd }) => {
  const feta = await typeId(herd.id, 'Feta')
  await admin.from('cheese_makes').insert([
    // Ready in 3 days: on the main page.
    { herd_id: herd.id, cheese_type_id: feta, made_on: isoDate(-57), ready_on: isoDate(3), milk_gallons: 3, notes: 'Brined in the crock' },
    // Made two days ago but not ready for two months: only on Feta's page.
    { herd_id: herd.id, cheese_type_id: feta, made_on: isoDate(-2), ready_on: isoDate(58), milk_gallons: 2 },
    // Ready a month ago and still on hand: only on Feta's page.
    { herd_id: herd.id, cheese_type_id: feta, made_on: isoDate(-90), ready_on: isoDate(-30), milk_gallons: 4 },
    // Finished: only on Feta's page.
    { herd_id: herd.id, cheese_type_id: feta, made_on: isoDate(-5), ready_on: isoDate(-5), finished_on: isoDate(-1) },
  ])
  await page.goto('/cheese')
  await expect(page.getByRole('heading', { name: 'Feta (1)' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Made / })).toHaveCount(1)
  await expect(page.getByRole('link', { name: /Made .* 3 gal/ })).toBeVisible()
  // Cheeses with nothing coming ready are a tap away.
  await expect(page.getByRole('link', { name: /Tomme\s*No makes yet/ })).toBeVisible()

  await page.getByRole('link', { name: /Feta \(1\)/ }).click()
  await expect(page.getByRole('heading', { name: 'Feta', exact: true })).toBeVisible()
  const rows = page.getByRole('main').getByRole('listitem')
  await expect(rows).toHaveCount(4)
  // Newest first, with milk and status, and no notes.
  await expect(rows.nth(0)).toContainText('2 gal')
  await expect(rows.nth(0)).toContainText('Aging')
  await expect(rows.nth(1)).toContainText('Finished')
  await expect(rows.nth(2)).toContainText('3 gal')
  await expect(rows.nth(2)).toContainText('Aging')
  await expect(rows.nth(3)).toContainText('4 gal')
  await expect(rows.nth(3)).toContainText('Ready')
  await expect(page.getByText('Brined in the crock')).toHaveCount(0)

  await rows.nth(2).click()
  await expect(page.getByText('Brined in the crock')).toBeVisible()
})

test('a new make from a cheese’s page starts with that cheese', async ({ page, herd }) => {
  await page.goto(`/cheese/types/${await typeId(herd.id, 'Tomme')}`)
  await expect(page.getByText('No Tomme made yet.')).toBeVisible()
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await expect(dialog.getByLabel('Ready')).toHaveValue(isoDate(120))
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(1)
  expect((await makes(herd.id))[0]?.cheese_types).toEqual({ name: 'Tomme' })
})

test('fresh cheese shows only as its cheese on the main page, and has no ready reminder', async ({ page, herd }) => {
  await admin.from('cheese_makes').insert({ herd_id: herd.id, cheese_type_id: await typeId(herd.id, 'Chèvre'), made_on: isoDate(-1), ready_on: isoDate(-1) })
  await page.goto('/cheese')
  await expect(page.getByRole('link', { name: /Chèvre\s*1 make/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Made / })).toHaveCount(0)
  await page.getByRole('link', { name: /Chèvre\s*1 make/ }).click()
  await expect(page).toHaveURL(/\/cheese\/types\//)
  await expect(page.getByRole('main').getByRole('listitem')).toContainText('Fresh')

  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/Chèvre .* ready/)).toHaveCount(0)
})

test('a cheese not in the list can be added from the dropdown', async ({ page, herd }) => {
  await page.goto('/cheese')
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await dialog.getByRole('combobox', { name: 'Cheese' }).fill('Gouda')
  await page.getByRole('option', { name: /Create "Gouda"/ }).click()
  await expect(dialog.getByText('Add Gouda to your cheeses')).toBeVisible()
  await dialog.getByRole('spinbutton', { name: 'Usually ages (days)' }).fill('21')
  await dialog.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(dialog.getByLabel('Ready')).toHaveValue(isoDate(21))
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText('Gouda').first()).toBeVisible()
  const { data } = await admin.from('cheese_types').select('aging_days').eq('herd_id', herd.id).eq('name', 'Gouda').single()
  expect(data?.aging_days).toBe(21)
})

test('a make coming ready can be marked finished, and leaves the main page', async ({ page, herd }) => {
  const { data } = await admin
    .from('cheese_makes')
    .insert({ herd_id: herd.id, cheese_type_id: await typeId(herd.id, 'Feta'), made_on: isoDate(-58), ready_on: isoDate(2) })
    .select('id')
    .single()
  await page.goto('/cheese')
  const make = page.getByRole('link', { name: /Made / })
  await expect(make).toContainText('Ready in 2 days')
  await make.click()
  await page.getByRole('button', { name: 'Mark finished' }).click()
  await expect(page.getByText(/^Finished /).first()).toBeVisible()
  expect((await makes(herd.id))[0]?.finished_on).toBe(isoDate())

  await page.getByRole('link', { name: 'Back to Feta' }).click()
  await expect(page.getByRole('main').getByRole('listitem')).toContainText('Finished')
  await page.goto('/cheese')
  await expect(page.getByText('Nothing coming ready in the next week')).toBeVisible()

  // Deleting from the make's page goes back to its cheese.
  await page.goto(`/cheese/makes/${data!.id}`)
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByRole('dialog', { name: 'Edit make' }).getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('No Feta made yet.')).toBeVisible()
  expect(await makes(herd.id)).toEqual([])
})

test('helpers can add a cheese but only owners rename, re-time or hide one', async ({ page, browser, herd }) => {
  // The owner sees the controls.
  await page.goto('/cheese')
  await page.getByRole('spinbutton', { name: 'Feta aging days' }).fill('45')
  await page.getByRole('spinbutton', { name: 'Feta aging days' }).blur()
  await expect.poll(async () => (await admin.from('cheese_types').select('aging_days').eq('id', await typeId(herd.id, 'Feta')).single()).data?.aging_days).toBe(45)

  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const helperPage = await ctx.newPage()
    await helperPage.goto('/cheese')
    await expect(helperPage.getByText('Only owners can rename or hide these.')).toBeVisible()
    await expect(helperPage.getByRole('spinbutton', { name: 'Feta aging days' })).toHaveCount(0)
    await helperPage.getByPlaceholder('Gouda, ricotta…').fill('Ricotta')
    await helperPage.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(helperPage.getByRole('link', { name: /Ricotta\s*No makes yet/ })).toBeVisible()
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})

test('a make’s notes can run to 10,000 characters, and the box stops there', async ({ page, herd }) => {
  await page.goto('/cheese')
  await page.getByRole('button', { name: 'New make' }).click()
  const dialog = page.getByRole('dialog', { name: 'New make' })
  await dialog.getByRole('combobox', { name: 'Cheese' }).click()
  await page.getByRole('option', { name: /Feta/ }).click()
  await dialog.getByLabel('Notes').fill('x'.repeat(10_050))
  await expect(dialog.getByLabel('Notes')).toHaveValue('x'.repeat(10_000))
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect.poll(async () => (await makes(herd.id))[0]?.notes?.length).toBe(10_000)
})

test('the cheese list is alphabetical, including newly added ones', async ({ page, herd: _herd }) => {
  await page.goto('/cheese')
  await page.getByPlaceholder('Gouda, ricotta…').fill('brie')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'brie name' })).toBeVisible()
  const names = await page.getByRole('textbox', { name: / name$/ }).evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value))
  expect(names).toEqual(['brie', 'Cheddar', 'Chèvre', 'Feta', 'Mozzarella', 'Tomme', 'Valençay'])
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
