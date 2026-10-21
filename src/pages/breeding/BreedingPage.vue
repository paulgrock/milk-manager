<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHerdGoats } from '@/composables/useGoats'
import { useBreedingData } from '@/composables/useBreeding'
import { useLactations } from '@/composables/useMilk'
import { useHerd } from '@/composables/useHerd'
import { addMonths, formatDate, relativeDays, todayISO } from '@/lib/dates'
import { STATUS_LABELS, addDays, daysBetween, doeBreedingState, type DoeBreedingState } from '@/lib/breeding'
import { STATUS_COLOR } from '@/lib/breedingStatusColors'
import { CURRENT_STATUSES, goatFullName, goatName, type Goat } from '@/lib/goats'
import { formatWeight, lactationOn } from '@/lib/milk'
import HeatModal from '@/components/breeding/HeatModal.vue'
import BreedingModal from '@/components/breeding/BreedingModal.vue'

const DUE_WITHIN_DAYS = 60
const HEAT_WITHIN_DAYS = 7

const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { goats, byId } = useHerdGoats()
const { query, data } = useBreedingData()
const lactations = useLactations()

const name = (g: Goat) => g.barn_name || goatName(g)
const does = computed(() => (goats.data.value ?? []).filter((g) => g.sex === 'doe' && CURRENT_STATUSES.includes(g.status)))
const states = computed(() => does.value.map((goat) => ({ goat, state: doeBreedingState(goat.id, data.value, today) })))

type WithCurrent = { goat: Goat; state: DoeBreedingState & { current: NonNullable<DoeBreedingState['current']> } }

const dueSoon = computed(() =>
  states.value
    .filter((x): x is WithCurrent => !!x.state.current && x.state.current.daysToDue <= DUE_WITHIN_DAYS)
    .sort((a, b) => a.state.current.due.expected.localeCompare(b.state.current.due.expected))
    .map((x) => ({
      ...x,
      // Still being milked past her dry-off date.
      dryOffNow: x.state.current.dryOffBy <= today && !!lactationOn(lactations.data.value ?? [], x.goat.id, today),
    })),
)

const bredLater = computed(() =>
  states.value.filter((x) => x.state.current && x.state.current.daysToDue > DUE_WITHIN_DAYS).length,
)

const heatWatch = computed(() =>
  states.value
    .filter((x) => x.state.nextHeat && x.state.nextHeat.date <= addDays(today, HEAT_WITHIN_DAYS))
    .sort((a, b) => a.state.nextHeat!.date.localeCompare(b.state.nextHeat!.date)),
)

// Doelings under breeding age aren't "not bred" yet.
const BREEDING_AGE_MONTHS = 6
const open = computed(() =>
  states.value.filter(
    (x) => !x.state.current && (!x.goat.birth_date || x.goat.birth_date <= addMonths(today, -BREEDING_AGE_MONTHS)),
  ),
)

const recentKiddings = computed(() =>
  data.value.kiddings
    .filter((k) => k.kidded_on >= addDays(today, -90))
    .sort((a, b) => b.kidded_on.localeCompare(a.kidded_on))
    .map((k) => {
      const kids = data.value.kids.filter((x) => x.kidding_id === k.id)
      return { kidding: k, doe: byId.value.get(k.doe_id), kids }
    }),
)

