<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useToast } from '@nuxt/ui/composables'
import { passkeysSupported, supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/dates'
import { deviceName, passkeyErrorMessage } from '@/lib/passkeys'

const toast = useToast()
const queryClient = useQueryClient()
const key = ['passkeys']

const passkeys = useQuery({
  queryKey: key,
  queryFn: async () => {
    const { data, error } = await supabase.auth.passkey.list()
    if (error) throw error
    return data ?? []
  },
  enabled: passkeysSupported,
})
const refresh = () => queryClient.invalidateQueries({ queryKey: key })

const add = useMutation({
  mutationFn: async () => {
    const { data, error } = await supabase.auth.registerPasskey()
    if (error) throw error
    // Name it after this device so the list makes sense later.
    await supabase.auth.passkey.update({ passkeyId: data.id, friendlyName: deviceName(navigator.userAgent) })
  },
  onSuccess: async () => {
    await refresh()
    toast.add({ color: 'success', title: 'Passkey added', description: 'Next time, sign in with your face, fingerprint or device PIN.' })
  },
  onError: (e) => toast.add({ color: 'error', title: 'Could not add passkey', description: passkeyErrorMessage(e) }),
})

const renaming = ref<{ id: string; name: string }>()
const rename = useMutation({
  mutationFn: async (v: { id: string; name: string }) => {
    const { error } = await supabase.auth.passkey.update({ passkeyId: v.id, friendlyName: v.name.trim().slice(0, 120) })
    if (error) throw error
  },
  onSuccess: async () => {
    renaming.value = undefined
    await refresh()
  },
})

const remove = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase.auth.passkey.delete({ passkeyId: id })
    if (error) throw error
  },
  onSuccess: refresh,
  onError: (e) => toast.add({ color: 'error', title: 'Could not remove passkey', description: (e as Error).message }),
})
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">Passkeys</h2>
      <p class="text-sm text-muted">Sign in with Face ID, Touch ID, a fingerprint or your device PIN instead of an email code.</p>
    </template>

    <p v-if="!passkeysSupported" class="text-muted text-sm">This browser doesn't support passkeys.</p>
    <template v-else>
      <ul v-if="passkeys.data.value?.length" class="divide-y divide-default -mt-2 mb-3">
        <li v-for="p in passkeys.data.value" :key="p.id" class="py-2 flex flex-wrap items-center gap-2">
          <form v-if="renaming?.id === p.id" class="flex flex-1 gap-2" @submit.prevent="rename.mutate(renaming!)">
            <UInput v-model="renaming!.name" maxlength="120" autofocus class="flex-1" aria-label="Passkey name" />
            <UButton type="submit" size="sm" :loading="rename.isPending.value">Save</UButton>
            <UButton size="sm" color="neutral" variant="ghost" @click="renaming = undefined">Cancel</UButton>
          </form>
          <template v-else>
            <UIcon name="i-lucide-key-round" class="text-muted" />
            <span class="flex-1 min-w-32">
              <span class="block font-medium">{{ p.friendly_name || 'Passkey' }}</span>
              <span class="block text-xs text-muted">
                Added {{ formatDate(p.created_at.slice(0, 10)) }}<template v-if="p.last_used_at"> · last used {{ formatDate(p.last_used_at.slice(0, 10)) }}</template>
              </span>
            </span>
            <UButton size="xs" color="neutral" variant="ghost" @click="renaming = { id: p.id, name: p.friendly_name ?? '' }">Rename</UButton>
            <UButton size="xs" color="error" variant="ghost" :aria-label="`Remove ${p.friendly_name || 'passkey'}`" @click="remove.mutate(p.id)">Remove</UButton>
          </template>
        </li>
      </ul>
      <UButton icon="i-lucide-fingerprint" variant="soft" :loading="add.isPending.value" @click="add.mutate()">
        Add a passkey on this device
      </UButton>
      <p class="mt-2 text-xs text-muted">
        Each device gets its own passkey (or shares one through iCloud Keychain or Google Password Manager). You can still sign in with an email code any time.
      </p>
    </template>
  </UCard>
</template>
