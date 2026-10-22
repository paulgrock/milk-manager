import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, isoDate } from './seed.ts'

async function careTypeId(herdId: string, name: string) {
  const { data } = await admin.from('care_types').select('id').eq('herd_id', herdId).eq('name', name).single()
  return data!.id
}

test('Today lists what is overdue and what is coming up this week', async ({ page, owner, herd }) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })
  // Clover: in milk and due in 30 days, so she should already be dried off.
  const { goat: clover } = await addDoeInMilk(owner, herd.id, 'Clover', 200)
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: clover.id, buck_id: rex.id, bred_on: isoDate(-120) })
  // Ina: hoof trim overdue; in heat 18 days ago, so expected again in 3.
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await admin.from('care_events').insert({ herd_id: herd.id, goat_id: ina.id, care_type_id: await careTypeId(herd.id, 'Hoof trim'), done_on: isoDate(-70) })
  await admin.from('heats').insert({ herd_id: herd.id, goat_id: ina.id, observed_on: isoDate(-18) })

  await page.goto('/')
  const attention = page.getByRole('main').locator('section, div').filter({ has: page.getByRole('heading', { name: 'Needs attention' }) }).first()
  await expect(attention.getByRole('link', { name: /Dry off Clover.*Overdue/ })).toBeVisible()
  await expect(attention.getByRole('link', { name: /Hoof trim: Ina.*Overdue/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ina heat expected' })).toBeVisible()

  await page.getByRole('link', { name: /Hoof trim: Ina/ }).click()
  await expect(page).toHaveURL(new RegExp(`/goats/${ina.id}$`))
})

test('logging the care clears it from Today', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await admin.from('care_events').insert({ herd_id: herd.id, goat_id: ina.id, care_type_id: await careTypeId(herd.id, 'Hoof trim'), done_on: isoDate(-70) })

  await page.goto('/')
  await expect(page.getByRole('link', { name: /Hoof trim: Ina.*Overdue/ })).toBeVisible()
  await page.getByRole('button', { name: 'Log care' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log care' })
  await dialog.getByRole('checkbox', { name: 'Ina' }).check()
  await dialog.getByRole('button', { name: 'Log for 1' }).click()
  await expect(page.getByRole('link', { name: /Hoof trim: Ina/ })).toBeHidden()
  await expect(page.getByText('Nothing overdue. Nice.')).toBeVisible()
})

test('the calendar moves between months and filters by kind', async ({ page, owner, herd }) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  // Bred 10 days ago: due in about 140 days, a few months out.
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: ina.id, buck_id: rex.id, bred_on: isoDate(-10) })
  const due = isoDate(140)

  await page.goto('/calendar')
  await expect(page.getByRole('link', { name: /Ina bred to Rex/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Ina due to kid/ })).toHaveCount(0)

  await page.goto(`/calendar?month=${due.slice(0, 7)}`)
  await expect(page.getByRole('link', { name: /Ina due to kid/ })).toBeVisible()

  // Hiding breeding hides it; the choice is remembered.
  await page.getByRole('button', { name: 'Breeding' }).click()
  await expect(page.getByRole('link', { name: /Ina due to kid/ })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Breeding' })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'Breeding' }).click()
  await expect(page.getByRole('link', { name: /Ina due to kid/ })).toBeVisible()

  await page.getByRole('button', { name: 'Previous month' }).click()
  await expect(page).toHaveURL(/month=/)
  await page.getByRole('button', { name: 'This month' }).click()
  await expect(page).not.toHaveURL(/month=/)
})

test('milk withdrawal shows when her milk is OK again', async ({ page, owner, herd }) => {
  const { goat: ina } = await addDoeInMilk(owner, herd.id, 'Ina')
  await admin.from('treatments').insert({ herd_id: herd.id, goat_id: ina.id, started_on: isoDate(-1), medication: 'Penicillin', milk_withdrawal_days: 4 })
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Ina's milk OK again/ })).toBeVisible()
})

test('the month title opens month and year wheels, like iOS', async ({ page, herd }) => {
  void herd
  const now = new Date()
  const thisMonth = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  await page.goto('/calendar')
  await page.getByRole('button', { name: thisMonth }).click()

  const months = page.getByRole('listbox', { name: 'Month' })
  const years = page.getByRole('listbox', { name: 'Year' })
  await expect(months.getByRole('option', { selected: true })).toHaveText(now.toLocaleDateString(undefined, { month: 'long' }))

  // Tapping an item.
  await months.getByRole('option', { name: 'March' }).click()
  await years.getByRole('option', { name: String(now.getFullYear() - 1) }).click()
  await expect(page).toHaveURL(new RegExp(`month=${now.getFullYear() - 1}-03`))
  await expect(page.getByRole('button', { name: `March ${now.getFullYear() - 1}` })).toBeVisible()

  // Spinning the wheel: whatever settles in the middle is chosen.
  await months.evaluate((el) => el.scrollTo({ top: 36 * 6, behavior: 'instant' }))
  await expect(page).toHaveURL(new RegExp(`month=${now.getFullYear() - 1}-07`))
  await expect(months.getByRole('option', { selected: true })).toHaveText('July')

  // Arrow keys.
  await years.focus()
  await page.keyboard.press('ArrowUp')
  await expect(page).toHaveURL(new RegExp(`month=${now.getFullYear() - 2}-07`))

  // "This month" sits left of the arrows and brings it back.
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'This month' }).click()
  await expect(page.getByRole('button', { name: thisMonth })).toBeVisible()
})
