<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { shiftDate, useHerdDayTotals, useLactations } from '@/composables/useMilk'
import { useChartTheme } from '@/composables/useChartTheme'
import { todayISO } from '@/lib/dates'
import { goatName } from '@/lib/goats'
import { CONFIDENCE_LABELS, STANDARD_DAYS, summarizeLactation } from '@/lib/lactation'
import { formatWeight, lactationOn } from '@/lib/milk'
import HerdTrendChart from '@/components/charts/HerdTrendChart.vue'

const TREND_DAYS = 90
const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { goats } = useHerdGoats()
const lactations = useLactations()
const theme = useChartTheme()

const active = computed(() =>
  (goats.data.value ?? [])
    .map((g) => ({ goat: g, lactation: lactationOn(lactations.data.value ?? [], g.id, today) }))
    .filter((x) => !!x.lactation),
)

// Enough history for the trend and for every current lactation's curve.
const since = computed(() =>
  [shiftDate(today, -(TREND_DAYS + 7)), ...active.value.map((x) => x.lactation!.freshened_on)].sort()[0]!,
)
const totals = useHerdDayTotals(since)

const herdByDate = computed(() => {
  const map = new Map<string, number>()
  for (const r of totals.data.value ?? []) map.set(r.milked_on!, (map.get(r.milked_on!) ?? 0) + (r.total_g ?? 0))
  return map
})

function averageOver(endDate: string, days: number): number | null {
  const values = Array.from({ length: days }, (_, i) => herdByDate.value.get(shiftDate(endDate, -i))).filter(
    (v): v is number => v !== undefined,
  )
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
}

const trend = computed(() =>
  Array.from({ length: TREND_DAYS }, (_, i) => {
    const date = shiftDate(today, i - TREND_DAYS + 1)
    return { date, grams: herdByDate.value.get(date) ?? null, avgG: averageOver(date, 7) }
  }),
)

const thisWeek = computed(() => averageOver(today, 7))
const lastWeek = computed(() => averageOver(shiftDate(today, -7), 7))
const weekChange = computed(() =>
  thisWeek.value !== null && lastWeek.value ? (thisWeek.value - lastWeek.value) / lastWeek.value : null,
)

const producers = computed(() =>
  active.value
    .map(({ goat, lactation }) => {
      const summary = summarizeLactation(lactation!, totals.data.value ?? [], today)
      const recent = summary.points.filter((p) => p.dim > summary.currentDim - 7)
      return {
        goat,
        lactation: lactation!,
        summary,
        weekAvgG: recent.length ? recent.reduce((s, p) => s + p.grams, 0) / recent.length : null,
      }
    })
    .sort((a, b) => (b.weekAvgG ?? -1) - (a.weekAvgG ?? -1)),
)
const maxWeekAvg = computed(() => Math.max(1, ...producers.value.map((p) => p.weekAvgG ?? 0)))
const herdProjected = computed(() => producers.value.reduce((s, p) => s + (p.summary.projected305G ?? 0), 0))
const projectedCount = computed(() => producers.value.filter((p) => p.summary.projected305G !== null).length)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UButton to="/milk" color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back to milk entry" />
      <h1 class="text-2xl font-semibold">Production</h1>
    </div>

    <div v-if="totals.isPending.value || lactations.isPending.value" class="space-y-3">
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Today</p>
          <p class="text-2xl font-semibold">{{ formatWeight(herdByDate.get(today) ?? 0, unit, true) }}</p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Average day, last 7</p>
          <p class="text-2xl font-semibold">{{ thisWeek === null ? '—' : formatWeight(thisWeek, unit, true) }}</p>
          <p v-if="weekChange !== null" class="text-xs" :class="weekChange >= 0 ? 'text-success' : 'text-muted'">
            {{ weekChange >= 0 ? '▲' : '▼' }} {{ Math.abs(Math.round(weekChange * 100)) }}% vs the week before
          </p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Does in milk</p>
          <p class="text-2xl font-semibold">{{ active.length }}</p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Projected 305-day, herd</p>
          <p class="text-2xl font-semibold">{{ projectedCount ? formatWeight(herdProjected, unit, true) : '—' }}</p>
          <p v-if="projectedCount < active.length" class="text-xs text-muted">
            {{ projectedCount }} of {{ active.length }} does have enough data
          </p>
        </UCard>
      </div>

      <UCard>
        <template #header><h2 class="font-semibold">Herd milk per day, last {{ TREND_DAYS }} days</h2></template>
        <HerdTrendChart :days="trend" :unit="unit" />
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">Does in milk</h2>
          <p class="text-sm text-muted">Ranked by average day over the last week.</p>
        </template>
        <p v-if="!producers.length" class="p-4 text-muted">No does in milk.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-muted text-xs">
                <th class="px-3 py-2 text-start font-normal">Doe</th>
                <th class="px-3 py-2 text-end font-normal">DIM</th>
                <th class="px-3 py-2 text-start font-normal min-w-40">Last 7 days ({{ unit }}/day)</th>
                <th class="px-3 py-2 text-end font-normal">So far</th>
                <th class="px-3 py-2 text-end font-normal">305-day</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in producers" :key="p.goat.id" class="border-t border-default">
                <td class="px-3 py-2">
                  <RouterLink :to="`/goats/${p.goat.id}`" class="font-medium hover:underline">
                    {{ p.goat.barn_name || goatName(p.goat) }}
                  </RouterLink>
                  <span class="block text-xs text-muted">Lactation {{ p.lactation.lactation_number }}</span>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">{{ p.summary.currentDim }}</td>
                <td class="px-3 py-2">
                  <div v-if="p.weekAvgG !== null" class="flex items-center gap-2">
                    <span class="flex-1 h-2 rounded-full bg-elevated overflow-hidden" aria-hidden="true">
                      <span
                        class="block h-full rounded-full"
                        :style="{ width: `${(p.weekAvgG / maxWeekAvg) * 100}%`, background: theme.sequential }"
                      />
                    </span>
                    <span class="w-10 text-end tabular-nums">{{ formatWeight(p.weekAvgG, unit) }}</span>
                  </div>
                  <span v-else class="text-muted">No weigh-ins</span>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">{{ formatWeight(p.summary.totalG, unit) }}</td>
                <td class="px-3 py-2 text-end tabular-nums">
                  <template v-if="p.summary.projected305G !== null">
                    {{ formatWeight(p.summary.projected305G, unit) }}
                    <span
                      v-if="p.summary.confidence && p.summary.currentDim < STANDARD_DAYS"
                      class="block text-xs text-muted"
                      >{{ CONFIDENCE_LABELS[p.summary.confidence].replace(' confidence', '') }}</span
                    >
                  </template>
                  <span v-else class="text-muted" :title="p.summary.projectionNote ?? ''">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
  </div>
</template>
