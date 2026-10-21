<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useMilkSaves } from '@/composables/useMilk'
import { useHerdMembers } from '@/composables/useHerdMembers'
import { formatDate } from '@/lib/dates'
import { goatName, type Goat } from '@/lib/goats'
import {
  AM,
  DAY_TOTAL,
  PM,
  applyRecord,
  dayStatus,
  formatWeight,
  formatWeightInput,
  milkingLabel,
  parseWeightInput,
  type MilkRow,
  type WeightUnit,
} from '@/lib/milk'

const props = defineProps<{ goat: Goat; date: string; rows: MilkRow[]; unit: WeightUnit; herdId: string }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { record, clear } = useMilkSaves()
const { nameOf } = useHerdMembers()

const isDayTotal = computed(() => props.rows.some((r) => r.milking === DAY_TOTAL))
const extraSlots = ref<number[]>([])

// Milkings to show: AM and PM always (unless the day is a single total),
// plus any extras that are saved or being added.
const slots = computed(() => {
  if (isDayTotal.value) return [DAY_TOTAL]
  const saved = props.rows.map((r) => r.milking)
  return [...new Set([AM, PM, ...saved, ...extraSlots.value])].sort((a, b) => a - b)
})

const fields = reactive<Record<number, { text: string; note: string; error: string }>>({})
function load() {
  for (const slot of [DAY_TOTAL, AM, PM, 3, 4, 5, 6]) {
    const row = props.rows.find((r) => r.milking === slot)
    fields[slot] = {
      text: row ? formatWeightInput(row, props.unit) : '',
      note: row?.note ?? '',
      error: '',
    }
  }
}
watch(
  open,
  (isOpen) => {
    if (isOpen) {
      extraSlots.value = []
      load()
    }
  },
  { immediate: true },
)
watch(() => props.rows, load, { deep: true })

const rowFor = (slot: number) => props.rows.find((r) => r.milking === slot)

function save(slot: number) {
  const field = fields[slot]!
  field.error = ''
  const existing = rowFor(slot)
  const parsed = parseWeightInput(field.text, props.unit)

  if (parsed.kind === 'invalid') {
    field.error = parsed.message
    return
  }
  if (parsed.kind === 'empty') {
    if (existing) clear.mutate({ herdId: props.herdId, goatId: props.goat.id, milkedOn: props.date, milking: slot })
    return
  }
  const note = field.note.trim() || null
  const unchanged =
    existing &&
    existing.weight_g === parsed.grams &&
    JSON.stringify(existing.portions_g) === JSON.stringify(parsed.portions) &&
    (existing.note ?? null) === note
  if (unchanged) return

  const vars = {
    herdId: props.herdId,
    goatId: props.goat.id,
    milkedOn: props.date,
    milking: slot,
    grams: parsed.grams,
    portions: parsed.portions,
    note,
  }
  try {
    applyRecord(props.rows, vars)
  } catch (e) {
    field.error = (e as Error).message
    return
  }
  record.mutate(vars, {
    onError: (e) => toast.add({ color: 'error', title: `Could not save ${milkingLabel(slot)}`, description: e.message }),
  })
}

function addExtra() {
  const next = Math.max(PM, ...slots.value) + 1
  if (next <= 6) extraSlots.value.push(next)
}

const status = computed(() => dayStatus(props.rows))
const splitHint = computed(() => {
  const total = rowFor(DAY_TOTAL)
  return total ? `Day total ${formatWeight(total.weight_g, props.unit, true)}` : ''
})

function splitDayTotal() {
  // Start entering AM; saving it splits the total (PM gets the rest).
  const total = rowFor(DAY_TOTAL)
  if (!total) return
  splitting.value = true
}
const splitting = ref(false)
const splitText = ref('')
const splitError = ref('')
function saveSplit() {
  splitError.value = ''
  const parsed = parseWeightInput(splitText.value, props.unit)
  if (parsed.kind !== 'ok') {
    splitError.value = parsed.kind === 'invalid' ? parsed.message : 'Enter the AM weight'
    return
  }
  const vars = { herdId: props.herdId, goatId: props.goat.id, milkedOn: props.date, milking: AM, grams: parsed.grams, portions: parsed.portions }
  try {
    applyRecord(props.rows, vars)
  } catch (e) {
    splitError.value = (e as Error).message
    return
  }
  record.mutate(vars, {
    onError: (e) => toast.add({ color: 'error', title: 'Could not split the day', description: e.message }),
  })
  splitting.value = false
  splitText.value = ''
}

