import { admin, expect, test } from './fixtures.ts'
import { writeFileSync } from 'node:fs'
import { layoutReport, reportHtml } from '../src/lib/dhiReportLayout.ts'
import { addLactation, addGoat, addMilkCurve, isoDate, lbToGrams } from './seed.ts'

/** A doe in milk, born `ageYears` before she freshened `daysAgo` days ago. */
async function doe(
  owner: Parameters<typeof addGoat>[0],
  herdId: string,
  name: string,
  opts: { breed?: string; ageYears?: number; daysAgo?: number } = {},
) {
  const daysAgo = opts.daysAgo ?? 60
  const born = new Date()
  born.setDate(born.getDate() - daysAgo)
  born.setMonth(born.getMonth() - Math.round((opts.ageYears ?? 1.5) * 12))
  const birth_date = born.toISOString().slice(0, 10)
  const goat = await addGoat(owner, herdId, {
    barn_name: name,
    sex: 'doe',
    breed: opts.breed ?? 'Nigerian Dwarf',
    birth_date,
  })
  await addLactation(owner, herdId, goat.id, isoDate(-daysAgo))
  return goat
}

/** Prints made-up report pages to a real PDF, the way a saved report arrives. */
async function printReport(
  page: import('@playwright/test').Page,
  testInfo: import('@playwright/test').TestInfo,
  pages: ReturnType<typeof layoutReport>,
) {
  const printer = await page.context().newPage()
  await printer.setContent(reportHtml(pages))
  const file = testInfo.outputPath('report.pdf')
  writeFileSync(file, await printer.pdf({ width: '11in', height: '8.5in' }))
  await printer.close()
  return file
}

/** A doe's report page with one test line on `daysAgo`. */
function reportDoe(name: string, identification: string, doeNumber: number, daysAgo = 10) {
  const [y, m, d] = isoDate(-daysAgo).split('-')
  return {
    doeNumber,
    name,
    identification,
    birthDate: '4/02/22',
    tests: [
      { date: '6/27/26', milk: '4.2', fat: '5.40', protein: '3.67', snf: '9.42', scc: '28', days: '81' },
      {
        date: `${Number(m)}/${d}/${y!.slice(2)}`,
        milk: '2.8',
        fat: '5.95',
        protein: '4.28',
        snf: '10.03',
        scc: '2442',
        ls: '7.6',
        days: '170',
        ltd: ['654', '39', '25', '63'] as [string, string, string, string],
        proj: ['973', '58', '40', '96'] as [string, string, string, string],
      },
    ],
  }
}
const printedDate = (daysAgo: number) => {
  const [y, m, d] = isoDate(-daysAgo).split('-')
  return `${Number(m)}/${d}/${y!.slice(2)}`
}

test("enters a DHIR test day: milk comes from the day's weights, SCC is read lab-style", async ({
  page,
  owner,
  herd,
}) => {
  const ina = await doe(owner, herd.id, 'Ina')
  const clover = await doe(owner, herd.id, 'Clover')
  await owner.client.rpc('record_milking', {
    p_goat_id: ina.id,
    p_milked_on: isoDate(),
    p_milking: 1,
    p_weight_g: lbToGrams(2),
  })
  await owner.client.rpc('record_milking', {
    p_goat_id: ina.id,
    p_milked_on: isoDate(),
    p_milking: 2,
    p_weight_g: lbToGrams(1.6),
  })

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

  const results = await admin
    .from('milk_test_results')
    .select('goat_id, milk_g, butterfat_pct, protein_pct, scc')
    .eq('herd_id', herd.id)
    .order('scc')
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
  const { data: t } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(), kind: 'one_day' })
    .select()
    .single()
  await admin
    .from('milk_test_results')
    .insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, milk_g: lbToGrams(3), butterfat_pct: 6.5 })

  await page.goto(`/goats/${ina.id}`)
  // 3.0 milk + 3.9 butterfat + 0.48 for 120 days in milk = 7.4, over the 7 points a miniature needs.
  await expect(page.getByText('7.4 of 7 points · *M')).toBeVisible()
  await expect(page.getByText('milk 3 + butterfat 3.9 + days in milk 0.48')).toBeVisible()
})

