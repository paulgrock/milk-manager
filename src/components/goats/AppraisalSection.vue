<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useGoatMutations } from '@/composables/useGoats'
import { formatDate, todayISO } from '@/lib/dates'
import {
  APPRAISAL_CODES,
  APPRAISAL_CODE_LABELS,
  ageInYears,
  appraisalSummary,
  type Appraisal,
  type Goat,
} from '@/lib/goats'

const props = defineProps<{ goat: Goat; appraisals: Appraisal[] }>()

const toast = useToast()
const { saveAppraisal, deleteAppraisal } = useGoatMutations()

const isBuck = computed(() => props.goat.sex !== 'doe')
const codeOptions = APPRAISAL_CODES.map((c) => ({ label: `${c} · ${APPRAISAL_CODE_LABELS[c]}`, value: c }))
type Code = (typeof APPRAISAL_CODES)[number]
type Trait = 'general_appearance' | 'dairy_strength' | 'body_capacity' | 'mammary_system'
const traits = computed<{ key: Trait; label: string }[]>(() => [
  { key: 'general_appearance', label: 'General appearance' },
  { key: 'dairy_strength', label: 'Dairy strength' },
  { key: 'body_capacity', label: 'Body capacity' },
  ...(isBuck.value ? [] : [{ key: 'mammary_system' as const, label: 'Mammary system' }]),
])
const open = ref(false)
const editingId = ref<string>()
const form = reactive({
  appraised_on: todayISO(),
  general_appearance: 'V' as Code,
  dairy_strength: 'V' as Code,
  body_capacity: 'V' as Code,
  mammary_system: 'V' as Code,
  final_score: 85 as number | undefined,
  appraiser: '',
  notes: '',
})

function startAdd() {
  editingId.value = undefined
  Object.assign(form, {
    appraised_on: todayISO(),
    general_appearance: 'V',
    dairy_strength: 'V',
    body_capacity: 'V',
    mammary_system: 'V',
    final_score: 85,
    appraiser: '',
    notes: '',
  })
  open.value = true
}

function startEdit(a: Appraisal) {
  editingId.value = a.id
  Object.assign(form, {
    appraised_on: a.appraised_on,
    general_appearance: a.general_appearance,
    dairy_strength: a.dairy_strength,
    body_capacity: a.body_capacity,
    mammary_system: a.mammary_system ?? 'V',
    final_score: a.final_score,
    appraiser: a.appraiser ?? '',
    notes: a.notes ?? '',
  })
  open.value = true
}

async function submit() {
  const score = Number(form.final_score)
  if (!Number.isInteger(score) || score < 50 || score > 99) {
    toast.add({ color: 'error', title: 'Final score must be a whole number from 50 to 99' })
    return
  }
  try {
    await saveAppraisal.mutateAsync({
      id: editingId.value,
      values: {
        goat_id: props.goat.id,
        appraised_on: form.appraised_on,
        general_appearance: form.general_appearance,
        dairy_strength: form.dairy_strength,
        body_capacity: form.body_capacity,
        mammary_system: isBuck.value ? null : form.mammary_system,
        final_score: score,
        appraiser: form.appraiser.trim() || null,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save appraisal', description: (e as Error).message })
  }
}

async function remove() {
  if (!editingId.value) return
  await deleteAppraisal.mutateAsync(editingId.value)
  open.value = false
}

function ageLabel(a: Appraisal) {
  const years = ageInYears(props.goat.birth_date, a.appraised_on)
  if (years === null) return ''
  return years < 2 ? '@ < 2 yo' : `@ ${years} yo`
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="font-semibold flex-1">Linear appraisal</h2>
        <UButton size="sm" variant="soft" icon="i-lucide-plus" @click="startAdd">Add</UButton>
      </div>
    </template>

    <p v-if="!appraisals.length" class="text-muted">No appraisals recorded.</p>
    <ul v-else class="divide-y divide-default -my-2">
      <li v-for="a in appraisals" :key="a.id">
        <button type="button" class="w-full py-2 flex items-center gap-3 text-start hover:bg-elevated/50 rounded" @click="startEdit(a)">
          <span class="font-mono font-semibold text-lg">{{ appraisalSummary(a) }}</span>
          <span class="text-sm text-muted">{{ ageLabel(a) }}</span>
          <span class="ms-auto text-sm text-muted text-end">
            {{ formatDate(a.appraised_on) }}
            <template v-if="a.appraiser"><br />{{ a.appraiser }}</template>
          </span>
        </button>
      </li>
    </ul>

    <UModal v-model:open="open" :title="editingId ? 'Edit appraisal' : 'Add appraisal'">
      <template #body>
        <form id="appraisal-form" class="space-y-3" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Date" required>
              <UInput v-model="form.appraised_on" type="date" required class="w-full" />
            </UFormField>
            <UFormField label="Final score" required>
              <UInputNumber v-model="form.final_score" :min="50" :max="99" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField v-for="t in traits" :key="t.key" :label="t.label">
              <USelect v-model="form[t.key]" :items="codeOptions" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Appraiser">
            <UInput v-model="form.appraiser" class="w-full" maxlength="100" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex gap-2 w-full">
          <UButton v-if="editingId" color="error" variant="ghost" :loading="deleteAppraisal.isPending.value" @click="remove">
            Delete
          </UButton>
          <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
          <UButton type="submit" form="appraisal-form" :loading="saveAppraisal.isPending.value">Save</UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
