<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese'
import { daysBetween } from '@/lib/breeding'
import { formatDate, relativeDays, todayISO } from '@/lib/dates'
import { STATUS_LABELS, makeStatus, monthlyTotals, yieldPerGallon, type CheeseMake, type CheeseType } from '@/lib/cheese'
import { formatWeight } from '@/lib/milk'
import MakeModal from '@/components/cheese/MakeModal.vue'

const today = todayISO()
const toast = useToast()
const { isOwner } = useHerd()
const { query, data } = useCheeseData()
const { saveType } = useCheeseMutations()

const typeName = (id: string) => data.value.types.find((t) => t.id === id)?.name ?? 'Cheese'
const withStatus = computed(() => data.value.makes.map((make) => ({ make, status: makeStatus(make, today) })))
// Ready first (waiting longest at the top), then aging (soonest first).
const ready = computed(() => withStatus.value.filter((m) => m.status === 'ready').sort((a, b) => a.make.ready_on.localeCompare(b.make.ready_on)))
const aging = computed(() => withStatus.value.filter((m) => m.status === 'aging').sort((a, b) => a.make.ready_on.localeCompare(b.make.ready_on)))
const finished = computed(() => withStatus.value.filter((m) => m.status === 'finished'))
const showFinished = ref(false)
const months = computed(() => monthlyTotals(data.value.makes).slice(0, 6))

function readyLabel(make: CheeseMake) {
  const days = daysBetween(today, make.ready_on)
  if (days > 0) return `Ready ${relativeDays(days)}`
  return days === 0 ? 'Ready today' : `Ready since ${formatDate(make.ready_on)}`
}
function amounts(make: CheeseMake) {
  const y = yieldPerGallon(make)
  return [
    make.milk_gallons != null && `${Number(make.milk_gallons)} gal`,
    make.pieces && `${make.pieces} ${make.pieces === 1 ? 'piece' : 'pieces'}`,
    make.cheese_weight_g && formatWeight(make.cheese_weight_g, 'lb', true),
    y !== null && `${y.toFixed(2)} lb/gal`,
  ]
    .filter(Boolean)
    .join(' · ')
}
const monthLabel = (m: string) => new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

const modal = ref<{ open: boolean; make?: CheeseMake }>({ open: false })

