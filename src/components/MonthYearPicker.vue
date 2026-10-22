<script setup lang="ts">
// The month title as a button that opens month and year wheels, like the
// iOS calendar. The month changes as the wheels settle.
import { computed } from 'vue'
import { todayISO } from '@/lib/dates'
import WheelColumn from './WheelColumn.vue'

/** 'YYYY-MM'. */
const model = defineModel<string>({ required: true })

const year = computed({
  get: () => Number(model.value.slice(0, 4)),
  set: (y: number) => (model.value = `${y}-${model.value.slice(5, 7)}`),
})
const month = computed({
  get: () => Number(model.value.slice(5, 7)),
  set: (m: number) => (model.value = `${model.value.slice(0, 4)}-${String(m).padStart(2, '0')}`),
})

const title = computed(() => new Date(year.value, month.value - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))
const months = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2000, i, 1).toLocaleDateString(undefined, { month: 'long' }),
  value: i + 1,
}))
const thisYear = Number(todayISO().slice(0, 4))
const years = computed(() => {
  const from = Math.min(thisYear - 15, year.value)
  const to = Math.max(thisYear + 5, year.value)
  return Array.from({ length: to - from + 1 }, (_, i) => ({ label: String(from + i), value: from + i }))
})
</script>

<template>
  <UPopover :content="{ align: 'center' }">
    <UButton color="neutral" variant="ghost" trailing-icon="i-lucide-chevron-down" class="w-full font-medium text-base justify-center whitespace-nowrap px-1 gap-1" aria-live="polite">
      {{ title }}
    </UButton>
    <template #content>
      <div class="flex gap-1 p-2">
        <WheelColumn v-model="month" :items="months" label="Month" class="w-36" />
        <WheelColumn v-model="year" :items="years" label="Year" class="w-24" />
      </div>
    </template>
  </UPopover>
</template>
