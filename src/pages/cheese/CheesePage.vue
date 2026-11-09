<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese'
import { formatDate, todayISO } from '@/lib/dates'
import { STATUS_ICONS, agingLabel, isCurrent, makeStatus, milkLabel, monthlyTotals, readyLabel } from '@/lib/cheese'
import MakeModal from '@/components/cheese/MakeModal.vue'
import TypeSettings from '@/components/cheese/TypeSettings.vue'

const today = todayISO()
const toast = useToast()
const { isOwner } = useHerd()
const { query, data } = useCheeseData()
const { saveType } = useCheeseMutations()

// Each cheese with its makes from the last week and the coming one, soonest ready first.
const byType = computed(() =>
  data.value.types.map((type) => {
    const makes = data.value.makes.filter((m) => m.cheese_type_id === type.id)
    const current = makes.filter((m) => isCurrent(m, today)).sort((a, b) => a.ready_on.localeCompare(b.ready_on))
    return { type, total: makes.length, current }
  }),
)
const withCurrent = computed(() => byType.value.filter((t) => t.current.length))
// The rest stay a tap away; a hidden cheese never made is left out.
const others = computed(() => byType.value.filter((t) => !t.current.length && (t.total || !t.type.hidden)))
const months = computed(() => monthlyTotals(data.value.makes).slice(0, 6))

const monthLabel = (m: string) => new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

const modalOpen = ref(false)

// The cheese list: anyone can add; owners rename, change aging times and hide.
const draft = reactive({ name: '', days: 0 })
async function addType() {
  if (!draft.name.trim()) return
  try {
    await saveType.mutateAsync({ values: { name: draft.name.trim(), aging_days: draft.days, sort_order: data.value.types.length + 1 } })
    Object.assign(draft, { name: '', days: 0 })
  } catch (e) {
    const message = (e as Error).message
    toast.add({ color: 'error', title: 'Could not add', description: message.includes('duplicate') ? 'That cheese is already in the list.' : message })
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Cheese</h1>
      <UButton icon="i-lucide-plus" @click="modalOpen = true">New make</UButton>
    </div>

    <div v-if="query.isPending.value" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-20 w-full" /></div>

    <template v-else>
      <UCard v-if="!withCurrent.length" class="text-center">
        <p class="text-muted">Nothing made this week or coming ready in the next. Tap a cheese below to see all its makes.</p>
      </UCard>

      <UCard v-for="{ type, current } in withCurrent" :key="type.id" :ui="{ header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }">
        <template #header>
          <RouterLink :to="`/cheese/types/${type.id}`" class="flex items-center gap-2 px-4 py-3 hover:bg-elevated/50">
            <h2 class="font-semibold flex-1">{{ type.name }} <span class="text-muted font-normal">({{ current.length }})</span></h2>
            <UIcon name="i-lucide-chevron-right" class="text-muted size-5" />
          </RouterLink>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="make in current" :key="make.id">
            <RouterLink :to="`/cheese/makes/${make.id}`" class="px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="flex-1 min-w-40">
                Made {{ formatDate(make.made_on) }}<span v-if="milkLabel(make)" class="text-muted"> · <span class="whitespace-nowrap">{{ milkLabel(make) }}</span></span>
              </span>
              <UBadge
                :color="makeStatus(make, today) === 'aging' ? 'neutral' : 'primary'"
                variant="subtle"
                :icon="STATUS_ICONS[makeStatus(make, today)]"
              >
                {{ readyLabel(make, today) }}
              </UBadge>
            </RouterLink>
          </li>
        </ul>
      </UCard>

      <UCard v-if="others.length" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">{{ withCurrent.length ? 'Other cheeses' : 'Cheeses' }}</h2>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="{ type, total } in others" :key="type.id">
            <RouterLink :to="`/cheese/types/${type.id}`" class="px-4 py-2 hover:bg-elevated/50 flex items-center gap-3">
              <span class="flex-1 font-medium">{{ type.name }}</span>
              <span class="text-sm text-muted">{{ total ? `${total} make${total === 1 ? '' : 's'}` : 'No makes yet' }}</span>
              <UIcon name="i-lucide-chevron-right" class="text-muted size-4" />
            </RouterLink>
          </li>
        </ul>
      </UCard>

      <UCard v-if="months.length" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">By month</h2>
          <p class="text-sm text-muted">Milk into cheese, by the month it was made. Pounds of milk are approximate.</p>
        </template>
        <table class="w-full text-sm">
          <thead class="text-muted text-start">
            <tr>
              <th class="px-4 py-2 text-start font-normal">Month</th>
              <th class="px-2 py-2 text-end font-normal">Makes</th>
              <th class="px-4 py-2 text-end font-normal">Milk</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="m in months" :key="m.month">
              <td class="px-4 py-2 whitespace-nowrap">{{ monthLabel(m.month) }}</td>
              <td class="px-2 py-2 text-end tabular-nums">{{ m.makes }}</td>
              <td class="px-4 py-2 text-end tabular-nums">
                <template v-if="m.gallons">
                  <span class="whitespace-nowrap">{{ +m.gallons.toFixed(2) }} gal</span>
                  <span class="block text-xs text-muted whitespace-nowrap">≈ {{ Math.round(m.milkLb) }} lb</span>
                </template>
                <span v-else class="text-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">Cheeses we make</h2>
          <p class="text-sm text-muted">
            How long each usually ages; a new make’s ready date starts from this. {{ isOwner ? '' : 'Only owners can rename or hide these.' }}
          </p>
        </template>
        <ul class="divide-y divide-default -my-2">
          <li v-for="t in data.types" :key="t.id" class="py-2">
            <TypeSettings v-if="isOwner" :type="t" />
            <div v-else class="flex flex-wrap items-center gap-3" :class="t.hidden ? 'opacity-60' : ''">
              <span class="flex-1 font-medium">{{ t.name }}</span>
              <span class="text-sm text-muted">{{ agingLabel(t.aging_days) }}{{ t.hidden ? ' · hidden' : '' }}</span>
            </div>
          </li>
        </ul>
        <form class="flex flex-wrap items-end gap-2 mt-4" @submit.prevent="addType">
          <UFormField label="Add a cheese" class="flex-1 min-w-40">
            <UInput v-model="draft.name" placeholder="Gouda, ricotta…" maxlength="60" class="w-full" />
          </UFormField>
          <UFormField label="Ages (days)">
            <UInputNumber v-model="draft.days" :min="0" :max="1095" class="w-28" />
          </UFormField>
          <UButton type="submit" variant="soft" :loading="saveType.isPending.value">Add</UButton>
        </form>
      </UCard>
    </template>

    <MakeModal v-model:open="modalOpen" />
  </div>
</template>
