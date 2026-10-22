<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHealthData, useHealthMutations } from '@/composables/useHealth'
import { todayISO } from '@/lib/dates'
import type { DiseaseTest } from '@/lib/health'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

const COMMON = ['CAE', 'CL', "Johne's", 'TB', 'Brucellosis', 'Q fever']

const props = defineProps<{ goatId?: string; test?: DiseaseTest }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { data } = useHealthData()
const { saveTest, removeTest } = useHealthMutations()

type Result = DiseaseTest['result']
const form = reactive({ goat_id: null as string | null, tested_on: todayISO(), disease: 'CAE', result: 'negative' as Result, lab: '', notes: '' })

watch(open, (isOpen) => {
  if (!isOpen) return
  const t = props.test
  Object.assign(form, {
    goat_id: t?.goat_id ?? props.goatId ?? null,
    tested_on: t?.tested_on ?? todayISO(),
    disease: t?.disease ?? 'CAE',
    result: t?.result ?? 'negative',
    lab: t?.lab ?? '',
    notes: t?.notes ?? '',
  })
})

const diseases = computed(() => [...new Set([...COMMON, ...data.value.tests.map((t) => t.disease)])])
const resultOptions = [
  { label: 'Negative', value: 'negative' },
  { label: 'Positive', value: 'positive' },
  { label: 'Inconclusive', value: 'inconclusive' },
  { label: 'Waiting on results', value: 'pending' },
]

async function submit() {
  if (!form.goat_id) return toast.add({ color: 'error', title: 'Pick a goat' })
  try {
    await saveTest.mutateAsync({
      id: props.test?.id,
      values: { goat_id: form.goat_id, tested_on: form.tested_on, disease: form.disease.trim(), result: form.result, lab: form.lab.trim() || null, notes: form.notes.trim() || null },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save test', description: (e as Error).message })
  }
}

async function remove() {
  await removeTest.mutateAsync(props.test!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="test ? 'Edit test' : 'Disease test'">
    <template #body>
      <form id="test-form" class="space-y-3" @submit.prevent="submit">
        <UFormField v-if="!goatId && !test" label="Goat" required><HerdGoatPicker v-model="form.goat_id" sex="any" /></UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Test for" required>
            <UInputMenu v-model="form.disease" :items="diseases" create-item class="w-full" @create="(d: string) => (form.disease = d)" />
          </UFormField>
          <UFormField label="Sample taken" required>
            <UInput v-model="form.tested_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Result">
            <USelect v-model="form.result" :items="resultOptions" class="w-full" />
          </UFormField>
          <UFormField label="Lab">
            <UInput v-model="form.lab" maxlength="100" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UInput v-model="form.notes" maxlength="1000" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="test" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="test-form" :loading="saveTest.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
