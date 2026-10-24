// Backs up the hosted Supabase project to this computer: the database (as
// SQL) and every photo file, in a dated folder.
//
//   npm run backup
//
// scripts/schedule-backup.sh runs it every night.
//
// Needs `npx supabase login` and Docker running (the Supabase CLI runs
// pg_dump in Docker; this starts Docker if it isn't up). Backups go to
// ~/Documents/Milk Manager Backups unless BACKUP_DIR is set; the newest 30
// are kept. Each folder has a RESTORE.md saying how to put it back.

import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const KEEP = 30
const BUCKET = 'goat-photos'
// Login state, not data: anyone holding these could act as the user.
const SKIP = [
  'auth.sessions',
  'auth.refresh_tokens',
  'auth.one_time_tokens',
  'auth.flow_state',
  'auth.audit_log_entries',
  'auth.mfa_challenges',
  'auth.webauthn_challenges',
  'auth.saml_relay_states',
  'auth.oauth_authorizations',
  'auth.oauth_client_states',
]

const root = process.env.BACKUP_DIR ?? join(homedir(), 'Documents', 'Milk Manager Backups')
const ref = readFileSync(new URL('../supabase/.temp/project-ref', import.meta.url), 'utf8').trim()
// Local time, e.g. 2026-10-24_08-51.
const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`
const dir = join(root, stamp)

const supabase = (...args: string[]) => {
  const r = spawnSync('npx', ['supabase', ...args], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`supabase ${args.join(' ')} failed:\n${r.stderr}`)
  return r.stdout
}

// Started here (e.g. by the nightly schedule) means quit again when done.
let startedDocker = false
function ensureDocker() {
  const up = () => spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0
  if (up()) return
  console.log('Starting Docker…')
  startedDocker = true
  execFileSync('open', ['-a', 'Docker'])
  for (let i = 0; i < 60 && !up(); i++) execFileSync('sleep', ['2'])
  if (!up()) throw new Error('Docker did not start. Open Docker Desktop and try again.')
}

// --- Database ------------------------------------------------------------------------------

ensureDocker()
mkdirSync(dir, { recursive: true })
chmodSync(root, 0o700)
console.log(`Backing up project ${ref} to ${dir}`)

supabase('db', 'dump', '--linked', '-f', join(dir, 'schema.sql'))
supabase('db', 'dump', '--linked', '--data-only', '--use-copy', '-x', SKIP.join(','), '-f', join(dir, 'data.sql'))
supabase('db', 'dump', '--linked', '--role-only', '-f', join(dir, 'roles.sql'))

// Rows per table, from the COPY blocks, for the summary and the check below.
const data = readFileSync(join(dir, 'data.sql'), 'utf8')
const counts = new Map<string, number>()
for (const block of data.matchAll(/^COPY "(\w+)"\."(\w+)"[^\n]*\n([\s\S]*?)^\\\.$/gm)) {
  counts.set(`${block[1]}.${block[2]}`, block[3]!.split('\n').filter(Boolean).length)
}

// --- Photos --------------------------------------------------------------------------------

// The secret key is fetched for this run only and never written to disk.
const keys = JSON.parse(supabase('projects', 'api-keys', '--project-ref', ref, '--reveal', '-o', 'json')) as { type: string; api_key: string }[]
const secret = keys.find((k) => k.type === 'secret')?.api_key
if (!secret) throw new Error('No secret API key found for the project')
const db = createClient(`https://${ref}.supabase.co`, secret, { auth: { persistSession: false } })

async function listFiles(prefix: string): Promise<string[]> {
  const files: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data: entries, error } = await db.storage.from(BUCKET).list(prefix, { limit: 1000, offset })
    if (error) throw error
    for (const e of entries) {
      const path = prefix ? `${prefix}/${e.name}` : e.name
      if (e.id) files.push(path)
      else files.push(...(await listFiles(path)))
    }
    if (entries.length < 1000) return files
  }
}

const photos = await listFiles('')
for (const path of photos) {
  const { data: file, error } = await db.storage.from(BUCKET).download(path)
  if (error) throw new Error(`Photo ${path}: ${error.message}`)
  const target = join(dir, 'photos', path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, Buffer.from(await file.arrayBuffer()))
}

// --- Check against the live project --------------------------------------------------------

const mismatches: string[] = []
for (const [table, rows] of counts) {
  if (!table.startsWith('public.')) continue
  const { count, error } = await db.from(table.slice(7)).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table}: ${error.message}`)
  // Records added while the backup ran would show here; anything else is a problem.
  if (count !== rows) mismatches.push(`${table}: backup has ${rows}, live has ${count}`)
}
const photoRows = counts.get('storage.objects') ?? 0
if (photoRows !== photos.length) mismatches.push(`photos: ${photos.length} files, ${photoRows} in storage.objects`)

// --- Restore notes and tidy-up -------------------------------------------------------------

writeFileSync(
  join(dir, 'RESTORE.md'),
  `# Milk Manager backup, ${stamp.replace('_', ' ')} (project ${ref})

- schema.sql, roles.sql: tables, rules and functions
- data.sql: every record, including user accounts (not their sign-in sessions)
- photos/: the ${BUCKET} storage bucket, same paths as in Supabase

## Putting it back into a new, empty Supabase project

1. Create the project, then from the milk-manager folder: \`npx supabase link --project-ref <new ref>\`
   and \`npx supabase db push\` (the app's migrations build the same tables as schema.sql).
2. Load the records, with triggers off so rows can go in any order (Project Settings → Database
   gives the connection string):

       psql "<connection string>" --single-transaction --variable ON_ERROR_STOP=1 \\
         --command 'SET session_replication_role = replica' --file data.sql

3. Upload photos/ to the ${BUCKET} bucket with the same paths (Storage in the dashboard, or a script).
4. Redo the dashboard settings (email templates, SMTP, the before_user_created hook, passkeys,
   Site URL) and point Netlify's VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at the new
   project.
`,
)

const older = readdirSync(root)
  .filter((d) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/.test(d))
  .sort()
  .slice(0, -KEEP)
for (const d of older) rmSync(join(root, d), { recursive: true, force: true })
if (startedDocker) spawnSync('osascript', ['-e', 'quit app "Docker"'])

const total = (t: string) => counts.get(t) ?? 0
console.log(
  `\nSaved: ${total('public.herds')} herds, ${total('public.goats')} goats, ${total('public.milk_weights')} milk weights, ` +
    `${total('public.lactations')} lactations, ${total('public.milk_test_results')} test results, ` +
    `${total('auth.users')} accounts, ${photos.length} photo files.`,
)
if (older.length) console.log(`Removed ${older.length} old backups (keeping the newest ${KEEP}).`)
if (mismatches.length) {
  console.log(`\nDoesn't match the live project (fine if someone was entering records just now):\n  ${mismatches.join('\n  ')}`)
  process.exitCode = 1
} else {
  console.log('Checked: every table and photo matches the live project.')
}
