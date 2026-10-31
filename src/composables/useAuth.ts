import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { authStorageKey, supabase } from '@/lib/supabase'
import { clearQueryCache } from '@/lib/queryClient'

const session = ref<Session | null>(null)
let ready: Promise<void> | undefined

/** The session saved on this device, read without any network. */
function savedSession(): Session | null {
  try {
    const saved = JSON.parse(localStorage.getItem(authStorageKey) ?? 'null') as Session | null
    return saved?.user?.id && saved.refresh_token ? saved : null
  } catch {
    return null
  }
}

/**
 * Loads the session and keeps it current. With one saved on the device the
 * app starts at once: getSession() would first renew an expired token over
 * the network (after an hour away, every opening waited on that). Supabase
 * renews it in the background instead, and data requests wait for the fresh
 * token themselves. Only a real sign-out ends the session here, not a renewal
 * that failed for want of signal, so the app still opens offline.
 */
export function initAuth(): Promise<void> {
  if (!ready) {
    session.value = savedSession()
    supabase.auth.onAuthStateChange((event, next) => {
      if (next) session.value = next
      else if (event === 'SIGNED_OUT') {
        // Signed out here or elsewhere, or access removed: drop this herd's data from the device.
        session.value = null
        void clearQueryCache()
      }
    })
    ready = session.value
      ? Promise.resolve()
      : supabase.auth.getSession().then(({ data }) => {
          session.value = data.session
        })
  }
  return ready
}

export function useAuth() {
  const user = computed(() => session.value?.user ?? null)

  async function sendCode(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) throw error
  }

  async function verifyCode(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    session.value = data.session
  }

  /** Opens the device's passkey prompt (Face ID, fingerprint…) and signs in. */
  async function signInWithPasskey() {
    const { data, error } = await supabase.auth.signInWithPasskey()
    if (error) throw error
    session.value = data.session
  }

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
    await clearQueryCache()
  }

  return { session, user, sendCode, verifyCode, signInWithPasskey, signOut }
}
