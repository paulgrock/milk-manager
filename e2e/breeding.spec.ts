import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, addLactation, isoDate, lbToGrams } from './seed.ts'

/** Formats like the app does (e.g. "Mar 1, 2026"). */
const shown = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

test('records a breeding to an outside buck, then a positive pregnancy check', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  const bredOn = isoDate(-40)

  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByText('Open (not bred).')).toBeVisible()
  await page.getByRole('button', { name: 'Record breeding' }).click()

  const dialog = page.getByRole('dialog', { name: 'Record a breeding' })
  await dialog.getByPlaceholder('Search or add…').fill('Castle Rock Roxstar')
  await page.getByRole('option', { name: /Create "Castle Rock Roxstar"/ }).click()
  await page.getByRole('dialog', { name: 'Add an outside buck' }).getByRole('button', { name: 'Add' }).click()
  await dialog.getByLabel('Bred on').fill(bredOn)
  await dialog.getByLabel('Stud fee').fill('75')
  await expect(dialog.getByText(`Due around ${shown(isoDate(110))}`)).toBeVisible()
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByText(new RegExp(`Due ${shown(isoDate(110))} \\(in 110 days\\)`))).toBeVisible()
  await expect(page.getByText('to Castle Rock Roxstar').first()).toBeVisible()

  await page.getByRole('button', { name: 'Pregnancy check' }).click()
  const check = page.getByRole('dialog', { name: 'Pregnancy check' })
  await check.getByRole('radio', { name: 'Pregnant', exact: true }).check()
  await check.getByRole('button', { name: 'Save' }).click()
  await expect(check).toBeHidden()
  await expect(page.getByText('Confirmed pregnant').first()).toBeVisible()
  await expect(page.getByText('Blood test: pregnant')).toBeVisible()

  const saved = await admin.from('breedings').select('bred_on, service_fee_cents, buck:goats!breedings_buck_id_herd_id_fkey(registered_name, status)').eq('doe_id', ina.id).single()
  expect(saved.data).toEqual({ bred_on: bredOn, service_fee_cents: 7500, buck: { registered_name: 'Castle Rock Roxstar', status: 'reference' } })
})

test('the breeding page lists who is due and who to dry off', async ({ page, owner, herd }) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', sex: 'buck' })
  // Clover: due in ~20 days and still in milk, so she should be dried off now.
  const { goat: clover } = await addDoeInMilk(owner, herd.id, 'Clover', 200)
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: clover.id, buck_id: rex.id, bred_on: isoDate(-130) })
  // Pepper: due in ~100 days, outside the 60-day window.
  const pepper = await addGoat(owner, herd.id, { barn_name: 'Pepper', sex: 'doe' })
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: pepper.id, buck_id: rex.id, bred_on: isoDate(-50) })
  // Ina: open, last in heat 18 days ago, so due back in heat in 3 days.
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await admin.from('heats').insert({ herd_id: herd.id, goat_id: ina.id, observed_on: isoDate(-18) })

  await page.goto('/breeding')
  await expect(page.getByRole('link', { name: /Clover/ }).first()).toContainText('in 20 days')
  await expect(page.getByText(`Dry off now (by ${shown(isoDate(-40))})`)).toBeVisible()
  await expect(page.getByText('1 more bred for later')).toBeVisible()
  await expect(page.getByRole('link', { name: /Ina.*Cycle/ })).toContainText('in 3 days')
  await expect(page.getByRole('link', { name: /Ina.*No kiddings recorded/ })).toBeVisible()
})

