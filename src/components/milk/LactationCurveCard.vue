<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useGoatDayTotals, useHerdDayTotals, useLactations } from '@/composables/useMilk'
import { MAX_SERIES } from '@/composables/useChartTheme'
import { todayISO } from '@/lib/dates'
import { goatName, type Goat } from '@/lib/goats'
import { CONFIDENCE_LABELS, STANDARD_DAYS, summarizeLactation, woodAt } from '@/lib/lactation'
import { useMilkTests } from '@/composables/useMilkTests'
import { dhirRequirement, productionOver, starOutlook, withTestDays, type TestPoint } from '@/lib/dhia'
import { daysInMilk } from '@/lib/milk'
import { formatWeight, type Lactation } from '@/lib/milk'
import LactationChart, { type CurveSeries } from '@/components/charts/LactationChart.vue'

const props = defineProps<{ goat: Goat }>()

const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { byId } = useHerdGoats()
const lactations = useLactations()
const ownTotalsQuery = useGoatDayTotals(() => props.goat.id)
const milkTests = useMilkTests()
// Her daily weights with official test-day weights folded in.
const ownTotals = {
  isPending: ownTotalsQuery.isPending,
  data: computed(() =>
    withTestDays(ownTotalsQuery.data.value ?? [], props.goat.id, milkTests.data.value.tests, milkTests.data.value.results),
  ),
}

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
    {
      id: selected.value.id,
      label: lactationLabel(selected.value),
      summary: summary.value,
      showProjection: inMilk,
      testPoints: testPoints.value.filter((t) => t.grams !== null).map((t) => ({ dim: t.dim, grams: t.grams! })),
    },
    ...compared.value.map((l) => ({
      id: l.id,
      label: lactationLabel(l),
      summary: summarizeLactation(l, l.goat_id === props.goat.id ? (ownTotals.data.value ?? []) : (otherTotals.data.value ?? []), today),
      showProjection: false,
    })),
  ]
})

const inMilk = computed(() => !!selected.value && (!selected.value.dried_off_on || selected.value.dried_off_on >= today))

// Her test days in this lactation.
const testPoints = computed<(TestPoint & { grams: number | null })[]>(() => {
  const l = selected.value
  if (!l) return []
  const end = l.dried_off_on ?? today
  const dates = new Map(milkTests.data.value.tests.map((t) => [t.id, t.tested_on]))
  return milkTests.data.value.results
    .filter((r) => r.goat_id === props.goat.id)
    .map((r) => ({ r, date: dates.get(r.test_id) }))
    .filter((x): x is { r: (typeof x)['r']; date: string } => !!x.date && x.date >= l.freshened_on && x.date <= end)
    .map(({ r, date }) => ({
      dim: daysInMilk(l.freshened_on, date),
      grams: r.milk_g,
      butterfatPct: r.butterfat_pct === null ? null : Number(r.butterfat_pct),
      proteinPct: r.protein_pct === null ? null : Number(r.protein_pct),
    }))
})

// DHIR star (ADGA): requirement for her age at kidding vs. her first 305 days.
const star = computed(() => {
  const l = selected.value
  const s = summary.value
  if (!l || !s) return null
  const requirement = dhirRequirement({ breed: props.goat.breed, birthDate: props.goat.birth_date, freshenedOn: l.freshened_on })
  if (!requirement) return { requirement: null }
  const recorded = s.points.filter((p) => p.dim >= 1 && p.dim <= STANDARD_DAYS)
  const toDate = productionOver(recorded, testPoints.value)
  let projected = null
  if (inMilk.value && s.fit && s.currentDim < STANDARD_DAYS) {
    const have = new Map(recorded.map((p) => [p.dim, p.grams]))
    const days = Array.from({ length: STANDARD_DAYS }, (_, i) => ({ dim: i + 1, grams: have.get(i + 1) ?? woodAt(s.fit!, i + 1) }))
    projected = productionOver(days, testPoints.value)
  }
  return { requirement, toDate, projected, outlook: starOutlook(requirement, toDate, projected) }
})
const OUTLOOK = {
  earned: { label: 'Star earned', color: 'success', icon: 'i-lucide-star' },
  'on-track': { label: 'On track', color: 'primary', icon: 'i-lucide-trending-up' },
  short: { label: 'Short on current pace', color: 'warning', icon: 'i-lucide-triangle-alert' },
  unknown: { label: 'Not enough data yet', color: 'neutral', icon: 'i-lucide-circle-help' },
} as const
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
        <div v-if="star" class="mt-4 rounded-md border border-default p-3 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-medium flex-1">DHIR star (ADGA)</h3>
            <UBadge v-if="star.requirement" :color="OUTLOOK[star.outlook!].color" variant="subtle" :icon="OUTLOOK[star.outlook!].icon">
              {{ OUTLOOK[star.outlook!].label }}
            </UBadge>
          </div>
          <p v-if="!star.requirement" class="text-sm text-muted">Add her birth date to see what she needs for a star.</p>
          <template v-else>
            <p class="text-sm text-muted">
              Kidded at {{ star.requirement.ageAtKidding.years }} yr {{ star.requirement.ageAtKidding.months }} mo
              · {{ star.requirement.miniature ? 'miniature' : 'standard' }} breed · any one of these in 305 days or less:
            </p>
            <table class="w-full text-sm tabular-nums">
              <thead>
                <tr class="text-xs text-muted">
                  <th class="text-start font-normal py-1"></th>
                  <th class="text-end font-normal py-1">Needed</th>
                  <th class="text-end font-normal py-1">So far</th>
                  <th v-if="star.projected" class="text-end font-normal py-1">Projected 305</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in [
                  { label: 'Milk', need: star.requirement.milkLb, now: star.toDate!.milkLb, proj: star.projected?.milkLb },
                  { label: 'Butterfat', need: star.requirement.butterfatLb, now: star.toDate!.butterfatLb, proj: star.projected?.butterfatLb },
                  { label: 'Protein', need: star.requirement.proteinLb, now: star.toDate!.proteinLb, proj: star.projected?.proteinLb },
                ]" :key="m.label" class="border-t border-default">
                  <td class="py-1">{{ m.label }}</td>
                  <td class="py-1 text-end">{{ m.need.toLocaleString() }} lb</td>
                  <td class="py-1 text-end" :class="m.now !== null && m.now >= m.need ? 'text-success font-semibold' : ''">
                    {{ m.now === null ? 'needs a test' : `${m.now.toLocaleString()} lb` }}
                  </td>
                  <td v-if="star.projected" class="py-1 text-end" :class="m.proj != null && m.proj >= m.need ? 'text-success font-semibold' : ''">
                    {{ m.proj == null ? '—' : `${m.proj.toLocaleString()} lb` }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="text-xs text-muted">
              Estimated from your weights<template v-if="testPoints.length"> and {{ testPoints.length }} test {{ testPoints.length === 1 ? 'day' : 'days' }}</template>.
              Your DHI processing center's lactation record is the official one.
            </p>
          </template>
        </div>

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
