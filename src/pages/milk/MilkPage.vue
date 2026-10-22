<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats'
import { shiftDate, useLactations, useMilkDay, useMilkSaves } from '@/composables/useMilk'
import { formatDate, todayISO } from '@/lib/dates'
import { goatName, type Goat } from '@/lib/goats'
import {
  AM,
  DAY_TOTAL,
  PM,
  applyRecord,
  daysInMilk,
  defaultMilking,
  formatWeight,
  lactationOn,
  milkingLabel,
  parseWeightInput,
  type Lactation,
  type MilkRow,
} from '@/lib/milk'
import MilkEntryRow from '@/components/milk/MilkEntryRow.vue'
import MilkDayEditor from '@/components/milk/MilkDayEditor.vue'
import LactationModal from '@/components/milk/LactationModal.vue'
import { useHealthData } from '@/composables/useHealth'
import { withdrawalOn } from '@/lib/health'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const online = useOnline()
const { herd, herdId } = useHerd()
const { goats, photos } = useHerdGoats()
const lactations = useLactations()
const { record, clear, pending, pendingFor } = useMilkSaves()

const today = todayISO()
const date = computed(() => {
  const q = route.query.date
  return typeof q === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q) && q <= today ? q : today
})
function goTo(d: string) {
  void router.replace({ query: d === today ? {} : { date: d } })
}

const milking = ref<number>(defaultMilking())
const milkingOptions = [
  { label: 'AM', value: AM },
  { label: 'PM', value: PM },
  { label: 'Day total', value: DAY_TOTAL },
]

const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const day = useMilkDay(date)

// The milk line: does in milk on this date, by barn name.
const line = computed(() =>
  (goats.data.value ?? [])
    .map((goat) => ({ goat, lactation: lactationOn(lactations.data.value ?? [], goat.id, date.value) }))
    .filter((x): x is { goat: Goat; lactation: Lactation } => !!x.lactation)
    .sort((a, b) => (a.goat.barn_name || goatName(a.goat)).localeCompare(b.goat.barn_name || goatName(b.goat))),
)

const rowsByGoat = computed(() => {
  const map = new Map<string, MilkRow[]>()
  for (const r of day.data.value ?? []) map.set(r.goat_id, [...(map.get(r.goat_id) ?? []), r])
  return map
})

// Weights recorded for does no longer on the line (e.g. dried off later
// that day) still count toward the totals.
const totals = computed(() => {
  const rows = day.data.value ?? []
  const thisMilking = rows.filter((r) => r.milking === milking.value)
  return {
    milkingG: thisMilking.reduce((s, r) => s + r.weight_g, 0),
    milkingCount: new Set(thisMilking.map((r) => r.goat_id)).size,
    dayG: rows.reduce((s, r) => s + r.weight_g, 0),
  }
})

// Does whose milk can't be sold today (treatment withdrawal).
const health = useHealthData()
const withheld = computed(() => {
  const map = new Map<string, string>()
  for (const { goat } of line.value) {
    const w = withdrawalOn(goat.id, health.data.value.treatments, date.value)
    if (w) map.set(goat.id, w.through)
  }
  return map
})
const withheldG = computed(() =>
  (day.data.value ?? []).filter((r) => withheld.value.has(r.goat_id)).reduce((s, r) => s + r.weight_g, 0),
)

const primaryPhotos = computed(
  () => new Map((photos.data.value ?? []).filter((p) => p.is_primary).map((p) => [p.goat_id, p.storage_path])),
)
const photoUrls = usePhotoUrls(() => line.value.map((x) => primaryPhotos.value.get(x.goat.id)).filter((p): p is string => !!p))

// --- Saving -------------------------------------------------------------------

const errors = ref<Record<string, string>>({})

function save(goat: Goat, text: string) {
  const key = goat.id
  delete errors.value[key]
  const rows = rowsByGoat.value.get(goat.id) ?? []
  const parsed = parseWeightInput(text, unit.value)

  if (parsed.kind === 'invalid') {
    errors.value[key] = parsed.message
    return
  }
  if (parsed.kind === 'empty') {
    if (rows.some((r) => r.milking === milking.value)) {
      clear.mutate({ herdId: herdId.value, goatId: goat.id, milkedOn: date.value, milking: milking.value })
    }
    return
  }

  const vars = {
    herdId: herdId.value,
    goatId: goat.id,
    milkedOn: date.value,
    milking: milking.value,
    grams: parsed.grams,
    portions: parsed.portions,
    note: rows.find((r) => r.milking === milking.value)?.note ?? null,
  }
  try {
    applyRecord(rows, vars)
  } catch (e) {
    errors.value[key] = (e as Error).message
    return
  }
  record.mutate(vars, {
    onError: (e) => {
      errors.value[key] = e.message
      toast.add({ color: 'error', title: `Could not save ${goat.barn_name || goatName(goat)}`, description: e.message })
    },
  })
}

const rowRefs = ref<InstanceType<typeof MilkEntryRow>[]>([])
async function focusNext(index: number) {
  await nextTick()
  rowRefs.value[index + 1]?.focus()
}

const waiting = computed(() => pending.value.filter((p) => p.paused).length)

// --- Dialogs --------------------------------------------------------------------