test('records twins: kids become goats, the dam starts a new lactation and shows on the milk line', async ({ page, owner, herd }) => {
  const rex = await addGoat(owner, herd.id, { barn_name: 'Rex', registered_name: 'Rex Ridge Rocket', sex: 'buck', breed: 'Nigerian Dwarf' })
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe', breed: 'Nigerian Dwarf' })
  // Milked through her pregnancy.
  await addLactation(owner, herd.id, ina.id, isoDate(-400), 2)
  await admin.from('breedings').insert({ herd_id: herd.id, doe_id: ina.id, buck_id: rex.id, bred_on: isoDate(-150) })

  await page.goto(`/goats/${ina.id}`)
  await page.getByRole('link', { name: 'Record kidding' }).click()
  await expect(page).toHaveURL(/\/breeding\/kidding\?doe=/)
  await expect(page.getByText('Sire: Rex Ridge Rocket')).toBeVisible()

  await page.getByLabel('Kid 1 weight').fill('2.4')
  await page.getByLabel('Kid 1 name').fill('Ivy')
  await page.getByRole('button', { name: 'Add kid' }).click()
  await page.getByLabel('Kid 2 weight').fill('2.9')
  await page.getByRole('button', { name: 'Add kid' }).click()
  await page.getByRole('combobox', { name: 'Kid 3 outcome' }).click()
  await page.getByRole('option', { name: 'Stillborn' }).click()
  await page.getByRole('combobox', { name: 'Kidding' }).click()
  await page.getByRole('option', { name: 'Assisted', exact: true }).click()
  await page.getByRole('button', { name: 'Save kidding' }).click()

  await expect(page).toHaveURL(new RegExp(`/goats/${ina.id}$`))
  await expect(page.getByText('Kidded · 3 kids')).toBeVisible()
  // The kids are linked as offspring.
  await expect(page.getByRole('link', { name: /Ivy/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Ina kid 2/ })).toBeVisible()

  const kids = await admin.from('goats').select('barn_name, sex, birth_date, sire_id, breed').eq('dam_id', ina.id).order('barn_name')
  expect(kids.data).toEqual([
    { barn_name: 'Ina kid 2', sex: 'buck', birth_date: isoDate(), sire_id: rex.id, breed: 'Nigerian Dwarf' },
    { barn_name: 'Ivy', sex: 'doe', birth_date: isoDate(), sire_id: rex.id, breed: 'Nigerian Dwarf' },
  ])
  const kidRows = await admin.from('kids').select('birth_weight_g, outcome').eq('herd_id', herd.id).order('birth_weight_g', { nullsFirst: true })
  expect(kidRows.data?.filter((k) => k.birth_weight_g !== null)).toEqual([
    { birth_weight_g: lbToGrams(2.4), outcome: 'alive' },
    { birth_weight_g: lbToGrams(2.9), outcome: 'alive' },
  ])
  const lactations = await admin.from('lactations').select('lactation_number, freshened_on, dried_off_on').eq('goat_id', ina.id).order('freshened_on')
  expect(lactations.data).toEqual([
    { lactation_number: 2, freshened_on: isoDate(-400), dried_off_on: isoDate(-1) },
    { lactation_number: 3, freshened_on: isoDate(), dried_off_on: null },
  ])

  await page.goto('/milk')
  await expect(page.getByText('Ina DIM 0')).toBeVisible()
  // Under Recent kiddings, and not listed as a doe to breed: she's a newborn.
  await page.goto('/breeding')
  await expect(page.getByRole('link', { name: 'Ivy' })).toHaveCount(1)
})

test('a heat logged for an open doe predicts the next one', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)
  await page.getByRole('button', { name: 'Log heat' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log a heat' })
  await dialog.getByLabel('Seen in heat on').fill(isoDate(-2))
  await dialog.getByLabel('Signs').fill('Flagging, loud')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText(`Next heat expected ${shown(isoDate(19))}`)).toBeVisible()
  await expect(page.getByText('In heat · Flagging, loud')).toBeVisible()
})

test('pen breeding gives a due window across the exposure', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/goats/${ina.id}`)
  await page.getByRole('button', { name: 'Record breeding' }).click()
  const dialog = page.getByRole('dialog', { name: 'Record a breeding' })
  await dialog.getByRole('combobox', { name: 'Method' }).click()
  await page.getByRole('option', { name: 'Pen bred' }).click()
  await dialog.getByLabel('Buck put in').fill('2026-03-01')
  await dialog.getByLabel('Buck taken out').fill('2026-03-21')
  await expect(dialog.getByText('Due around Aug 8, 2026 (Jul 24, 2026 – Aug 23, 2026)')).toBeVisible()
})

test('a kidding saved with no signal waits, says so, and goes through once back online', async ({ page, context, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await page.goto(`/breeding/kidding?doe=${ina.id}`)
  await expect(page.getByPlaceholder('Search does…')).toHaveValue(/Ina/)
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Save kidding' }).click()
  // Unlike milk, a kidding isn't kept on the device, so the form stays open and says why.
  await expect(page.getByText('No signal. This kidding will save as soon as you are back online')).toBeVisible()
  await expect(page).toHaveURL(/\/breeding\/kidding/)
  await context.setOffline(false)
  await expect(page).toHaveURL(new RegExp(`/goats/${ina.id}$`), { timeout: 20_000 })
  const kiddings = await admin.from('kiddings').select('id').eq('doe_id', ina.id)
  expect(kiddings.data).toHaveLength(1)
})
