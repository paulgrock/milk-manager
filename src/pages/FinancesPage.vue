<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useBreedingData } from '@/composables/useBreeding'
import { useFinances } from '@/composables/useFinances'
import { useChartTheme } from '@/composables/useChartTheme'
import { formatDate, todayISO } from '@/lib/dates'
import { goatFullName, goatName } from '@/lib/goats'
import { categoryLabel, formatMoney, toCsv, yearSummary, type FinanceEntry } from '@/lib/finances'
import EntryModal, { type EntryDraft } from '@/components/finances/EntryModal.vue'

const { herd, isOwner } = useHerd()
const { byId } = useHerdGoats()
const { data: breeding } = useBreedingData()
const { query, entries } = useFinances()
const theme = useChartTheme()

const thisYear = Number(todayISO().slice(0, 4))
const year = ref(thisYear)
const years = computed(() => {
  const found = new Set([thisYear, ...entries.value.map((e) => Number(e.occurred_on.slice(0, 4)))])
  return [...found].sort((a, b) => b - a).map((y) => ({ label: String(y), value: y }))
})

const summary = computed(() => yearSummary(entries.value, year.value))
const yearEntries = computed(() => entries.value.filter((e) => Number(e.occurred_on.slice(0, 4)) === year.value))
const maxCategory = computed(() => Math.max(1, ...summary.value.byCategory.map((c) => c.cents)))
const monthName = (m: number) => new Date(2026, m - 1, 1).toLocaleDateString(undefined, { month: 'short' })
const activeMonths = computed(() => summary.value.byMonth.filter((m) => m.income || m.expense))

const goatLabel = (id: string | null) => {
  const g = id ? byId.value.get(id) : undefined
  return g ? g.barn_name || goatName(g) : undefined
}

// Stud fees typed into breedings that aren't in the books yet.
const unrecordedFees = computed(() => {
  const recorded = new Set(entries.value.map((e) => e.breeding_id).filter(Boolean))
  return breeding.value.breedings
    .filter((b) => b.service_fee_cents && !recorded.has(b.id))
    .sort((a, b) => b.bred_on.localeCompare(a.bred_on))
})

const modal = ref<{ open: boolean; entry?: FinanceEntry; draft?: EntryDraft }>({ open: false })
function recordFee(b: (typeof unrecordedFees.value)[number]) {
  const buck = b.buck_id ? byId.value.get(b.buck_id) : undefined
  modal.value = {
    open: true,
    draft: {
      kind: 'expense',
      category: 'stud_fee',
      occurred_on: b.bred_on,
      amount_cents: b.service_fee_cents!,
      description: `Stud fee${buck ? `: ${goatFullName(buck)}` : ''}`,
      goat_id: b.doe_id,
      breeding_id: b.id,
    },
  }
}

