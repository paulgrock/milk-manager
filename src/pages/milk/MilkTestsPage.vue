<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useMilkTests } from '@/composables/useMilkTests'
import { formatDate } from '@/lib/dates'
import { SCC_LIMIT, TEST_KIND_LABELS, formatScc } from '@/lib/dhia'
import { formatWeight } from '@/lib/milk'

const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { query, data } = useMilkTests()

const rows = computed(() =>
  data.value.tests.map((test) => {
    const results = data.value.results.filter((r) => r.test_id === test.id)
    const avg = (key: 'milk_g' | 'butterfat_pct' | 'protein_pct' | 'scc') => {
      const values = results.map((r) => r[key]).filter((v): v is number => v !== null).map(Number)
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
    }
    return { test, count: results.length, milk: avg('milk_g'), fat: avg('butterfat_pct'), protein: avg('protein_pct'), scc: avg('scc') }
  }),
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <UButton to="/milk" color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back to milk entry" />
      <h1 class="text-2xl font-semibold flex-1">Milk tests</h1>
      <UButton to="/milk/tests/new" icon="i-lucide-plus">Add test day</UButton>
    </div>
    <p class="text-sm text-muted">DHIR test days, ADGA one-day tests and your own samples: weights, butterfat, protein and somatic cell count.</p>

    <div v-if="query.isPending.value" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-12 w-full" /></div>
    <UCard v-else-if="!rows.length" class="text-center">
      <p class="text-muted mb-3">No milk tests yet.</p>
      <UButton to="/milk/tests/new" icon="i-lucide-plus">Add test day</UButton>
    </UCard>
    <div v-else class="overflow-x-auto rounded-lg border border-default">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs text-muted">
            <th class="px-3 py-2 text-start font-normal">Date</th>
            <th class="px-3 py-2 text-start font-normal">Kind</th>
            <th class="px-3 py-2 text-end font-normal">Does</th>
            <th class="px-3 py-2 text-end font-normal">Avg milk</th>
            <th class="px-3 py-2 text-end font-normal">Avg fat</th>
            <th class="px-3 py-2 text-end font-normal">Avg protein</th>
            <th class="px-3 py-2 text-end font-normal">Avg SCC</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.test.id" class="border-t border-default hover:bg-elevated/50">
            <td class="px-3 py-2">
              <RouterLink :to="`/milk/tests/${r.test.id}`" class="font-medium hover:underline">{{ formatDate(r.test.tested_on) }}</RouterLink>
            </td>
            <td class="px-3 py-2">{{ TEST_KIND_LABELS[r.test.kind] }}<span v-if="r.test.lab" class="text-muted"> · {{ r.test.lab }}</span></td>
            <td class="px-3 py-2 text-end tabular-nums">{{ r.count }}</td>
            <td class="px-3 py-2 text-end tabular-nums">{{ r.milk === null ? '—' : formatWeight(r.milk, unit, true) }}</td>
            <td class="px-3 py-2 text-end tabular-nums">{{ r.fat === null ? '—' : `${r.fat.toFixed(1)}%` }}</td>
            <td class="px-3 py-2 text-end tabular-nums">{{ r.protein === null ? '—' : `${r.protein.toFixed(1)}%` }}</td>
            <td class="px-3 py-2 text-end tabular-nums" :class="r.scc !== null && r.scc >= SCC_LIMIT ? 'text-warning' : ''">
              {{ r.scc === null ? '—' : formatScc(r.scc) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