// The cheese list: anyone can add; owners rename, change aging times and hide.
const draft = reactive({ name: '', months: 0 })
async function addType() {
  if (!draft.name.trim()) return
  try {
    await saveType.mutateAsync({ values: { name: draft.name.trim(), aging_months: draft.months, sort_order: data.value.types.length + 1 } })
    Object.assign(draft, { name: '', months: 0 })
  } catch (e) {
    const message = (e as Error).message
    toast.add({ color: 'error', title: 'Could not add', description: message.includes('duplicate') ? 'That cheese is already in the list.' : message })
  }
}
function updateType(t: CheeseType, values: Partial<Pick<CheeseType, 'name' | 'aging_months' | 'hidden'>>) {
  if (values.name !== undefined && !values.name.trim()) return
  saveType.mutate(
    { id: t.id, values: { name: t.name, ...values } },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) },
  )
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Cheese</h1>
      <UButton icon="i-lucide-plus" @click="modal = { open: true }">New make</UButton>
    </div>

    <div v-if="query.isPending.value" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-20 w-full" /></div>

    <template v-else>
      <UCard v-if="!ready.length && !aging.length" class="text-center">
        <p class="text-muted">No cheese aging. Record a make when you make cheese, and it shows here until it’s ready.</p>
      </UCard>

      <UCard v-for="group in [{ title: 'Ready', rows: ready }, { title: 'Aging', rows: aging }].filter((g) => g.rows.length)" :key="group.title" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">{{ group.title }} <span class="text-muted font-normal">({{ group.rows.length }})</span></h2>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="{ make, status } in group.rows" :key="make.id">
            <button type="button" class="w-full text-start px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-start gap-x-3 gap-y-1" @click="modal = { open: true, make }">
              <span class="flex-1 min-w-48">
                <span class="font-medium">{{ typeName(make.cheese_type_id) }}</span>
                <span class="text-sm text-muted"> · made {{ formatDate(make.made_on) }}</span>
                <span v-if="amounts(make)" class="block text-sm text-muted">{{ amounts(make) }}</span>
                <span v-if="make.notes" class="block text-sm text-muted line-clamp-2">{{ make.notes }}</span>
              </span>
              <UBadge :color="status === 'ready' ? 'primary' : 'neutral'" variant="subtle" :icon="status === 'ready' ? 'i-lucide-check' : 'i-lucide-hourglass'">
                {{ readyLabel(make) }}
              </UBadge>
            </button>
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
              <th class="px-2 py-2 text-end font-normal">Milk</th>
              <th class="px-4 py-2 text-end font-normal">Cheese</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="m in months" :key="m.month">
              <td class="px-4 py-2 whitespace-nowrap">{{ monthLabel(m.month) }}</td>
              <td class="px-2 py-2 text-end tabular-nums">{{ m.makes }}</td>
              <td class="px-2 py-2 text-end tabular-nums">
                <template v-if="m.gallons">
                  <span class="whitespace-nowrap">{{ +m.gallons.toFixed(2) }} gal</span>
                  <span class="block text-xs text-muted whitespace-nowrap">≈ {{ Math.round(m.milkLb) }} lb</span>
                </template>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="px-4 py-2 text-end tabular-nums">{{ m.cheeseLb ? `${+m.cheeseLb.toFixed(1)} lb` : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </UCard>

      <div v-if="finished.length">
        <UButton color="neutral" variant="link" :icon="showFinished ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" @click="showFinished = !showFinished">
          Finished ({{ finished.length }})
        </UButton>
        <ul v-if="showFinished" class="divide-y divide-default rounded-lg border border-default">
          <li v-for="{ make, status } in finished" :key="make.id">
            <button type="button" class="w-full text-start px-4 py-2 text-sm hover:bg-elevated/50 flex gap-3" @click="modal = { open: true, make }">
              <span class="flex-1">{{ typeName(make.cheese_type_id) }} · made {{ formatDate(make.made_on) }}</span>
              <span class="text-muted">{{ STATUS_LABELS[status] }} {{ formatDate(make.finished_on) }}</span>
            </button>
          </li>
        </ul>
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">Cheeses we make</h2>
          <p class="text-sm text-muted">
            How long each usually ages; a new make’s ready date starts from this. {{ isOwner ? '' : 'Only owners can rename or hide these.' }}
          </p>
        </template>
        <ul class="divide-y divide-default -my-2">
          <li v-for="t in data.types" :key="t.id" class="py-2 flex flex-wrap items-center gap-3" :class="t.hidden ? 'opacity-60' : ''">
            <template v-if="isOwner">
              <UInput
                :model-value="t.name"
                maxlength="60"
                class="flex-1 min-w-40"
                :aria-label="`${t.name} name`"
                @change="(e: Event) => updateType(t, { name: (e.target as HTMLInputElement).value })"
              />
              <!-- Kept together, so on a phone they wrap as one line under the name. -->
              <div class="flex items-center gap-2 ms-auto">
                <UInputNumber
                  :model-value="t.aging_months"
                  :min="0"
                  :max="36"
                  class="w-28"
                  :aria-label="`${t.name} aging months`"
                  @update:model-value="(v: unknown) => updateType(t, { aging_months: Number(v) || 0 })"
                />
                <span class="text-sm text-muted">months</span>
                <UButton size="xs" color="neutral" variant="ghost" class="w-16 justify-center" @click="updateType(t, { hidden: !t.hidden })">
                  {{ t.hidden ? 'Restore' : 'Hide' }}
                </UButton>
              </div>
            </template>
            <template v-else>
              <span class="flex-1 font-medium">{{ t.name }}</span>
              <span class="text-sm text-muted">{{ t.aging_months ? `${t.aging_months} months` : 'fresh' }}{{ t.hidden ? ' · hidden' : '' }}</span>
            </template>
          </li>
        </ul>
        <form class="flex flex-wrap items-end gap-2 mt-4" @submit.prevent="addType">
          <UFormField label="Add a cheese" class="flex-1 min-w-40">
            <UInput v-model="draft.name" placeholder="Gouda, ricotta…" maxlength="60" class="w-full" />
          </UFormField>
          <UFormField label="Ages (months)">
            <UInputNumber v-model="draft.months" :min="0" :max="36" class="w-28" />
          </UFormField>
          <UButton type="submit" variant="soft" :loading="saveType.isPending.value">Add</UButton>
        </form>
      </UCard>
    </template>

    <MakeModal v-model:open="modal.open" :make="modal.make" />
  </div>
</template>