test('DHIR star progress uses her age at kidding and her test-day butterfat', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { ageYears: 1.5, daysAgo: 120 })
  await addMilkCurve(herd.id, ina.id, 120)
  const { data: t } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-30), kind: 'dhir' })
    .select()
    .single()
  await admin
    .from('milk_test_results')
    .insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, milk_g: lbToGrams(4), butterfat_pct: 6.5 })

  await page.goto(`/goats/${ina.id}`)
  await expect(page.getByRole('heading', { name: 'DHIR star (ADGA)' })).toBeVisible()
  const star = page.getByRole('main')
  await expect(star.getByText(/miniature breed · any one of these in 305 days or less/)).toBeVisible()
  // A Nigerian Dwarf kidding before 2 needs 600 lb milk, 31 lb butterfat or 18 lb protein.
  await expect(star.getByRole('row', { name: /Milk 600 lb/ })).toBeVisible()
  await expect(star.getByRole('row', { name: /Butterfat 31 lb/ })).toBeVisible()
  await expect(star.getByRole('row', { name: /Protein 18 lb needs a test/ })).toBeVisible()
  await expect(star.getByText('Star earned')).toBeVisible()
  await expect(star.getByText('and 1 test day')).toBeVisible()
  // The test day is marked on her curve.
  await expect(page.getByText('test day', { exact: true })).toBeVisible()
})

test('saving a test updates her DHIR star totals', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { ageYears: 1.5, daysAgo: 120 })
  await addMilkCurve(herd.id, ina.id, 120)

  // Load her page first, so the star is already cached when the test is saved.
  await page.goto(`/goats/${ina.id}`)
  const star = page.getByRole('main')
  await expect(star.getByRole('row', { name: /Butterfat 31 lb needs a test/ })).toBeVisible()
  await expect(star.getByText('Estimated from your weights.')).toBeVisible()

  await page.goto('/milk/tests/new')
  await page.getByLabel('Ina milk').fill('4')
  await page.getByLabel('Ina butterfat').fill('6.5')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()

  // Back to her page without reloading the app: the star has her butterfat now.
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Goats' }).first().click()
  await page.getByRole('link', { name: /Ina/ }).first().click()
  await expect(page).toHaveURL(new RegExp(`/goats/(${ina.id}|[a-z0-9-]+)$`))
  await expect(star.getByRole('row', { name: /Butterfat 31 lb \d[\d,.]* lb/ })).toBeVisible()
  await expect(star.getByText('and 1 test day')).toBeVisible()
})

test('a test day after the latest DHI report is added on to the report for her star', async ({ page, owner, herd }) => {
  const elena = await doe(owner, herd.id, 'Elena', { ageYears: 2.5, daysAgo: 150 })
  const report = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-40), kind: 'dhir' })
    .select()
    .single()
  await admin.from('milk_test_results').insert({
    herd_id: herd.id,
    test_id: report.data!.id,
    goat_id: elena.id,
    milk_g: lbToGrams(3),
    butterfat_pct: 6,
    ltd_milk_g: lbToGrams(423),
    ltd_fat_g: lbToGrams(26),
    proj305_milk_g: lbToGrams(771),
    proj305_fat_g: lbToGrams(48),
  })
  // Entered by hand before the lab's report comes back: no lactation-to-date figures.
  const later = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-5), kind: 'dhir' })
    .select()
    .single()
  await admin.from('milk_test_results').insert({
    herd_id: herd.id,
    test_id: later.data!.id,
    goat_id: elena.id,
    milk_g: lbToGrams(2.5),
    butterfat_pct: 6,
  })

  await page.goto(`/goats/${elena.id}`)
  const star = page.getByRole('main')
  // 423 lb on the report at day 110, then days 111–145 sloping from 3 lb to 2.5 lb: 96 lb more.
  await expect(star.getByRole('row', { name: /^Milk 615 lb 519 lb$/ })).toBeVisible()
  // 26 lb on the report plus 6% of those 96 lb.
  await expect(star.getByRole('row', { name: /^Butterfat 31\.\d+ lb 31\.8 lb$/ })).toBeVisible()
  await expect(star.getByText(/plus an estimate from your weights and test days since that report/)).toBeVisible()
  // DHI's projection is from before the newer test, so it isn't shown as current.
  await expect(star.getByText('771 lb')).toHaveCount(0)
})