const editing = ref<Goat>()
const editorOpen = computed({ get: () => !!editing.value, set: (v) => !v && (editing.value = undefined) })

const lactationModal = ref<{ open: boolean; mode: 'start' | 'dryOff'; lactation?: Lactation }>({ open: false, mode: 'start' })
const startLactation = () => (lactationModal.value = { open: true, mode: 'start' })
const dryOff = (lactation: Lactation) => (lactationModal.value = { open: true, mode: 'dryOff', lactation })
</script>

<template>
  <div class="space-y-4 pb-28">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Milk</h1>
      <UButton to="/milk/production" color="neutral" variant="ghost" icon="i-lucide-chart-line">Production</UButton>
      <UButton to="/milk/tests" color="neutral" variant="ghost" icon="i-lucide-flask-conical">Tests</UButton>
      <UButton to="/milk/history" color="neutral" variant="ghost" icon="i-lucide-history">History</UButton>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-1">
        <UButton color="neutral" variant="outline" icon="i-lucide-chevron-left" aria-label="Previous day" @click="goTo(shiftDate(date, -1))" />
        <UInput :model-value="date" type="date" :max="today" class="w-40" aria-label="Date" @update:model-value="(v: unknown) => v && goTo(String(v))" />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-chevron-right"
          aria-label="Next day"
          :disabled="date >= today"
          @click="goTo(shiftDate(date, 1))"
        />
        <UButton v-if="date !== today" variant="link" @click="goTo(today)">Today</UButton>
      </div>
      <UTabs
        v-model="milking"
        :items="milkingOptions"
        :content="false"
        size="md"
        class="ms-auto"
        :ui="{ list: 'w-auto' }"
      />
    </div>

    <UAlert
      v-if="waiting"
      color="warning"
      variant="subtle"
      icon="i-lucide-cloud-off"
      :title="`${waiting} ${waiting === 1 ? 'weight is' : 'weights are'} saved on this phone`"
      :description="online ? 'Uploading…' : 'They will upload automatically when you have signal. It is safe to close the app.'"
    />

    <div v-if="goats.isPending.value || lactations.isPending.value" class="space-y-2">
      <USkeleton v-for="i in 5" :key="i" class="h-14 w-full" />
    </div>

    <UCard v-else-if="!line.length" class="text-center">
      <p class="text-muted mb-3">
        No does are in milk on {{ formatDate(date) }}. Add a doe to the milk line with the date she freshened.
      </p>
      <UButton icon="i-lucide-plus" @click="startLactation">Add doe to milk line</UButton>
    </UCard>

    <template v-else>
      <p class="text-sm text-muted">
        {{ formatDate(date) }} · {{ milkingLabel(milking) }} · {{ line.length }} {{ line.length === 1 ? 'doe' : 'does' }} in milk
        <template v-if="milking === DAY_TOTAL"> · For days you only weighed once</template>
      </p>
      <ul class="divide-y divide-default">
        <MilkEntryRow
          v-for="({ goat, lactation }, i) in line"
          :key="goat.id"
          ref="rowRefs"
          :goat="goat"
          :rows="rowsByGoat.get(goat.id) ?? []"
          :milking="milking"
          :unit="unit"
          :dim="daysInMilk(lactation.freshened_on, date)"
          :photo-url="photoUrls[primaryPhotos.get(goat.id) ?? '']"
          :is-today="date === today"
          :withheld-through="withheld.get(goat.id)"
          :saving="pendingFor(goat.id, date).length > 0"
          :waiting-for-signal="pendingFor(goat.id, date).some((p) => p.paused)"
          :error="errors[goat.id]"
          @save="(text) => save(goat, text)"
          @next="focusNext(i)"
          @edit-day="editing = goat"
          @dry-off="dryOff(lactation)"
        />
      </ul>
      <UButton color="neutral" variant="ghost" icon="i-lucide-plus" @click="startLactation">Add doe to milk line</UButton>
    </template>

    <div
      v-if="line.length"
      class="fixed bottom-0 inset-x-0 border-t border-default bg-default/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div class="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <div>
          <p class="text-xs text-muted">{{ milkingLabel(milking) }} · {{ totals.milkingCount }}/{{ line.length }} does</p>
          <p class="text-lg font-semibold tabular-nums">{{ formatWeight(totals.milkingG, unit, true) }}</p>
        </div>
        <div v-if="withheldG" class="text-end">
          <p class="text-xs text-warning">Withheld</p>
          <p class="text-lg font-semibold tabular-nums">{{ formatWeight(withheldG, unit, true) }}</p>
        </div>
        <div class="ms-auto text-end">
          <p class="text-xs text-muted">Day total</p>
          <p class="text-lg font-semibold tabular-nums">{{ formatWeight(totals.dayG, unit, true) }}</p>
        </div>
      </div>
    </div>

    <MilkDayEditor
      v-if="editing"
      v-model:open="editorOpen"
      :goat="editing"
      :date="date"
      :rows="rowsByGoat.get(editing.id) ?? []"
      :unit="unit"
      :herd-id="herdId"
    />
    <LactationModal
      v-model:open="lactationModal.open"
      :mode="lactationModal.mode"
      :lactation="lactationModal.lactation"
      :date="date"
    />
  </div>
</template>
