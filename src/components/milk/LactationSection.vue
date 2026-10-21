<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGoatDayTotals, useLactations } from '@/composables/useMilk'
import { useHerd } from '@/composables/useHerd'
import { formatDate, todayISO } from '@/lib/dates'
import type { Goat } from '@/lib/goats'
import { daysInMilk, formatWeight, type Lactation } from '@/lib/milk'
import LactationModal from './LactationModal.vue'

const props = defineProps<{ goat: Goat }>()

const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const lactations = useLactations()
const dayTotals = useGoatDayTotals(() => props.goat.id)
const today = todayISO()

const rows = computed(() =>
  (lactations.data.value ?? [])
    .filter((l) => l.goat_id === props.goat.id)
    .map((l) => {
      const end = l.dried_off_on ?? today
      const days = (dayTotals.data.value ?? []).filter((d) => d.milked_on! >= l.freshened_on && d.milked_on! <= end)
      const totalG = days.reduce((s, d) => s + (d.total_g ?? 0), 0)
      return {
        lactation: l,
        inMilk: !l.dried_off_on || l.dried_off_on >= today,
        dim: daysInMilk(l.freshened_on, end),
        totalG,
        daysRecorded: days.length,
        avgG: days.length ? Math.round(totalG / days.length) : 0,
      }
    }),
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
              {{ r.inMilk ? `DIM ${r.dim}` : `${r.dim + 1} days` }}
              <template v-if="r.daysRecorded"> · {{ r.daysRecorded }} {{ r.daysRecorded === 1 ? 'day' : 'days' }} weighed · avg {{ formatWeight(r.avgG, unit, true) }}/day</template>
            </span>
          </span>
          <span class="font-medium tabular-nums">{{ formatWeight(r.totalG, unit, true) }}</span>
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