function downloadCsv() {
  const csv = toCsv(yearEntries.value, (id) => goatLabel(id))
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${(herd.value?.name ?? 'herd').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-finances-${year.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Finances</h1>
      <template v-if="isOwner">
        <USelect v-model="year" :items="years" class="w-28" aria-label="Year" />
        <UButton variant="soft" icon="i-lucide-download" :disabled="!yearEntries.length" @click="downloadCsv">CSV</UButton>
        <UButton variant="soft" icon="i-lucide-plus" @click="modal = { open: true, draft: { kind: 'income' } }">Income</UButton>
        <UButton icon="i-lucide-plus" @click="modal = { open: true, draft: { kind: 'expense' } }">Expense</UButton>
      </template>
    </div>

    <UAlert v-if="!isOwner" color="neutral" variant="subtle" icon="i-lucide-lock" title="Only owners can see finances." />

    <template v-else-if="query.isPending.value">
      <USkeleton class="h-24 w-full" />
    </template>

    <template v-else>
      <div class="grid grid-cols-3 gap-3">
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Income {{ year }}</p>
          <p class="text-xl sm:text-2xl font-semibold">{{ formatMoney(summary.income) }}</p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">Expenses {{ year }}</p>
          <p class="text-xl sm:text-2xl font-semibold">{{ formatMoney(summary.expense) }}</p>
        </UCard>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <p class="text-xs text-muted">{{ summary.net >= 0 ? 'Profit' : 'Loss' }} {{ year }}</p>
          <p class="text-xl sm:text-2xl font-semibold" :class="summary.net < 0 ? 'text-error' : ''">
            {{ summary.net < 0 ? '−' : '' }}{{ formatMoney(Math.abs(summary.net)) }}
          </p>
        </UCard>
      </div>

      <UAlert
        v-if="unrecordedFees.length"
        color="primary"
        variant="subtle"
        icon="i-lucide-heart"
        :title="`${unrecordedFees.length} stud ${unrecordedFees.length === 1 ? 'fee' : 'fees'} from breedings not in the books yet`"
      >
        <template #description>
          <ul class="mt-2 space-y-1">
            <li v-for="b in unrecordedFees" :key="b.id" class="flex flex-wrap items-center gap-2">
              <span class="flex-1">{{ formatDate(b.bred_on) }} · {{ goatLabel(b.doe_id) }} · {{ formatMoney(b.service_fee_cents!) }}</span>
              <UButton size="xs" variant="soft" @click="recordFee(b)">Add as expense</UButton>
            </li>
          </ul>
        </template>
      </UAlert>

      <div class="grid md:grid-cols-2 gap-4 items-start">
        <UCard>
          <template #header><h2 class="font-semibold">By category</h2></template>
          <p v-if="!summary.byCategory.length" class="text-muted">Nothing recorded in {{ year }}.</p>
          <ul v-else class="space-y-2">
            <li v-for="c in summary.byCategory" :key="`${c.kind}-${c.category}`" class="text-sm">
              <div class="flex justify-between gap-2">
                <span>{{ categoryLabel(c.kind, c.category) }} <span class="text-xs text-muted">{{ c.kind }}</span></span>
                <span class="tabular-nums">{{ formatMoney(c.cents) }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-elevated overflow-hidden mt-1" aria-hidden="true">
                <div
                  class="h-full rounded-full"
                  :style="{ width: `${(c.cents / maxCategory) * 100}%`, background: c.kind === 'income' ? theme.series[0] : theme.series[1] }"
                />
              </div>
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header><h2 class="font-semibold">By month</h2></template>
          <p v-if="!activeMonths.length" class="p-4 text-muted">Nothing recorded in {{ year }}.</p>
          <table v-else class="w-full text-sm tabular-nums">
            <thead>
              <tr class="text-xs text-muted">
                <th class="px-4 py-2 text-start font-normal">Month</th>
                <th class="px-2 py-2 text-end font-normal">Income</th>
                <th class="px-2 py-2 text-end font-normal">Expenses</th>
                <th class="px-4 py-2 text-end font-normal">Net</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in activeMonths" :key="m.month" class="border-t border-default">
                <td class="px-4 py-2">{{ monthName(m.month) }}</td>
                <td class="px-2 py-2 text-end">{{ formatMoney(m.income) }}</td>
                <td class="px-2 py-2 text-end">{{ formatMoney(m.expense) }}</td>
                <td class="px-4 py-2 text-end" :class="m.income - m.expense < 0 ? 'text-error' : ''">
                  {{ m.income - m.expense < 0 ? '−' : '' }}{{ formatMoney(Math.abs(m.income - m.expense)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </UCard>
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header><h2 class="font-semibold">Entries</h2></template>
        <p v-if="!yearEntries.length" class="p-4 text-muted">No income or expenses in {{ year }} yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="e in yearEntries" :key="e.id">
            <button type="button" class="w-full flex items-center gap-3 px-4 py-2 text-start text-sm hover:bg-elevated/50" @click="modal = { open: true, entry: e }">
              <span class="w-24 shrink-0 text-muted">{{ formatDate(e.occurred_on) }}</span>
              <span class="flex-1 min-w-0">
                <span class="block truncate">{{ e.description || categoryLabel(e.kind, e.category) }}</span>
                <span class="block text-xs text-muted truncate">
                  {{ categoryLabel(e.kind, e.category) }}<template v-if="e.party"> · {{ e.party }}</template
                  ><template v-if="goatLabel(e.goat_id)"> · {{ goatLabel(e.goat_id) }}</template>
                </span>
              </span>
              <span class="tabular-nums font-medium" :class="e.kind === 'income' ? 'text-success' : ''">
                {{ e.kind === 'income' ? '+' : '−' }}{{ formatMoney(e.amount_cents) }}
              </span>
            </button>
          </li>
        </ul>
      </UCard>
    </template>

    <EntryModal v-model:open="modal.open" :entry="modal.entry" :draft="modal.draft" />
  </div>
</template>
