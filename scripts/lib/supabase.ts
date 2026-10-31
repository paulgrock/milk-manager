// The Supabase project a script works on: the hosted one when SUPABASE_URL and
// SUPABASE_SECRET_KEY are set, otherwise the local stack (`npx supabase start`).

import { execSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

/** The local stack's address and secret key, from `supabase status`. */
export function localSupabase() {
  const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const get = (k: string) => out.match(new RegExp(`^${k}="?(.*?)"?$`, 'm'))?.[1]
  return { url: get('API_URL')!, key: get('SECRET_KEY')! }
}

/** Where a script reads and writes: SUPABASE_URL + SUPABASE_SECRET_KEY, or the local stack. */
export function scriptTarget() {
  return process.env.SUPABASE_URL ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY! } : localSupabase()
}

/** A client with the secret key (past RLS) that keeps no session. */
export function adminClient(target: { url: string; key: string } = scriptTarget()) {
  return createClient(target.url, target.key, { auth: { persistSession: false } })
}

/**
 * The linked hosted project (supabase/.temp/project-ref, from `npx supabase link`),
 * with its secret key fetched through the Supabase CLI for this run only, never
 * written to disk. Needs `npx supabase login`.
 */
export function hostedTarget() {
  const ref = readFileSync(new URL('../../supabase/.temp/project-ref', import.meta.url), 'utf8').trim()
  const r = spawnSync('npx', ['supabase', 'projects', 'api-keys', '--project-ref', ref, '--reveal', '-o', 'json'], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`Could not get the project's keys (is the Supabase CLI logged in?):\n${r.stderr}`)
  const keys = JSON.parse(r.stdout) as { type: string; api_key: string }[]
  const key = keys.find((k) => k.type === 'secret')?.api_key
  if (!key) throw new Error('No secret API key found for the project')
  return { ref, url: `https://${ref}.supabase.co`, key }
}
