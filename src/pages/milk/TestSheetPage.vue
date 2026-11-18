<script setup lang="ts">
// What to write by hand on the lab's two DHIR forms for one test day, in the
// forms' own order and words. Opens on any milking day (?date=YYYY-MM-DD),
// whether or not the test has been recorded yet. See GLOSSARY.md (Milk tests).
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { shiftDate, useLactations, useMilkDay } from '@/composables/useMilk'
import { useMilkTests } from '@/composables/useMilkTests'
import { refreshQueries } from '@/lib/queryClient'
import { supabase, unwrap } from '@/lib/supabase'
import { formatDate, todayISO } from '@/lib/dates'
import type { Json } from '@/lib/database.types'
import {
  buildTestSheet,
  dayBefore,
  isFormTime,
  readMilkingTimes,
  type MilkingTimes,
  type ScheduleKey,
  type SheetTime,
} from '@/lib/testSheet'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { herdId } = useHerd()
const { goats } = useHerdGoats()
const lactations = useLactations()
const { query, data } = useMilkTests()

const today = todayISO()
const date = computed(() => {
  const q = route.query.date
  return typeof q === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q) && q <= today ? q : today
})
function goTo(d: string) {
  void router.replace({ query: d === today ? {} : { date: d } })
}

const day = useMilkDay(date)
const previousDay = useMilkDay(() => dayBefore(date.value))

/** A DHIR test already recorded for this day, if any. */
const testThatDay = computed(() => data.value.tests.find((t) => t.tested_on === date.value && t.kind === 'dhir'))

// Times corrected by hand for this day.
const timesKey = computed(() => ['milkingTimes', herdId.value, date.value] as const)
const savedTimes = useQuery({
  queryKey: timesKey,
  queryFn: async (): Promise<MilkingTimes> => {
    const { data, error } = await supabase
      .from('milking_times')
      .select('times')
      .eq('herd_id', herdId.value)
      .eq('milked_on', date.value)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return readMilkingTimes(data?.times ?? {})
  },
  enabled: computed(() => !!herdId.value),
})

const loading = computed(
  () =>
    query.isPending.value ||
    goats.isPending.value ||
    lactations.isPending.value ||
    day.isPending.value ||
    previousDay.isPending.value ||
    savedTimes.isPending.value,
)

const sheet = computed(() =>
  loading.value
    ? null
    : buildTestSheet({
        date: date.value,
        milkingTimes: (savedTimes.data.value ?? {}) as Json,
        tests: data.value.tests,
        results: data.value.results,
        goats: goats.data.value ?? [],
        lactations: lactations.data.value ?? [],
        dayRows: day.data.value ?? [],
        previousDayRows: previousDay.data.value ?? [],
      }),
)

// --- Ticks: what's been copied, kept on this phone for this day -------------

const ticks = ref<Record<string, boolean>>({})
const ticksKey = computed(() => `test-sheet-ticks:${herdId.value}:${date.value}`)
watch(
  ticksKey,
  (key) => {
    try {
      ticks.value = JSON.parse(localStorage.getItem(key) ?? '{}')
    } catch {
      ticks.value = {}
    }
  },
  { immediate: true },
)
function toggle(key: string, value: boolean | 'indeterminate') {
  ticks.value = { ...ticks.value, [key]: value === true }
  try {
    localStorage.setItem(ticksKey.value, JSON.stringify(ticks.value))
  } catch {
    // Private browsing or storage full: ticks just won't be remembered.
  }
}

// --- Correcting milking times ----------------------------------------------

const editingTimes = ref(false)
watch(date, () => (editingTimes.value = false))
const timeFields = reactive<Record<ScheduleKey, { start: string; stop: string }>>({
  previous: { start: '', stop: '' },
  '1': { start: '', stop: '' },
  '2': { start: '', stop: '' },
})
const timeError = ref('')

function startEditing() {
  for (const row of sheet.value?.schedule ?? []) {
    timeFields[row.key] = { start: row.start.value ?? '', stop: row.stop.value ?? '' }
  }
  timeError.value = ''
  editingTimes.value = true
}

