<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useLactations } from '@/composables/useMilk'
import { useMilkTests } from '@/composables/useMilkTests'
import { formatDate } from '@/lib/dates'
import { SCC_LIMIT, TEST_KIND_LABELS, componentGrams, formatScc, isMiniature, oneDayPoints } from '@/lib/dhia'
import type { Goat } from '@/lib/goats'
import { daysInMilk, formatWeight, lactationOn } from '@/lib/milk'

const props = defineProps<{ goat: Goat }>()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { data } = useMilkTests()
const lactations = useLactations()

const rows = computed(() => {
  const tests = new Map(data.value.tests.map((t) => [t.id, t]))
  return data.value.results
    .filter((r) => r.goat_id === props.goat.id && tests.has(r.test_id))
    .map((r) => {
      const test = tests.get(r.test_id)!
      const lactation = lactationOn(lactations.data.value ?? [], props.goat.id, test.tested_on)
      const dim = lactation ? daysInMilk(lactation.freshened_on, test.tested_on) : null
      const points =
        test.kind === 'one_day' && r.milk_g !== null && r.butterfat_pct !== null && dim !== null
          ? oneDayPoints({ milkG: r.milk_g, butterfatPct: r.butterfat_pct, dim, miniature: isMiniature(props.goat.breed) })
          : null
      return {
        r,
        test,
        dim,
        fatG: componentGrams(r.milk_g, r.butterfat_pct),
        proteinG: componentGrams(r.milk_g, r.protein_pct),
        points,
      }
    })
    .sort((a, b) => b.test.tested_on.localeCompare(a.test.tested_on))
})
</script>

<template>
  <UCard v-if="rows.length" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header><h2 class="font-semibold">Milk tests</h2></template>
    <div class="overflow-x-auto">
      <table class="w-full text-sm tabular-nums">
        <thead>
          <tr class="text-xs text-muted">
            <th class="px-3 py-2 text-start font-normal">Date</th>
            <th class="px-2 py-2 text-end font-normal">DIM</th>
            <th class="px-2 py-2 text-end font-normal">Milk</th>
            <th class="px-2 py-2 text-end font-normal">Fat</th>
            <th class="px-2 py-2 text-end font-normal">Protein</th>
            <th class="px-3 py-2 text-end font-normal">SCC</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in rows" :key="row.r.id">
            <tr class="border-t border-default">
              <td class="px-3 py-2">
                <RouterLink :to="`/milk/tests/${row.test.id}`" class="hover:underline">{{ formatDate(row.test.tested_on) }}</RouterLink>
                <span class="block text-xs text-muted">{{ TEST_KIND_LABELS[row.test.kind] }}</span>
              </td>
              <td class="px-2 py-2 text-end">{{ row.dim ?? '—' }}</td>
              <td class="px-2 py-2 text-end">{{ row.r.milk_g === null ? '—' : formatWeight(row.r.milk_g, unit, true) }}</td>
              <td class="px-2 py-2 text-end">
                <template v-if="row.r.butterfat_pct !== null">
                  {{ Number(row.r.butterfat_pct) }}%
                  <span v-if="row.fatG !== null" class="block text-xs text-muted">{{ formatWeight(row.fatG, unit, true) }}</span>
                </template>
                <template v-else>—</template>
              </td>
              <td class="px-2 py-2 text-end">
                <template v-if="row.r.protein_pct !== null">
                  {{ Number(row.r.protein_pct) }}%
                  <span v-if="row.proteinG !== null" class="block text-xs text-muted">{{ formatWeight(row.proteinG, unit, true) }}</span>
                </template>
                <template v-else>—</template>
              </td>
              <td class="px-3 py-2 text-end" :class="row.r.scc !== null && row.r.scc >= SCC_LIMIT ? 'text-warning font-semibold' : ''">
                {{ row.r.scc === null ? '—' : formatScc(row.r.scc) }}
                <UIcon v-if="row.r.scc !== null && row.r.scc >= SCC_LIMIT" name="i-lucide-triangle-alert" class="align-middle" aria-label="Over 1.5 million, the Grade A limit" />
              </td>
            </tr>
            <tr v-if="row.points">
              <td colspan="6" class="px-3 pb-2 text-xs">
                <UBadge :color="row.points.earned ? 'success' : 'neutral'" variant="subtle" size="sm" :icon="row.points.earned ? 'i-lucide-star' : undefined">
                  {{ row.points.total }} of {{ row.points.needed }} points{{ row.points.earned ? ' · *M' : '' }}
                </UBadge>
                <span class="text-muted ms-2">
                  milk {{ row.points.milk }} + butterfat {{ row.points.butterfat }} + days in milk {{ row.points.daysInMilk }}
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
