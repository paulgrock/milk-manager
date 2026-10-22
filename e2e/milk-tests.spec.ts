import { admin, expect, test } from './fixtures.ts'
import { addLactation, addGoat, addMilkCurve, isoDate, lbToGrams } from './seed.ts'

/** A doe in milk, born `ageYears` before she freshened `daysAgo` days ago. */
async function doe(owner: Parameters<typeof addGoat>[0], herdId: string, name: string, opts: { breed?: string; ageYears?: number; daysAgo?: number } = {}) {
  const daysAgo = opts.daysAgo ?? 60
  const born = new Date()
  born.setDate(born.getDate() - daysAgo)
  born.setMonth(born.getMonth() - Math.round((opts.ageYears ?? 1.5) * 12))
  const birth_date = born.toISOString().slice(0, 10)
  const goat = await addGoat(owner, herdId, { barn_name: name, sex: 'doe', breed: opts.breed ?? 'Nigerian Dwarf', birth_date })
  await addLactation(owner, herdId, goat.id, isoDate(-daysAgo))
  return goat
}

test('enters a DHIR test day: milk comes from the day\'s weights, SCC is read lab-style', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina')
  const clover = await doe(owner, herd.id, 'Clover')
  await owner.client.rpc('record_milking', { p_goat_id: ina.id, p_milked_on: isoDate(), p_milking: 1, p_weight_g: lbToGrams(2) })
  await owner.client.rpc('record_milking', { p_goat_id: ina.id, p_milked_on: isoDate(), p_milking: 2, p_weight_g: lbToGrams(1.6) })

  await page.goto('/milk/tests/new')
  await page.getByLabel('Lab').fill('DHI Provo')
  await expect(page.getByLabel('Ina milk')).toHaveValue('3.6')
  await page.getByLabel('Ina butterfat').fill('6.5')
  await page.getByLabel('Ina protein').fill('4.2')
  await page.getByLabel('Ina SCC').fill('450')
  await page.getByLabel('Clover milk').fill('3')
  await page.getByLabel('Clover butterfat').fill('5')
  await page.getByLabel('Clover SCC').fill('1.8M')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 2 results').first()).toBeVisible()
  await expect(page).toHaveURL(/\/milk\/tests\/[0-9a-f-]{36}$/)

  const results = await admin.from('milk_test_results').select('goat_id, milk_g, butterfat_pct, protein_pct, scc').eq('herd_id', herd.id).order('scc')
  expect(results.data).toEqual([
    { goat_id: ina.id, milk_g: lbToGrams(2) + lbToGrams(1.6), butterfat_pct: 6.5, protein_pct: 4.2, scc: 450_000 },
    { goat_id: clover.id, milk_g: lbToGrams(3), butterfat_pct: 5, protein_pct: null, scc: 1_800_000 },
  ])

  await page.goto('/milk/tests')
  const row = page.getByRole('row').filter({ hasText: 'DHIR test day' })
  await expect(row).toContainText('DHI Provo')
  await expect(row).toContainText('1.13M') // average of 450k and 1.8M

  // Her page shows the result, butterfat pounds, and the high-SCC warning for Clover.
  await page.goto(`/goats/${clover.id}`)
  await expect(page.getByLabel('Over 1.5 million, the Grade A limit')).toBeVisible()
  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByRole('heading', { name: 'Milk tests' })).toBeVisible()
  await expect(page.getByText('0.23 lb')).toBeVisible() // 3.6 lb × 6.5% butterfat
})

test('an ADGA one-day test scores star points for a Nigerian Dwarf', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { daysAgo: 120 })
  const { data: t } = await admin.from('milk_tests').insert({ herd_id: herd.id, tested_on: isoDate(), kind: 'one_day' }).select().single()
  await admin.from('milk_test_results').insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, milk_g: lbToGrams(3), butterfat_pct: 6.5 })

  await page.goto(`/goats/${ina.id}`)
  // 3.0 milk + 3.9 butterfat + 0.48 for 120 days in milk = 7.4, over the 7 points a miniature needs.
  await expect(page.getByText('7.4 of 7 points · *M')).toBeVisible()
  await expect(page.getByText('milk 3 + butterfat 3.9 + days in milk 0.48')).toBeVisible()
})

