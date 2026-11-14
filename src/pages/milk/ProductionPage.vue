<script setup lang="ts">
import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useHerd } from "@/composables/useHerd";
import { useHerdGoats } from "@/composables/useGoats";
import {
  shiftDate,
  useHerdDayTotals,
  useLactations,
} from "@/composables/useMilk";
import { useChartTheme } from "@/composables/useChartTheme";
import { addMonths, parseDate, todayISO } from "@/lib/dates";
import { goatName, inHerdOn } from "@/lib/goats";
import {
  CONFIDENCE_LABELS,
  STANDARD_DAYS,
  summarizeLactation,
} from "@/lib/lactation";
import { formatWeight, lactationOn } from "@/lib/milk";
import HerdTrendChart from "@/components/charts/HerdTrendChart.vue";
import { useMilkTests } from "@/composables/useMilkTests";
import { officialFigures, withTestDays } from "@/lib/dhia";

type RangeUnit = "days" | "weeks" | "months";
const RANGE_UNITS: { label: string; value: RangeUnit }[] = [
  { label: "days", value: "days" },
  { label: "weeks", value: "weeks" },
  { label: "months", value: "months" },
];
const RANGE_PRESETS: { label: string; amount: number; unit: RangeUnit }[] = [
  { label: "30d", amount: 30, unit: "days" },
  { label: "90d", amount: 90, unit: "days" },
  { label: "6mo", amount: 6, unit: "months" },
  { label: "305d", amount: 305, unit: "days" },
  { label: "1yr", amount: 12, unit: "months" },
];
// Ten years is plenty, and keeps a typo from loading the whole database.
const MAX_TREND_DAYS = 3650;

const today = todayISO();
// Kept per device, like other view preferences.
const range = useLocalStorage<{ amount: number; unit: RangeUnit }>(
  "production-trend-range",
  { amount: 90, unit: "days" },
);
const rangeAmount = computed({
  get: () => range.value.amount,
  set: (v) =>
    (range.value = { ...range.value, amount: Math.max(1, Math.round(v || 1)) }),
});
const rangeUnit = computed({
  get: () => range.value.unit,
  set: (v) => (range.value = { ...range.value, unit: v }),
});

