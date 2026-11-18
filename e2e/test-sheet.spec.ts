// The test sheet: what to write by hand on the lab's DHIR forms.
import { admin, expect, test } from './fixtures.ts'
import { addDoeInMilk, addGoat, addLactation, isoDate, lbToGrams } from './seed.ts'

const testDay = isoDate(-1)
const dayBefore = isoDate(-2)

/** A local time on `date`, as the phone would have saved it. */
function at(date: string, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(`${date}T00:00:00`)
  d.setHours(h!, m!)
  return d.toISOString()
}

const formDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}/${y!.slice(2)}`
}

test('shows what to write on the Owner’s Options form and the barn sheet', async ({ page, owner, herd }) => {
  const { goat: ina } = await addDoeInMilk(owner, herd.id, 'Ina')
  const { goat: clover } = await addDoeInMilk(owner, herd.id, 'Clover')
  await admin.from('goats').update({ dhir_sample_number: 2 }).eq('id', ina.id)
  await admin.from('goats').update({ dhir_sample_number: 1 }).eq('id', clover.id)
  // Dry now, but has freshened: counts toward the herd.
  const dry = await addGoat(owner, herd.id, { barn_name: 'Rosie', sex: 'doe' })
  await addLactation(owner, herd.id, dry.id, isoDate(-400), 1, isoDate(-100))

  const w = (goat_id: string, milked_on: string, milking: number, lb: number, time: string) => ({
    herd_id: herd.id,
    goat_id,
    milked_on,
    milking,
    weight_g: lbToGrams(lb),
    entered_at: at(milked_on, time),
  })
  const { error } = await admin
    .from('milk_weights')
    .insert([
      w(ina.id, dayBefore, 2, 1, '20:05'),
      w(clover.id, dayBefore, 2, 1, '20:50'),
      w(clover.id, testDay, 1, 1.3, '9:02'),
      w(ina.id, testDay, 1, 1.2, '9:40'),
      w(clover.id, testDay, 2, 1.25, '21:31'),
    ])
  if (error) throw error

  // No test recorded yet: the sheet is filled in before the lab's results come back.
  await page.goto('/milk/tests')
  await page.getByRole('link', { name: 'Copy to form' }).click()
  await expect(page).toHaveURL('/milk/tests/sheet')
  await expect(page.getByText(/No milk weights entered on/)).toBeVisible()
  await page.getByRole('button', { name: 'Previous day' }).click()
  await expect(page).toHaveURL(`/milk/tests/sheet?date=${testDay}`)
  await expect(page.getByText(/No milk weights entered on/)).toHaveCount(0)

  await expect(page.getByText(formDate(testDay)).first()).toBeVisible()
  const schedule = page.getByTestId('milking-schedule')
  await expect(schedule).toContainText('Previous Milking Start20:05')
  await expect(schedule).toContainText('Previous Milking Stop20:50')
  await expect(schedule).toContainText('Milking 1 Start9:02')
  await expect(schedule).toContainText('Milking 1 Stop9:40')
  await expect(schedule).toContainText('Milking 2 Start21:31')
  await expect(page.getByText('Number of cows in herd').locator('..')).toContainText('3')

  // Both does are new to test, so they're under enrollment.
  await expect(page.getByText('New Cow Enrollment and Corrections')).toBeVisible()

  // Barn sheet in sample number order; Ina has no PM.
  const rows = page.getByTestId('barn-sheet').locator('tbody tr')
  await expect(rows.nth(0)).toContainText('1Clover1.31.3')
  await expect(rows.nth(1)).toContainText('2Ina1.2—')
  await expect(rows.nth(2)).toContainText('No PM weight')

  // Correct a time; it's saved for the day.
  await page.getByRole('button', { name: 'Correct times' }).click()
  await page.getByLabel('Milking 1 Start').fill('9:00')
  await page.getByRole('button', { name: 'Save times' }).click()
  await expect(schedule).toContainText('Milking 1 Start9:00Corrected')
  await expect
    .poll(
      async () =>
        (await admin.from('milking_times').select('times').eq('herd_id', herd.id).eq('milked_on', testDay).single())
          .data,
    )
    .toEqual({ times: { '1': { start: '9:00' } } })

  // Ticks are remembered on this phone.
  await page.getByRole('checkbox', { name: 'Clover copied' }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Clover copied' })).toBeChecked()

  // Copied from a phone: nothing runs off the right edge at 375px, editing times included.
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(page.getByTestId('barn-sheet')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
  await page.screenshot({ path: test.info().outputPath('test-sheet-375.png'), fullPage: true })
  await page.getByRole('button', { name: 'Correct times' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
  await page.screenshot({ path: test.info().outputPath('test-sheet-375-editing.png'), fullPage: true })
})

test('a DHIR test recorded for the day links to its results, and test pages have no sheet button', async ({
  page,
  owner,
  herd,
}) => {
  await addDoeInMilk(owner, herd.id, 'Ina')
  const { data } = await admin
    .from('milk_tests')
    .insert({ herd_id: herd.id, tested_on: testDay, kind: 'dhir' })
    .select()
    .single()
  await page.goto(`/milk/tests/sheet?date=${testDay}`)
  await page.getByRole('link', { name: "See this day's test results" }).click()
  await expect(page).toHaveURL(`/milk/tests/${data!.id}`)
  await expect(page.getByRole('heading', { name: 'Milk test' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Copy to form' })).toHaveCount(0)

  // The tests page's buttons fit a phone.
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/milk/tests')
  await expect(page.getByRole('link', { name: 'Copy to form' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
  await page.screenshot({ path: test.info().outputPath('milk-tests-375.png') })
})
