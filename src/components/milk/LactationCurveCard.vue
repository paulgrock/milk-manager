<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useGoatDayTotals, useHerdDayTotals, useLactations } from '@/composables/useMilk'
import { MAX_SERIES } from '@/composables/useChartTheme'
import { todayISO } from '@/lib/dates'
import { goatName, type Goat } from '@/lib/goats'
import { CONFIDENCE_LABELS, STANDARD_DAYS, summarizeLactation } from '@/lib/lactation'
import { formatWeight, type Lactation } from '@/lib/milk'
import LactationChart, { type CurveSeries } from '@/components/charts/LactationChart.vue'

const props = defineProps<{ goat: Goat }>()

const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { byId } = useHerdGoats()
const lactations = useLactations()
const ownTotals = useGoatDayTotals(() => props.goat.id)

const own = computed(() =>
  (lactations.data.value ?? [])
    .filter((l) => l.goat_id === props.goat.id)
    .sort((a, b) => b.freshened_on.localeCompare(a.freshened_on)),
)

const selectedId = ref<string>()
watch(
  own,
  (list) => {
    if (!list.some((l) => l.id === selectedId.value)) selectedId.value = list[0]?.id
  },
  { immediate: true },
)
const selected = computed(() => own.value.find((l) => l.id === selectedId.value))

const lactationLabel = (l: Lactation) => {
  if (l.goat_id === props.goat.id) return `Lactation ${l.lactation_number}`
  const g = byId.value.get(l.goat_id)
  return `${g ? g.barn_name || goatName(g) : 'Doe'} · L${l.lactation_number}`
}

const lactationOptions = computed(() =>
  own.value.map((l) => ({ label: `${lactationLabel(l)} (${l.freshened_on.slice(0, 4)})`, value: l.id })),
)

// Up to two other lactations to compare: her earlier ones, or other does'.
const compareIds = ref<string[]>([])
const compareOptions = computed(() =>
  (lactations.data.value ?? [])
    .filter((l) => l.id !== selectedId.value)
    .sort((a, b) => Number(b.goat_id === props.goat.id) - Number(a.goat_id === props.goat.id) || b.freshened_on.localeCompare(a.freshened_on))
    .map((l) => ({ label: `${lactationLabel(l)} (${l.freshened_on.slice(0, 4)})`, value: l.id })),
)
watch(compareIds, (ids) => {
  if (ids.length > MAX_SERIES - 1) compareIds.value = ids.slice(0, MAX_SERIES - 1)
})
watch(selectedId, () => (compareIds.value = compareIds.value.filter((id) => id !== selectedId.value)))

const compared = computed(() =>
  compareIds.value.map((id) => (lactations.data.value ?? []).find((l) => l.id === id)).filter((l): l is Lactation => !!l),
)

// Other does' milk is only loaded when one is being compared.
const otherSince = computed(
  () =>
    compared.value
      .filter((l) => l.goat_id !== props.goat.id)
      .map((l) => l.freshened_on)
      .sort()[0] ?? '',
)
const otherTotals = useHerdDayTotals(otherSince)

const summary = computed(() => (selected.value ? summarizeLactation(selected.value, ownTotals.data.value ?? [], today) : null))

const series = computed<CurveSeries[]>(() => {
  if (!selected.value || !summary.value) return []
  const inMilk = !selected.value.dried_off_on || selected.value.dried_off_on >= today
  return [
    { id: selected.value.id, label: lactationLabel(selected.value), summary: summary.value, showProjection: inMilk },
    ...compared.value.map((l) => ({
      id: l.id,
      label: lactationLabel(l),
      summary: summarizeLactation(l, l.goat_id === props.goat.id ? (ownTotals.data.value ?? []) : (otherTotals.data.value ?? []), today),
      showProjection: false,
    })),
  ]
})

const inMilk = computed(() => !!selected.value && (!selected.value.dried_off_on || selected.value.dried_off_on >= today))
const confidenceColor = { low: 'warning', medium: 'neutral', high: 'success' } as const
</script>

<template>
  <UCard v-if="own.length">
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="font-semibold flex-1">Lactation curve</h2>
        <USelect v-if="own.length > 1" v-model="selectedId" :items="lactationOptions" size="sm" class="w-48" aria-label="Lactation" />
      </div>
    </template>

    <div v-if="ownTotals.isPending.value" class="space-y-2">
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else-if="summary">
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <dt class="text-xs text-muted">{{ inMilk ? 'So far' : 'Total' }}</dt>
          <dd class="text-xl font-semibold">{{ formatWeight(summary.totalG, unit, true) }}</dd>
          <dd class="text-xs text-muted">{{ summary.daysRecorded }} days weighed · DIM {{ summary.currentDim }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">{{ inMilk && summary.currentDim < STANDARD_DAYS ? 'Projected 305-day' : '305-day' }}</dt>
          <template v-if="summary.projected305G !== null">
            <dd class="text-xl font-semibold">{{ formatWeight(summary.projected305G, unit, true) }}</dd>
            <dd v-if="inMilk && summary.confidence && summary.currentDim < STANDARD_DAYS">
              <UBadge
                :color="confidenceColor[summary.confidence]"
                variant="subtle"
                size="sm"
                :icon="summary.confidence === 'low' ? 'i-lucide-triangle-alert' : summary.confidence === 'high' ? 'i-lucide-circle-check' : 'i-lucide-circle-dot'"
              >
                {{ CONFIDENCE_LABELS[summary.confidence] }}
              </UBadge>
            </dd>
          </template>
          <template v-else>
            <dd class="text-xl font-semibold text-muted">—</dd>
            <dd class="text-xs text-muted">{{ summary.projectionNote }}</dd>
          </template>
        </div>
        <div>
          <dt class="text-xs text-muted">Peak (7-day avg)</dt>
          <template v-if="summary.peak">
            <dd class="text-xl font-semibold">{{ formatWeight(summary.peak.grams, unit, true) }}</dd>
            <dd class="text-xs text-muted">on day {{ summary.peak.dim }}</dd>
          </template>
          <dd v-else class="text-xl font-semibold text-muted">—</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Average day</dt>
          <dd class="text-xl font-semibold">{{ summary.daysRecorded ? formatWeight(summary.avgG, unit, true) : '—' }}</dd>
        </div>
      </dl>

      <p v-if="!summary.points.length" class="text-muted">No complete days weighed in this lactation yet.</p>
      <template v-else>
        <LactationChart :series="series" :unit="unit" />
        <UFormField label="Compare with" class="mt-3" :hint="`Up to ${MAX_SERIES - 1}`">
          <USelectMenu
            v-model="compareIds"
            :items="compareOptions"
            value-key="value"
            multiple
            placeholder="Earlier lactations or other does"
            class="w-full sm:w-96"
          />
        </UFormField>
      </template>
    </template>
  </UCard>
</template>
