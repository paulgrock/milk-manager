<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGoatDayTotals, useLactations } from '@/composables/useMilk'
import { useHerd } from '@/composables/useHerd'
import { formatDate, todayISO } from '@/lib/dates'
import type { Goat } from '@/lib/goats'
import { formatWeight, type Lactation } from '@/lib/milk'
import { STANDARD_DAYS, summarizeLactation } from '@/lib/lactation'
import LactationModal from './LactationModal.vue'
import { useMilkTests } from '@/composables/useMilkTests'
import { officialFigures, withTestDays } from '@/lib/dhia'

const props = defineProps<{ goat: Goat }>()

const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const lactations = useLactations()
const dayTotals = useGoatDayTotals(() => props.goat.id)
const milkTests = useMilkTests()
const today = todayISO()

const rows = computed(() =>
  (lactations.data.value ?? [])
    .filter((l) => l.goat_id === props.goat.id)
    .map((l) => ({
      lactation: l,
      inMilk: !l.dried_off_on || l.dried_off_on >= today,
      summary: summarizeLactation(
        l,
        withTestDays(dayTotals.data.value ?? [], props.goat.id, milkTests.data.value.tests, milkTests.data.value.results),
        today,
        officialFigures(l, milkTests.data.value.tests, milkTests.data.value.results),
      ),
    })),
)
const current = computed(() => rows.value.find((r) => r.inMilk)?.lactation)

const modal = ref<{ open: boolean; mode: 'start' | 'edit' | 'dryOff'; lactation?: Lactation }>({ open: false, mode: 'start' })
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="font-semibold flex-1">Lactations</h2>
        <UButton
          v-if="current"
          size="sm"
          variant="soft"
          color="neutral"
          icon="i-lucide-moon"
          @click="modal = { open: true, mode: 'dryOff', lactation: current }"
        >
          Dry off
        </UButton>
        <UButton v-else size="sm" variant="soft" icon="i-lucide-plus" @click="modal = { open: true, mode: 'start' }">
          Freshened
        </UButton>
      </div>
    </template>

    <p v-if="!rows.length" class="text-muted">No lactations recorded.</p>
    <ul v-else class="divide-y divide-default -my-2">
      <li v-for="r in rows" :key="r.lactation.id">
        <button
          type="button"
          class="w-full py-2 flex items-center gap-3 text-start hover:bg-elevated/50 rounded"
          @click="modal = { open: true, mode: 'edit', lactation: r.lactation }"
        >
          <span class="font-semibold w-8">#{{ r.lactation.lactation_number }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm">
              {{ formatDate(r.lactation.freshened_on) }} –
              {{ r.inMilk ? 'in milk' : formatDate(r.lactation.dried_off_on) }}
            </span>
            <span class="block text-xs text-muted">
              {{ r.inMilk ? `DIM ${r.summary.currentDim}` : `${r.summary.currentDim} days` }}
              <template v-if="r.summary.daysRecorded">
                · {{ r.summary.daysRecorded }} {{ r.summary.daysRecorded === 1 ? 'day' : 'days' }} weighed
              </template>
            </span>
          </span>
          <span class="text-end">
            <span class="block font-medium tabular-nums">{{ formatWeight(r.summary.totalG, unit, true) }}</span>
            <span v-if="r.summary.projected305G !== null" class="block text-xs text-muted tabular-nums">
              {{ r.inMilk && r.summary.currentDim < STANDARD_DAYS ? 'proj.' : '' }} 305d {{ formatWeight(r.summary.projected305G, unit) }}
            </span>
          </span>
        </button>
      </li>
    </ul>

    <LactationModal
      v-model:open="modal.open"
      :mode="modal.mode"
      :lactation="modal.lactation"
      :goat-id="goat.id"
    />
  </UCard>
</template>
