<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese'
import { formatDate, todayISO } from '@/lib/dates'
import { LB_PER_GALLON, STATUS_ICONS, makeStatus, milkLabel, readyLabel, type CheeseMake } from '@/lib/cheese'
import MakeModal from '@/components/cheese/MakeModal.vue'

const today = todayISO()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { query, data } = useCheeseData()
const { saveMake } = useCheeseMutations()

const make = computed(() => data.value.makes.find((m) => m.id === route.params.make))
const type = computed(() => data.value.types.find((t) => t.id === make.value?.cheese_type_id))
const status = computed(() => (make.value ? makeStatus(make.value, today) : 'aging'))
const backTo = computed(() => (type.value ? `/cheese/types/${type.value.id}` : '/cheese'))

// The form keeps the make it opened with, so it can still close and report a delete once the make is gone.
const editing = ref<{ open: boolean; make?: CheeseMake; backTo: string }>({ open: false, backTo: '/cheese' })
function openEdit() {
  editing.value = { open: true, make: make.value, backTo: backTo.value }
}
// Once it's deleted there's nothing to show here, so go back to its cheese.
function onDeleted() {
  void router.replace(editing.value.backTo)
}

function markFinished() {
  const m = make.value!
  saveMake.mutate(
    {
      id: m.id,
      values: { cheese_type_id: m.cheese_type_id, made_on: m.made_on, ready_on: m.ready_on, milk_gallons: m.milk_gallons, notes: m.notes, finished_on: today },
    },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) },
  )
}
</script>

<template>
  <div>
    <div v-if="query.isPending.value" class="space-y-3">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-48 w-full" />
    </div>

    <UAlert v-else-if="!make" color="error" variant="subtle" title="Make not found" :actions="[{ label: 'Back to cheese', to: '/cheese' }]" />

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UButton :to="backTo" color="neutral" variant="ghost" icon="i-lucide-arrow-left" :aria-label="`Back to ${type?.name ?? 'cheese'}`" />
        <div class="flex-1">
          <h1 class="text-2xl font-semibold">{{ type?.name ?? 'Cheese' }}</h1>
          <p class="text-sm text-muted">Made {{ formatDate(make.made_on) }}</p>
        </div>
        <UButton color="neutral" variant="outline" icon="i-lucide-pencil" @click="openEdit">Edit</UButton>
      </div>

      <UCard>
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <UBadge
            :color="status === 'ready' || status === 'fresh' ? 'primary' : 'neutral'"
            variant="subtle"
            :icon="STATUS_ICONS[status]"
          >
            {{ readyLabel(make, today) }}
          </UBadge>
          <UButton v-if="status !== 'finished'" size="xs" variant="soft" class="ms-auto" :loading="saveMake.isPending.value" @click="markFinished">
            Mark finished
          </UButton>
        </div>
        <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt class="text-muted">Made</dt>
          <dd>{{ formatDate(make.made_on) }}</dd>
          <dt class="text-muted">Ready</dt>
          <dd>{{ formatDate(make.ready_on) }}</dd>
          <dt class="text-muted">Milk used</dt>
          <dd>
            <template v-if="milkLabel(make)">
              {{ milkLabel(make) }} <span v-if="make.milk_gallons != null" class="text-muted">≈ {{ Math.round(Number(make.milk_gallons) * LB_PER_GALLON) }} lb</span>
            </template>
            <span v-else class="text-muted">Not recorded</span>
          </dd>
          <template v-if="make.finished_on">
            <dt class="text-muted">Finished</dt>
            <dd>{{ formatDate(make.finished_on) }}</dd>
          </template>
        </dl>
      </UCard>

      <UCard>
        <template #header><h2 class="font-semibold">Notes</h2></template>
        <p v-if="make.notes" class="whitespace-pre-line">{{ make.notes }}</p>
        <p v-else class="text-muted text-sm">No notes. Use Edit to add some.</p>
      </UCard>
    </div>

    <MakeModal v-model:open="editing.open" :make="editing.make" @deleted="onDeleted" />
  </div>
</template>