const saveTimes = useMutation({
  mutationFn: async (times: MilkingTimes) =>
    Object.keys(times).length
      ? unwrap(
          await supabase
            .from('milking_times')
            .upsert({ herd_id: herdId.value, milked_on: date.value, times, updated_at: new Date().toISOString() }),
        )
      : unwrap(await supabase.from('milking_times').delete().eq('herd_id', herdId.value).eq('milked_on', date.value)),
  onSuccess: async () => {
    await refreshQueries(timesKey.value)
    editingTimes.value = false
  },
  onError: (e: Error) => toast.add({ color: 'error', title: 'Could not save times', description: e.message }),
})

function submitTimes() {
  const times: MilkingTimes = {}
  const worked = Object.fromEntries((sheet.value?.schedule ?? []).map((r) => [r.key, r]))
  for (const key of ['previous', '1', '2'] as const) {
    for (const end of ['start', 'stop'] as const) {
      const text = timeFields[key][end].trim().replace(/^0(\d)/, '$1')
      if (!text) continue
      if (!isFormTime(text)) {
        timeError.value = 'Times look like 9:00 or 21:30'
        return
      }
      // Only keep it as a correction when it differs from the worked-out time.
      const was: SheetTime | undefined = worked[key]?.[end]
      if (was?.source === 'entered' && was.value === text) continue
      times[key] = { ...times[key], [end]: text }
    }
  }
  saveTimes.mutate(times)
}

function resetTimes() {
  saveTimes.mutate({})
}

const hasCorrections = computed(() => Object.keys(savedTimes.data.value ?? {}).length > 0)
const noWeights = computed(() => !day.data.value?.length)

