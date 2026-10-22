<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useLactations, useMilkDay } from '@/composables/useMilk'
import { useMilkTestMutations, useMilkTests, type ResultInput } from '@/composables/useMilkTests'
import { todayISO } from '@/lib/dates'
import { SCC_LIMIT, TEST_KIND_LABELS, formatScc, parseScc, type MilkTestKind } from '@/lib/dhia'
import { goatName } from '@/lib/goats'
import { formatWeight, lactationOn, parseWeightInput } from '@/lib/milk'

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
type Row = { milk: string; fat: string; protein: string; scc: string; error: string }
const rows = reactive<Record<string, Row>>({})
const blankRow = (): Row => ({ milk: '', fat: '', protein: '', scc: '', error: '' })

const loaded = ref<string>()
watch(
  existing,
  (t) => {
    if (!t || loaded.value === t.id) return
    Object.assign(form, { tested_on: t.tested_on, kind: t.kind, lab: t.lab ?? '', tester: t.tester ?? '', notes: t.notes ?? '' })
    for (const r of data.value.results.filter((x) => x.test_id === t.id)) {
      rows[r.goat_id] = {
        milk: r.milk_g === null ? '' : String(Math.round((r.milk_g / (unit.value === 'lb' ? 453.59237 : 1000)) * 100) / 100),
        fat: r.butterfat_pct === null ? '' : String(Number(r.butterfat_pct)),
        protein: r.protein_pct === null ? '' : String(Number(r.protein_pct)),
        scc: r.scc === null ? '' : formatScc(r.scc),
        error: '',
      }
    }
    loaded.value = t.id
  },
  { immediate: true },
)

// Does on test: everyone in milk that day, plus anyone already with a result.
const does = computed(() => {
  const ids = new Set(
    (goats.data.value ?? []).filter((g) => lactationOn(lactations.data.value ?? [], g.id, form.tested_on)).map((g) => g.id),
  )
  for (const id of Object.keys(rows)) if (rows[id] && Object.values(rows[id]).some((v) => v)) ids.add(id)
  return [...ids]
    .map((id) => byId.value.get(id))
    .filter((g) => !!g)
    .sort((a, b) => (a!.barn_name || goatName(a!)).localeCompare(b!.barn_name || goatName(b!)))
})
watch(does, (list) => {
  for (const g of list) rows[g!.id] ??= blankRow()
}, { immediate: true })

// A new test starts with each doe's milk weights from that day, if there are any.
const day = useMilkDay(() => form.tested_on)
// Runs when the day's weights or the does list loads, whichever is last.
watch(
  [() => day.data.value, does],
  ([dayRows]) => {
    if (testId.value || !dayRows) return
    for (const g of does.value) {
      const total = dayRows.filter((r) => r.goat_id === g!.id).reduce((s, r) => s + r.weight_g, 0)
      const row = rows[g!.id]
      if (row && !row.milk && total) row.milk = formatWeight(total, unit.value).replace(/,/g, '')
    }
  },
  { immediate: true },
)

const kindOptions = Object.entries(TEST_KIND_LABELS).map(([value, label]) => ({ label, value }))

function parsePct(text: string): number | null | 'invalid' {
  if (!text.trim()) return null
  const n = Number(text.replace(',', '.').replace('%', ''))
  return Number.isFinite(n) && n >= 0.5 && n <= 15 ? n : 'invalid'
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
    const scc = parseScc(row.scc)
    if (milk.kind === 'invalid' || (milk.kind === 'ok' && milk.portions)) row.error = 'Milk should be one weight for the whole test day'
    else if (fat === 'invalid' || protein === 'invalid') row.error = 'Percentages should be between 0.5 and 15'
    else if (scc === 'invalid') row.error = 'SCC like 450, 450k or 1.2M'
    if (row.error) {
      ok = false
      continue
    }
    const milkG = milk.kind === 'ok' ? milk.grams : null
    if (milkG === null && fat === null && protein === null && scc === null) continue
    results.push({ goat_id: g!.id, milk_g: milkG, butterfat_pct: fat as number | null, protein_pct: protein as number | null, scc: scc as number | null })
  }
  if (!ok) return toast.add({ color: 'error', title: 'Fix the highlighted does' })
  try {
    const test = await save.mutateAsync({
      id: testId.value,
      test: { tested_on: form.tested_on, kind: form.kind, lab: form.lab.trim() || null, tester: form.tester.trim() || null, notes: form.notes.trim() || null },
      results,
    })
    toast.add({ color: 'success', title: `Saved ${results.length} ${results.length === 1 ? 'result' : 'results'}` })
    if (!testId.value) await router.replace(`/milk/tests/${test.id}`)
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save test', description: (e as Error).message })
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
      <UButton to="/milk/tests" color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back to milk tests" />
      <h1 class="text-2xl font-semibold flex-1">{{ testId ? 'Milk test' : 'Add test day' }}</h1>
      <UButton v-if="testId" color="error" variant="ghost" icon="i-lucide-trash-2" @click="confirmDelete = true">Delete</UButton>
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
          <h2 class="font-semibold">Results</h2>
          <p class="text-sm text-muted">Milk is the whole test day for each doe. Leave a doe blank to skip her. SCC can be typed as 450, 450k or 1.2M.</p>
        </template>
        <p v-if="!does.length" class="p-4 text-muted">No does in milk on this date.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-muted">
                <th class="px-3 py-2 text-start font-normal">Doe</th>
                <th class="px-2 py-2 text-start font-normal">Milk ({{ unit }})</th>
                <th class="px-2 py-2 text-start font-normal">Butterfat %</th>
                <th class="px-2 py-2 text-start font-normal">Protein %</th>
                <th class="px-2 py-2 text-start font-normal">SCC</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="g in does" :key="g!.id">
                <tr class="border-t border-default">
                  <td class="px-3 py-2 font-medium whitespace-nowrap">{{ g!.barn_name || goatName(g!) }}</td>
                  <td class="px-2 py-1"><UInput v-model="rows[g!.id]!.milk" inputmode="decimal" class="w-24" :aria-label="`${g!.barn_name || goatName(g!)} milk`" /></td>
                  <td class="px-2 py-1"><UInput v-model="rows[g!.id]!.fat" inputmode="decimal" class="w-20" :aria-label="`${g!.barn_name || goatName(g!)} butterfat`" /></td>
                  <td class="px-2 py-1"><UInput v-model="rows[g!.id]!.protein" inputmode="decimal" class="w-20" :aria-label="`${g!.barn_name || goatName(g!)} protein`" /></td>
                  <td class="px-2 py-1">
                    <UInput
                      v-model="rows[g!.id]!.scc"
                      class="w-24"
                      :color="typeof parseScc(rows[g!.id]!.scc) === 'number' && (parseScc(rows[g!.id]!.scc) as number) >= SCC_LIMIT ? 'warning' : undefined"
                      :highlight="typeof parseScc(rows[g!.id]!.scc) === 'number' && (parseScc(rows[g!.id]!.scc) as number) >= SCC_LIMIT"
                      :aria-label="`${g!.barn_name || goatName(g!)} SCC`"
                    />
                  </td>
                </tr>
                <tr v-if="rows[g!.id]!.error">
                  <td colspan="5" class="px-3 pb-2 text-xs text-error">{{ rows[g!.id]!.error }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </UCard>

      <UFormField label="Notes"><UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" /></UFormField>
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

    <UModal v-model:open="confirmDelete" title="Delete this test?" description="Its results for every doe are deleted too.">
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="confirmDelete = false">Cancel</UButton>
          <UButton color="error" :loading="remove.isPending.value" @click="onDelete">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
