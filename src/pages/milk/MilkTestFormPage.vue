<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useLactations, useMilkDay } from '@/composables/useMilk'
import { useMilkTestMutations, useMilkTests, type ResultInput } from '@/composables/useMilkTests'
import { formatDate, todayISO } from '@/lib/dates'
import { parseDhiReport, readPdfText, registrationDigits } from '@/lib/dhiReport'
import { SCC_LIMIT, TEST_KIND_LABELS, formatScc, parseScc, type MilkTestKind } from '@/lib/dhia'
import { goatName } from '@/lib/goats'
import { formatWeight, lactationOn, parseWeightInput } from '@/lib/milk'
import { byBarnSheetOrder } from '@/lib/testSheet'
import NotesField from '@/components/NotesField.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { goats, byId } = useHerdGoats()
const lactations = useLactations()
const { data } = useMilkTests()
const { save, remove } = useMilkTestMutations()

const testId = computed(() => (route.params.id as string | undefined) ?? undefined)
const existing = computed(() => data.value.tests.find((t) => t.id === testId.value))

const form = reactive({ tested_on: todayISO(), kind: 'dhir' as MilkTestKind, lab: '', tester: '', notes: '' })
// The report's lactation-to-date and projected 305-day pounds, in report order.
const TOTALS = [
  { key: 'ltdMilk', column: 'ltd_milk_g', label: 'Milk' },
  { key: 'ltdFat', column: 'ltd_fat_g', label: 'Butterfat' },
  { key: 'ltdProtein', column: 'ltd_protein_g', label: 'Protein' },
  { key: 'ltdSnf', column: 'ltd_snf_g', label: 'SNF' },
  { key: 'projMilk', column: 'proj305_milk_g', label: 'Milk' },
  { key: 'projFat', column: 'proj305_fat_g', label: 'Butterfat' },
  { key: 'projProtein', column: 'proj305_protein_g', label: 'Protein' },
  { key: 'projSnf', column: 'proj305_snf_g', label: 'SNF' },
] as const
type TotalKey = (typeof TOTALS)[number]['key']
type Row = { milk: string; fat: string; protein: string; snf: string; scc: string; error: string } & Record<
  TotalKey,
  string
>
const rows = reactive<Record<string, Row>>({})
const blankRow = (): Row => ({
  milk: '',
  fat: '',
  protein: '',
  snf: '',
  scc: '',
  error: '',
  ltdMilk: '',
  ltdFat: '',
  ltdProtein: '',
  ltdSnf: '',
  projMilk: '',
  projFat: '',
  projProtein: '',
  projSnf: '',
})
// Whose report totals are showing.
const totalsOpen = reactive<Record<string, boolean>>({})
const gramsPerUnit = computed(() => (unit.value === 'lb' ? 453.59237 : 1000))
/** Grams as the number typed in the form, in the herd's unit. */
const toInput = (grams: number | null, places: number) =>
  grams === null ? '' : String(Math.round((grams / gramsPerUnit.value) * 10 ** places) / 10 ** places)
// Report totals to a tenth of a pound, or a hundredth of a kilo (about the same).
const totalPlaces = computed(() => (unit.value === 'kg' ? 2 : 1))
// What each weight field showed when the test was opened, and the exact grams
// behind it: a field nobody changed saves those grams, not its rounded text.
const stored: Record<string, Record<string, { text: string; grams: number }>> = {}
function remember(goatId: string, field: string, text: string, grams: number | null) {
  if (grams === null) return
  ;(stored[goatId] ??= {})[field] = { text, grams }
}
/** Grams for a weight field: what was stored if it still shows the same, otherwise what's typed. */
function unchangedGrams(goatId: string, field: string, text: string, typed: number | null): number | null {
  const s = stored[goatId]?.[field]
  return s && s.text === text ? s.grams : typed
}
const pctInput = (pct: number | null) => (pct === null ? '' : String(Number(pct)))
/** SCC as typed, without rounding: 2,442,000 is "2442k", not "2.44M" (which would save as 2,440,000). */
const sccInput = (scc: number | null) => {
  if (scc === null) return ''
  if (parseScc(formatScc(scc)) === scc) return formatScc(scc)
  return scc % 1000 === 0 ? `${scc / 1000}k` : String(scc)
}

