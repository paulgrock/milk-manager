<script setup lang="ts">
import '@/lib/echarts'
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption, SeriesOption } from 'echarts'
import { useChartTheme } from '@/composables/useChartTheme'
import { STANDARD_DAYS, woodAt, type LactationSummary } from '@/lib/lactation'
import { formatWeight, fromGrams, type WeightUnit } from '@/lib/milk'

export interface CurveSeries {
  id: string
  label: string
  summary: LactationSummary
  /** Draw the fitted curve forward from today to day 305. */
  showProjection: boolean
}

const props = defineProps<{ series: CurveSeries[]; unit: WeightUnit }>()
const theme = useChartTheme()

const toUnit = (g: number) => Math.round(fromGrams(g, props.unit) * 100) / 100
const maxDim = computed(() =>
  Math.max(STANDARD_DAYS, ...props.series.flatMap((s) => s.summary.points.map((p) => p.dim))),
)

function projectionPoints(s: CurveSeries): [number, number][] {
  const fit = s.summary.fit
  if (!s.showProjection || !fit || s.summary.currentDim >= STANDARD_DAYS) return []
  const out: [number, number][] = []
  for (let dim = Math.max(1, s.summary.currentDim); dim <= STANDARD_DAYS; dim += 2) out.push([dim, toUnit(woodAt(fit, dim))])
  return out
}

// What the tooltip shows at a day in milk, for each lactation.
function valuesAt(dim: number) {
  return props.series.map((s, i) => {
    const raw = s.summary.points.find((p) => p.dim === dim)
    const smooth = s.summary.smoothed.find((p) => p.dim === dim)
    const projected = s.showProjection && s.summary.fit && dim > s.summary.currentDim ? woodAt(s.summary.fit, dim) : undefined
    return { label: s.label, color: theme.value.series[i]!, raw: raw?.grams, smooth: smooth?.grams, projected }
  })
}

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const series: SeriesOption[] = props.series.flatMap((s, i): SeriesOption[] => {
    const color = t.series[i]!
    return [
      {
        name: s.label,
        type: 'scatter',
        data: s.summary.points.map((p) => [p.dim, toUnit(p.grams)]),
        symbolSize: 5,
        itemStyle: { color, opacity: i === 0 ? 0.35 : 0.2 },
        emphasis: { disabled: true },
        silent: true,
        z: 1,
      },
      {
        name: s.label,
        type: 'line',
        data: s.summary.smoothed.map((p) => [p.dim, toUnit(p.grams)]),
        showSymbol: false,
        smooth: 0.3,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        emphasis: { disabled: true },
        z: 3,
      },
      {
        name: s.label,
        type: 'line',
        data: projectionPoints(s),
        showSymbol: false,
        lineStyle: { width: 2, color, type: [6, 4] },
        itemStyle: { color },
        emphasis: { disabled: true },
        z: 2,
      },
    ]
  })

  return {
    animation: false,
    grid: { left: 8, right: 16, top: props.series.length > 1 ? 36 : 16, bottom: 28, containLabel: true },
    legend:
      props.series.length > 1
        ? {
            top: 0,
            left: 0,
            data: props.series.map((s, i) => ({ name: s.label, itemStyle: { color: t.series[i] } })),
            icon: 'roundRect',
            itemWidth: 12,
            itemHeight: 4,
            textStyle: { color: t.textSecondary },
          }
        : undefined,
    xAxis: {
      type: 'value',
      min: 0,
      max: maxDim.value,
      interval: 50,
      name: 'Days in milk',
      nameLocation: 'middle',
      nameGap: 26,
      nameTextStyle: { color: t.muted },
      axisLabel: { color: t.muted },
      axisLine: { lineStyle: { color: t.axis } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: t.muted, formatter: (v: number) => `${v} ${props.unit}` },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: t.grid } },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: t.axis } },
      backgroundColor: t.surface,
      borderColor: t.grid,
      textStyle: { color: t.textPrimary },
      formatter: (params) => {
        const first = Array.isArray(params) ? params[0] : params
        const dim = Math.round(Number((first as { axisValue?: number }).axisValue ?? 0))
        const rows = valuesAt(dim)
          .map((v) => {
            const parts = [
              v.raw !== undefined ? `<b>${formatWeight(v.raw, props.unit, true)}</b> weighed` : '',
              v.smooth !== undefined ? `${formatWeight(v.smooth, props.unit)} 7-day avg` : '',
              v.projected !== undefined ? `${formatWeight(v.projected, props.unit, true)} projected` : '',
            ].filter(Boolean)
            if (!parts.length) return ''
            return `<div style="display:flex;gap:6px;align-items:baseline"><span style="display:inline-block;width:10px;height:4px;border-radius:2px;background:${v.color}"></span><span style="color:${t.textSecondary}">${v.label}</span></div><div style="margin:0 0 4px 16px">${parts.join(' · ')}</div>`
          })
          .join('')
        return `<div style="font-size:12px"><div style="color:${t.muted};margin-bottom:4px">Day ${dim} in milk</div>${rows || `<span style="color:${t.muted}">No weigh-in</span>`}</div>`
      },
    },
    series,
  }
})

