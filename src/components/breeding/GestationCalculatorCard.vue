<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { addMonths, formatDate, todayISO } from '@/lib/dates'
import { GESTATION_CHOICES, GESTATION_DAYS, gestationPlan } from '@/lib/breeding'

const open = ref(false)
const from = ref<'bred' | 'due'>('bred')
const today = todayISO()
const date = ref(today)
const gestationDays = ref(GESTATION_DAYS)

const modes = [
  { value: 'bred', label: 'Breed on' },
  { value: 'due', label: 'Want kids by' },
] as const
const lengthOptions = GESTATION_CHOICES.map((d) => ({ value: d, label: `${d} days` }))

// Start each side on a sensible date: today to breed, five months out to kid.
watch(from, (f) => (date.value = f === 'bred' ? today : addMonths(today, 5)))

const plan = computed(() => (date.value ? gestationPlan(from.value, date.value, gestationDays.value) : null))
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }) + ', ' + formatDate(iso)
</script>

<template>
  <UCard :ui="{ header: 'p-0 sm:p-0', body: open ? '' : 'hidden' }">
    <template #header>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 sm:px-6 text-start"
        :aria-expanded="open"
        aria-controls="gestation-calculator"
        @click="open = !open"
      >
        <span class="flex-1">
          <span class="block font-semibold">Gestation calculator</span>
          <span class="block text-sm text-muted">Find a due date or when to breed</span>
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-5 text-muted transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </button>
    </template>

    <div v-if="open" id="gestation-calculator" class="space-y-3">
      <div role="radiogroup" aria-label="Count from" class="flex gap-1 rounded-md bg-elevated p-1">
        <button
          v-for="m in modes"
          :key="m.value"
          type="button"
          role="radio"
          :aria-checked="from === m.value"
          class="flex-1 rounded px-2 py-1.5 text-sm"
          :class="from === m.value ? 'bg-default font-medium shadow-sm' : 'text-muted'"
          @click="from = m.value"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <UFormField :label="from === 'bred' ? 'Breeding date' : 'Kidding date'">
          <UInput v-model="date" type="date" class="w-full" />
        </UFormField>
        <UFormField label="Gestation">
          <USelect v-model="gestationDays" :items="lengthOptions" class="w-full" />
        </UFormField>
      </div>

      <dl v-if="plan" class="divide-y divide-default border-t border-default text-sm">
        <div class="flex flex-wrap justify-between gap-x-3 py-2">
          <dt class="text-muted">{{ from === 'bred' ? 'Due' : 'Breed on' }}</dt>
          <dd class="font-medium">{{ longDate(from === 'bred' ? plan.dueOn : plan.bredOn) }}</dd>
        </div>
        <div class="flex flex-wrap justify-between gap-x-3 py-2">
          <dt class="text-muted">Dry off by</dt>
          <dd class="font-medium">{{ longDate(plan.dryOffBy) }}</dd>
        </div>
      </dl>
      <p v-else class="text-sm text-muted">Pick a date.</p>
    </div>
  </UCard>
</template>