const useDayTotal = () => {
  extraSlots.value = []
  enteringDayTotal.value = true
}
const enteringDayTotal = ref(false)
watch(open, () => (enteringDayTotal.value = false))
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`${goat.barn_name || goatName(goat)} · ${formatDate(date)}`"
    :description="`Day total ${formatWeight(status.totalG, unit, true)}. Type parts like 2.1 + 1.3 if you weighed a milking in more than one container.`"
  >
    <template #body>
      <div class="space-y-4">
        <template v-if="isDayTotal || enteringDayTotal">
          <UFormField label="Day total" :error="fields[DAY_TOTAL]?.error || undefined" :hint="rowFor(DAY_TOTAL) && nameOf(rowFor(DAY_TOTAL)!.recorded_by) ? `by ${nameOf(rowFor(DAY_TOTAL)!.recorded_by)}` : undefined">
            <UInput v-model="fields[DAY_TOTAL]!.text" inputmode="text" autocomplete="off" class="w-full" size="xl" @blur="save(DAY_TOTAL)">
              <template #trailing><span class="text-xs text-muted">{{ unit }}</span></template>
            </UInput>
          </UFormField>
          <UFormField label="Note">
            <UInput v-model="fields[DAY_TOTAL]!.note" class="w-full" maxlength="500" @blur="save(DAY_TOTAL)" />
          </UFormField>

          <div v-if="isDayTotal" class="rounded-md border border-default p-3 space-y-2">
            <p class="text-sm">Know the AM weight now? Enter it and PM becomes the rest of the day total.</p>
            <div v-if="splitting" class="flex gap-2 items-start">
              <UFormField :error="splitError || undefined" class="flex-1">
                <UInput v-model="splitText" inputmode="text" placeholder="AM weight" autofocus class="w-full" @keydown.enter.prevent="saveSplit" />
              </UFormField>
              <UButton @click="saveSplit">Split</UButton>
            </div>
            <UButton v-else size="sm" variant="soft" @click="splitDayTotal">Split into AM and PM</UButton>
            <p class="text-xs text-muted">{{ splitHint }}</p>
          </div>
        </template>

        <template v-else>
          <div v-for="slot in slots" :key="slot" class="grid grid-cols-[5rem_1fr] gap-2 items-start">
            <div class="pt-2">
              <p class="font-medium">{{ milkingLabel(slot) }}</p>
              <p v-if="rowFor(slot) && nameOf(rowFor(slot)!.recorded_by)" class="text-xs text-muted">
                by {{ nameOf(rowFor(slot)!.recorded_by) }}
              </p>
            </div>
            <div class="space-y-1">
              <UFormField :error="fields[slot]?.error || undefined">
                <UInput
                  v-model="fields[slot]!.text"
                  inputmode="text"
                  autocomplete="off"
                  placeholder="—"
                  class="w-full"
                  size="lg"
                  :aria-label="`${milkingLabel(slot)} weight`"
                  @blur="save(slot)"
                >
                  <template #trailing><span class="text-xs text-muted">{{ unit }}</span></template>
                </UInput>
              </UFormField>
              <UInput
                v-model="fields[slot]!.note"
                placeholder="Note"
                size="sm"
                class="w-full"
                maxlength="500"
                :disabled="!rowFor(slot) && !fields[slot]!.text"
                :aria-label="`${milkingLabel(slot)} note`"
                @blur="save(slot)"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton v-if="Math.max(...slots) < 6" size="sm" variant="soft" icon="i-lucide-plus" @click="addExtra">
              Extra milking
            </UButton>
            <UButton v-if="!rows.length" size="sm" variant="ghost" color="neutral" @click="useDayTotal">
              Only know the day total
            </UButton>
          </div>
        </template>
      </div>
    </template>
    <template #footer>
      <UButton class="ms-auto" @click="open = false">Done</UButton>
    </template>
  </UModal>
</template>