// Table view: weekly averages, so the numbers are readable without the chart.
const showTable = ref(false)
const tableRows = computed(() => {
  const weeks = Math.ceil(maxDim.value / 7)
  return Array.from({ length: weeks }, (_, w) => {
    const from = w * 7
    const to = from + 6
    const cells = props.series.map((s) => {
      const inWeek = s.summary.points.filter((p) => p.dim >= from && p.dim <= to)
      if (inWeek.length) return formatWeight(inWeek.reduce((a, p) => a + p.grams, 0) / inWeek.length, props.unit)
      const fit = s.summary.fit
      if (s.showProjection && fit && from > s.summary.currentDim && from <= STANDARD_DAYS) {
        return `${formatWeight(woodAt(fit, from + 3), props.unit)}*`
      }
      return ''
    })
    return { label: `${from}–${to}`, cells }
  }).filter((r) => r.cells.some(Boolean))
})
</script>

<template>
  <div>
    <!-- vue-echarts sets its own element to height: 100%, so the wrapper sets the size. -->
    <div class="h-64 sm:h-80">
      <VChart
        :option="option"
        autoresize
        class="size-full"
        role="img"
        :aria-label="`Lactation curve: ${series.map((s) => s.label).join(', ')}`"
      />
    </div>
    <div class="flex items-center gap-3 mt-1 text-xs text-muted">
      <span class="inline-flex items-center gap-1"><span class="inline-block size-1.5 rounded-full bg-current opacity-50" /> daily weigh-in</span>
      <span class="inline-flex items-center gap-1"><span class="inline-block w-4 h-0.5 bg-current" /> 7-day average</span>
      <span class="inline-flex items-center gap-1"><span class="inline-block w-4 border-t-2 border-dashed border-current" /> projected</span>
      <UButton size="xs" variant="link" color="neutral" class="ms-auto" @click="showTable = !showTable">
        {{ showTable ? 'Hide table' : 'Show as table' }}
      </UButton>
    </div>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto rounded-md border border-default">
      <table class="w-full text-sm tabular-nums">
        <thead class="sticky top-0 bg-default">
          <tr class="text-muted text-start">
            <th class="px-2 py-1 text-start font-normal">Days in milk</th>
            <th v-for="s in series" :key="s.id" class="px-2 py-1 text-end font-normal">{{ s.label }} ({{ unit }}/day)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in tableRows" :key="r.label" class="border-t border-default">
            <td class="px-2 py-1">{{ r.label }}</td>
            <td v-for="(c, i) in r.cells" :key="i" class="px-2 py-1 text-end">{{ c }}</td>
          </tr>
        </tbody>
      </table>
      <p class="px-2 py-1 text-xs text-muted">* projected from the fitted curve</p>
    </div>
  </div>
</template>
