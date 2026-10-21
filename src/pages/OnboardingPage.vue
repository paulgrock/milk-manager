<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { supabase, unwrap } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { useHerd } from '@/composables/useHerd'
import PendingInvites from '@/components/PendingInvites.vue'

const router = useRouter()
const { user, signOut } = useAuth()
const { refreshMemberships, selectHerd } = useHerd()

const herdName = ref('')

const createHerd = useMutation({
  mutationFn: async (name: string) => unwrap(await supabase.rpc('create_herd', { herd_name: name })),
  onSuccess: async (herd) => {
    await refreshMemberships()
    selectHerd(herd.id)
    await router.replace('/')
  },
})

async function onSignOut() {
  await signOut()
  await router.replace('/login')
}
</script>

<template>
  <main class="min-h-dvh flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-4">
      <PendingInvites @accepted="router.replace('/')" />

      <UCard>
        <template #header>
          <h1 class="text-lg font-semibold">Set up your herd</h1>
          <p class="text-sm text-muted">
            If someone is adding you to their herd, ask them to invite <strong>{{ user?.email }}</strong>.
          </p>
        </template>

        <form class="space-y-4" @submit.prevent="createHerd.mutate(herdName)">
          <UFormField label="Herd or farm name" name="herdName">
            <UInput v-model="herdName" required maxlength="100" placeholder="e.g. Bird's Eye Farm" class="w-full" size="xl" />
          </UFormField>
          <UButton type="submit" block size="xl" :loading="createHerd.isPending.value">Create herd</UButton>
          <UAlert v-if="createHerd.error.value" color="error" variant="subtle" :description="createHerd.error.value.message" />
        </form>
      </UCard>

      <UButton variant="link" color="neutral" block @click="onSignOut">Sign out</UButton>
    </div>
  </main>
</template>
