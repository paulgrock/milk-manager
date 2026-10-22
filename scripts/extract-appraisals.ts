// Moves linear appraisal scores written into goats' titles ("5*M VVEV 88")
// into appraisal records, leaving the real titles ("5*M").
//
//   node scripts/extract-appraisals.ts --herd <herd id> --appraised-on YYYY-MM-DD [--apply]
//
// Without --apply it only prints what it would do. Local Supabase by default;
// set SUPABASE_URL and SUPABASE_SECRET_KEY for a hosted project. A goat that
// already has the same score on that date isn't given a second one.

import { execSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { splitAppraisal } from '../src/lib/appraisalText.ts'

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const herdId = arg('herd')
const appraisedOn = arg('appraised-on')
const apply = args.includes('--apply')
if (!herdId || !appraisedOn || !/^\d{4}-\d{2}-\d{2}$/.test(appraisedOn)) {
  console.error('Usage: node scripts/extract-appraisals.ts --herd <herd id> --appraised-on YYYY-MM-DD [--apply]')
  process.exit(1)
}

function localSupabase() {
  const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const get = (k: string) => out.match(new RegExp(`^${k}="?(.*?)"?$`, 'm'))?.[1]
  return { url: get('API_URL')!, key: get('SECRET_KEY')! }
}
const target = process.env.SUPABASE_URL ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY! } : localSupabase()
const db = createClient(target.url, target.key, { auth: { persistSession: false } })

const { data: goats, error } = await db
  .from('goats')
  .select('id, registered_name, barn_name, title_suffix')
  .eq('herd_id', herdId)
  .not('title_suffix', 'is', null)
  .order('registered_name')
if (error) throw error
const { data: existing } = await db.from('linear_appraisals').select('goat_id, appraised_on, final_score').eq('herd_id', herdId)
const have = new Set((existing ?? []).map((a) => `${a.goat_id}|${a.appraised_on}|${a.final_score}`))

const found = goats.flatMap((g) => {
  const { titles, appraisal } = splitAppraisal(g.title_suffix)
  return appraisal ? [{ goat: g, titles, appraisal }] : []
})
for (const { goat, titles, appraisal } of found) {
  const codes = [appraisal.general_appearance, appraisal.dairy_strength, appraisal.body_capacity, appraisal.mammary_system].join('')
  console.log(
    `${goat.registered_name ?? goat.barn_name}: "${goat.title_suffix}" → titles "${titles ?? ''}", appraisal ${codes} ${appraisal.final_score}` +
      (appraisal.age ? ` (${appraisal.age})` : ''),
  )
}
console.log(`\n${found.length} goats with a score in their titles, appraised ${appraisedOn}.`)
if (!apply) {
  console.log('Dry run only. Add --apply to move them.')
  process.exit(0)
}

let added = 0
for (const { goat, titles, appraisal } of found) {
  const { age, ...scores } = appraisal
  if (!have.has(`${goat.id}|${appraisedOn}|${scores.final_score}`)) {
    const { error } = await db
      .from('linear_appraisals')
      .insert({ herd_id: herdId, goat_id: goat.id, appraised_on: appraisedOn, ...scores, notes: age ? `Listed as ${age}` : null })
    if (error) throw new Error(`${goat.registered_name} appraisal: ${error.message}`)
    added += 1
  }
  const { error } = await db.from('goats').update({ title_suffix: titles }).eq('id', goat.id)
  if (error) throw new Error(`${goat.registered_name} titles: ${error.message}`)
}
console.log(`Added ${added} appraisals and cleaned ${found.length} titles.`)
