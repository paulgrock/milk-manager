<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useCareLog, useHealthData, useHealthMutations } from '@/composables/useHealth'
import { formatDate, relativeDays, todayISO } from '@/lib/dates'
import { CURRENT_STATUSES, goatName, type Goat } from '@/lib/goats'
import { careStatus, withdrawalOn, type CareStatus, type CareType } from '@/lib/health'
import LogCareModal from '@/components/health/LogCareModal.vue'
import TreatmentModal from '@/components/health/TreatmentModal.vue'

const today = todayISO()
const toast = useToast()
const { isOwner } = useHerd()
const { goats, byId, pathOf } = useHerdGoats()
const { query, data } = useHealthData()
const { waitingCount } = useCareLog()
const { saveCareType } = useHealthMutations()

const name = (g?: Goat) => (g ? g.barn_name || goatName(g) : '?')
const herd = computed(() =>
  (goats.data.value ?? []).filter((g) => CURRENT_STATUSES.includes(g.status)).sort((a, b) => name(a).localeCompare(name(b))),
)
const activeTypes = computed(() => data.value.careTypes.filter((t) => !t.archived))

const withheld = computed(() =>
  herd.value
    .map((goat) => ({ goat, withdrawal: withdrawalOn(goat.id, data.value.treatments, today) }))
    .filter((x) => !!x.withdrawal)
    .sort((a, b) => a.withdrawal!.through.localeCompare(b.withdrawal!.through)),
)

// Per care type: goats overdue or due within a week, and how many have never had it.
const careDue = computed(() =>
  activeTypes.value
    .filter((t) => t.interval_days)
    .map((type) => {
      const statuses = herd.value.map((goat) => ({ goat, status: careStatus(goat.id, type, data.value.careEvents, today) }))
      const due = statuses
        .filter((s) => s.status.state === 'overdue' || s.status.state === 'due')
        .sort((a, b) => a.status.daysUntilDue! - b.status.daysUntilDue!)
      const never = statuses.filter((s) => s.status.state === 'never')
      return { type, due, never }
    })
    .filter((x) => x.due.length || x.never.length),
)

const recentTreatments = computed(() =>
  [...data.value.treatments].sort((a, b) => b.started_on.localeCompare(a.started_on)).slice(0, 8),
)

function dueLabel(s: CareStatus) {
  return s.state === 'overdue' ? `${-s.daysUntilDue!} days overdue` : relativeDays(s.daysUntilDue!)
}

const careModal = ref<{ open: boolean; careTypeId?: string; goatIds?: string[] }>({ open: false })
const treatmentOpen = ref(false)

