<script setup lang="ts">
import { useHerd } from '@/composables/useHerd'
import { useAuth } from '@/composables/useAuth'
import PendingInvites from '@/components/PendingInvites.vue'

const { herd, role } = useHerd()
const { user } = useAuth()
</script>

<template>
  <div class="space-y-4">
    <PendingInvites />
    <div>
      <h1 class="text-2xl font-semibold">Today</h1>
      <p class="text-muted">
        Signed in as {{ user?.email }} · {{ role === 'owner' ? 'Owner' : 'Helper' }} of {{ herd?.name }}
      </p>
    </div>
    <UCard>
      <p class="text-muted">
        Today's milk total and what's due (hoof trims, copper, kiddings) will show up here once those sections are
        built.
      </p>
    </UCard>
  </div>
</template>
