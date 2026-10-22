// Imports goats from a Sanity CMS export (the farm website's content) into a herd.
//
//   node scripts/import-sanity-goats.ts --export <dir> --herd <herd id> [--breed "Nigerian Dwarf"]
//     [--appraised-on YYYY-MM-DD] [--apply]
//
// Without --apply it only prints what it would do. Runs against the local
// Supabase stack by default; set SUPABASE_URL and SUPABASE_SECRET_KEY to point
// it at a hosted project. Safe to run twice: goats already in the herd (same
// registration number or name) are skipped.
//
// The export repeats ancestors with slightly different spellings and titles
// ("Diji Farm JRB Typhoon VGV 85", "Diji Farm JRB Typhoon *B VGV 85"), so
// goats are matched on their name with titles, appraisal scores and sire
// initials removed.
//
// A linear appraisal score in a name ("5*M VVEV 88 (@ 2 yo)") becomes an
// appraisal record dated --appraised-on (today if not given), not a title.

import { execFileSync, execSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { splitAppraisal } from '../src/lib/appraisalText.ts'

type Node = { name?: string; link?: string; sire?: Node; dam?: Node }
type SanityGoat = {
  _id: string
  _updatedAt: string
  name: string
  aka?: string
  date?: string
  goatType?: 'doe' | 'buck'
  adgaPedigree?: string
  sire?: Node
  dam?: Node
  copy?: unknown[]
  images?: { _sanityAsset: string; alt?: string }[]
  slug?: { current: string }
}

// --- Arguments and connection ------------------------------------------------------

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const exportDir = arg('export')
const herdId = arg('herd')
const breed = arg('breed') ?? null
const apply = args.includes('--apply')
const appraisedOn = arg('appraised-on') ?? new Date().toISOString().slice(0, 10)
if (!exportDir || !herdId) {
  console.error('Usage: node scripts/import-sanity-goats.ts --export <dir> --herd <herd id> [--breed "Nigerian Dwarf"] [--apply]')
  process.exit(1)
}

function localSupabase() {
  const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const get = (k: string) => out.match(new RegExp(`^${k}="?(.*?)"?$`, 'm'))?.[1]
  return { url: get('API_URL')!, key: get('SECRET_KEY')! }
}
const target = process.env.SUPABASE_URL
  ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY! }
  : localSupabase()
const db = createClient(target.url, target.key, { auth: { persistSession: false } })

// --- Names ----------------------------------------------------------------------------

