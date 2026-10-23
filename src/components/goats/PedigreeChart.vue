<script setup lang="ts">
import { computed } from 'vue'
import { appraisalSummary, buildPedigree, goatFullName, type Appraisal, type Goat, type PedigreeNode } from '@/lib/goats'

const props = defineProps<{ goat: Goat; byId: Map<string, Goat>; latest: Map<string, Appraisal> }>()

const tree = computed(() => buildPedigree(props.goat, props.byId, 2))

// Rows in the order Bird's Eye-style pedigrees read: S, SS, SD, D, DS, DD.
const cells = computed(() => {
  const t = tree.value
  // Parents span two grid rows, each grandparent takes one.
  const cell = (label: string, node: PedigreeNode | null, generation: 1 | 2, row: number) => ({
    label,
    goat: node?.goat ?? null,
    generation,
    gridRow: generation === 1 ? `${row} / span 2` : `${row}`,
  })
  return [
    cell('Sire', t.sire, 1, 1),
    cell('SS', t.sire?.sire ?? null, 2, 1),
    cell('SD', t.sire?.dam ?? null, 2, 2),
    cell('Dam', t.dam, 1, 3),
    cell('DS', t.dam?.sire ?? null, 2, 3),
    cell('DD', t.dam?.dam ?? null, 2, 4),
  ]
})
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2">
    <template v-for="c in cells" :key="c.label">
      <div
        :class="[
          'rounded-md border border-default p-2 min-w-0 flex flex-col justify-center',
          c.generation === 1 ? 'col-start-1 bg-elevated/40' : 'col-start-2',
        ]"
        :style="{ gridRow: c.gridRow }"
      >
        <p class="text-xs text-muted">{{ c.label }}</p>
        <template v-if="c.goat">
          <RouterLink :to="`/goats/${c.goat.slug}`" class="font-medium hover:underline break-words">
            {{ goatFullName(c.goat) }}
          </RouterLink>
          <p v-if="latest.get(c.goat.id)" class="text-xs text-muted">{{ appraisalSummary(latest.get(c.goat.id)!) }}</p>
        </template>
        <p v-else class="text-muted italic">Unknown</p>
      </div>
    </template>
  </div>
</template>
