<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBreedingData } from '@/composables/useBreeding'
import { useHerdGoats } from '@/composables/useGoats'
import { useHerd } from '@/composables/useHerd'
import { formatDate, relativeDays, todayISO } from '@/lib/dates'
import {
  METHOD_LABELS,
  STATUS_LABELS,
  breedingStatus,
  daysBetween,
  doeBreedingState,
  dueWindow,
  type Breeding,
  type BreedingStatus,
  type Heat,
  type PregnancyCheck,
} from '@/lib/breeding'
import { goatFullName, type Goat } from '@/lib/goats'
import { formatWeight } from '@/lib/milk'
import { STATUS_COLOR } from '@/lib/breedingStatusColors'
import HeatModal from './HeatModal.vue'
import BreedingModal from './BreedingModal.vue'
import CheckModal from './CheckModal.vue'

const props = defineProps<{ goat: Goat }>()
const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { data } = useBreedingData()
const { byId } = useHerdGoats()

const state = computed(() => doeBreedingState(props.goat.id, data.value, today))
const buckName = (id: string | null) => (id && byId.value.get(id) ? goatFullName(byId.value.get(id)!) : 'unknown buck')

// Everything that happened, newest first.
type Event =
  | { kind: 'heat'; date: string; heat: Heat }
  | { kind: 'breeding'; date: string; breeding: Breeding; status: BreedingStatus }
  | { kind: 'check'; date: string; check: PregnancyCheck }
  | { kind: 'kidding'; date: string; id: string; summary: string }

const events = computed<Event[]>(() => {
  const d = data.value
  const mine = new Set(d.breedings.filter((b) => b.doe_id === props.goat.id).map((b) => b.id))
  return [
    ...d.heats.filter((h) => h.goat_id === props.goat.id).map((heat) => ({ kind: 'heat' as const, date: heat.observed_on, heat })),
    ...d.breedings
      .filter((b) => mine.has(b.id))
      .map((breeding) => ({ kind: 'breeding' as const, date: breeding.bred_on, breeding, status: breedingStatus(breeding, d, today) })),
    ...d.checks.filter((c) => mine.has(c.breeding_id)).map((check) => ({ kind: 'check' as const, date: check.checked_on, check })),
    ...d.kiddings
      .filter((k) => k.doe_id === props.goat.id)
      .map((k) => {
        const kids = d.kids.filter((x) => x.kidding_id === k.id)
        const parts = kids.map(
          (x) => `${x.sex === 'doe' ? 'doeling' : 'buckling'}${x.birth_weight_g ? ` ${formatWeight(x.birth_weight_g, unit.value, true)}` : ''}${x.outcome !== 'alive' ? ` (${x.outcome})` : ''}`,
        )
        return { kind: 'kidding' as const, date: k.kidded_on, id: k.id, summary: `${kids.length} ${kids.length === 1 ? 'kid' : 'kids'}${parts.length ? `: ${parts.join(', ')}` : ''}` }
      }),
  ].sort((a, b) => b.date.localeCompare(a.date))
})

const heatModal = ref<{ open: boolean; heat?: Heat }>({ open: false })
const breedingModal = ref<{ open: boolean; breeding?: Breeding }>({ open: false })
const checkModal = ref<{ open: boolean; breedingId: string; check?: PregnancyCheck }>({ open: false, breedingId: '' })

