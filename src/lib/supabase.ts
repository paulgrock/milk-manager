import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local.')
}

export const supabase = createClient<Database>(url, key, {
  // Passkeys are experimental in Supabase Auth and must be switched on here.
  auth: { experimental: { passkey: true } },
})

/** Whether this browser can use passkeys at all. */
export const passkeysSupported = typeof window !== 'undefined' && 'PublicKeyCredential' in window

/**
 * Where sign-in emails end up when running against the local Supabase stack:
 * they're never delivered, only caught by its Mailpit inbox. Null for a
 * hosted project.
 */
export const localMailInbox: string | null = (() => {
  const { hostname, protocol } = new URL(url)
  return hostname === '127.0.0.1' || hostname === 'localhost' ? `${protocol}//${hostname}:54324` : null
})()

/** Throws the Supabase error if there is one, otherwise returns the data. */
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

const PAGE_SIZE = 1000

/**
 * Fetches every row of a query, a page at a time. Supabase caps a single
 * response at 1000 rows, which a doe's milk history passes in a few years.
 * The query must have a stable order.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const batch = unwrap(await page(from, from + PAGE_SIZE - 1))
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) return rows
  }
}