const loaded = ref<string>()
watch(
  existing,
  (t) => {
    if (!t || loaded.value === t.id) return
    Object.assign(form, {
      tested_on: t.tested_on,
      kind: t.kind,
      lab: t.lab ?? '',
      tester: t.tester ?? '',
      notes: t.notes ?? '',
    })
    for (const r of data.value.results.filter((x) => x.test_id === t.id)) {
      const row: Row = {
        ...blankRow(),
        milk: toInput(r.milk_g, 2),
        fat: pctInput(r.butterfat_pct),
        protein: pctInput(r.protein_pct),
        snf: pctInput(r.snf_pct),
        scc: sccInput(r.scc),
      }
      remember(r.goat_id, 'milk', row.milk, r.milk_g)
      for (const f of TOTALS) {
        row[f.key] = toInput(r[f.column], totalPlaces.value)
        remember(r.goat_id, f.column, row[f.key], r[f.column])
      }
      rows[r.goat_id] = row
    }
    loaded.value = t.id
  },
  { immediate: true },
)

// Does on test: everyone in milk that day, plus anyone already with a result.
const does = computed(() => {
  const ids = new Set(
    (goats.data.value ?? [])
      .filter((g) => lactationOn(lactations.data.value ?? [], g.id, form.tested_on))
      .map((g) => g.id),
  )
  for (const id of Object.keys(rows)) if (rows[id] && Object.values(rows[id]).some((v) => v)) ids.add(id)
  return [...ids]
    .map((id) => byId.value.get(id))
    .filter((g) => !!g)
    .sort((a, b) => byBarnSheetOrder(a!, b!))
})
watch(
  does,
  (list) => {
    for (const g of list) rows[g!.id] ??= blankRow()
  },
  { immediate: true },
)

// A new test starts with each doe's milk weights from that day, if there are any.
const day = useMilkDay(() => form.tested_on)
// What was last filled in for each doe, so a new date can replace it without
// touching a weight someone typed.
const prefilled: Record<string, string> = {}
// Runs when the day's weights or the does list loads, whichever is last.
watch(
  [() => day.data.value, does],
  ([dayRows]) => {
    if (testId.value || !dayRows) return
    for (const g of does.value) {
      const row = rows[g!.id]
      if (!row || (row.milk && row.milk !== prefilled[g!.id])) continue
      const total = dayRows.filter((r) => r.goat_id === g!.id).reduce((s, r) => s + r.weight_g, 0)
      row.milk = total ? formatWeight(total, unit.value).replace(/,/g, '') : ''
      prefilled[g!.id] = row.milk
    }
  },
  { immediate: true },
)

const kindOptions = Object.entries(TEST_KIND_LABELS).map(([value, label]) => ({ label, value }))

function parsePct(text: string, max = 15): number | null | 'invalid' {
  if (!text.trim()) return null
  const n = Number(text.replace(',', '.').replace('%', ''))
  return Number.isFinite(n) && n >= 0.5 && n <= max ? n : 'invalid'
}

