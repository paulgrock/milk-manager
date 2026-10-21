import { admin, expect, test } from './fixtures.ts'
import { addGoat } from './seed.ts'

test('adds a goat with an outside sire and an in-herd dam, then sees her pedigree', async ({ page, owner, herd }) => {
  const ds = await addGoat(owner, herd.id, { registered_name: 'Castle Rock Roxstar', title_suffix: '+*B', sex: 'buck', status: 'reference' })
  await addGoat(owner, herd.id, {
    registered_name: 'Harley Hillside Dime Piece',
    title_suffix: '4*M',
    sex: 'doe',
    status: 'reference',
    sire_id: ds.id,
  })

  await page.goto('/goats/new')
  await page.getByLabel('Registered name').fill("Bird's Eye Farm Ina May")
  await page.getByLabel('Barn name').fill('Ina')
  await page.getByLabel('Title after name').fill('5*M')
  await page.getByLabel('Born').fill('2019-05-08')
  await page.getByLabel('Tattoo, right ear').fill('BEF')
  await page.getByLabel('Tattoo, left ear').fill('K12')

  // Sire isn't in the herd yet: type the name and create him on the spot.
  const [sirePicker, damPicker] = await page.getByPlaceholder('Search or add…').all()
  await sirePicker!.fill('Curbstone Valley Tigris')
  await page.getByRole('option', { name: /Create "Curbstone Valley Tigris"/ }).click()
  const modal = page.getByRole('dialog', { name: 'Add an outside buck' })
  await expect(modal.getByLabel('Registered name')).toHaveValue('Curbstone Valley Tigris')
  await modal.getByLabel('Title after').fill('+*B')
  await modal.getByRole('button', { name: 'Add' }).click()
  await expect(modal).toBeHidden()

  await damPicker!.fill('Harley')
  await page.getByRole('option', { name: 'Harley Hillside Dime Piece 4*M' }).click()

  await page.getByRole('button', { name: 'Add goat' }).click()
  await expect(page).toHaveURL(/\/goats\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('heading', { name: "Bird's Eye Farm Ina May 5*M" })).toBeVisible()
  await expect(page.getByText('R: BEF · L: K12')).toBeVisible()

  // Sire, dam, and the dam's sire (DS) from her record.
  await expect(page.getByRole('link', { name: 'Curbstone Valley Tigris +*B' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Harley Hillside Dime Piece 4*M' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Castle Rock Roxstar +*B' })).toBeVisible()

  const sire = await admin.from('goats').select('sex, status').eq('registered_name', 'Curbstone Valley Tigris').eq('herd_id', herd.id).single()
  expect(sire.data).toEqual({ sex: 'buck', status: 'reference' })
})

test('records a linear appraisal and shows it pedigree-style', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { registered_name: 'Ina May', sex: 'doe', birth_date: '2019-05-08' })
  await page.goto(`/goats/${ina.id}`)

  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Linear appraisal' }) }).last()
  await card.getByRole('button', { name: 'Add' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add appraisal' })
  await dialog.getByLabel('Date').fill('2021-06-01')
  await dialog.getByRole('combobox', { name: 'Body capacity' }).click()
  await page.getByRole('option', { name: 'E · Excellent' }).click()
  await dialog.getByRole('spinbutton', { name: 'Final score' }).fill('88')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText('VVEV 88')).toBeVisible()
  await expect(page.getByText('@ 2 yo')).toBeVisible()
  await expect(page.getByText('LA 88')).toBeVisible()
})

test('herd list hides outside and sold goats until asked, and searches tattoos', async ({ page, owner, herd }) => {
  await addGoat(owner, herd.id, { registered_name: 'Zinnia', sex: 'doe', tattoo_right: 'BEF', tattoo_left: 'S12' })
  await addGoat(owner, herd.id, { registered_name: 'Apollo', sex: 'buck' })
  await addGoat(owner, herd.id, { barn_name: 'Old Sally', sex: 'doe', status: 'sold' })
  await addGoat(owner, herd.id, { registered_name: 'Outside Sire', sex: 'buck', status: 'reference' })

  await page.goto('/goats')
  const rows = page.getByRole('main').getByRole('listitem')
  await expect(rows).toHaveCount(2)
  await expect(rows.first()).toContainText('Apollo')

  await page.getByPlaceholder('Name, tattoo or registration #').fill('s12')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Zinnia')

  await page.getByRole('button', { name: 'Clear search' }).click()
  await page.getByRole('combobox').filter({ hasText: 'Current herd' }).click()
  await page.getByRole('option', { name: 'Everyone' }).click()
  await expect(rows).toHaveCount(4)
})

test('owner deletes a goat; her kids keep their records', async ({ page, owner, herd }) => {
  const dam = await addGoat(owner, herd.id, { barn_name: 'Mama', sex: 'doe' })
  const kid = await addGoat(owner, herd.id, { barn_name: 'Kiddo', sex: 'doe', dam_id: dam.id })

  await page.goto(`/goats/${dam.id}/edit`)
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page).toHaveURL(/\/goats$/)

  const after = await admin.from('goats').select('id, dam_id').eq('id', kid.id).single()
  expect(after.data).toEqual({ id: kid.id, dam_id: null })
})
