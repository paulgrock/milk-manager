<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { supabase, unwrap } from '@/lib/supabase'
import { useHerd } from '@/composables/useHerd'

const emit = defineEmits<{ accepted: [herdId: string] }>()
const { refreshMemberships, selectHerd } = useHerd()
const toast = useToast()

const invites = useQuery({
  queryKey: ['pendingInvites'],
  queryFn: async () => unwrap(await supabase.rpc('pending_invites')),
})

const accept = useMutation({
  mutationFn: async (inviteId: string) => unwrap(await supabase.rpc('accept_invite', { invite_id: inviteId })),
  onSuccess: async (member) => {
    await refreshMemberships()
    await invites.refetch()
    selectHerd(member.herd_id)
    emit('accepted', member.herd_id)
  },
  onError: (e) => toast.add({ color: 'error', title: 'Could not join herd', description: e.message }),
})

const decline = useMutation({
  mutationFn: async (inviteId: string) => unwrap(await supabase.from('herd_invites').delete().eq('id', inviteId)),
  onSuccess: () => invites.refetch(),
})
</script>

<template>
  <div v-if="invites.data.value?.length" class="space-y-2">
    <UAlert
      v-for="invite in invites.data.value"
      :key="invite.id"
      color="primary"
      variant="subtle"
      icon="i-lucide-mail-open"
      :title="`You're invited to ${invite.herd_name}`"
      :description="`As ${invite.role === 'owner' ? 'an owner' : 'a helper'}`"
      :actions="[
        { label: 'Join', loading: accept.isPending.value, onClick: () => accept.mutate(invite.id) },
        { label: 'Decline', color: 'neutral', variant: 'ghost', onClick: () => decline.mutate(invite.id) },
      ]"
    />
  </div>
</template>