test('fills a test day from a DHI report PDF: matched by registration, in report order', async ({
  page,
  owner,
  herd,
}, testInfo) => {
  // Her barn name isn't the name on the report; her registration number is.
  const bram = await addGoat(owner, herd.id, {
    barn_name: 'Bram',
    sex: 'doe',
    breed: 'Nigerian Dwarf',
    registration_number: 'D001111111',
    birth_date: isoDate(-1000),
  })
  await addLactation(owner, herd.id, bram.id, isoDate(-180))
  // Registered as someone else, so STRANGER's DOE NO. 2 mustn't match her.
  await addGoat(owner, herd.id, {
    barn_name: 'Decoy',
    sex: 'doe',
    registration_number: 'D009999998',
    dhir_sample_number: 2,
  })
  const pdf = await printReport(
    page,
    testInfo,
    layoutReport('TEST FARM', printedDate(10), [
      reportDoe('BRAMBLE', 'ND USA 1111111', 1),
      reportDoe('STRANGER', 'ND USA 9999999', 2),
    ]),
  )

  await page.goto('/milk/tests/new')
  await page.locator('input[type=file]').setInputFiles(pdf)
  await expect(page.getByText('Filled 1 doe from the report').first()).toBeVisible()
  await expect(page.getByText(/Not found in your herd: STRANGER/).first()).toBeVisible()
  await expect(page.getByLabel('Test date')).toHaveValue(isoDate(-10))
  await expect(page.getByLabel('Bram milk')).toHaveValue('2.8')
  await expect(page.getByLabel('Bram butterfat')).toHaveValue('5.95')
  await expect(page.getByLabel('Bram protein')).toHaveValue('4.28')
  await expect(page.getByLabel('Bram SNF')).toHaveValue('10.03')
  await expect(page.getByLabel('Bram SCC')).toHaveValue('2442k')
  await expect(page.getByRole('button', { name: /Report totals 654 lb to date · 973 lb projected/ })).toBeVisible()

  // Tab goes through her numbers in the order they're printed on the report line.
  await page.getByRole('button', { name: /Report totals/ }).click()
  await page.getByLabel('Bram milk').focus()
  const order = [await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))]
  // One more press for the Report totals button between SCC and her totals.
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press('Tab')
    order.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? null))
  }
  expect(order.filter((l) => l?.startsWith('Bram'))).toEqual([
    'Bram milk',
    'Bram butterfat',
    'Bram protein',
    'Bram SNF',
    'Bram SCC',
    'Bram to date milk',
    'Bram to date butterfat',
    'Bram to date protein',
    'Bram to date snf',
    'Bram projected 305 milk',
    'Bram projected 305 butterfat',
    'Bram projected 305 protein',
    'Bram projected 305 snf',
  ])

  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()
  const { data: saved } = await admin
    .from('milk_test_results')
    .select(
      'milk_g, butterfat_pct, protein_pct, snf_pct, scc, ltd_milk_g, ltd_fat_g, ltd_snf_g, proj305_milk_g, proj305_snf_g',
    )
    .eq('goat_id', bram.id)
    .single()
  expect(saved).toEqual({
    milk_g: lbToGrams(2.8),
    butterfat_pct: 5.95,
    protein_pct: 4.28,
    snf_pct: 10.03,
    scc: 2_442_000,
    ltd_milk_g: lbToGrams(654),
    ltd_fat_g: lbToGrams(39),
    ltd_snf_g: lbToGrams(63),
    proj305_milk_g: lbToGrams(973),
    proj305_snf_g: lbToGrams(96),
  })

  // Her star now uses the report's own figures.
  await page.goto(`/goats/${bram.id}`)
  await expect(page.getByText("From your DHI report's lactation-to-date and projected 305-day figures.")).toBeVisible()
})

