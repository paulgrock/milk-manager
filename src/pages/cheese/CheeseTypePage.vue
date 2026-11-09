<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHerd } from '@/composables/useHerd'
import { useCheeseData } from '@/composables/useCheese'
import { formatDate, todayISO } from '@/lib/dates'
import { STATUS_LABELS, agingLabel, makeStatus, milkLabel } from '@/lib/cheese'
import MakeModal from '@/components/cheese/MakeModal.vue'
import TypeSettings from '@/components/cheese/TypeSettings.vue'

const today = todayISO()
const route = useRoute()
const { isOwner } = useHerd()
const { query, data } = useCheeseData()

const type = computed(() => data.value.types.find((t) => t.id === route.params.type))
// Every make of this cheese, newest first. Notes wait for the make's own page.
const makes = computed(() => data.value.makes.filter((m) => m.cheese_type_id === type.value?.id))
const STATUS_COLORS = { fresh: 'primary', ready: 'primary', aging: 'neutral', finished: 'neutral' } as const

const modalOpen = ref(false)
</script>

<template>
  <div v-if="query.isPending.value" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>

  <UAlert v-else-if="!type" color="error" variant="subtle" title="Cheese not found" :actions="[{ label: 'Back to cheese', to: '/cheese' }]" />

  <div v-else class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <UButton to="/cheese" color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back to cheese" />
      <div class="flex-1">
        <h1 class="text-2xl font-semibold">{{ type.name }}</h1>
        <p class="text-sm text-muted">Ages {{ agingLabel(type.aging_days) }}{{ type.hidden ? ' · hidden' : '' }}</p>
      </div>
      <UButton icon="i-lucide-plus" @click="modalOpen = true">New make</UButton>
    </div>

    <UCard v-if="!makes.length" class="text-center">
      <p class="text-muted">No {{ type.name }} made yet.</p>
    </UCard>

    <ul v-else class="divide-y divide-default rounded-lg border border-default">
      <li v-for="make in makes" :key="make.id">
        <RouterLink :to="`/cheese/makes/${make.id}`" class="px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="flex-1 min-w-40">
            {{ formatDate(make.made_on) }}
            <span class="text-muted"> · {{ milkLabel(make) || 'milk not recorded' }}</span>
          </span>
          <UBadge :color="STATUS_COLORS[makeStatus(make, today)]" variant="subtle">{{ STATUS_LABELS[makeStatus(make, today)] }}</UBadge>
        </RouterLink>
      </li>
    </ul>

    <UCard v-if="isOwner">
      <template #header>
        <h2 class="font-semibold">Settings</h2>
        <p class="text-sm text-muted">How long it usually ages; a new make’s ready date starts from this.</p>
      </template>
      <TypeSettings :type="type" />
    </UCard>

    <MakeModal v-model:open="modalOpen" :type-id="type.id" />
  </div>
</template>
