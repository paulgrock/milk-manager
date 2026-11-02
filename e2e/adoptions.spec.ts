import { admin, createUser, deleteUser, expect, signInContext, test } from './fixtures.ts'
import { addGoat, isoDate } from './seed.ts'

const season = Number(isoDate().slice(0, 4)) + 1

async function finances(herdId: string) {
  const { data } = await admin.from('finance_entries').select('category, amount_cents, party, description').eq('herd_id', herdId).order('amount_cents')
  return data ?? []
}
async function kidOf(herdId: string, doeId: string, sexes: ('doe' | 'buck')[]) {
  const kidded_on = `${season}-02-20`
  const { data: kidding } = await admin.from('kiddings').insert({ herd_id: herdId, doe_id: doeId, kidded_on }).select().single()
  await admin.from('kids').insert(sexes.map((sex) => ({ herd_id: herdId, kidding_id: kidding!.id, sex })))
}

test('a reservation with a new buyer and a deposit puts the deposit in Finances', async ({ page, owner, herd }) => {
  await addGoat(owner, herd.id, { barn_name: 'Clover', sex: 'doe' })
  // Under Breeding, for owners.
  await page.goto('/breeding')
  await page.getByRole('link', { name: 'Adoptions' }).click()
  await expect(page.getByRole('heading', { name: 'Adoptions' })).toBeVisible()
  await page.goto(`/breeding/adoptions?season=${season}`)
  await page.getByRole('button', { name: 'New reservation' }).click()
  const dialog = page.getByRole('dialog', { name: 'New reservation' })
  await dialog.getByRole('combobox', { name: 'Buyer' }).fill('Jo Smith')
  await page.getByRole('option', { name: /Create "Jo Smith"/ }).click()
  await dialog.getByLabel('New buyer phone').fill('555-0100')
  await dialog.getByRole('button', { name: 'Add buyer' }).click()
  await expect(dialog.getByRole('combobox', { name: 'Buyer' })).toHaveValue('Jo Smith')
  await dialog.getByPlaceholder('Any doe').fill('Clov')
  await page.getByRole('option', { name: /Clover/ }).click()
  await dialog.getByRole('combobox', { name: 'Wants' }).click()
  await page.getByRole('option', { name: 'Doeling' }).click()
  await dialog.getByLabel('Deposit').fill('100')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  const clover = page.getByRole('main').locator('div').filter({ has: page.getByRole('heading', { name: 'Clover' }) }).first()
  await expect(clover.getByRole('button', { name: /Jo Smith · 1 doeling/ })).toContainText('$100.00 deposit held')
  await expect(page.getByRole('button', { name: /Jo Smith.*555-0100/ })).toBeVisible()
  expect(await finances(herd.id)).toEqual([{ category: 'kid_sale', amount_cents: 10000, party: 'Jo Smith', description: `Deposit for ${season} kids from Clover` }])

  // It's in the books, but changed from Sales.
  await page.goto(`/finances?year=${isoDate().slice(0, 4)}`)
  await page.getByText(`Deposit for ${season} kids from Clover`).click()
  await expect(page.getByRole('dialog').getByText('Recorded from Adoptions')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Delete' })).toHaveCount(0)
})

test('kids are matched to the line in order, adopted less the deposit, and leave the herd', async ({ page, owner, herd }) => {
  const clover = await addGoat(owner, herd.id, { barn_name: 'Clover', sex: 'doe' })
  const { data: buyers } = await admin.from('buyers').insert([{ herd_id: herd.id, name: 'Jo Smith' }, { herd_id: herd.id, name: 'Sam Lee' }]).select()
  const [jo, sam] = [buyers!.find((b) => b.name === 'Jo Smith')!, buyers!.find((b) => b.name === 'Sam Lee')!]
  await admin.from('reservations').insert([
    { herd_id: herd.id, buyer_id: jo.id, season, doe_id: clover.id, wants: 'doeling', position: 1, deposit_cents: 10000, deposit_on: isoDate() },
    { herd_id: herd.id, buyer_id: sam.id, season, doe_id: clover.id, wants: 'any', position: 2 },
  ])
  await kidOf(herd.id, clover.id, ['doe', 'buck'])

  await page.goto(`/breeding/adoptions?season=${season}`)
  await expect(page.getByText(/Kidded .* · 1 doeling, 1 buckling/)).toBeVisible()
  const order = () => page.getByRole('button', { name: /^(Jo Smith|Sam Lee) · 1 (doeling|kid)/ }).allTextContents()
  await expect.poll(order).toEqual([expect.stringContaining('Jo Smith'), expect.stringContaining('Sam Lee')])
  await page.getByRole('button', { name: 'Move Sam Lee up' }).click()
  await expect.poll(order).toEqual([expect.stringContaining('Sam Lee'), expect.stringContaining('Jo Smith')])

  // Jo wants a doeling: only the doeling is offered.
  const joRow = page.getByRole('listitem').filter({ has: page.getByRole('button', { name: /^Jo Smith · 1 doeling/ }) })
  await joRow.getByRole('button', { name: 'Match a kid' }).click()
  await expect(page.getByRole('menuitem')).toHaveCount(1)
  await page.getByRole('menuitem', { name: /Clover's doeling/ }).click()
  await expect(joRow.getByText(/Clover's doeling/)).toBeVisible()
  expect(await finances(herd.id)).toHaveLength(1)

  await joRow.getByRole('button', { name: 'Mark adopted' }).click()
  const dialog = page.getByRole('dialog', { name: 'Record an adoption' })
  await dialog.getByLabel('Price').fill('450')
  await expect(dialog.getByText('Less the $100.00 deposit: $350.00 goes into Finances.')).toBeVisible()
  await dialog.getByLabel('Pickup').fill(isoDate(30))
  await dialog.getByRole('button', { name: 'Save adoption' }).click()
  await expect(dialog).toBeHidden()
  await expect(joRow).toContainText('$100.00 deposit used on an adoption')
  await expect(page.getByRole('button', { name: /Clover's doeling .* to Jo Smith/ })).toContainText('$450.00')
  expect((await finances(herd.id)).map((f) => [f.amount_cents, f.description])).toEqual([[10000, `Deposit for ${season} kids from Clover`], [35000, 'Adoption, less deposit']])

  // The buckling nobody matched can be sold on its own.
  await page.getByRole('listitem').filter({ hasText: 'not matched yet' }).getByRole('button', { name: 'Mark adopted' }).click()
  const second = page.getByRole('dialog', { name: 'Record an adoption' })
  await second.getByRole('combobox', { name: 'Buyer' }).click()
  await page.getByRole('option', { name: 'Sam Lee' }).click()
  await second.getByLabel('Price').fill('300')
  await second.getByRole('button', { name: 'Save adoption' }).click()
  await expect(second).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Adopted this season' }).locator('..')).toContainText('$750.00')
})

test('adopting out a goat from the herd marks it sold and books a goat sale', async ({ page, owner, herd }) => {
  const rosie = await addGoat(owner, herd.id, { barn_name: 'Rosie', sex: 'doe', birth_date: '2022-04-01' })
  await admin.from('buyers').insert({ herd_id: herd.id, name: 'Pat Jones' })
  await page.goto('/breeding/adoptions')
  await page.getByRole('button', { name: 'Record an adoption' }).click()
  const dialog = page.getByRole('dialog', { name: 'Record an adoption' })
  await dialog.getByRole('combobox', { name: 'Buyer' }).click()
  await page.getByRole('option', { name: 'Pat Jones' }).click()
  await dialog.getByRole('tab', { name: 'A goat' }).click()
  await dialog.getByPlaceholder('Search goats…').fill('Rosie')
  await page.getByRole('option', { name: /Rosie/ }).click()
  await dialog.getByLabel('Price').fill('600')
  await dialog.getByRole('button', { name: 'Save adoption' }).click()
  await expect(dialog).toBeHidden()

  expect(await finances(herd.id)).toEqual([{ category: 'goat_sale', amount_cents: 60000, party: 'Pat Jones', description: 'Adoption' }])
  const { data: goat } = await admin.from('goats').select('status, left_herd_on, left_herd_reason').eq('id', rosie.id).single()
  expect(goat).toEqual({ status: 'sold', left_herd_on: isoDate(), left_herd_reason: 'Adopted by Pat Jones' })
  await page.goto(`/goats/${rosie.id}`)
  await expect(page.getByText(/^Adopted \w{3} \d+, \d{4}$/)).toBeVisible()
  await page.goto('/goats')
  await page.getByRole('combobox').filter({ hasText: 'Current herd' }).click()
  await expect(page.getByRole('option', { name: 'Adopted' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Sold' })).toHaveCount(0)
  await expect(page.getByRole('option', { name: 'Available' })).toBeVisible()
})

test('helpers don’t see adoptions', async ({ browser, herd }) => {
  const helper = await createUser('helper')
  try {
    await admin.from('herd_members').insert({ herd_id: herd.id, user_id: helper.id, role: 'helper', display_name: 'helper', email: helper.email })
    const ctx = await browser.newContext()
    await signInContext(ctx, helper)
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Health' })).toBeVisible()
    await page.goto('/breeding')
    await expect(page.getByRole('heading', { name: 'Breeding' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Adoptions' })).toHaveCount(0)
    await page.goto('/breeding/adoptions')
    await expect(page.getByText('Only owners can see adoptions.')).toBeVisible()
    await ctx.close()
  } finally {
    await deleteUser(helper)
  }
})
