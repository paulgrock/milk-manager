// Imports lactations, kiddings and DHIR test days from a JSON file of a
// DHI report (typed in, or read from the doe pages) into a herd.
//
//   node scripts/import-dhir.ts --file <report.json> --herd <herd id> [--apply]
//
// Without --apply it only prints what it would do. Local Supabase by default;
// set SUPABASE_URL and SUPABASE_SECRET_KEY for a hosted project. Safe to run
// twice: lactations, kiddings, test days and results already there are kept.
//
// File format:
//   { lab, kind: "dhir" | "one_day" | "owner", sccUnit: "thousands" | "cells",
//     does: [{ registration, barn,
//              lactations: [{ number, kidded: "YYYY-MM-DD", milkDays?,      // milkDays set = dried off
//                             record?: { milk, fat, protein },               // complete lactation, lb
//                             record305?: { milk, fat, protein } }],         // first 305 days, lb
//              tests: [["YYYY-MM-DD", milkLb, fatPct, proteinPct, scc,
//                       dim?, ltdMilk?, ltdFat?, ltdProtein?, proj305Milk?, proj305Fat?, proj305Protein?], ...] }] }
//
// Lactation-to-date and projected 305-day figures are stored as printed, and
// are what the app shows; a re-run updates them from the file.

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

type Report = {
  lab?: string
  kind?: 'dhir' | 'one_day' | 'owner'
  sccUnit?: 'thousands' | 'cells'
  does: {
    registration: string
    barn?: string
    lactations: {
      number: number
      kidded: string
      milkDays?: number
      record?: { milk: number; fat?: number; protein?: number }
      record305?: { milk: number; fat?: number; protein?: number }
    }[]
    tests: (string | number | null)[][]
  }[]
}

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const file = arg('file')
const herdId = arg('herd')
const apply = args.includes('--apply')
if (!file || !herdId) {
  console.error('Usage: node scripts/import-dhir.ts --file <report.json> --herd <herd id> [--apply]')
  process.exit(1)
}

function localSupabase() {
  const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const get = (k: string) => out.match(new RegExp(`^${k}="?(.*?)"?$`, 'm'))?.[1]
  return { url: get('API_URL')!, key: get('SECRET_KEY')! }
}
const target = process.env.SUPABASE_URL ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY! } : localSupabase()
const db = createClient(target.url, target.key, { auth: { persistSession: false } })

const GRAMS_PER_LB = 453.59237
const lbToG = (lb: number | null | undefined) => (lb === null || lb === undefined ? null : Math.round(lb * GRAMS_PER_LB))
const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d! + days))
  return date.toISOString().slice(0, 10)
}

const report = JSON.parse(readFileSync(file, 'utf8')) as Report
const sccFactor = report.sccUnit === 'cells' ? 1 : 1000
const kind = report.kind ?? 'dhir'

// --- Match does --------------------------------------------------------------------------

const { data: goats, error } = await db
  .from('goats')
  .select('id, barn_name, registered_name, registration_number, sex')
  .eq('herd_id', herdId)
if (error) throw error
const byReg = new Map(goats.filter((g) => g.registration_number).map((g) => [g.registration_number!.toUpperCase(), g]))

const missing = report.does.filter((d) => !byReg.get(d.registration.toUpperCase()))
if (missing.length) {
  console.error(`Not in this herd (by registration number): ${missing.map((d) => `${d.barn ?? ''} ${d.registration}`).join(', ')}`)
  process.exit(1)
}

// --- Report ------------------------------------------------------------------------------

const testDates = [...new Set(report.does.flatMap((d) => d.tests.map((t) => t[0])))].sort()
console.log(`\n${report.does.length} does, ${testDates.length} test days (${testDates[0]} – ${testDates.at(-1)}), lab: ${report.lab ?? '—'}\n`)
for (const d of report.does) {
  const g = byReg.get(d.registration.toUpperCase())!
  console.log(`${g.barn_name ?? g.registered_name} (${d.registration})`)
  for (const l of d.lactations) {
    const dry = l.milkDays !== undefined ? addDays(l.kidded, l.milkDays) : null
    console.log(`  Lactation ${l.number}: kidded ${l.kidded}, ${dry ? `dried off ${dry} (${l.milkDays} days)` : 'in milk'}`)
  }
  for (const [date, milk, fat, protein, scc, dim, ltd, , , proj] of d.tests as [string, number, number, number, number | null, number?, number?, number?, number?, number?][]) {
    console.log(
      `  Test ${date}: ${milk ?? '—'} lb, fat ${fat ?? '—'}%, protein ${protein ?? '—'}%, SCC ${scc === null ? '—' : (scc * sccFactor).toLocaleString()}` +
        (ltd !== undefined ? `  | day ${dim}, to date ${ltd} lb, projected 305 ${proj ?? '—'} lb` : ''),
    )
  }
}

