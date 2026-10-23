// Copies one herd, with its members' accounts and photos, from one Supabase
// project to another: e.g. from the local stack to the hosted project.
//
//   TARGET_SUPABASE_URL=https://<ref>.supabase.co TARGET_SUPABASE_SECRET_KEY=sb_secret_... \
//     node scripts/copy-herd.ts --herd <herd id> [--apply]
//
// Without --apply it only prints what it would copy. The source is the local
// stack unless SUPABASE_URL and SUPABASE_SECRET_KEY are set. Ids are kept, so
// links between records survive. Members get accounts on the target with the
// same id and email (or their existing account there, matched by email); they
// sign in there with an emailed code as usual. Refuses to run if the herd is
// already on the target.

import { execSync } from 'node:child_process'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const herdId = arg('herd')
const apply = args.includes('--apply')
if (!herdId || !process.env.TARGET_SUPABASE_URL || !process.env.TARGET_SUPABASE_SECRET_KEY) {
  console.error('Usage: TARGET_SUPABASE_URL=... TARGET_SUPABASE_SECRET_KEY=... node scripts/copy-herd.ts --herd <herd id> [--apply]')
  process.exit(1)
}

function localSupabase() {
  const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const get = (k: string) => out.match(new RegExp(`^${k}="?(.*?)"?$`, 'm'))?.[1]
  return { url: get('API_URL')!, key: get('SECRET_KEY')! }
}
const source = process.env.SUPABASE_URL ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY! } : localSupabase()
const noSession = { auth: { persistSession: false } }
const from = createClient(source.url, source.key, noSession)
const to = createClient(process.env.TARGET_SUPABASE_URL, process.env.TARGET_SUPABASE_SECRET_KEY, noSession)

// Parents before children. Goats go in without their sire and dam, which are
// linked once every goat is there.
const TABLES = [
  'herds',
  'herd_members',
  'herd_invites',
  'goats',
  'linear_appraisals',
  'goat_photos',
  'care_types',
  'care_events',
  'treatments',
  'health_observations',
  'disease_tests',
  'lactations',
  'milk_weights',
  'heats',
  'breedings',
  'pregnancy_checks',
  'kiddings',
  'kids',
  'milk_tests',
  'milk_test_results',
  'finance_entries',
] as const
// Columns that point at an account.
const USER_COLUMNS = ['created_by', 'recorded_by', 'invited_by', 'user_id']

type Row = Record<string, unknown>

async function rowsOf(db: SupabaseClient, table: string): Promise<Row[]> {
  const rows: Row[] = []
  const column = table === 'herds' ? 'id' : 'herd_id'
  for (let start = 0; ; start += 1000) {
    let query = db.from(table).select('*').eq(column, herdId!)
    // A stable order for paging; goats oldest first so each keeps the same page address.
    if (table === 'goats') query = query.order('created_at').order('id')
    else query = query.order(table === 'herd_members' ? 'user_id' : 'id')
    const { data, error } = await query.range(start, start + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

// --- Read ----------------------------------------------------------------------------------

const data = new Map<string, Row[]>()
for (const table of TABLES) data.set(table, await rowsOf(from, table))
const herd = data.get('herds')![0]
if (!herd) throw new Error(`Herd ${herdId} not found in the source`)

const { data: already } = await to.from('herds').select('id').eq('id', herdId)
if (already?.length) {
  console.error(`"${herd.name}" is already on the target. Nothing copied.`)
  process.exit(1)
}

console.log(`\nCopying "${herd.name}" from ${source.url} to ${process.env.TARGET_SUPABASE_URL}\n`)
for (const table of TABLES) console.log(`  ${table.padEnd(20)} ${data.get(table)!.length}`)
const members = data.get('herd_members')!
const photos = data.get('goat_photos')!
console.log(`  ${'photo files'.padEnd(20)} ${photos.length}`)
console.log(`  accounts: ${members.map((m) => m.email).join(', ')}`)

if (!apply) {
  console.log('\nDry run only. Add --apply to copy.')
  process.exit(0)
}

// --- Accounts ------------------------------------------------------------------------------

// Source account id → target account id.
const accounts = new Map<string, string>()
const { data: targetUsers, error: usersError } = await to.auth.admin.listUsers({ perPage: 1000 })
if (usersError) throw usersError
for (const m of members) {
  const id = m.user_id as string
  const email = (m.email as string).toLowerCase()
  const existing = targetUsers.users.find((u) => u.email?.toLowerCase() === email)
  if (existing) {
    accounts.set(id, existing.id)
    continue
  }
  const { data: source } = await from.auth.admin.getUserById(id)
  const { data: made, error } = await to.auth.admin.createUser({
    id,
    email,
    email_confirm: true,
    user_metadata: source.user?.user_metadata ?? {},
  })
  if (error) throw new Error(`Account for ${email}: ${error.message}`)
  accounts.set(id, made.user.id)
}
const account = (id: unknown) => (typeof id === 'string' ? (accounts.get(id) ?? null) : null)

// --- Rows ----------------------------------------------------------------------------------

async function insert(table: string, rows: Row[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await to.from(table).insert(rows.slice(i, i + 500))
    if (error) throw new Error(`${table}: ${error.message}`)
  }
}

for (const table of TABLES) {
  let rows = data.get(table)!.map((r) => {
    const copy = { ...r }
    for (const c of USER_COLUMNS) if (c in copy) copy[c] = account(copy[c])
    return copy
  })
  if (table === 'herd_members') rows = rows.filter((r) => r.user_id)
  if (table === 'goats') rows = rows.map(({ sire_id: _s, dam_id: _d, slug: _slug, ...r }) => r)
  await insert(table, rows)
  // A new herd gets the default care routine; the copied routine replaces it.
  if (table === 'herds') {
    const { error } = await to.from('care_types').delete().eq('herd_id', herdId!)
    if (error) throw new Error(`Default care types: ${error.message}`)
  }
  if (table === 'goats') {
    for (const g of data.get('goats')!.filter((g) => g.sire_id || g.dam_id)) {
      const { error } = await to.from('goats').update({ sire_id: g.sire_id, dam_id: g.dam_id }).eq('id', g.id as string)
      if (error) throw new Error(`Parents of ${g.registered_name ?? g.barn_name}: ${error.message}`)
    }
  }
  console.log(`  copied ${table}`)
}

// --- Photo files ---------------------------------------------------------------------------

for (const p of photos) {
  const path = p.storage_path as string
  const { data: file, error } = await from.storage.from('goat-photos').download(path)
  if (error) throw new Error(`Download ${path}: ${error.message}`)
  const { error: upError } = await to.storage.from('goat-photos').upload(path, file, { contentType: file.type, upsert: true })
  if (upError) throw new Error(`Upload ${path}: ${upError.message}`)
}
console.log(`  copied ${photos.length} photo files`)

// --- Check ---------------------------------------------------------------------------------

let mismatched = 0
for (const table of TABLES) {
  const copied = (await rowsOf(to, table)).length
  const expected = table === 'herd_members' ? members.filter((m) => m.user_id).length : data.get(table)!.length
  if (copied !== expected) {
    mismatched += 1
    console.log(`  ${table}: ${copied} on the target, expected ${expected}`)
  }
}
console.log(mismatched ? `\n${mismatched} tables don't match.` : `\nDone: every table matches.`)
