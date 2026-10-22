import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { clearQueryCache } from '@/lib/queryClient'

const session = ref<Session | null>(null)
let ready: Promise<void> | undefined

/** Loads the saved session (works offline) and keeps it current. */
export function initAuth(): Promise<void> {
  ready ??= supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    supabase.auth.onAuthStateChange((_event, next) => {
      session.value = next
    })
  })
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