/** A report total in the herd's unit, as grams. */
function parseTotal(text: string): number | null | 'invalid' {
  if (!text.trim()) return null
  const n = Number(text.replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 && n < 100_000 ? Math.round(n * gramsPerUnit.value) : 'invalid'
}

/** "519 lb to date · 771 lb projected", for her report totals while they're closed. */
function totalsSummary(row: Row): string | null {
  const parts = []
  if (row.ltdMilk.trim()) parts.push(`${row.ltdMilk} ${unit.value} to date`)
  if (row.projMilk.trim()) parts.push(`${row.projMilk} ${unit.value} projected`)
  if (parts.length) return parts.join(' · ')
  return TOTALS.some((f) => row[f.key].trim()) ? 'Entered' : null
}

async function submit() {
  let ok = true
  const results: ResultInput[] = []
  for (const g of does.value) {
    const row = rows[g!.id]!
    row.error = ''
    const milk = parseWeightInput(row.milk, unit.value)
    const fat = parsePct(row.fat)
    const protein = parsePct(row.protein)
    const snf = parsePct(row.snf, 20)
    const scc = parseScc(row.scc)
    const totals = Object.fromEntries(
      TOTALS.map((f) => {
        const typed = parseTotal(row[f.key])
        return [f.column, typed === 'invalid' ? typed : unchangedGrams(g!.id, f.column, row[f.key], typed)]
      }),
    )
    if (milk.kind === 'invalid' || (milk.kind === 'ok' && milk.portions))
      row.error = 'Milk should be one weight for the whole test day'
    else if (fat === 'invalid' || protein === 'invalid') row.error = 'Percentages should be between 0.5 and 15'
    else if (snf === 'invalid') row.error = 'SNF should be between 0.5 and 20%'
    else if (scc === 'invalid') row.error = 'SCC like 450, 450k or 1.2M'
    else if (Object.values(totals).includes('invalid')) {
      row.error = `Report totals should be ${unit.value}, like 519 or 31.8`
      totalsOpen[g!.id] = true
    }
    if (row.error) {
      ok = false
      continue
    }
    const milkG = unchangedGrams(g!.id, 'milk', row.milk, milk.kind === 'ok' ? milk.grams : null)
    if (milkG === null && fat === null && protein === null && snf === null && scc === null) {
      if (Object.values(totals).some((v) => v !== null)) {
        row.error = 'Add her test-day numbers too'
        ok = false
      }
      continue
    }
    results.push({
      goat_id: g!.id,
      milk_g: milkG,
      butterfat_pct: fat as number | null,
      protein_pct: protein as number | null,
      snf_pct: snf as number | null,
      scc: scc as number | null,
      ...(totals as Record<(typeof TOTALS)[number]['column'], number | null>),
    })
  }
  if (!ok) return toast.add({ color: 'error', title: 'Fix the highlighted does' })
  try {
    const test = await save.mutateAsync({
      id: testId.value,
      test: {
        tested_on: form.tested_on,
        kind: form.kind,
        lab: form.lab.trim() || null,
        tester: form.tester.trim() || null,
        notes: form.notes.trim() || null,
      },
      results,
    })
    toast.add({ color: 'success', title: `Saved ${results.length} ${results.length === 1 ? 'result' : 'results'}` })
    if (!testId.value) await router.replace(`/milk/tests/${test.id}`)
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save test', description: (e as Error).message })
  }
}

// Fill the form from a DHI doe report PDF: each doe's line for this test date.
const reportInput = ref<HTMLInputElement>()
const readingReport = ref(false)
async function fillFromReport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  readingReport.value = true
  try {
    let report
    try {
      report = parseDhiReport(await readPdfText(await file.arrayBuffer()))
    } catch (e) {
      // pdf.js names what was wrong with the file; anything else is the reader
      // itself not loading, e.g. offline before it was ever downloaded.
      const name = (e as Error | undefined)?.name
      if (name !== 'InvalidPDFException' && name !== 'PasswordException' && name !== 'FormatError')
        return toast.add({
          color: 'error',
          title: "Couldn't open the PDF reader",
          description: 'It downloads the first time it is used. Try again with a signal.',
        })
      report = null
    }
    if (!report?.does.length)
      return toast.add({
        color: 'error',
        title: 'No does found in that PDF',
        description: "It should be the DHI report's doe pages, saved or printed as a PDF, not a scan or photo.",
      })
    // A new test takes the report's date; an existing one keeps its own.
    if (!testId.value && report.testDate) {
      form.tested_on = report.testDate
      form.kind = 'dhir'
      await nextTick()
    }
    const herdGoats = goats.data.value ?? []
    const filled: string[] = []
    const notInHerd: string[] = []
    const noTest: string[] = []
    const twice: string[] = []
    for (const d of report.does) {
      // Her registration first. Failing that, her DHIR sample number (the
      // report's DOE NO.) or barn name, but never a goat registered as someone else.
      const unregisteredOrSame = (g: (typeof herdGoats)[number]) => {
        const own = registrationDigits(g.registration_number)
        return !own || !d.registration || own === d.registration
      }
      const goat =
        herdGoats.find((g) => d.registration && registrationDigits(g.registration_number) === d.registration) ??
        herdGoats.find((g) => unregisteredOrSame(g) && d.doeNumber !== null && g.dhir_sample_number === d.doeNumber) ??
        herdGoats.find((g) => unregisteredOrSame(g) && (g.barn_name ?? '').toUpperCase() === d.name.toUpperCase())
      if (!goat) {
        notInHerd.push(d.name)
        continue
      }
      if (filled.includes(goat.id)) {
        twice.push(`${d.name} (also matched ${goat.barn_name || goatName(goat)})`)
        continue
      }
      const t = d.tests.find((x) => x.date === form.tested_on)
      if (!t) {
        noTest.push(goat.barn_name || goatName(goat))
        continue
      }
      // Pounds as printed, in the herd's unit: milk to the hundredth like a loaded test.
      const lb = (n: number | null, places = totalPlaces.value) =>
        n === null ? '' : toInput(Math.round(n * 453.59237), places)
      rows[goat.id] = {
        ...blankRow(),
        milk: lb(t.milkLb, 2),
        fat: t.fatPct === null ? '' : String(t.fatPct),
        protein: t.proteinPct === null ? '' : String(t.proteinPct),
        snf: t.snfPct === null ? '' : String(t.snfPct),
        scc: sccInput(t.scc),
        ltdMilk: lb(t.toDate.milkLb),
        ltdFat: lb(t.toDate.fatLb),
        ltdProtein: lb(t.toDate.proteinLb),
        ltdSnf: lb(t.toDate.snfLb),
        projMilk: lb(t.projected305.milkLb),
        projFat: lb(t.projected305.fatLb),
        projProtein: lb(t.projected305.proteinLb),
        projSnf: lb(t.projected305.snfLb),
      }
      filled.push(goat.id)
    }
    if (!filled.length)
      return toast.add({
        color: 'error',
        title: `The report has no tests on ${formatDate(form.tested_on)}`,
        description: report.testDate ? `Its test date is ${formatDate(report.testDate)}.` : undefined,
      })
    const notes = [
      notInHerd.length ? `Not found in your herd: ${notInHerd.join(', ')}.` : '',
      noTest.length ? `No test that day: ${noTest.join(', ')}.` : '',
      twice.length ? `Skipped, matched a doe already filled: ${twice.join(', ')}.` : '',
    ]
    toast.add({
      color: notInHerd.length || twice.length ? 'warning' : 'success',
      title: `Filled ${filled.length} ${filled.length === 1 ? 'doe' : 'does'} from the report`,
      description: [...notes, 'Check the numbers, then save.'].filter(Boolean).join(' '),
    })
  } finally {
    readingReport.value = false
  }
}

