import { test as base, expect, type BrowserContext } from '@playwright/test'
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/database.types.ts'
import { env } from './env.ts'

export { expect }

type Client = SupabaseClient<Database>

const noPersist = { auth: { persistSession: false, autoRefreshToken: false } }

/** Bypasses row-level security. Only for setting up and checking test data. */
export const admin: Client = createClient<Database>(env.apiUrl, env.secretKey, noPersist)

/** supabase-js keeps the session under sb-<first part of the API host>-auth-token. */
const STORAGE_KEY = `sb-${new URL(env.apiUrl).hostname.split('.')[0]}-auth-token`

export interface TestUser {
  id: string
  email: string
  /** Acts as this user, so row-level security applies. */
  client: Client
  session: Session
}

export async function createUser(prefix: string): Promise<TestUser> {
  const email = `${prefix}-${crypto.randomUUID().slice(0, 8)}@example.test`
  const created = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (created.error) throw created.error

  // Sign in the way the app does (an emailed code), without the email.
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (link.error) throw link.error
  const client = createClient<Database>(env.apiUrl, env.publishableKey, noPersist)
  const verified = await client.auth.verifyOtp({ email, token: link.data.properties.email_otp, type: 'email' })
  if (verified.error || !verified.data.session) throw verified.error ?? new Error('No session')

  return { id: created.data.user.id, email, client, session: verified.data.session }
}

export async function deleteUser(user: TestUser) {
  // Herds they own go first; deleting the user then removes their memberships.
  const owned = await admin.from('herd_members').select('herd_id').eq('user_id', user.id).eq('role', 'owner')
  const herdIds = (owned.data ?? []).map((m) => m.herd_id)
  // Fail loudly: a delete that quietly fails leaves test herds behind (it once did).
  if (herdIds.length) {
    const { error } = await admin.from('herds').delete().in('id', herdIds)
    if (error) throw new Error(`Could not delete test herds: ${error.message}`)
  }
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(`Could not delete test user: ${error.message}`)
}

/** Starts the browser already signed in as `user`, the same as returning to the app. */
export async function signInContext(context: BrowserContext, user: TestUser) {
  await context.addInitScript(
    ([key, value]) => {
      if (!window.localStorage.getItem(key!)) window.localStorage.setItem(key!, value!)
    },
    [STORAGE_KEY, JSON.stringify(user.session)],
  )
}

/** The 6-digit sign-in code most recently emailed to an address (local Mailpit). */
export async function latestCode(email: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const res = await fetch(`${env.mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    const body = (await res.json()) as { messages: { Snippet: string }[] }
    const code = body.messages?.[0]?.Snippet.match(/\b\d{6}\b/)?.[0]
    if (code) return code
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`No sign-in code emailed to ${email}`)
}

export interface Herd {
  id: string
  name: string
}

type Fixtures = {
  owner: TestUser
  herd: Herd
}

/**
 * `owner` is a fresh signed-in user; `herd` is a fresh herd they own. The
 * page starts signed in as the owner. Everything is deleted afterwards.
 */
export const test = base.extend<Fixtures>({
  owner: async ({}, use) => {
    const user = await createUser('owner')
    await use(user)
    await deleteUser(user)
  },
  herd: async ({ owner, context }, use) => {
    const name = `Test Herd ${owner.email.slice(6, 14)}`
    const { data, error } = await owner.client.rpc('create_herd', { herd_name: name })
    if (error) throw error
    await signInContext(context, owner)
    await use({ id: data.id, name })
  },
})
