<script setup lang="ts">
import '@/lib/echarts'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { useChartTheme } from '@/composables/useChartTheme'
import { formatDate } from '@/lib/dates'
import { formatWeight, fromGrams, type WeightUnit } from '@/lib/milk'

/** One point per day, oldest first. `grams` is null for days with nothing recorded. */
const props = defineProps<{ days: { date: string; grams: number | null; avgG: number | null }[]; unit: WeightUnit }>()
const theme = useChartTheme()
const toUnit = (g: number | null) => (g === null ? null : Math.round(fromGrams(g, props.unit) * 100) / 100)

const option = computed<EChartsOption>(() => {
  const t = theme.value
  const color = t.series[0]!
  return {
    animation: false,
    grid: { left: 8, right: 16, top: 36, bottom: 8, containLabel: true },
    legend: {
      top: 0,
      left: 0,
      data: ['Day total', '7-day average'],
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
      textStyle: { color: t.textSecondary },
    },
    xAxis: {
      type: 'category',
      data: props.days.map((d) => d.date),
      axisLabel: { color: t.muted, formatter: (v: string) => formatDate(v).replace(/,? \d{4}$/, ''), hideOverlap: true },
      axisLine: { lineStyle: { color: t.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: t.muted, formatter: (v: number) => `${v} ${props.unit}` },
      splitLine: { lineStyle: { color: t.grid } },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: t.axis } },
      backgroundColor: t.surface,
      borderColor: t.grid,
      textStyle: { color: t.textPrimary },
      formatter: (params) => {
        const i = (Array.isArray(params) ? params[0] : params)?.dataIndex ?? 0
        const d = props.days[i]!
        return `<div style="font-size:12px"><div style="color:${t.muted}">${formatDate(d.date)}</div>
          <div><b>${d.grams === null ? '—' : formatWeight(d.grams, props.unit, true)}</b> <span style="color:${t.textSecondary}">day total</span></div>
          <div>${d.avgG === null ? '—' : formatWeight(d.avgG, props.unit, true)} <span style="color:${t.textSecondary}">7-day average</span></div></div>`
      },
    },
    series: [
      {
        name: 'Day total',
        type: 'line',
        data: props.days.map((d) => toUnit(d.grams)),
        showSymbol: false,
        connectNulls: false,
        lineStyle: { width: 1, color, opacity: 0.45 },
        itemStyle: { color, opacity: 0.45 },
        emphasis: { disabled: true },
      },
      {
        name: '7-day average',
        type: 'line',
        data: props.days.map((d) => toUnit(d.avgG)),
        showSymbol: false,
        smooth: 0.3,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        emphasis: { disabled: true },
      },
    ],
  }
})
</script>

<template>
  <!-- vue-echarts sets its own element to height: 100%, so the wrapper sets the size. -->
  <div class="h-56 sm:h-72">
    <VChart :option="option" autoresize class="size-full" role="img" aria-label="Herd milk per day, last 90 days" />
  </div>
</template>