const scheduleLines = computed(() =>
  (sheet.value?.schedule ?? []).flatMap((row) => {
    const name = row.key === 'previous' ? 'Previous Milking' : `Milking ${row.key}`
    return [
      { label: `${name} Start`, time: row.start },
      { label: `${name} Stop`, time: row.stop },
    ]
  }),
)
const anyMissingTime = computed(() => scheduleLines.value.some((l) => l.time.source === 'none'))
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UButton
        to="/milk/tests"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        aria-label="Back to milk tests"
      />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-semibold">Copy to form</h1>
        <p class="text-sm text-muted">DHIR test day {{ formatDate(date) }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-1">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-chevron-left"
        aria-label="Previous day"
        @click="goTo(shiftDate(date, -1))"
      />
      <UInput
        :model-value="date"
        type="date"
        :max="today"
        class="w-40"
        aria-label="Test day"
        @update:model-value="(v: unknown) => v && goTo(String(v))"
      />
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

    <div v-if="loading" class="space-y-2"><USkeleton v-for="i in 4" :key="i" class="h-16 w-full" /></div>
    <template v-else-if="sheet">
      <p class="text-sm text-muted">
        Only what you write by hand. The lab prints everything else. Tick each part once it's on the paper.
        <template v-if="testThatDay">
          <RouterLink :to="`/milk/tests/${testThatDay.id}`" class="underline">See this day's test results</RouterLink>.
        </template>
      </p>
      <UAlert
        v-if="noWeights"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="`No milk weights entered on ${formatDate(date)}`"
        description="Pick the test day above, or enter the weights on the milk page first."
      />

      <div class="grid gap-4 lg:grid-cols-2 lg:items-start">
        <!-- Owner's Options -------------------------------------------------- -->
        <section class="space-y-4" aria-labelledby="owners-options">
          <h2 id="owners-options" class="text-lg font-semibold">Owner's Options</h2>

          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted">Current Test Date</p>
                <p class="text-3xl font-semibold tabular-nums">{{ sheet.testDate }}</p>
              </div>
              <UCheckbox
                :model-value="!!ticks['date']"
                label="Copied"
                @update:model-value="(v: boolean | 'indeterminate') => toggle('date', v)"
              />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <h3 class="font-semibold">Milking Schedule 1</h3>
                <UCheckbox
                  :model-value="!!ticks['schedule']"
                  label="Copied"
                  @update:model-value="(v: boolean | 'indeterminate') => toggle('schedule', v)"
                />
              </div>
            </template>

            <dl v-if="!editingTimes" class="divide-y divide-default" data-testid="milking-schedule">
              <div
                v-for="line in scheduleLines"
                :key="line.label"
                class="flex items-baseline justify-between gap-3 py-2"
              >
                <dt class="text-sm">{{ line.label }}</dt>
                <dd class="text-end">
                  <span v-if="line.time.value" class="text-2xl font-semibold tabular-nums">{{ line.time.value }}</span>
                  <span v-else class="text-sm text-warning">Enter by hand</span>
                  <span v-if="line.time.source === 'corrected'" class="block text-xs text-muted">Corrected</span>
                </dd>
              </div>
            </dl>
            <p v-if="!editingTimes && anyMissingTime" class="mt-2 text-xs text-muted">
              No times recorded for a milking with no weights, or only a day total.
            </p>

            <form v-else-if="editingTimes" class="space-y-3" @submit.prevent="submitTimes">
              <div v-for="row in sheet.schedule" :key="row.key" class="grid grid-cols-2 gap-2">
                <UFormField :label="`${row.key === 'previous' ? 'Previous Milking' : `Milking ${row.key}`} Start`">
                  <UInput v-model="timeFields[row.key].start" inputmode="numeric" placeholder="9:00" class="w-full" />
                </UFormField>
                <UFormField :label="`${row.key === 'previous' ? 'Previous Milking' : `Milking ${row.key}`} Stop`">
                  <UInput v-model="timeFields[row.key].stop" inputmode="numeric" placeholder="9:45" class="w-full" />
                </UFormField>
              </div>
              <p v-if="timeError" class="text-sm text-error">{{ timeError }}</p>
              <div class="flex flex-wrap gap-2">
                <UButton type="submit" :loading="saveTimes.isPending.value">Save times</UButton>
                <UButton color="neutral" variant="ghost" @click="editingTimes = false">Cancel</UButton>
              </div>
            </form>

            <template v-if="!editingTimes" #footer>
              <p class="text-xs text-muted mb-2">
                Worked out from when the first and last weight of each milking was entered.
              </p>
              <div class="flex flex-wrap gap-2">
                <UButton size="sm" variant="soft" icon="i-lucide-pencil" @click="startEditing">Correct times</UButton>
                <UButton
                  v-if="hasCorrections"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :loading="saveTimes.isPending.value"
                  @click="resetTimes"
                  >Use entry times</UButton
                >
              </div>
            </template>
          </UCard>

          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted">Number of cows in herd</p>
                <p class="text-3xl font-semibold tabular-nums">{{ sheet.cowsInHerd }}</p>
                <p class="text-xs text-muted">Every doe that has freshened, milking or dry</p>
              </div>
              <UCheckbox
                :model-value="!!ticks['cows']"
                label="Copied"
                @update:model-value="(v: boolean | 'indeterminate') => toggle('cows', v)"
              />
            </div>
          </UCard>

          <UCard v-if="sheet.newToTest.length">
            <template #header>
              <h3 class="font-semibold">New Cow Enrollment and Corrections</h3>
              <p class="text-xs text-muted">Does in milk that weren't on an earlier DHIR test.</p>
            </template>
            <ul class="divide-y divide-default">
              <li v-for="row in sheet.newToTest" :key="row.goat.id" class="py-3 first:pt-0 last:pb-0 space-y-2">
                <div class="flex items-start justify-between gap-3">
                  <p class="font-semibold">{{ row.barnName }}</p>
                  <UCheckbox
                    :model-value="!!ticks[`enroll:${row.goat.id}`]"
                    label="Copied"
                    @update:model-value="(v: boolean | 'indeterminate') => toggle(`enroll:${row.goat.id}`, v)"
                  />
                </div>
                <dl class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <template v-if="row.birthDate"
                    ><dt class="text-muted">Birthdate</dt>
                    <dd class="tabular-nums">{{ row.birthDate }}</dd></template
                  >
                  <template v-if="row.registration"
                    ><dt class="text-muted">Registration</dt>
                    <dd class="break-all">{{ row.registration }}</dd></template
                  >
                  <template v-if="row.breed"
                    ><dt class="text-muted">Breed</dt>
                    <dd>{{ row.breed }}</dd></template
                  >
                  <template v-if="row.lactationNumber"
                    ><dt class="text-muted">Lact No.</dt>
                    <dd>{{ row.lactationNumber }}</dd></template
                  >
                  <template v-if="row.sire.name"
                    ><dt class="text-muted">Sire</dt>
                    <dd class="break-words">{{ row.sire.name }}</dd></template
                  >
                  <template v-if="row.sire.registration"
                    ><dt class="text-muted">Sire registration</dt>
                    <dd class="break-all">{{ row.sire.registration }}</dd></template
                  >
                  <template v-if="row.sire.breed"
                    ><dt class="text-muted">Sire breed</dt>
                    <dd>{{ row.sire.breed }}</dd></template
                  >
                  <template v-if="row.dam.name"
                    ><dt class="text-muted">Dam</dt>
                    <dd class="break-words">{{ row.dam.name }}</dd></template
                  >
                  <template v-if="row.dam.registration"
                    ><dt class="text-muted">Dam registration</dt>
                    <dd class="break-all">{{ row.dam.registration }}</dd></template
                  >
                  <template v-if="row.dam.breed"
                    ><dt class="text-muted">Dam breed</dt>
                    <dd>{{ row.dam.breed }}</dd></template
                  >
                </dl>
              </li>
            </ul>
          </UCard>
        </section>

        <!-- Barn Sheet ------------------------------------------------------- -->
        <section class="space-y-4" aria-labelledby="barn-sheet">
          <h2 id="barn-sheet" class="text-lg font-semibold">Barn Sheet</h2>

          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted">Current Test Date</p>
                <p class="text-3xl font-semibold tabular-nums">{{ sheet.testDate }}</p>
              </div>
              <UCheckbox
                :model-value="!!ticks['barn-date']"
                label="Copied"
                @update:model-value="(v: boolean | 'indeterminate') => toggle('barn-date', v)"
              />
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <h3 class="font-semibold">Milk Weights</h3>
              <p class="text-xs text-muted">1st is AM, 2nd is PM, in pounds. Rows follow the DHIR sample number.</p>
            </template>
            <p v-if="!sheet.barn.length" class="p-4 text-muted">No does in milk on this date.</p>
            <table v-else class="w-full text-sm" data-testid="barn-sheet">
              <thead>
                <tr class="text-xs text-muted">
                  <th class="ps-3 pe-1 py-2 text-start font-normal">No.</th>
                  <th class="px-1 py-2 text-start font-normal">Doe</th>
                  <th class="px-1 py-2 text-end font-normal">1st</th>
                  <th class="px-1 py-2 text-end font-normal">2nd</th>
                  <th v-if="sheet.hasThird" class="px-1 py-2 text-end font-normal">3rd</th>
                  <th class="ps-1 pe-3 py-2 font-normal"><span class="sr-only">Copied</span></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in sheet.barn" :key="row.goat.id">
                  <tr class="border-t border-default" :class="ticks[`barn:${row.goat.id}`] ? 'opacity-50' : ''">
                    <td class="ps-3 pe-1 py-2 tabular-nums">{{ row.sampleNumber ?? '—' }}</td>
                    <td class="px-1 py-2 font-medium break-words">{{ row.name }}</td>
                    <td class="px-1 py-2 text-end text-xl font-semibold tabular-nums">{{ row.first ?? '—' }}</td>
                    <td class="px-1 py-2 text-end text-xl font-semibold tabular-nums">{{ row.second ?? '—' }}</td>
                    <td v-if="sheet.hasThird" class="px-1 py-2 text-end text-xl font-semibold tabular-nums">
                      {{ row.third ?? '' }}
                    </td>
                    <td class="ps-1 pe-3 py-2 text-end">
                      <UCheckbox
                        :model-value="!!ticks[`barn:${row.goat.id}`]"
                        :aria-label="`${row.name} copied`"
                        @update:model-value="(v: boolean | 'indeterminate') => toggle(`barn:${row.goat.id}`, v)"
                      />
                    </td>
                  </tr>
                  <tr v-if="row.sampleNumber === null || row.missing.length || row.dayTotalOnly">
                    <td :colspan="sheet.hasThird ? 6 : 5" class="px-3 pb-2 text-xs text-warning">
                      <template v-if="row.dayTotalOnly"
                        >Only a day total was entered, so there's no 1st or 2nd.
                      </template>
                      <template v-if="row.missing.length">No {{ row.missing.join(' or ') }} weight. </template>
                      <template v-if="row.sampleNumber === null">
                        No sample number:
                        <RouterLink :to="`/goats/${row.goat.slug}/edit`" class="underline"
                          >set it on her page</RouterLink
                        >.
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </UCard>
        </section>
      </div>
    </template>
  </div>
</template>
