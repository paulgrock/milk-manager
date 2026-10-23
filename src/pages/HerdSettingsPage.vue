<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { refreshQueries } from '@/lib/queryClient'
import { useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { supabase, unwrap } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { useHerd, type HerdRole } from '@/composables/useHerd'
import { useHerdMembers } from '@/composables/useHerdMembers'
import PasskeysCard from '@/components/PasskeysCard.vue'
import { squareImageDataUrl } from '@/lib/images'

const router = useRouter()
const toast = useToast()
const { user, signOut } = useAuth()
const { herd, herdId, isOwner, refreshMemberships } = useHerd()

const roleOptions = [
  { label: 'Owner', value: 'owner' },
  { label: 'Helper', value: 'helper' },
]
const unitOptions = [
  { label: 'Pounds (lb)', value: 'lb' },
  { label: 'Kilograms (kg)', value: 'kg' },
]

function onError(title: string) {
  return (e: Error) => toast.add({ color: 'error', title, description: e.message })
}

// --- Herd details ----------------------------------------------------------

const details = reactive({ name: '', weight_unit: 'lb' as 'lb' | 'kg' })
watch(
  herd,
  (h) => {
    if (h) Object.assign(details, { name: h.name, weight_unit: h.weight_unit })
  },
  { immediate: true },
)

const saveDetails = useMutation({
  mutationFn: async () =>
    unwrap(await supabase.from('herds').update({ name: details.name.trim(), weight_unit: details.weight_unit }).eq('id', herdId.value)),
  onSuccess: async () => {
    await refreshMemberships()
    toast.add({ color: 'success', title: 'Herd saved' })
  },
  onError: onError('Could not save herd'),
})

// --- Logo ------------------------------------------------------------------

// Shown in the header in place of the app icon.
const LOGO_SIZE = 192
const logoInput = ref<HTMLInputElement>()
const saveLogo = useMutation({
  mutationFn: async (logo: string | null) => unwrap(await supabase.from('herds').update({ logo }).eq('id', herdId.value)),
  onSuccess: (_data, logo) => {
    void refreshMemberships()
    toast.add({ color: 'success', title: logo ? 'Logo updated' : 'Logo removed' })
  },
  onError: onError('Could not save logo'),
})
async function onLogoFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    saveLogo.mutate(await squareImageDataUrl(file, LOGO_SIZE))
  } catch {
    toast.add({ color: 'error', title: 'Could not read that picture', description: 'Try a PNG or JPEG.' })
  }
}

// --- Members ---------------------------------------------------------------

const { members, membersKey } = useHerdMembers()

const changeRole = useMutation({
  mutationFn: async ({ userId, role }: { userId: string; role: HerdRole }) =>
    unwrap(await supabase.from('herd_members').update({ role }).eq('herd_id', herdId.value).eq('user_id', userId)),
  onSettled: () => refreshQueries(membersKey.value),
  onError: onError('Could not change role'),
})

const removeMember = useMutation({
  mutationFn: async (userId: string) =>
    unwrap(await supabase.from('herd_members').delete().eq('herd_id', herdId.value).eq('user_id', userId)),
  onSuccess: async (_data, userId) => {
    if (userId === user.value?.id) {
      await refreshMemberships()
      await router.replace('/')
    } else {
      await refreshQueries(membersKey.value)
    }
  },
  onError: onError('Could not remove member'),
})

// --- Invites ---------------------------------------------------------------

const invitesKey = computed(() => ['herdInvites', herdId.value])
const invites = useQuery({
  queryKey: invitesKey,
  queryFn: async () =>
    unwrap(await supabase.from('herd_invites').select('*').eq('herd_id', herdId.value).order('created_at')),
  enabled: computed(() => !!herdId.value && isOwner.value),
})

const invite = reactive({ email: '', role: 'helper' as HerdRole })
const lastInvited = ref('')

const sendInvite = useMutation({
  mutationFn: async () =>
    unwrap(
      await supabase
        .from('herd_invites')
        .insert({ herd_id: herdId.value, email: invite.email.trim().toLowerCase(), role: invite.role }),
    ),
  onSuccess: async () => {
    lastInvited.value = invite.email.trim().toLowerCase()
    invite.email = ''
    await refreshQueries(invitesKey.value)
  },
  onError: (e: Error) =>
    toast.add({
      color: 'error',
      title: 'Could not invite',
      description: e.message.includes('duplicate') ? 'That email already has an invite.' : e.message,
    }),
})

const cancelInvite = useMutation({
  mutationFn: async (id: string) => unwrap(await supabase.from('herd_invites').delete().eq('id', id)),
  onSettled: () => refreshQueries(invitesKey.value),
})

