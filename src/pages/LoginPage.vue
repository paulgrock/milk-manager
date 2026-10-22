<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { localMailInbox, passkeysSupported } from '@/lib/supabase'
import { passkeyErrorMessage } from '@/lib/passkeys'

const { sendCode, verifyCode, signInWithPasskey } = useAuth()
const router = useRouter()
const route = useRoute()

const step = ref<'email' | 'code'>('email')
const email = ref('')
const code = ref<string[]>([])
const busy = ref(false)
const error = ref('')

async function submitEmail() {
  error.value = ''
  busy.value = true
  try {
    email.value = email.value.trim().toLowerCase()
    await sendCode(email.value)
    step.value = 'code'
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

async function usePasskey() {
  error.value = ''
  busy.value = true
  try {
    await signInWithPasskey()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (e) {
    error.value = passkeyErrorMessage(e)
  } finally {
    busy.value = false
  }
}

async function submitCode() {
  error.value = ''
  busy.value = true
  try {
    await verifyCode(email.value, code.value.join(''))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (e) {
    error.value = (e as Error).message
    code.value = []
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="min-h-dvh flex items-center justify-center p-4 bg-default">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-3">
          <img src="/favicon.svg" alt="" class="size-10" />
          <div>
            <h1 class="text-lg font-semibold">Milk Manager</h1>
            <p class="text-sm text-muted">Sign in to your herd</p>
          </div>
        </div>
      </template>

      <form v-if="step === 'email'" class="space-y-4" @submit.prevent="submitEmail">
        <UFormField label="Email" name="email">
          <UInput v-model="email" type="email" autocomplete="email" required autofocus class="w-full" size="xl" />
        </UFormField>
        <UButton type="submit" block size="xl" :loading="busy">Email me a code</UButton>
        <template v-if="passkeysSupported">
          <USeparator label="or" />
          <UButton block size="xl" color="neutral" variant="outline" icon="i-lucide-fingerprint" :loading="busy" @click="usePasskey">
            Sign in with a passkey
          </UButton>
        </template>
      </form>

      <form v-else class="space-y-4" @submit.prevent="submitCode">
        <p class="text-sm">
          We sent a 6-digit code to <strong>{{ email }}</strong>.
        </p>
        <UAlert
          v-if="localMailInbox"
          color="info"
          variant="subtle"
          icon="i-lucide-mail-search"
          title="This is the local test setup"
          description="Sign-in emails aren't really sent here. They're caught by the local mail inbox."
          :actions="[{ label: 'Open local inbox', to: localMailInbox, target: '_blank', trailingIcon: 'i-lucide-external-link' }]"
        />
        <UPinInput v-model="code" :length="6" otp type="number" size="xl" autofocus @complete="submitCode" />
        <UButton type="submit" block size="xl" :loading="busy" :disabled="code.join('').length < 6">Sign in</UButton>
        <UButton variant="link" color="neutral" @click="step = 'email'; code = []">Use a different email</UButton>
      </form>

      <UAlert v-if="error" class="mt-4" color="error" variant="subtle" :description="error" />
    </UCard>
  </main>
</template>
