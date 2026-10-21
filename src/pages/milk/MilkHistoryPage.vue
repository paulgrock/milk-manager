<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { shiftDate, useHerdDayTotals } from '@/composables/useMilk'
import { formatDate, todayISO } from '@/lib/dates'
import { goatName } from '@/lib/goats'
import { formatWeight } from '@/lib/milk'

const { herd } = useHerd()
const { byId } = useHerdGoats()
const totals = useHerdDayTotals(shiftDate(todayISO(), -60))
const unit = computed(() => herd.value?.weight_unit ?? 'lb')

const DAYS = 30
const days = computed(() => {
  const rows = totals.data.value ?? []
  const today = todayISO()
  return Array.from({ length: DAYS }, (_, i) => {
    const date = shiftDate(today, -i)
    const dayRows = rows.filter((r) => r.milked_on === date)
    // Today's PM may just not have happened yet.
    const incomplete = date === today ? [] : dayRows.filter((r) => !r.is_day_total && r.has_am !== r.has_pm)
    return {
      date,
      totalG: dayRows.reduce((s, r) => s + (r.total_g ?? 0), 0),
      does: dayRows.length,
      incomplete: incomplete.map((r) => {
        const g = byId.value.get(r.goat_id!)
        return g ? g.barn_name || goatName(g) : '?'
      }),
    }
  })
})
const maxG = computed(() => Math.max(1, ...days.value.map((d) => d.totalG)))

const week = computed(() => {
  const recent = days.value.slice(0, 7).filter((d) => d.totalG > 0)
  return recent.length ? recent.reduce((s, d) => s + d.totalG, 0) / recent.length : 0
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UButton to="/milk" color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back to milk entry" />
      <h1 class="text-2xl font-semibold">Milk history</h1>
    </div>

    <UCard>
      <p class="text-sm text-muted">Average day, last 7 days</p>
      <p class="text-2xl font-semibold tabular-nums">{{ formatWeight(Math.round(week), unit, true) }}</p>
    </UCard>

    <div v-if="totals.isPending.value" class="space-y-2">
      <USkeleton v-for="i in 6" :key="i" class="h-10 w-full" />
    </div>

    <ul v-else class="divide-y divide-default rounded-lg border border-default">
      <li v-for="d in days" :key="d.date">
        <RouterLink :to="{ path: '/milk', query: { date: d.date } }" class="flex items-center gap-3 px-3 py-2 hover:bg-elevated/50">
          <span class="w-28 shrink-0 text-sm">{{ formatDate(d.date) }}</span>
          <span class="flex-1 h-2 rounded bg-elevated overflow-hidden" aria-hidden="true">
            <span class="block h-full bg-primary rounded" :style="{ width: `${(d.totalG / maxG) * 100}%` }" />
          </span>
          <span class="w-20 text-end tabular-nums font-medium">{{ d.totalG ? formatWeight(d.totalG, unit) : '—' }}</span>
          <span class="w-14 text-end text-xs text-muted">{{ d.does ? `${d.does} ${d.does === 1 ? 'doe' : 'does'}` : '' }}</span>
        </RouterLink>
        <p v-if="d.incomplete.length" class="px-3 pb-2 -mt-1 text-xs text-warning">
          Missing a milking: {{ d.incomplete.join(', ') }}
        </p>
      </li>
    </ul>
  </div>
</template>