test('report totals can be typed in by hand when editing a test', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { daysAgo: 120 })
  const { data: t } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-3), kind: 'dhir' })
    .select()
    .single()
  await admin
    .from('milk_test_results')
    .insert({ herd_id: herd.id, test_id: t!.id, goat_id: ina.id, milk_g: lbToGrams(3), butterfat_pct: 6.5 })

  await page.goto(`/milk/tests/${t!.id}`)
  await expect(page.getByRole('button', { name: /Report totals not entered/ })).toBeVisible()
  await page.getByRole('button', { name: /Report totals/ }).click()
  await page.getByLabel('Ina to date milk').fill('412')
  await page.getByLabel('Ina projected 305 milk').fill('nope')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Report totals should be lb, like 519 or 31.8')).toBeVisible()
  await page.getByLabel('Ina projected 305 milk').fill('880')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()
  const { data: saved } = await admin
    .from('milk_test_results')
    .select('ltd_milk_g, proj305_milk_g')
    .eq('goat_id', ina.id)
    .single()
  expect(saved).toEqual({ ltd_milk_g: lbToGrams(412), proj305_milk_g: lbToGrams(880) })
})

test('a kg herd keeps report numbers exact, and untouched totals save as stored', async ({
  page,
  owner,
  herd,
}, testInfo) => {
  await admin.from('herds').update({ weight_unit: 'kg' }).eq('id', herd.id)
  const bram = await addGoat(owner, herd.id, {
    barn_name: 'Bram',
    sex: 'doe',
    registration_number: 'D001111111',
  })
  await addLactation(owner, herd.id, bram.id, isoDate(-180))
  const pdf = await printReport(
    page,
    testInfo,
    layoutReport('TEST FARM', printedDate(10), [reportDoe('BRAMBLE', 'ND USA 1111111', 1)]),
  )
  await page.goto('/milk/tests/new')
  await page.locator('input[type=file]').setInputFiles(pdf)
  // 2.8 lb is 1.27 kg, not 1.3.
  await expect(page.getByLabel('Bram milk')).toHaveValue('1.27')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()
  const first = await admin.from('milk_test_results').select('id, test_id, milk_g').eq('goat_id', bram.id).single()
  expect(first.data!.milk_g).toBe(lbToGrams(2.8))

  // Figures that don't land on a hundredth of a kilo, opened and saved untouched.
  await admin
    .from('milk_test_results')
    .update({ milk_g: 1271, ltd_fat_g: 11793, proj305_milk_g: 441349 })
    .eq('id', first.data!.id)
  await page.goto(`/milk/tests/${first.data!.test_id}`)
  await expect(page.getByLabel('Bram milk')).toHaveValue('1.27')
  await page.getByRole('button', { name: 'Save test' }).click()
  await expect(page.getByText('Saved 1 result').first()).toBeVisible()
  const again = await admin
    .from('milk_test_results')
    .select('milk_g, ltd_fat_g, proj305_milk_g')
    .eq('goat_id', bram.id)
    .single()
  expect(again.data).toEqual({ milk_g: 1271, ltd_fat_g: 11793, proj305_milk_g: 441349 })
})

test("says the PDF reader didn't load, not that the report is wrong", async ({ page, owner, herd }, testInfo) => {
  await doe(owner, herd.id, 'Ina')
  const pdf = await printReport(
    page,
    testInfo,
    layoutReport('TEST FARM', printedDate(10), [reportDoe('INA', 'ND USA 1111111', 1)]),
  )
  // As if offline before pdf.js was ever downloaded.
  await page.route(/\/assets\/pdf[^/]*$/, (route) => route.abort())
  await page.goto('/milk/tests/new')
  await page.locator('input[type=file]').setInputFiles(pdf)
  await expect(page.getByText("Couldn't open the PDF reader").first()).toBeVisible()
  await expect(page.getByText('No does found in that PDF')).toHaveCount(0)
})