const appUrl = window.location.origin

async function onSignOut() {
  await signOut()
  await router.replace('/login')
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Settings</h1>

    <UCard>
      <template #header><h2 class="font-semibold">Herd</h2></template>
      <div class="flex items-center gap-3 mb-4">
        <img
          :src="herd?.logo ?? '/favicon.svg'"
          :alt="herd?.logo ? `${herd.name} logo` : ''"
          class="size-14 rounded-[22%] object-cover bg-elevated"
        />
        <div class="space-y-1">
          <p class="text-sm font-medium">Logo</p>
          <div v-if="isOwner" class="flex gap-2">
            <UButton size="sm" variant="soft" icon="i-lucide-image-up" :loading="saveLogo.isPending.value" @click="logoInput?.click()">
              {{ herd?.logo ? 'Change' : 'Upload' }}
            </UButton>
            <UButton v-if="herd?.logo" size="sm" color="neutral" variant="ghost" @click="saveLogo.mutate(null)">Remove</UButton>
            <input ref="logoInput" type="file" accept="image/*" class="hidden" aria-label="Logo file" @change="onLogoFile" />
          </div>
          <p class="text-xs text-muted">Shown at the top of the app. Square pictures work best.</p>
        </div>
      </div>
      <form class="space-y-4" @submit.prevent="saveDetails.mutate()">
        <UFormField label="Herd or farm name">
          <UInput v-model="details.name" :disabled="!isOwner" required maxlength="100" class="w-full" />
        </UFormField>
        <UFormField label="Milk weight unit">
          <USelect v-model="details.weight_unit" :items="unitOptions" :disabled="!isOwner" class="w-full sm:w-60" />
        </UFormField>
        <UButton v-if="isOwner" type="submit" :loading="saveDetails.isPending.value">Save</UButton>
        <p v-else class="text-sm text-muted">Only owners can change herd details.</p>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">People</h2>
        <p class="text-sm text-muted">Owners can do everything. Helpers can enter milk and care records.</p>
      </template>
      <ul class="divide-y divide-default">
        <li v-for="m in members.data.value" :key="m.user_id" class="py-3 flex flex-wrap items-center gap-3">
          <div class="flex-1 min-w-40">
            <p class="font-medium">
              {{ m.display_name }}
              <span v-if="m.user_id === user?.id" class="text-muted font-normal">(you)</span>
            </p>
            <p class="text-sm text-muted">{{ m.email }}</p>
          </div>
          <USelect
            v-if="isOwner"
            :model-value="m.role"
            :items="roleOptions"
            class="w-32"
            @update:model-value="(role: unknown) => changeRole.mutate({ userId: m.user_id, role: role as HerdRole })"
          />
          <UBadge v-else color="neutral" variant="subtle">{{ m.role === 'owner' ? 'Owner' : 'Helper' }}</UBadge>
          <UButton
            v-if="isOwner || m.user_id === user?.id"
            color="error"
            variant="ghost"
            :label="m.user_id === user?.id ? 'Leave' : 'Remove'"
            @click="removeMember.mutate(m.user_id)"
          />
        </li>
      </ul>
    </UCard>

    <UCard v-if="isOwner">
      <template #header><h2 class="font-semibold">Invite someone</h2></template>
      <form class="flex flex-wrap gap-3 items-end" @submit.prevent="sendInvite.mutate()">
        <UFormField label="Email" class="flex-1 min-w-56">
          <UInput v-model="invite.email" type="email" required class="w-full" />
        </UFormField>
        <UFormField label="Role">
          <USelect v-model="invite.role" :items="roleOptions" class="w-32" />
        </UFormField>
        <UButton type="submit" :loading="sendInvite.isPending.value">Invite</UButton>
      </form>
      <UAlert
        v-if="lastInvited"
        class="mt-4"
        color="success"
        variant="subtle"
        :description="`Invite saved. Ask ${lastInvited} to sign in at ${appUrl} with that email. They'll see the invite there.`"
      />
      <ul v-if="invites.data.value?.length" class="mt-4 divide-y divide-default">
        <li v-for="i in invites.data.value" :key="i.id" class="py-2 flex items-center gap-3">
          <span class="flex-1">{{ i.email }}</span>
          <UBadge color="neutral" variant="subtle">{{ i.role === 'owner' ? 'Owner' : 'Helper' }} · pending</UBadge>
          <UButton color="neutral" variant="ghost" label="Cancel" @click="cancelInvite.mutate(i.id)" />
        </li>
      </ul>
    </UCard>

    <PasskeysCard />

    <UButton color="neutral" variant="outline" icon="i-lucide-log-out" @click="onSignOut">Sign out</UButton>
  </div>
</template>
