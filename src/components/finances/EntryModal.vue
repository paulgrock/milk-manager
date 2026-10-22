<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useFinanceMutations } from '@/composables/useFinances'
import { todayISO } from '@/lib/dates'
import { CATEGORIES, parseMoney, type FinanceEntry, type FinanceKind } from '@/lib/finances'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

export interface EntryDraft {
  kind?: FinanceKind
  category?: string
  occurred_on?: string
  amount_cents?: number
  description?: string
  goat_id?: string
  breeding_id?: string
}

const props = defineProps<{ entry?: FinanceEntry; draft?: EntryDraft }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { save, remove } = useFinanceMutations()

const form = reactive({
  kind: 'expense' as FinanceKind,
  category: 'feed',
  occurred_on: todayISO(),
  amount: '',
  description: '',
  party: '',
  goat_id: null as string | null,
  breeding_id: null as string | null,
  notes: '',
})

// Immediate: the goat page can mount this already open (offering to record a sale).
watch(open, fill, { immediate: true })
function fill(isOpen: boolean) {
  if (!isOpen) return
  const e = props.entry
  const d = props.draft ?? {}
  Object.assign(form, {
    kind: e?.kind ?? d.kind ?? 'expense',
    category: e?.category ?? d.category ?? (d.kind === 'income' ? 'milk' : 'feed'),
    occurred_on: e?.occurred_on ?? d.occurred_on ?? todayISO(),
    amount: e ? (e.amount_cents / 100).toFixed(2) : d.amount_cents ? (d.amount_cents / 100).toFixed(2) : '',
    description: e?.description ?? d.description ?? '',
    party: e?.party ?? '',
    goat_id: e?.goat_id ?? d.goat_id ?? null,
    breeding_id: e?.breeding_id ?? d.breeding_id ?? null,
    notes: e?.notes ?? '',
  })
}

const kindOptions = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
]
const categoryOptions = computed(() => Object.entries(CATEGORIES[form.kind]).map(([value, label]) => ({ label, value })))
watch(
  () => form.kind,
  (kind) => {
    if (!(form.category in CATEGORIES[kind])) form.category = Object.keys(CATEGORIES[kind])[0]!
  },
)

async function submit() {
  const cents = parseMoney(form.amount)
  if (cents === null || cents === 'invalid') return toast.add({ color: 'error', title: 'Amount should be like 75 or 1,200.50' })
  try {
    await save.mutateAsync({
      id: props.entry?.id,
      values: {
        kind: form.kind,
        category: form.category,
        occurred_on: form.occurred_on,
        amount_cents: cents,
        description: form.description.trim() || null,
        party: form.party.trim() || null,
        goat_id: form.goat_id,
        breeding_id: form.breeding_id,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save', description: (e as Error).message })
  }
}

async function onDelete() {
  await remove.mutateAsync(props.entry!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="entry ? 'Edit entry' : form.kind === 'income' ? 'Add income' : 'Add expense'">
    <template #body>
      <form id="entry-form" class="space-y-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Type">
            <USelect v-model="form.kind" :items="kindOptions" class="w-full" />
          </UFormField>
          <UFormField label="Category">
            <USelect v-model="form.category" :items="categoryOptions" class="w-full" />
          </UFormField>
          <UFormField label="Date" required>
            <UInput v-model="form.occurred_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Amount" required>
            <UInput v-model="form.amount" inputmode="decimal" placeholder="0.00" required class="w-full">
              <template #leading><span class="text-muted">$</span></template>
            </UInput>
          </UFormField>
        </div>
        <UFormField label="What for">
          <UInput v-model="form.description" maxlength="200" placeholder="50 lb alfalfa pellets, doeling to the Smiths…" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="form.kind === 'income' ? 'From' : 'Paid to'">
            <UInput v-model="form.party" maxlength="100" class="w-full" />
          </UFormField>
          <UFormField label="Goat" hint="Optional">
            <HerdGoatPicker v-model="form.goat_id" sex="any" include-former />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="entry" color="error" variant="ghost" @click="onDelete">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="entry-form" :loading="save.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
