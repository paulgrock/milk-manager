import { readFile } from 'node:fs/promises'
import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { addGoat, isoDate } from './seed.ts'

const year = Number(isoDate().slice(0, 4))

async function addEntry(page: import('@playwright/test').Page, type: 'Income' | 'Expense', fields: { category?: string; amount: string; what?: string; party?: string }) {
  await page.getByRole('button', { name: type, exact: true }).click()
  const dialog = page.getByRole('dialog', { name: `Add ${type.toLowerCase()}` })
  if (fields.category) {
    await dialog.getByRole('combobox', { name: 'Category' }).click()
    await page.getByRole('option', { name: fields.category }).click()
  }
  await dialog.getByLabel('Amount').fill(fields.amount)
  if (fields.what) await dialog.getByLabel('What for').fill(fields.what)
  if (fields.party) await dialog.getByLabel(type === 'Income' ? 'From' : 'Paid to').fill(fields.party)
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
}

test('records income and expenses and totals the year', async ({ page, herd }) => {
  await page.goto('/finances')
  await expect(page.getByText(`No income or expenses in ${year} yet.`)).toBeVisible()

  await addEntry(page, 'Expense', { amount: '120.50', what: 'Alfalfa pellets', party: 'Feed store' })
  await addEntry(page, 'Expense', { category: 'Vet and medicine', amount: '$85' })
  await addEntry(page, 'Income', { category: 'Kid sales', amount: '1,200', what: 'Two doelings' })

  await expect(page.getByText('$1,200.00').first()).toBeVisible()
  await expect(page.getByText('$205.50').first()).toBeVisible()
  await expect(page.getByText(`Profit ${year}`)).toBeVisible()
  await expect(page.getByText('$994.50').first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Alfalfa pellets.*Feed · Feed store.*−\$120\.50/ })).toBeVisible()

  // Edit an entry, then delete one.
  await page.getByRole('button', { name: /Alfalfa pellets/ }).click()
  await page.getByRole('dialog', { name: 'Edit entry' }).getByLabel('Amount').fill('100')
  await page.getByRole('dialog', { name: 'Edit entry' }).getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('button', { name: /Alfalfa pellets.*−\$100\.00/ })).toBeVisible()
  await page.getByRole('button', { name: /Vet and medicine/ }).click()
  await page.getByRole('dialog', { name: 'Edit entry' }).getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText(`Profit ${year}`)).toBeVisible()
  await expect(page.getByText('$1,100.00').first()).toBeVisible()

  const saved = await admin.from('finance_entries').select('kind, category, amount_cents').eq('herd_id', herd.id).order('amount_cents')
  expect(saved.data).toEqual([
    { kind: 'expense', category: 'feed', amount_cents: 10000 },
    { kind: 'income', category: 'kid_sale', amount_cents: 120000 },
  ])
})

test('exports the year as a CSV for the tax preparer', async ({ page, herd }) => {
  await admin.from('finance_entries').insert([
    { herd_id: herd.id, kind: 'expense', category: 'feed', occurred_on: `${year}-02-01`, amount_cents: 4550, description: 'Hay, 5 bales', party: 'Smith, J' },
    { herd_id: herd.id, kind: 'income', category: 'milk', occurred_on: `${year}-03-01`, amount_cents: 2000 },
    { herd_id: herd.id, kind: 'income', category: 'milk', occurred_on: `${year - 1}-12-01`, amount_cents: 999 },
  ])
  await page.goto('/finances')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'CSV' }).click()
  const file = await download
  expect(file.suggestedFilename()).toMatch(new RegExp(`finances-${year}\\.csv$`))
  const csv = await readFile((await file.path())!, 'utf8')
  expect(csv.split('\r\n')).toEqual([
    'Date,Type,Category,Amount,Signed amount,Description,Paid to / from,Goat,Notes',
    `${year}-02-01,Expense,Feed,45.50,-45.50,"Hay, 5 bales","Smith, J",,`,
    `${year}-03-01,Income,Milk sales,20.00,20.00,,,,`,
    '',
  ])

  // Earlier years are a pick away.
  await page.getByRole('combobox', { name: 'Year' }).click()
  await page.getByRole('option', { name: String(year - 1) }).click()
  await expect(page.getByText('$9.99').first()).toBeVisible()
})

test('a stud fee typed on a breeding can go in the books once', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  const rex = await addGoat(owner, herd.id, { registered_name: 'Rex Ridge Rocket', sex: 'buck', status: 'reference' })
  const { data: b } = await admin.from('breedings').insert({ herd_id: herd.id, doe_id: ina.id, buck_id: rex.id, bred_on: isoDate(-5), service_fee_cents: 7500 }).select().single()

  await page.goto('/finances')
  await expect(page.getByText('1 stud fee from breedings not in the books yet')).toBeVisible()
  await page.getByRole('button', { name: 'Add as expense' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add expense' })
  await expect(dialog.getByLabel('Amount')).toHaveValue('75.00')
  await expect(dialog.getByLabel('What for')).toHaveValue('Stud fee: Rex Ridge Rocket')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('stud fee from breedings not in the books yet')).toBeHidden()

  const entry = await admin.from('finance_entries').select('category, amount_cents, breeding_id, goat_id').eq('herd_id', herd.id).single()
  expect(entry.data).toEqual({ category: 'stud_fee', amount_cents: 7500, breeding_id: b!.id, goat_id: ina.id })
})

test('marking a goat sold offers to record the sale', async ({ page, owner, herd }) => {
  const kid = await addGoat(owner, herd.id, { barn_name: 'Ivy', sex: 'doe', birth_date: isoDate(-90) })
  await page.goto(`/goats/${kid.id}/edit`)
  await page.getByRole('combobox', { name: 'Status' }).click()
  await page.getByRole('option', { name: 'Sold' }).click()
  await page.getByLabel('Date sold').fill(isoDate())
  await page.getByRole('button', { name: 'Save changes' }).click()

  const dialog = page.getByRole('dialog', { name: 'Add income' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('combobox', { name: 'Category' })).toHaveText(/Kid sales/)
  await dialog.getByLabel('Amount').fill('450')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page).not.toHaveURL(/recordSale/)

  // Her page shows the money tied to her.
  await expect(page.getByRole('heading', { name: 'Finances' })).toBeVisible()
  await expect(page.getByText('+$450.00').first()).toBeVisible()
})

test('helpers see no finances at all', async ({ browser, herd }) => {
  await admin.from('finance_entries').insert({ herd_id: herd.id, kind: 'income', category: 'milk', occurred_on: isoDate(), amount_cents: 5000 })
  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const page = await ctx.newPage()
    await page.goto('/')
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Calendar' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Finances' })).toHaveCount(0)
    await page.goto('/finances')
    await expect(page.getByText('Only owners can see finances.')).toBeVisible()
    await expect(page.getByText('$50.00')).toHaveCount(0)
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})
