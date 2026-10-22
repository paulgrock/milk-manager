<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { goatName, type Goat } from '@/lib/goats'
import {
  DAY_TOTAL,
  dayStatus,
  formatWeight,
  formatWeightInput,
  milkingLabel,
  type EntryUnit,
  type MilkRow,
  type WeightUnit,
} from '@/lib/milk'
import GoatAvatar from '@/components/goats/GoatAvatar.vue'
import { formatDate } from '@/lib/dates'

const props = defineProps<{
  goat: Goat
  rows: MilkRow[]
  milking: number
  /** For the day total. */
  unit: WeightUnit
  /** What weights are typed and shown in. */
  entryUnit: EntryUnit
  dim: number
  photoUrl?: string
  isToday: boolean
  /** Set when her milk must be withheld on this day (treatment withdrawal). */
  withheldThrough?: string
  saving: boolean
  waitingForSignal: boolean
  error?: string
}>()

const emit = defineEmits<{
  save: [text: string]
  next: []
  editDay: []
  dryOff: []
}>()

const input = ref<{ inputRef: HTMLInputElement }>()
defineExpose({ focus: () => input.value?.inputRef?.focus() })

const current = computed(() => props.rows.find((r) => r.milking === props.milking))
const status = computed(() => dayStatus(props.rows))
const hasSeparate = computed(() => props.rows.some((r) => r.milking > 0))
const dayTotalRow = computed(() => props.rows.find((r) => r.milking === DAY_TOTAL))
const locked = computed(() => props.milking === DAY_TOTAL && hasSeparate.value)

const text = ref('')
const focused = ref(false)
watch(
  [current, () => props.entryUnit],
  () => {
    if (!focused.value) text.value = current.value ? formatWeightInput(current.value, props.entryUnit) : ''
  },
  { immediate: true },
)

const summary = computed(() =>
  props.rows
    .filter((r) => r.milking !== props.milking)
    .map((r) => `${milkingLabel(r.milking)} ${formatWeight(r.weight_g, props.entryUnit, true)}`)
    .join(' · '),
)

const placeholder = computed(() => {
  if (locked.value) return formatWeight(status.value.totalG, props.entryUnit)
  if (dayTotalRow.value && props.milking !== DAY_TOTAL) return `of ${formatWeight(dayTotalRow.value.weight_g, props.entryUnit)}`
  return '—'
})

// Enter saves and moves on, which also blurs; remember what was just sent so
// it isn't sent twice before the saved value comes back.
let lastSent: string | undefined
watch(current, () => (lastSent = undefined))

function commit() {
  focused.value = false
  const saved = lastSent ?? (current.value ? formatWeightInput(current.value, props.entryUnit) : '')
  if (text.value.trim() !== saved) {
    lastSent = text.value.trim()
    emit('save', text.value)
  }
}

function onEnter() {
  commit()
  emit('next')
}

const menu = computed<DropdownMenuItem[]>(() => [
  { label: 'Edit this day', icon: 'i-lucide-list', onSelect: () => emit('editDay') },
  { label: 'Dry off', icon: 'i-lucide-moon', onSelect: () => emit('dryOff') },
])
</script>

<template>
  <li class="flex items-center gap-3 py-2">
    <GoatAvatar :goat="goat" :url="photoUrl" size="md" />
    <div class="flex-1 min-w-0">
      <p class="font-medium truncate">
        {{ goat.barn_name || goatName(goat) }}
        <span class="text-xs text-muted font-normal">DIM {{ dim }}</span>
      </p>
      <p class="text-xs text-muted truncate">
        <template v-if="summary">{{ summary }}</template>
        <template v-if="rows.length > 1 || (rows.length && !current)"> · Day {{ formatWeight(status.totalG, unit, true) }}</template>
      </p>
      <UBadge v-if="withheldThrough" color="warning" variant="subtle" size="sm" icon="i-lucide-milk-off" class="me-1">
        Withhold · through {{ formatDate(withheldThrough) }}
      </UBadge>
      <p v-if="error" class="text-xs text-error">{{ error }}</p>
      <UBadge v-else-if="status.missing && !(isToday && status.missing === 'PM')" color="warning" variant="subtle" size="sm">{{ status.missing }} missing</UBadge>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <UIcon
        v-if="waitingForSignal"
        name="i-lucide-cloud-off"
        class="text-warning size-4"
        title="Saved on this phone. Will upload when there's signal."
      />
      <UIcon v-else-if="saving" name="i-lucide-loader-circle" class="animate-spin text-muted size-4" title="Saving" />
      <UIcon v-else-if="current" name="i-lucide-check" class="text-success size-4" title="Saved" />
      <UInput
        ref="input"
        v-model="text"
        inputmode="decimal"
        enterkeyhint="next"
        autocomplete="off"
        :placeholder="placeholder"
        :disabled="locked"
        :color="error ? 'error' : undefined"
        :highlight="!!error"
        class="w-24"
        size="xl"
        :ui="{ base: 'text-end tabular-nums', trailing: 'pe-2' }"
        :aria-label="`${goat.barn_name || goatName(goat)} ${milkingLabel(milking)}`"
        @focus="focused = true"
        @blur="commit"
        @keydown.enter.prevent="onEnter"
      >
        <template #trailing><span class="text-xs text-muted">{{ entryUnit }}</span></template>
      </UInput>
      <UDropdownMenu :items="menu">
        <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" aria-label="More" />
      </UDropdownMenu>
    </div>
  </li>
</template>