if (!apply) {
  console.log('\nDry run only. Add --apply to import.')
  process.exit(0)
}

// --- Import ------------------------------------------------------------------------------

let lactations = 0
let kiddings = 0
for (const d of report.does) {
  const goat = byReg.get(d.registration.toUpperCase())!
  for (const l of d.lactations) {
    const dried = l.milkDays !== undefined ? addDays(l.kidded, l.milkDays) : null
    const official = {
      official_days: l.record ? (l.milkDays ?? null) : null,
      official_milk_g: lbToG(l.record?.milk),
      official_fat_g: lbToG(l.record?.fat),
      official_protein_g: lbToG(l.record?.protein),
      official_305_milk_g: lbToG(l.record305?.milk),
      official_305_fat_g: lbToG(l.record305?.fat),
      official_305_protein_g: lbToG(l.record305?.protein),
    }
    const { data: existing } = await db.from('lactations').select('id').eq('goat_id', goat.id).eq('freshened_on', l.kidded)
    if (!existing?.length) {
      const { error } = await db
        .from('lactations')
        .insert({ herd_id: herdId, goat_id: goat.id, lactation_number: l.number, freshened_on: l.kidded, dried_off_on: dried, ...official })
      if (error) throw new Error(`${goat.barn_name} lactation ${l.number}: ${error.message}`)
      lactations += 1
    } else if (l.record) {
      const { error } = await db.from('lactations').update(official).eq('id', existing[0]!.id)
      if (error) throw new Error(`${goat.barn_name} lactation ${l.number} record: ${error.message}`)
    }
    const { data: kidding } = await db.from('kiddings').select('id').eq('doe_id', goat.id).eq('kidded_on', l.kidded)
    if (!kidding?.length) {
      const { error } = await db
        .from('kiddings')
        .insert({ herd_id: herdId, doe_id: goat.id, kidded_on: l.kidded, notes: `From ${report.lab ?? 'DHI'} report (lactation ${l.number})` })
      if (error) throw new Error(`${goat.barn_name} kidding ${l.kidded}: ${error.message}`)
      kiddings += 1
    }
  }
}

// One test per date, shared by every doe tested that day.
const testIds = new Map<string, string>()
let testsCreated = 0
for (const date of testDates) {
  const { data: found } = await db.from('milk_tests').select('id').eq('herd_id', herdId).eq('tested_on', date).eq('kind', kind)
  if (found?.length) {
    testIds.set(date, found[0]!.id)
    continue
  }
  const { data: created, error } = await db
    .from('milk_tests')
    .insert({ herd_id: herdId, tested_on: date, kind, lab: report.lab ?? null })
    .select('id')
    .single()
  if (error) throw new Error(`Test ${date}: ${error.message}`)
  testIds.set(date, created.id)
  testsCreated += 1
}

type Row = [string, number | null, number | null, number | null, number | null, number?, number?, number?, number?, number?, number?, number?]
const rows = report.does.flatMap((d) =>
  (d.tests as Row[]).map(([date, milk, fat, protein, scc, dim, ltdMilk, ltdFat, ltdProtein, projMilk, projFat, projProtein]) => ({
    herd_id: herdId,
    test_id: testIds.get(date)!,
    goat_id: byReg.get(d.registration.toUpperCase())!.id,
    milk_g: lbToG(milk),
    butterfat_pct: fat,
    protein_pct: protein,
    scc: scc === null ? null : Math.round(scc * sccFactor),
    dim: dim ?? null,
    ltd_milk_g: lbToG(ltdMilk),
    ltd_fat_g: lbToG(ltdFat),
    ltd_protein_g: lbToG(ltdProtein),
    proj305_milk_g: lbToG(projMilk),
    proj305_fat_g: lbToG(projFat),
    proj305_protein_g: lbToG(projProtein),
  })),
)
const { data: before } = await db.from('milk_test_results').select('test_id, goat_id').in('test_id', [...testIds.values()])
const known = new Set((before ?? []).map((r) => `${r.test_id}|${r.goat_id}`))
// Upsert: new results are added, existing ones get the report's figures.
const { error: resultsError } = await db.from('milk_test_results').upsert(rows, { onConflict: 'test_id,goat_id' })
if (resultsError) throw resultsError
const inserted = rows.filter((r) => !known.has(`${r.test_id}|${r.goat_id}`))

console.log(`\nImported: ${lactations} lactations, ${kiddings} kiddings, ${testsCreated} test days, ${inserted.length} results.`)
