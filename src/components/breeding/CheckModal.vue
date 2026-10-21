<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useBreedingMutations } from '@/composables/useBreeding'
import { todayISO } from '@/lib/dates'
import type { PregnancyCheck } from '@/lib/breeding'

const props = defineProps<{ breedingId: string; check?: PregnancyCheck }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { saveCheck, removeCheck } = useBreedingMutations()

type Method = PregnancyCheck['method']
type Result = PregnancyCheck['result']
const form = reactive({ checked_on: todayISO(), method: 'blood' as Method, result: 'pregnant' as Result, notes: '' })

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(form, {
      checked_on: props.check?.checked_on ?? todayISO(),
      method: props.check?.method ?? 'blood',
      result: props.check?.result ?? 'pregnant',
      notes: props.check?.notes ?? '',
    })
  }
})

const methodOptions = [
  { label: 'Blood test', value: 'blood' },
  { label: 'Ultrasound', value: 'ultrasound' },
  { label: 'Observation', value: 'observation' },
]
const resultOptions = [
  { label: 'Pregnant', value: 'pregnant' },
  { label: 'Open (not pregnant)', value: 'open' },
  { label: 'Unsure', value: 'unsure' },
]

async function submit() {
  try {
    await saveCheck.mutateAsync({
      id: props.check?.id,
      values: { breeding_id: props.breedingId, checked_on: form.checked_on, method: form.method, result: form.result, notes: form.notes.trim() || null },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save check', description: (e as Error).message })
  }
}

async function remove() {
  await removeCheck.mutateAsync(props.check!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="check ? 'Edit pregnancy check' : 'Pregnancy check'">
    <template #body>
      <form id="check-form" class="space-y-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Checked on" required>
            <UInput v-model="form.checked_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Method">
            <USelect v-model="form.method" :items="methodOptions" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Result">
          <URadioGroup v-model="form.result" :items="resultOptions" />
        </UFormField>
        <UFormField label="Notes">
          <UInput v-model="form.notes" maxlength="1000" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="check" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="check-form" :loading="saveCheck.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
