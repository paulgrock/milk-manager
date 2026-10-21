import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, isoDate, lbToGrams, milkRows } from './seed.ts'

const today = isoDate()

test('enters AM weights by keyboard, including a milking weighed in parts', async ({ page, owner, herd }) => {
  const { goat: clover } = await addDoeInMilk(owner, herd.id, 'Clover')
  const { goat: pepper } = await addDoeInMilk(owner, herd.id, 'Pepper')

  await page.goto('/milk')
  await page.getByRole('tab', { name: 'AM' }).click()
  await page.getByLabel('Clover AM').fill('3.4')
  await page.keyboard.press('Enter')
  // Enter moves straight to the next doe.
  await expect(page.getByLabel('Pepper AM')).toBeFocused()
  await page.keyboard.type('2.1 + 0.8')
  await page.keyboard.press('Enter')

  await expect(page.getByText('AM · 2/2 does')).toBeVisible()
  await expect(page.getByText('6.3 lb').first()).toBeVisible()

  await expect.poll(() => milkRows(clover.id, today)).toEqual([{ milking: 1, weight_g: lbToGrams(3.4), portions_g: null }])
  await expect
    .poll(() => milkRows(pepper.id, today))
    .toEqual([{ milking: 1, weight_g: lbToGrams(2.1) + lbToGrams(0.8), portions_g: [lbToGrams(2.1), lbToGrams(0.8)] }])

  // Reloading shows the saved parts the way they were typed.
  await page.reload()
  await page.getByRole('tab', { name: 'AM' }).click()
  await expect(page.getByLabel('Pepper AM')).toHaveValue('2.1 + 0.8')
})

test('rejects a weight that is not a number and keeps the row unsaved', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover')
  await page.goto('/milk')
  await page.getByRole('tab', { name: 'AM' }).click()
  await page.getByLabel('Clover AM').fill('abc')
  await page.keyboard.press('Tab')
  await expect(page.getByText('Use numbers like 3.4, or 2.1 + 1.3 for parts')).toBeVisible()
  expect(await milkRows(goat.id, today)).toEqual([])
})

test('a day total splits into AM and PM when AM is entered later', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Ina')
  await page.goto('/milk')

  await page.getByRole('tab', { name: 'Day total' }).click()
  await page.getByLabel('Ina Day total').fill('6.5')
  await page.keyboard.press('Tab')
  await expect.poll(() => milkRows(goat.id, today)).toEqual([{ milking: 0, weight_g: lbToGrams(6.5), portions_g: null }])

  await page.getByRole('tab', { name: 'AM' }).click()
  await expect(page.getByLabel('Ina AM')).toHaveAttribute('placeholder', 'of 6.5')
  await page.getByLabel('Ina AM').fill('3.7')
  await page.keyboard.press('Tab')
  await expect(page.getByText('PM 2.8')).toBeVisible()
  await expect
    .poll(() => milkRows(goat.id, today))
    .toEqual([
      { milking: 1, weight_g: lbToGrams(3.7), portions_g: null },
      { milking: 2, weight_g: lbToGrams(6.5) - lbToGrams(3.7), portions_g: null },
    ])
})

test('the day editor adds an extra milking weighed in parts', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Ina')
  await page.goto('/milk')
  await page.getByRole('button', { name: 'More' }).click()
  await page.getByRole('menuitem', { name: 'Edit this day' }).click()

  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('AM weight').fill('3.7')
  await dialog.getByLabel('PM weight').fill('2.8')
  await dialog.getByRole('button', { name: 'Extra milking' }).click()
  await dialog.getByLabel('Extra weight').fill('0.4 + 0.3')
  await dialog.getByLabel('Extra note').click()
  await dialog.getByRole('button', { name: 'Done' }).click()

  await expect
    .poll(() => milkRows(goat.id, today))
    .toEqual([
      { milking: 1, weight_g: lbToGrams(3.7), portions_g: null },
      { milking: 2, weight_g: lbToGrams(2.8), portions_g: null },
      { milking: 3, weight_g: lbToGrams(0.4) + lbToGrams(0.3), portions_g: [lbToGrams(0.4), lbToGrams(0.3)] },
    ])
})

test('adds a doe to the milk line and dries one off', async ({ page, owner, herd }) => {
  await addDoeInMilk(owner, herd.id, 'Clover')
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', registered_name: 'Ina May', sex: 'doe' })

  await page.goto('/milk')
  await page.getByRole('button', { name: 'Add doe to milk line' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a doe to the milk line' })
  await dialog.getByPlaceholder('Search does…').fill('Ina')
  await page.getByRole('option', { name: 'Ina May' }).click()
  await expect(page.getByRole('dialog', { name: 'Ina freshened' })).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

  await expect(page.getByLabel(/^Ina /)).toBeVisible()
  await expect(page.getByText('Ina DIM 0')).toBeVisible()
  const lactation = await admin.from('lactations').select('freshened_on, lactation_number').eq('goat_id', ina.id).single()
  expect(lactation.data).toEqual({ freshened_on: today, lactation_number: 1 })

  // Dry Clover off yesterday: she leaves today's line.
  await page.getByRole('listitem').filter({ hasText: 'Clover' }).getByRole('button', { name: 'More' }).click()
  await page.getByRole('menuitem', { name: 'Dry off' }).click()
  const dry = page.getByRole('dialog', { name: /Dry off Clover/ })
  await dry.getByLabel('Last day milked').fill(isoDate(-1))
  await dry.getByRole('button', { name: 'Dry off' }).click()
  await expect(dry).toBeHidden()
  await expect(page.getByRole('listitem').filter({ hasText: 'Clover' })).toHaveCount(0)
  await expect(page.getByText('1 doe in milk')).toBeVisible()
})

test('flags a past day with only one milking', async ({ page, owner, herd }) => {
  const { goat } = await addDoeInMilk(owner, herd.id, 'Clover')
  await owner.client.rpc('record_milking', { p_goat_id: goat.id, p_milked_on: isoDate(-1), p_milking: 1, p_weight_g: 1500 })

  await page.goto(`/milk?date=${isoDate(-1)}`)
  await expect(page.getByText('PM missing')).toBeVisible()

  await page.goto('/milk/history')
  await expect(page.getByText('Missing a milking: Clover')).toBeVisible()
})