const PREFIX_TITLES = new Set(['SGCH', 'GCH', 'ARMCH', 'MCH', 'CH', 'SG'])
/** A word that starts the titles/scores after a name: *B, 5*M, VEEV, VEEV90, (pending), ELITE… */
const isTitleWord = (w: string) => /\*|^\(|^[EVGAFP+]{3,4}\d*$|^ELITE$/i.test(w) && !/^[A-Z][a-z]/.test(w)

export function splitName(raw: string) {
  const words = raw.replace(/ /g, ' ').replace(/[’‘]/g, "'").replace(/^[\s:]+/, '').trim().split(/\s+/)
  const prefix: string[] = []
  while (words.length > 1 && PREFIX_TITLES.has(words[0]!)) prefix.push(words.shift()!)
  const cut = words.findIndex((w, i) => i > 0 && isTitleWord(w))
  const name = (cut < 0 ? words : words.slice(0, cut)).join(' ')
  // "VEEV90" and "VEEV 90" are the same score.
  const suffix = cut < 0 ? '' : words.slice(cut).join(' ').replace(/\b([EVGAFP+]{3,4})(\d{2})\b/g, '$1 $2').replace(/\s+/g, ' ')
  return { name, prefix: prefix.join(' ') || null, suffix: suffix || null }
}

/** Matching key: lower case, no sire initials (JRB, AH…), plain apostrophes and spaces. */
export function nameKey(name: string) {
  return splitName(name)
    .name.split(' ')
    .filter((w, i) => i === 0 || !/^[A-Z0-9]{2,3}$/.test(w))
    .join(' ')
    .toLowerCase()
}

const slugFromLink = (link?: string) => link?.match(/birdseyefarm\.com\/goats\/([^/?#]+)/)?.[1]

const copyText = (copy: unknown[] = []) =>
  copy
    .map((c) =>
      typeof c === 'string'
        ? c
        : ((c as { children?: { text?: string }[] }).children ?? []).map((ch) => ch.text ?? '').join(''),
    )
    .filter((t) => t.trim())
    .join('\n\n')

// --- Read the export --------------------------------------------------------------------

const docs = readFileSync(join(exportDir, 'data.ndjson'), 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l) as { _type: string } & SanityGoat)
const herdDocs = docs.filter((d) => d._type === 'goat' && !d._id.startsWith('drafts.'))

type Planned = {
  key: string
  name: string
  prefix: string | null
  suffix: string | null
  sex: 'doe' | 'buck'
  inHerd: boolean
  doc?: SanityGoat
  sireKey?: string
  damKey?: string
  /** Title/score spellings seen for an outside goat, with the record's date. */
  suffixes: { suffix: string | null; prefix: string | null; seen: string }[]
}

const planned = new Map<string, Planned>()
const bySlug = new Map<string, string>()

for (const doc of herdDocs) {
  const { name, prefix, suffix } = splitName(doc.name)
  const key = nameKey(doc.name)
  planned.set(key, { key, name, prefix, suffix, sex: doc.goatType ?? 'doe', inHerd: true, doc, suffixes: [] })
  if (doc.slug?.current) bySlug.set(doc.slug.current, key)
}

function resolve(node: Node | undefined, sex: 'doe' | 'buck', seen: string): string | undefined {
  if (!node?.name?.trim()) return undefined
  const slug = slugFromLink(node.link)
  const key = (slug && bySlug.get(slug)) || nameKey(node.name)
  const { name, prefix, suffix } = splitName(node.name)
  let goat = planned.get(key)
  if (!goat) {
    goat = { key, name, prefix, suffix, sex, inHerd: false, suffixes: [] }
    planned.set(key, goat)
  }
  if (!goat.inHerd) {
    goat.suffixes.push({ suffix, prefix, seen })
  }
  // Always walk the grandparents, so every spelling of them is seen; an
  // outside goat's own parents come from the first record that has them.
  const sireKey = resolve(node.sire, 'buck', seen)
  const damKey = resolve(node.dam, 'doe', seen)
  if (!goat.inHerd) {
    goat.sireKey ??= sireKey
    goat.damKey ??= damKey
  }
  return key
}

for (const goat of [...planned.values()].filter((g) => g.inHerd)) {
  goat.sireKey = resolve(goat.doc!.sire, 'buck', goat.doc!._updatedAt)
  goat.damKey = resolve(goat.doc!.dam, 'doe', goat.doc!._updatedAt)
}

// Outside goats written with different titles or scores: use the spelling
// from the most recently edited record (titles like *B are earned over time),
// and the longer one if two records were edited at the same time.
const conflicts: string[] = []
for (const goat of planned.values()) {
  if (goat.inHerd || !goat.suffixes.length) continue
  const counts = new Map<string, { n: number; seen: string; v: (typeof goat.suffixes)[number] }>()
  for (const v of goat.suffixes) {
    const k = `${v.prefix ?? ''}|${v.suffix ?? ''}`
    const c = counts.get(k) ?? { n: 0, seen: '', v }
    c.n += 1
    if (v.seen > c.seen) c.seen = v.seen
    counts.set(k, c)
  }
  const length = (c: { v: { prefix: string | null; suffix: string | null } }) => (c.v.prefix ?? '').length + (c.v.suffix ?? '').length
  const best = [...counts.values()].sort((a, b) => b.seen.localeCompare(a.seen) || length(b) - length(a))[0]!
  goat.prefix = best.v.prefix
  goat.suffix = best.v.suffix
  if (counts.size > 1) {
    conflicts.push(`${goat.name}: used "${[best.v.prefix, best.v.suffix].filter(Boolean).join(' ')}" over ${[...counts.values()].filter((c) => c !== best).map((c) => `"${[c.v.prefix, c.v.suffix].filter(Boolean).join(' ')}"`).join(', ')}`)
  }
}

// --- Report -------------------------------------------------------------------------------

const label = (key?: string) => (key ? (planned.get(key)?.name ?? key) : '—')
const herd = [...planned.values()].filter((g) => g.inHerd)
const outside = [...planned.values()].filter((g) => !g.inHerd)
console.log(`\nHerd goats (${herd.length}):`)
for (const g of herd) {
  const reg = g.doc!.adgaPedigree?.match(/RegNumber=([A-Z0-9]+)/)?.[1]
  console.log(`  ${[g.prefix, g.name, g.suffix].filter(Boolean).join(' ')}  [${g.sex}, "${g.doc!.aka ?? ''}", born ${g.doc!.date ?? '?'}, ${reg ?? 'no reg #'}, ${g.doc!.images?.length ?? 0} photos]`)
  console.log(`      sire: ${label(g.sireKey)}   dam: ${label(g.damKey)}`)
}
console.log(`\nOutside goats for pedigrees (${outside.length}):`)
for (const g of outside.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${[g.prefix, g.name, g.suffix].filter(Boolean).join(' ')}  [${g.sex}]  sire: ${label(g.sireKey)}  dam: ${label(g.damKey)}`)
}
if (conflicts.length) console.log(`\nSame goat written differently:\n  ${conflicts.join('\n  ')}`)
console.log(`\nBreed: ${breed ?? '(not set)'}`)

if (!apply) {
  console.log('\nDry run only. Add --apply to import.')
  process.exit(0)
}

// --- Import ---------------------------------------------------------------------------------

const { data: herdRow, error: herdError } = await db.from('herds').select('id, name').eq('id', herdId).single()
if (herdError || !herdRow) throw new Error(`Herd ${herdId} not found`)
const { data: existing } = await db.from('goats').select('id, registered_name, registration_number').eq('herd_id', herdId)
const ids = new Map<string, string>()
for (const g of existing ?? []) {
  if (g.registered_name) ids.set(nameKey(g.registered_name), g.id)
}
const regIds = new Map((existing ?? []).filter((g) => g.registration_number).map((g) => [g.registration_number!, g.id]))

// Goats first (parents linked in a second pass, since they reference each other).
let created = 0
let appraisals = 0
for (const g of planned.values()) {
  const reg = g.doc?.adgaPedigree?.match(/RegNumber=([A-Z0-9]+)/)?.[1] ?? null
  const already = (reg && regIds.get(reg)) || ids.get(g.key)
  if (already) {
    ids.set(g.key, already)
    continue
  }
  const { data, error } = await db
    .from('goats')
    .insert({
      herd_id: herdId,
      registered_name: g.name,
      title_prefix: g.prefix,
      title_suffix: splitAppraisal(g.suffix).titles,
      barn_name: g.doc?.aka ?? null,
      sex: g.sex,
      birth_date: g.doc?.date ?? null,
      breed: g.inHerd ? breed : null,
      registry: reg ? 'ADGA' : null,
      registration_number: reg,
      pedigree_url: g.doc?.adgaPedigree ?? null,
      status: g.inHerd ? 'active' : 'reference',
      notes: g.doc ? copyText(g.doc.copy) || null : null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`${g.name}: ${error.message}`)
  ids.set(g.key, data.id)
  created += 1
  const { appraisal } = splitAppraisal(g.suffix)
  if (appraisal) {
    const { age, ...scores } = appraisal
    const { error } = await db
      .from('linear_appraisals')
      .insert({ herd_id: herdId, goat_id: data.id, appraised_on: appraisedOn, ...scores, notes: age ? `Listed as ${age}` : null })
    if (error) throw new Error(`${g.name} appraisal: ${error.message}`)
    appraisals += 1
  }
}

let linked = 0
for (const g of planned.values()) {
  const sire_id = g.sireKey ? ids.get(g.sireKey) : undefined
  const dam_id = g.damKey ? ids.get(g.damKey) : undefined
  if (!sire_id && !dam_id) continue
  // Only fills in missing parents, so a second run doesn't undo edits made in the app.
  const { data: changed, error } = await db
    .from('goats')
    .update({ ...(sire_id ? { sire_id } : {}), ...(dam_id ? { dam_id } : {}) })
    .eq('id', ids.get(g.key)!)
    .is(sire_id ? 'sire_id' : 'dam_id', null)
    .select('id')
  if (error) throw new Error(`${g.name} parents: ${error.message}`)
  linked += changed.length
}

// Photos: shrunk to 1600px like the app does, first one is the main photo.
const work = mkdtempSync(join(tmpdir(), 'goat-photos-'))
let photos = 0
for (const g of herd) {
  const goatId = ids.get(g.key)!
  const { count } = await db.from('goat_photos').select('id', { count: 'exact', head: true }).eq('goat_id', goatId)
  if (count) continue
  for (const [i, img] of (g.doc!.images ?? []).entries()) {
    const file = join(exportDir, img._sanityAsset.replace(/^image@file:\/\/\.\//, ''))
    const small = join(work, `${goatId}-${i}.jpg`)
    execFileSync('sips', ['-Z', '1600', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', file, '--out', small], { stdio: 'ignore' })
    const id = crypto.randomUUID()
    const path = `${herdId}/${goatId}/${id}.jpg`
    const up = await db.storage.from('goat-photos').upload(path, readFileSync(small), { contentType: 'image/jpeg' })
    if (up.error) throw new Error(`${g.name} photo: ${up.error.message}`)
    const alt = img.alt ?? ''
    const kind = /confo/i.test(alt) ? 'conformation' : /head/i.test(alt) ? 'head' : /udder/i.test(alt) ? 'udder' : 'other'
    const { error } = await db.from('goat_photos').insert({ id, herd_id: herdId, goat_id: goatId, storage_path: path, kind, is_primary: i === 0 })
    if (error) throw new Error(`${g.name} photo row: ${error.message}`)
    photos += 1
  }
}

console.log(`\nImported into "${herdRow.name}": ${created} goats created, ${appraisals} appraisals, ${linked} parent links, ${photos} photos.`)