const heatOpen = ref(false)
const breedingOpen = ref(false)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Breeding</h1>
      <UButton variant="soft" icon="i-lucide-flame" @click="heatOpen = true">Log heat</UButton>
      <UButton variant="soft" icon="i-lucide-heart" @click="breedingOpen = true">Record breeding</UButton>
      <UButton icon="i-lucide-baby" to="/breeding/kidding">Record kidding</UButton>
    </div>

    <div v-if="query.isPending.value || goats.isPending.value" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
    </div>

    <template v-else>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">Due soon</h2>
          <p class="text-sm text-muted">
            Next {{ DUE_WITHIN_DAYS }} days<template v-if="bredLater"> · {{ bredLater }} more bred for later</template>
          </p>
        </template>
        <p v-if="!dueSoon.length" class="p-4 text-muted">Nobody is due in the next {{ DUE_WITHIN_DAYS }} days.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="{ goat, state, dryOffNow } in dueSoon" :key="goat.id">
            <RouterLink :to="`/goats/${goat.id}`" class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-elevated/50">
              <span class="font-medium min-w-24">{{ name(goat) }}</span>
              <UBadge :color="STATUS_COLOR[state.current.status]" variant="subtle" size="sm">
                {{ STATUS_LABELS[state.current.status] }}
              </UBadge>
              <span class="text-sm text-muted flex-1 min-w-40">
                to {{ state.current.breeding.buck_id && byId.get(state.current.breeding.buck_id) ? goatFullName(byId.get(state.current.breeding.buck_id)!) : 'unknown buck' }}
              </span>
              <span class="text-end">
                <span class="block font-medium">{{ formatDate(state.current.due.expected) }}</span>
                <span class="block text-xs text-muted">{{ relativeDays(state.current.daysToDue) }}</span>
              </span>
              <UBadge v-if="dryOffNow" color="warning" variant="subtle" icon="i-lucide-moon" class="basis-full sm:basis-auto w-fit">
                Dry off now (by {{ formatDate(state.current.dryOffBy) }})
              </UBadge>
            </RouterLink>
          </li>
        </ul>
      </UCard>

      <div class="grid md:grid-cols-2 gap-4 items-start">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="font-semibold">Watch for heat</h2>
            <p class="text-sm text-muted">Next {{ HEAT_WITHIN_DAYS }} days</p>
          </template>
          <p v-if="!heatWatch.length" class="p-4 text-muted">No heats expected this week.</p>
          <ul v-else class="divide-y divide-default">
            <li v-for="{ goat, state } in heatWatch" :key="goat.id">
              <RouterLink :to="`/goats/${goat.id}`" class="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50">
                <span class="font-medium flex-1">{{ name(goat) }}</span>
                <span class="text-sm text-muted">{{ state.nextHeat!.reason === 'return' ? 'Did she settle?' : 'Cycle' }}</span>
                <span class="text-end">
                  <span class="block">{{ formatDate(state.nextHeat!.date) }}</span>
                  <span class="block text-xs text-muted">{{ relativeDays(daysBetween(today, state.nextHeat!.date)) }}</span>
                </span>
              </RouterLink>
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="font-semibold">Not bred</h2>
            <p class="text-sm text-muted">{{ open.length }} {{ open.length === 1 ? 'doe' : 'does' }}</p>
          </template>
          <p v-if="!open.length" class="p-4 text-muted">Every doe is bred.</p>
          <ul v-else class="divide-y divide-default">
            <li v-for="{ goat, state } in open" :key="goat.id">
              <RouterLink :to="`/goats/${goat.id}`" class="flex items-center gap-3 px-4 py-2 hover:bg-elevated/50">
                <span class="flex-1">{{ name(goat) }}</span>
                <span class="text-xs text-muted">
                  {{ state.lastKidding ? `Kidded ${formatDate(state.lastKidding.kidded_on)}` : 'No kiddings recorded' }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header><h2 class="font-semibold">Recent kiddings</h2></template>
        <p v-if="!recentKiddings.length" class="p-4 text-muted">No kiddings in the last 90 days.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="{ kidding, doe, kids } in recentKiddings" :key="kidding.id" class="px-4 py-3">
            <div class="flex items-center gap-3">
              <RouterLink v-if="doe" :to="`/goats/${doe.id}`" class="font-medium hover:underline">{{ name(doe) }}</RouterLink>
              <span class="text-sm text-muted flex-1">{{ formatDate(kidding.kidded_on) }}</span>
              <span class="text-sm">{{ kids.length }} {{ kids.length === 1 ? 'kid' : 'kids' }}</span>
            </div>
            <ul class="mt-1 flex flex-wrap gap-2">
              <li v-for="kid in kids" :key="kid.id">
                <UBadge :color="kid.outcome === 'alive' ? 'neutral' : 'error'" variant="outline" size="sm">
                  <RouterLink v-if="kid.goat_id" :to="`/goats/${kid.goat_id}`" class="hover:underline">
                    {{ byId.get(kid.goat_id) ? name(byId.get(kid.goat_id)!) : kid.sex === 'doe' ? 'Doeling' : 'Buckling' }}
                  </RouterLink>
                  <template v-else>{{ kid.sex === 'doe' ? 'Doeling' : 'Buckling' }}</template>
                  <template v-if="kid.birth_weight_g"> · {{ formatWeight(kid.birth_weight_g, unit, true) }}</template>
                  <template v-if="kid.outcome !== 'alive'"> · {{ kid.outcome }}</template>
                </UBadge>
              </li>
            </ul>
          </li>
        </ul>
      </UCard>
    </template>

    <HeatModal v-model:open="heatOpen" />
    <BreedingModal v-model:open="breedingOpen" />
  </div>
</template>
