import { computed, ref } from 'vue'
import { useMutationObserver } from '@vueuse/core'

// The validated chart palette (dataviz reference palette). Only the first
// three categorical slots are used: they pass colorblind checks as a set in
// both modes. Light slot 3 is under 3:1 contrast, so charts using it always
// ship a legend and visible numbers.
const LIGHT = {
  surface: '#fcfcfb',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  series: ['#2a78d6', '#eb6834', '#1baf7a'],
  sequential: '#2a78d6',
}
const DARK = {
  surface: '#1a1a19',
  textPrimary: '#f0efec',
  textSecondary: '#c3c2b7',
  muted: '#898781',
  grid: '#2c2c2a',
  axis: '#383835',
  series: ['#3987e5', '#d95926', '#199e70'],
  sequential: '#3987e5',
}

export type ChartColors = typeof LIGHT

/** Chart colors for the current light/dark mode (Nuxt UI toggles the `dark` class on <html>). */
export function useChartTheme() {
  const isDark = ref(document.documentElement.classList.contains('dark'))
  useMutationObserver(
    document.documentElement,
    () => (isDark.value = document.documentElement.classList.contains('dark')),
    { attributes: true, attributeFilter: ['class'] },
  )
  return computed<ChartColors>(() => (isDark.value ? DARK : LIGHT))
}

export const MAX_SERIES = LIGHT.series.length