test('DHIR star progress uses her age at kidding and her test-day butterfat', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { ageYears: 1.5, daysAgo: 120 })
  await addMilkCurve(herd.id, ina.id, 120)
  const { data: t } = await admin.from('milk_tests').insert({ herd_id: herd.id, tested_on: isoDate(-30), kind: 'dhir' }).select().single()
  await admin.from('milk_test_results').insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, milk_g: lbToGrams(4), butterfat_pct: 6.5 })

  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByRole('heading', { name: 'DHIR star (ADGA)' })).toBeVisible()
  const star = page.getByRole('main')
  await expect(star.getByText(/miniature breed · any one of these in 305 days or less/)).toBeVisible()
  // A Nigerian Dwarf kidding before 2 needs 600 lb milk, 21 lb butterfat or 18 lb protein.
  await expect(star.getByRole('row', { name: /Milk 600 lb/ })).toBeVisible()
  await expect(star.getByRole('row', { name: /Butterfat 21 lb/ })).toBeVisible()
  await expect(star.getByRole('row', { name: /Protein 18 lb needs a test/ })).toBeVisible()
  await expect(star.getByText('Star earned')).toBeVisible()
  await expect(star.getByText('and 1 test day')).toBeVisible()
  // The test day is marked on her curve.
  await expect(page.getByText('test day', { exact: true })).toBeVisible()
})

test('a doe without a birth date gets asked for one', async ({ page, owner, herd }) => {
  const ina = await addGoat(owner, herd.id, { barn_name: 'Ina', sex: 'doe' })
  await addLactation(owner, herd.id, ina.id, isoDate(-40))
  await addMilkCurve(herd.id, ina.id, 40)
  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByText('Add her birth date to see what she needs for a star.')).toBeVisible()
})

test('edits and deletes a test', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina')
  const { data: t } = await admin.from('milk_tests').insert({ herd_id: herd.id, tested_on: isoDate(-1), kind: 'dhir' }).select().single()
  await admin.from('milk_test_results').insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, scc: 300_000 })

  await page.goto(`/milk/tests/${t!.id}`)
  await expect(page.getByLabel('Ina SCC')).toHaveValue('300k')
  await page.getByLabel('Ina SCC').fill('')
  await page.getByLabel('Ina butterfat').fill('6')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()
  const updated = await admin.from('milk_test_results').select('scc, butterfat_pct').eq('test_id', t!.id).single()
  expect(updated.data).toEqual({ scc: null, butterfat_pct: 6 })

  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page).toHaveURL(/\/milk\/tests$/)
  await expect(page.getByText('No milk tests yet.')).toBeVisible()
})

test("a DHI report's lactation-to-date and projected 305 figures are shown as printed", async ({ page, owner, herd }) => {
  const elena = await doe(owner, herd.id, 'Elena', { ageYears: 2.5, daysAgo: 150 })
  const tests = [
    { day: -95, milk: 3.2, fat: 6.01, ltd: 175, proj: 897 },
    { day: -56, milk: 2.8, fat: 5.83, ltd: 290, proj: 821 },
    { day: -5, milk: 2.5, fat: 6.02, ltd: 423, proj: 771 },
  ]
  for (const t of tests) {
    const { data } = await admin.from('milk_tests').insert({ herd_id: herd.id, tested_on: isoDate(t.day), kind: 'dhir' }).select().single()
    await admin.from('milk_test_results').insert({
      herd_id: herd.id,
      test_id: data!.id,
      goat_id: elena.id,
      milk_g: lbToGrams(t.milk),
      butterfat_pct: t.fat,
      ltd_milk_g: lbToGrams(t.ltd),
      ltd_fat_g: lbToGrams(26),
      proj305_milk_g: lbToGrams(t.proj),
      proj305_fat_g: lbToGrams(48),
    })
  }

  await page.goto(`/goats/${elena.id}`)
  // So far is DHI's 423 lb, not the 8.5 lb of three test days added up.
  await expect(page.getByText('423 lb').first()).toBeVisible()
  await expect(page.getByText(/DHI report · to day 145/)).toBeVisible()
  await expect(page.getByText('771 lb').first()).toBeVisible()
  await expect(page.getByText('DHI report', { exact: true })).toBeVisible()
  await expect(page.getByText("From your DHI report's lactation-to-date and projected 305-day figures.")).toBeVisible()
  // Only test days, so no weekly average.
  await expect(page.getByText('Last 7 days', { exact: true })).toHaveCount(0)
  // The Lactations list agrees.
  await expect(page.getByRole('button', { name: /#1.*423 lb/ })).toBeVisible()
})