// Care routine editor (owners).
const draft = reactive({ name: '', interval: undefined as number | undefined, unit: '' })
async function addType() {
  if (!draft.name.trim()) return
  try {
    await saveCareType.mutateAsync({
      values: { name: draft.name.trim(), interval_days: draft.interval || null, dose_unit: draft.unit.trim() || null, sort_order: data.value.careTypes.length + 1 },
    })
    Object.assign(draft, { name: '', interval: undefined, unit: '' })
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not add', description: (e as Error).message.includes('duplicate') ? 'That name is already in the list.' : (e as Error).message })
  }
}
function updateType(t: CareType, values: Partial<Pick<CareType, 'interval_days' | 'archived'>>) {
  saveCareType.mutate(
    { id: t.id, values: { name: t.name, ...values } },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) },
  )
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Health</h1>
      <UButton icon="i-lucide-clipboard-check" @click="careModal = { open: true }">Log care</UButton>
      <UButton variant="soft" icon="i-lucide-pill" @click="treatmentOpen = true">Treatment</UButton>
    </div>

    <UAlert
      v-if="waitingCount"
      color="warning"
      variant="subtle"
      icon="i-lucide-cloud-off"
      :title="`${waitingCount} care ${waitingCount === 1 ? 'log is' : 'logs are'} saved on this phone`"
      description="They will upload automatically when you have signal."
    />

    <div v-if="query.isPending.value" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
    </div>

    <template v-else>
      <UCard v-if="withheld.length" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold flex items-center gap-2"><UIcon name="i-lucide-milk-off" class="text-warning" /> Milk withheld</h2>
        </template>
        <ul class="divide-y divide-default">
          <li v-for="{ goat, withdrawal } in withheld" :key="goat.id">
            <RouterLink :to="`/goats/${goat.slug}`" class="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50">
              <span class="font-medium flex-1">{{ name(goat) }}</span>
              <span class="text-sm text-muted">{{ withdrawal!.treatments.map((t) => t.medication).join(', ') }}</span>
              <span class="text-sm">through <strong>{{ formatDate(withdrawal!.through) }}</strong></span>
            </RouterLink>
          </li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">Care due</h2>
          <p class="text-sm text-muted">Overdue, or due in the next week</p>
        </template>
        <p v-if="!careDue.length" class="p-4 text-muted">Everyone is up to date.</p>
        <div v-for="{ type, due, never } in careDue" :key="type.id" class="border-t border-default first:border-0 px-4 py-3 space-y-2">
          <div class="flex items-center gap-2">
            <h3 class="font-medium flex-1">{{ type.name }}</h3>
            <UButton
              v-if="due.length"
              size="xs"
              variant="soft"
              @click="careModal = { open: true, careTypeId: type.id, goatIds: due.map((d) => d.goat.id) }"
            >
              Log for these {{ due.length }}
            </UButton>
          </div>
          <ul v-if="due.length" class="flex flex-wrap gap-2">
            <li v-for="{ goat, status } in due" :key="goat.id">
              <RouterLink :to="`/goats/${goat.slug}`">
                <UBadge :color="status.state === 'overdue' ? 'warning' : 'neutral'" variant="subtle" :icon="status.state === 'overdue' ? 'i-lucide-alarm-clock' : undefined">
                  {{ name(goat) }} · {{ dueLabel(status) }}
                </UBadge>
              </RouterLink>
            </li>
          </ul>
          <p v-if="never.length" class="text-xs text-muted">
            Never recorded for {{ never.length }}: {{ never.map((n) => name(n.goat)).join(', ') }}
          </p>
        </div>
      </UCard>


      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header><h2 class="font-semibold">Recent treatments</h2></template>
        <p v-if="!recentTreatments.length" class="p-4 text-muted">None recorded.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="t in recentTreatments" :key="t.id">
            <RouterLink :to="pathOf(t.goat_id)" class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-elevated/50">
              <span class="w-24 text-muted">{{ formatDate(t.started_on) }}</span>
              <span class="flex-1">{{ name(byId.get(t.goat_id)) }} · {{ t.medication }}</span>
            </RouterLink>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">Care routine</h2>
          <p class="text-sm text-muted">How often each kind of care is due. {{ isOwner ? '' : 'Only owners can change this.' }}</p>
        </template>
        <ul class="divide-y divide-default -my-2">
          <li v-for="t in data.careTypes" :key="t.id" class="py-2 flex flex-wrap items-center gap-3" :class="t.archived ? 'opacity-60' : ''">
            <span class="flex-1 min-w-32 font-medium">{{ t.name }}<span v-if="t.dose_unit" class="text-muted font-normal"> ({{ t.dose_unit }})</span></span>
            <template v-if="isOwner">
              <UInputNumber
                :model-value="t.interval_days ?? undefined"
                :min="1"
                :max="1095"
                placeholder="As needed"
                class="w-32"
                :aria-label="`${t.name} every how many days`"
                @update:model-value="(v: unknown) => updateType(t, { interval_days: (v as number) || null })"
              />
              <span class="text-sm text-muted w-8">days</span>
              <UButton size="xs" color="neutral" variant="ghost" @click="updateType(t, { archived: !t.archived })">
                {{ t.archived ? 'Restore' : 'Hide' }}
              </UButton>
            </template>
            <span v-else class="text-sm text-muted">{{ t.interval_days ? `every ${t.interval_days} days` : 'as needed' }}</span>
          </li>
        </ul>
        <form v-if="isOwner" class="flex flex-wrap items-end gap-2 mt-4" @submit.prevent="addType">
          <UFormField label="Add care" class="flex-1 min-w-40">
            <UInput v-model="draft.name" placeholder="Deworming, BoSe…" maxlength="60" class="w-full" />
          </UFormField>
          <UFormField label="Every (days)">
            <UInputNumber v-model="draft.interval" :min="1" :max="1095" placeholder="As needed" class="w-32" />
          </UFormField>
          <UFormField label="Dose unit">
            <UInput v-model="draft.unit" maxlength="10" placeholder="ml, g" class="w-24" />
          </UFormField>
          <UButton type="submit" variant="soft" :loading="saveCareType.isPending.value">Add</UButton>
        </form>
      </UCard>
    </template>

    <LogCareModal v-model:open="careModal.open" :care-type-id="careModal.careTypeId" :goat-ids="careModal.goatIds" />
    <TreatmentModal v-model:open="treatmentOpen" />
  </div>
</template>