const CHECK_LABELS = { pregnant: 'pregnant', open: 'open', unsure: 'unsure' } as const
const CHECK_METHODS = { blood: 'Blood test', ultrasound: 'Ultrasound', observation: 'Observed' } as const
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">Breeding</h2>
    </template>

    <div class="space-y-3">
      <div v-if="state.current" class="rounded-md border border-default p-3 space-y-1">
        <div class="flex items-center gap-2">
          <UBadge :color="STATUS_COLOR[state.current.status]" variant="subtle">{{ STATUS_LABELS[state.current.status] }}</UBadge>
          <span class="text-sm">to {{ buckName(state.current.breeding.buck_id) }}</span>
        </div>
        <p class="text-lg font-semibold">
          Due {{ formatDate(state.current.due.expected) }}
          <span class="text-sm font-normal text-muted">({{ relativeDays(state.current.daysToDue) }})</span>
        </p>
        <p class="text-sm text-muted">
          Could kid {{ formatDate(state.current.due.earliest) }} – {{ formatDate(state.current.due.latest) }} · dry off by
          {{ formatDate(state.current.dryOffBy) }}
        </p>
      </div>
      <p v-else class="text-muted text-sm">Open (not bred).</p>

      <p v-if="state.nextHeat" class="text-sm">
        <UIcon name="i-lucide-calendar-clock" class="align-middle me-1" />
        {{ state.nextHeat.reason === 'return' ? 'Watch for a return to heat' : 'Next heat expected' }}
        <strong>{{ formatDate(state.nextHeat.date) }}</strong>
        ({{ relativeDays(daysBetween(today, state.nextHeat.date)) }})
      </p>

      <div class="flex flex-wrap gap-2">
        <UButton size="sm" variant="soft" icon="i-lucide-flame" @click="heatModal = { open: true }">Log heat</UButton>
        <UButton size="sm" variant="soft" icon="i-lucide-heart" @click="breedingModal = { open: true }">Record breeding</UButton>
        <UButton
          v-if="state.current"
          size="sm"
          variant="soft"
          icon="i-lucide-test-tube"
          @click="checkModal = { open: true, breedingId: state.current.breeding.id }"
        >
          Pregnancy check
        </UButton>
        <UButton
          size="sm"
          variant="soft"
          icon="i-lucide-baby"
          :to="{ path: '/breeding/kidding', query: { doe: goat.id, ...(state.current ? { breeding: state.current.breeding.id } : {}) } }"
        >
          Record kidding
        </UButton>
      </div>

      <ul v-if="events.length" class="divide-y divide-default border-t border-default">
        <li v-for="e in events" :key="`${e.kind}-${e.date}-${'id' in e ? e.id : e.kind === 'heat' ? e.heat.id : e.kind === 'breeding' ? e.breeding.id : e.check.id}`">
          <button
            type="button"
            class="w-full py-2 flex gap-3 text-start text-sm hover:bg-elevated/50 rounded disabled:hover:bg-transparent"
            :disabled="e.kind === 'kidding'"
            @click="
              e.kind === 'heat'
                ? (heatModal = { open: true, heat: e.heat })
                : e.kind === 'breeding'
                  ? (breedingModal = { open: true, breeding: e.breeding })
                  : e.kind === 'check'
                    ? (checkModal = { open: true, breedingId: e.check.breeding_id, check: e.check })
                    : undefined
            "
          >
            <span class="w-24 shrink-0 text-muted">{{ formatDate(e.date) }}</span>
            <span class="flex-1">
              <template v-if="e.kind === 'heat'">In heat<template v-if="e.heat.signs"> · {{ e.heat.signs }}</template></template>
              <template v-else-if="e.kind === 'breeding'">
                {{ METHOD_LABELS[e.breeding.method] }} to {{ buckName(e.breeding.buck_id) }}
                <span class="text-muted">· due {{ formatDate(dueWindow(e.breeding).expected) }}</span>
              </template>
              <template v-else-if="e.kind === 'check'">
                {{ CHECK_METHODS[e.check.method] }}: {{ CHECK_LABELS[e.check.result] }}
              </template>
              <template v-else>Kidded · {{ e.summary }}</template>
            </span>
            <UBadge v-if="e.kind === 'breeding'" :color="STATUS_COLOR[e.status]" variant="subtle" size="sm">
              {{ STATUS_LABELS[e.status] }}
            </UBadge>
          </button>
        </li>
      </ul>
    </div>

    <HeatModal v-model:open="heatModal.open" :goat-id="goat.id" :heat="heatModal.heat" />
    <BreedingModal v-model:open="breedingModal.open" :goat-id="goat.id" :breeding="breedingModal.breeding" />
    <CheckModal v-model:open="checkModal.open" :breeding-id="checkModal.breedingId" :check="checkModal.check" />
  </UCard>
</template>