/** Days in the chart window, today included. Months count back by the calendar. */
const trendDays = computed(() => {
  const { amount, unit } = range.value;
  const days =
    unit === "months"
      ? Math.round(
          (parseDate(today).getTime() -
            parseDate(addMonths(today, -amount)).getTime()) /
            86_400_000,
        )
      : amount * (unit === "weeks" ? 7 : 1);
  return Math.min(MAX_TREND_DAYS, Math.max(1, days));
});
const rangeLabel = computed(() => {
  const { amount, unit } = range.value;
  return `last ${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
});
const isPreset = (p: (typeof RANGE_PRESETS)[number]) =>
  p.amount === range.value.amount && p.unit === range.value.unit;
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? "lb");
const { goats } = useHerdGoats();
const lactations = useLactations();
const theme = useChartTheme();
const milkTests = useMilkTests();

const active = computed(() =>
  (goats.data.value ?? [])
    .filter((g) => inHerdOn(g, today))
    .map((g) => ({
      goat: g,
      lactation: lactationOn(lactations.data.value ?? [], g.id, today),
    }))
    .filter((x) => !!x.lactation),
);

// Enough history for the trend and for every current lactation's curve.
const since = computed(
  () =>
    [
      shiftDate(today, -(trendDays.value + 7)),
      ...active.value.map((x) => x.lactation!.freshened_on),
    ].sort()[0]!,
);
const totals = useHerdDayTotals(since);

const herdByDate = computed(() => {
  const map = new Map<string, number>();
  for (const r of totals.data.value ?? [])
    map.set(r.milked_on!, (map.get(r.milked_on!) ?? 0) + (r.total_g ?? 0));
  return map;
});

function averageOver(endDate: string, days: number): number | null {
  const values = Array.from({ length: days }, (_, i) =>
    herdByDate.value.get(shiftDate(endDate, -i)),
  ).filter((v): v is number => v !== undefined);
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;
}

const trend = computed(() =>
  Array.from({ length: trendDays.value }, (_, i) => {
    const date = shiftDate(today, i - trendDays.value + 1);
    return {
      date,
      grams: herdByDate.value.get(date) ?? null,
      avgG: averageOver(date, 7),
    };
  }),
);

const thisWeek = computed(() => averageOver(today, 7));
const lastWeek = computed(() => averageOver(shiftDate(today, -7), 7));
const weekChange = computed(() =>
  thisWeek.value !== null && lastWeek.value
    ? (thisWeek.value - lastWeek.value) / lastWeek.value
    : null,
);

const producers = computed(() =>
  active.value
    .map(({ goat, lactation }) => {
      const summary = summarizeLactation(
        lactation!,
        withTestDays(
          totals.data.value ?? [],
          goat.id,
          milkTests.data.value.tests,
          milkTests.data.value.results,
        ),
        today,
        officialFigures(
          lactation!,
          milkTests.data.value.tests,
          milkTests.data.value.results,
        ),
      );
      const recent = summary.points.filter(
        (p) => p.dim > summary.currentDim - 7,
      );
      return {
        goat,
        lactation: lactation!,
        summary,
        weekAvgG: recent.length
          ? recent.reduce((s, p) => s + p.grams, 0) / recent.length
          : null,
      };
    })
    .sort((a, b) => (b.weekAvgG ?? -1) - (a.weekAvgG ?? -1)),
);
const maxWeekAvg = computed(() =>
  Math.max(1, ...producers.value.map((p) => p.weekAvgG ?? 0)),
);
const herdProjected = computed(() =>
  producers.value.reduce((s, p) => s + (p.summary.projected305G ?? 0), 0),
);
const projectedCount = computed(
  () => producers.value.filter((p) => p.summary.projected305G !== null).length,
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UButton
        to="/milk"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        aria-label="Back to milk entry"
      />
      <h1 class="text-2xl font-semibold">Production</h1>
    </div>

    <div
      v-if="totals.isPending.value || lactations.isPending.value"
      class="space-y-3"
    >
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Today</p>
          <p class="text-2xl font-semibold">
            {{ formatWeight(herdByDate.get(today) ?? 0, unit, true) }}
          </p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Average day, last 7</p>
          <p class="text-2xl font-semibold">
            {{ thisWeek === null ? "—" : formatWeight(thisWeek, unit, true) }}
          </p>
          <p
            v-if="weekChange !== null"
            class="text-xs"
            :class="weekChange >= 0 ? 'text-success' : 'text-muted'"
          >
            {{ weekChange >= 0 ? "▲" : "▼" }}
            {{ Math.abs(Math.round(weekChange * 100)) }}% vs the week before
          </p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Does in milk</p>
          <p class="text-2xl font-semibold">{{ active.length }}</p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Projected 305-day, herd</p>
          <p class="text-2xl font-semibold">
            {{ projectedCount ? formatWeight(herdProjected, unit, true) : "—" }}
          </p>
          <p v-if="projectedCount < active.length" class="text-xs text-muted">
            {{ projectedCount }} of {{ active.length }} does have enough data
          </p>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">
              Herd milk per day, {{ rangeLabel }}
              <UIcon
                v-if="totals.isPlaceholderData.value"
                name="i-lucide-loader-circle"
                class="size-4 animate-spin align-middle text-muted"
              />
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <UFieldGroup size="sm">
                <UButton
                  v-for="p in RANGE_PRESETS"
                  :key="p.label"
                  :label="p.label"
                  color="neutral"
                  :variant="isPreset(p) ? 'solid' : 'outline'"
                  @click="range = { amount: p.amount, unit: p.unit }"
                />
              </UFieldGroup>
              <UFieldGroup size="sm">
                <UInputNumber
                  v-model="rangeAmount"
                  :min="1"
                  :max="3650"
                  :format-options="{ useGrouping: false }"
                  class="w-24"
                  aria-label="Timeframe length"
                />
                <USelect
                  v-model="rangeUnit"
                  :items="RANGE_UNITS"
                  class="w-24"
                  aria-label="Timeframe unit"
                />
              </UFieldGroup>
            </div>
          </div>
          <p
            v-if="trendDays === MAX_TREND_DAYS"
            class="text-xs text-muted mt-1"
          >
            Showing the most recent 10 years.
          </p>
        </template>
        <HerdTrendChart :days="trend" :unit="unit" :range-label="rangeLabel" />
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">Does in milk</h2>
          <p class="text-sm text-muted">
            Ranked by average day over the last week.
          </p>
        </template>
        <p v-if="!producers.length" class="p-4 text-muted">No does in milk.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-muted text-xs">
                <th class="px-3 py-2 text-start font-normal">Doe</th>
                <th class="px-3 py-2 text-end font-normal">DIM</th>
                <th class="px-3 py-2 text-start font-normal min-w-40">
                  Last 7 days ({{ unit }}/day)
                </th>
                <th class="px-3 py-2 text-end font-normal">So far</th>
                <th class="px-3 py-2 text-end font-normal">305-day</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in producers"
                :key="p.goat.id"
                class="border-t border-default"
              >
                <td class="px-3 py-2">
                  <RouterLink
                    :to="`/goats/${p.goat.slug}`"
                    class="font-medium hover:underline"
                  >
                    {{ p.goat.barn_name || goatName(p.goat) }}
                  </RouterLink>
                  <span class="block text-xs text-muted"
                    >Lactation {{ p.lactation.lactation_number }}</span
                  >
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ p.summary.currentDim }}
                </td>
                <td class="px-3 py-2">
                  <div
                    v-if="p.weekAvgG !== null"
                    class="flex items-center gap-2"
                  >
                    <span
                      class="flex-1 h-2 rounded-full bg-elevated overflow-hidden"
                      aria-hidden="true"
                    >
                      <span
                        class="block h-full rounded-full"
                        :style="{
                          width: `${(p.weekAvgG / maxWeekAvg) * 100}%`,
                          background: theme.sequential,
                        }"
                      />
                    </span>
                    <span class="w-10 text-end tabular-nums">{{
                      formatWeight(p.weekAvgG, unit)
                    }}</span>
                  </div>
                  <span v-else class="text-muted">No weigh-ins</span>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ formatWeight(p.summary.totalG, unit) }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  <template v-if="p.summary.projected305G !== null">
                    {{ formatWeight(p.summary.projected305G, unit) }}
                    <span
                      v-if="
                        p.summary.confidence &&
                        p.summary.currentDim < STANDARD_DAYS
                      "
                      class="block text-xs text-muted"
                      >{{
                        CONFIDENCE_LABELS[p.summary.confidence].replace(
                          " confidence",
                          "",
                        )
                      }}</span
                    >
                  </template>
                  <span
                    v-else
                    class="text-muted"
                    :title="p.summary.projectionNote ?? ''"
                    >—</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
  </div>
</template>