test('report totals stay visible on a test that is not a DHIR test day', async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina', { daysAgo: 120 })
  const { data: t } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-3), kind: 'owner' })
    .select()
    .single()
  await admin.from('milk_test_results').insert({
    herd_id: herd.id,
    test_id: t!.id,
    goat_id: ina.id,
    milk_g: lbToGrams(3),
    ltd_milk_g: lbToGrams(412),
  })
  await page.goto(`/milk/tests/${t!.id}`)
  await expect(page.getByRole('button', { name: /Report totals 412 lb to date/ })).toBeVisible()
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
  const { data: t } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: isoDate(-1), kind: 'dhir' })
    .select()
    .single()
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

test("a DHI report's lactation-to-date and projected 305 figures are shown as printed", async ({
  page,
  owner,
  herd,
}) => {
  const elena = await doe(owner, herd.id, 'Elena', { ageYears: 2.5, daysAgo: 150 })
  const tests = [
    { day: -95, milk: 3.2, fat: 6.01, ltd: 175, proj: 897 },
    { day: -56, milk: 2.8, fat: 5.83, ltd: 290, proj: 821 },
    { day: -5, milk: 2.5, fat: 6.02, ltd: 423, proj: 771 },
  ]
  for (const t of tests) {
    const { data } = await admin
      .from('milk_tests')
      .insert({ herd_id: herd.id, tested_on: isoDate(t.day), kind: 'dhir' })
      .select()
      .single()
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

test('a new test lists does in barn sheet order: sample number, then name', async ({ page, owner, herd }) => {
  const ada = await doe(owner, herd.id, 'Ada')
  const bea = await doe(owner, herd.id, 'Bea')
  const cy = await doe(owner, herd.id, 'Cy')
  await doe(owner, herd.id, 'Abby')
  await admin.from('goats').update({ dhir_sample_number: 1 }).eq('id', cy.id)
  await admin.from('goats').update({ dhir_sample_number: 2 }).eq('id', ada.id)
  await admin.from('goats').update({ dhir_sample_number: 10 }).eq('id', bea.id)

  await page.goto('/milk/tests/new')
  const milk = page.getByRole('textbox', { name: / milk$/ })
  await expect(milk).toHaveCount(4)
  const order = await milk.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
  expect(order).toEqual(['Cy milk', 'Ada milk', 'Bea milk', 'Abby milk'])

  await page.setViewportSize({ width: 375, height: 812 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})

test("changing the test date swaps in that day's milk weights but keeps typed ones", async ({ page, owner, herd }) => {
  const ina = await doe(owner, herd.id, 'Ina')
  const clover = await doe(owner, herd.id, 'Clover')
  const dot = await doe(owner, herd.id, 'Dot')
  const weigh = (goatId: string, daysAgo: number, lb: number) =>
    owner.client.rpc('record_milking', {
      p_goat_id: goatId,
      p_milked_on: isoDate(-daysAgo),
      p_milking: 1,
      p_weight_g: lbToGrams(lb),
    })
  await weigh(ina.id, 0, 3)
  await weigh(ina.id, 1, 2)
  await weigh(clover.id, 0, 1)
  await weigh(dot.id, 0, 4)

  await page.goto('/milk/tests/new')
  await expect(page.getByLabel('Ina milk')).toHaveValue('3')
  await expect(page.getByLabel('Dot milk')).toHaveValue('4')
  await page.getByLabel('Clover milk').fill('5')

  await page.getByLabel('Test date').fill(isoDate(-1))
  await expect(page.getByLabel('Ina milk')).toHaveValue('2')
  await expect(page.getByLabel('Clover milk')).toHaveValue('5')
  await expect(page.getByLabel('Dot milk')).toHaveValue('')
})