const confirmDelete = ref(false)
async function onDelete() {
  await remove.mutateAsync(testId.value!)
  await router.replace('/milk/tests')
}
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
      <h1 class="text-2xl font-semibold flex-1">{{ testId ? 'Milk test' : 'Add test day' }}</h1>
      <UButton v-if="testId" color="error" variant="ghost" icon="i-lucide-trash-2" @click="confirmDelete = true"
        >Delete</UButton
      >
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <UCard>
        <div class="grid sm:grid-cols-4 gap-3">
          <UFormField label="Test date" required>
            <UInput v-model="form.tested_on" type="date" :max="todayISO()" required class="w-full" />
          </UFormField>
          <UFormField label="Kind">
            <USelect v-model="form.kind" :items="kindOptions" class="w-full" />
          </UFormField>
          <UFormField label="Lab">
            <UInput v-model="form.lab" maxlength="100" class="w-full" />
          </UFormField>
          <UFormField label="Tester">
            <UInput v-model="form.tester" maxlength="100" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-semibold flex-1">Results</h2>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-file-up"
              :loading="readingReport"
              @click="reportInput?.click()"
              >Fill from DHI report</UButton
            >
            <input
              ref="reportInput"
              type="file"
              accept="application/pdf,.pdf"
              class="sr-only"
              tabindex="-1"
              aria-hidden="true"
              @change="fillFromReport"
            />
          </div>
          <p class="text-sm text-muted mt-1">
            Milk is the whole test day for each doe. Leave a doe blank to skip her. SCC can be typed as 450, 450k or
            1.2M. A DHI report PDF fills in each doe's line for this test date.
          </p>
        </template>
        <p v-if="!does.length" class="p-4 text-muted">No does in milk on this date.</p>
        <template v-else>
          <div
            v-for="g in does"
            :key="g!.id"
            class="border-t border-default first:border-t-0 px-4 py-3 space-y-2"
            :data-doe="g!.barn_name || goatName(g!)"
          >
            <p class="font-medium">{{ g!.barn_name || goatName(g!) }}</p>
            <div class="grid grid-cols-2 gap-x-3 gap-y-2 sm:max-w-md">
              <label
                v-for="f in [
                  { key: 'milk', label: `Milk (${unit})`, aria: 'milk' },
                  { key: 'fat', label: 'Butterfat %', aria: 'butterfat' },
                  { key: 'protein', label: 'Protein %', aria: 'protein' },
                  { key: 'snf', label: 'SNF %', aria: 'SNF' },
                ] as const"
                :key="f.key"
                class="block text-xs text-muted space-y-0.5"
              >
                <span>{{ f.label }}</span>
                <UInput
                  v-model="rows[g!.id]![f.key]"
                  inputmode="decimal"
                  class="w-full"
                  :aria-label="`${g!.barn_name || goatName(g!)} ${f.aria}`"
                />
              </label>
              <label class="block text-xs text-muted space-y-0.5">
                <span>SCC</span>
                <UInput
                  v-model="rows[g!.id]!.scc"
                  class="w-full"
                  :color="
                    typeof parseScc(rows[g!.id]!.scc) === 'number' &&
                    (parseScc(rows[g!.id]!.scc) as number) >= SCC_LIMIT
                      ? 'warning'
                      : undefined
                  "
                  :highlight="
                    typeof parseScc(rows[g!.id]!.scc) === 'number' &&
                    (parseScc(rows[g!.id]!.scc) as number) >= SCC_LIMIT
                  "
                  :aria-label="`${g!.barn_name || goatName(g!)} SCC`"
                />
              </label>
            </div>

            <div
              v-if="form.kind === 'dhir' || totalsSummary(rows[g!.id]!)"
              class="rounded-md border border-default sm:max-w-md"
            >
              <button
                type="button"
                class="w-full flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-2 text-sm text-start"
                :aria-expanded="!!totalsOpen[g!.id]"
                @click="totalsOpen[g!.id] = !totalsOpen[g!.id]"
              >
                <UIcon
                  name="i-lucide-chevron-right"
                  class="text-muted transition-transform"
                  :class="totalsOpen[g!.id] ? 'rotate-90' : ''"
                />
                <span class="font-medium">Report totals</span>
                <span v-if="totalsSummary(rows[g!.id]!)" class="text-muted tabular-nums">{{
                  totalsSummary(rows[g!.id]!)
                }}</span>
                <span v-else class="text-muted">not entered · her star uses an estimate</span>
              </button>
              <div v-if="totalsOpen[g!.id]" class="px-3 pb-3 space-y-2">
                <div class="grid grid-cols-2 gap-x-3">
                  <fieldset
                    v-for="group in [
                      { title: `Lactation to date (${unit})`, aria: 'to date', fields: TOTALS.slice(0, 4) },
                      { title: `Projected 305 day (${unit})`, aria: 'projected 305', fields: TOTALS.slice(4) },
                    ]"
                    :key="group.title"
                    class="min-w-0 space-y-2"
                  >
                    <legend class="text-xs font-semibold pb-1">{{ group.title }}</legend>
                    <label v-for="f in group.fields" :key="f.key" class="block text-xs text-muted space-y-0.5">
                      <span>{{ f.label }}</span>
                      <UInput
                        v-model="rows[g!.id]![f.key]"
                        inputmode="decimal"
                        class="w-full"
                        :aria-label="`${g!.barn_name || goatName(g!)} ${group.aria} ${f.label.toLowerCase()}`"
                      />
                    </label>
                  </fieldset>
                </div>
                <p class="text-xs text-muted">
                  From the DHI report. Leave any blank that isn't on it; projected 305 is only printed while she's in
                  milk.
                </p>
              </div>
            </div>
            <p v-if="rows[g!.id]!.error" class="text-xs text-error">{{ rows[g!.id]!.error }}</p>
          </div>
        </template>
      </UCard>

      <NotesField v-model="form.notes" />
      <UAlert
        v-if="save.isPaused.value"
        color="warning"
        variant="subtle"
        icon="i-lucide-wifi-off"
        title="No signal. This test will save as soon as you are back online."
        description="Keep this screen open until it does."
      />
      <UButton type="submit" size="lg" :loading="save.isPending.value">Save test</UButton>
    </form>

    <UModal
      v-model:open="confirmDelete"
      title="Delete this test?"
      description="Its results for every doe are deleted too."
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="confirmDelete = false">Cancel</UButton>
          <UButton color="error" :loading="remove.isPending.value" @click="onDelete">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
