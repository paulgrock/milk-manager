import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, addLactation, isoDate } from './seed.ts'

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

test('the In milk view lists only does milking today', async ({ page, owner, herd }) => {
  await addDoeInMilk(owner, herd.id, 'Clover')
  const dry = await addGoat(owner, herd.id, { barn_name: 'Dry Doe', sex: 'doe' })
  await addLactation(owner, herd.id, dry.id, isoDate(-400), 1, isoDate(-30))
  await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })

  await page.goto('/goats')
  const rows = page.getByRole('main').getByRole('listitem')
  await expect(rows).toHaveCount(3)
  await page.getByRole('combobox').filter({ hasText: 'Current herd' }).click()
  await page.getByRole('option', { name: 'In milk' }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Clover')
})

test('a doe who dies leaves the milk line and care lists but keeps her page and pedigree', async ({ page, owner, herd }) => {
  const { goat: chimi } = await addDoeInMilk(owner, herd.id, 'Chimi', 100)
  await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe', dam_id: chimi.id })

  await page.goto(`/goats/${chimi.id}/edit`)
  await page.getByRole('combobox', { name: 'Status' }).click()
  await page.getByRole('option', { name: 'Deceased' }).click()
  await page.getByLabel('Date died').fill(isoDate(-10))
  await page.getByLabel('Cause').fill('Bloat')
  await page.getByRole('button', { name: 'Save changes' }).click()

  // Her page says so; her open lactation ended that day.
  await expect(page.getByText(/^Died /)).toBeVisible()
  await expect(page.getByText('Bloat')).toBeVisible()
  const lactation = await admin.from('lactations').select('dried_off_on').eq('goat_id', chimi.id).single()
  expect(lactation.data?.dried_off_on).toBe(isoDate(-10))

  // Not on today's milk line, but still on a day before she died.
  await page.goto('/milk')
  await expect(page.getByLabel(/^Chimi /)).toHaveCount(0)
  await page.goto(`/milk?date=${isoDate(-11)}`)
  await expect(page.getByLabel(/^Chimi /)).toBeVisible()

  // Not due for care.
  await page.goto('/health')
  await expect(page.getByText(/Chimi/)).toHaveCount(0)

  // Off the default goats list, on the Deceased one.
  await page.goto('/goats')
  await expect(page.getByRole('main').getByRole('listitem').filter({ hasText: 'Chimi' })).toHaveCount(0)
  await page.getByRole('combobox').filter({ hasText: 'Current herd' }).click()
  await page.getByRole('option', { name: 'Deceased' }).click()
  await expect(page.getByRole('main').getByRole('listitem').filter({ hasText: 'Chimi' })).toHaveCount(1)
})

test('an uploaded photo becomes her picture, as a rounded square like the app icon', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', registered_name: 'Ina May', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)

  // A small generated photo.
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 400
    const g = c.getContext('2d')!
    g.fillStyle = '#b45309'
    g.fillRect(0, 0, 400, 400)
    g.fillStyle = '#fafaf9'
    g.fillRect(100, 120, 200, 160)
    return c.toDataURL('image/png').split(',')[1]!
  })
  await page.locator('input[type=file]').setInputFiles({ name: 'ina.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
  await expect(page.getByRole('img', { name: /Ina May, / })).toBeVisible()

  // The first photo is her main one, shown at the top of her page and on the goat list.
  const avatarRadius = (img: import('@playwright/test').Locator) => img.evaluate((el) => getComputedStyle(el.parentElement!).borderTopLeftRadius)
  const header = page.getByRole('img', { name: 'Ina May', exact: true })
  await expect(header).toBeVisible()
  expect(await avatarRadius(header)).toBe('22%')

  await page.goto('/goats')
  const listed = page.getByRole('img', { name: 'Ina May', exact: true })
  await expect(listed).toBeVisible()
  expect(await avatarRadius(listed)).toBe('22%')
})
