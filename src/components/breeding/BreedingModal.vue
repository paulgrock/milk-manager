<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useBreedingMutations } from '@/composables/useBreeding'
import { formatDate, todayISO } from '@/lib/dates'
import { METHOD_LABELS, dueWindow, type Breeding, type BreedingMethod } from '@/lib/breeding'
import DoePicker from './DoePicker.vue'
import GoatPicker from '@/components/goats/GoatPicker.vue'

const props = defineProps<{ goatId?: string; breeding?: Breeding; date?: string }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { saveBreeding, removeBreeding } = useBreedingMutations()

const form = reactive({
  doe_id: null as string | null,
  buck_id: null as string | null,
  method: 'hand' as BreedingMethod,
  bred_on: todayISO(),
  exposure_end: '',
  fee: '' as string,
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const b = props.breeding
  Object.assign(form, {
    doe_id: b?.doe_id ?? props.goatId ?? null,
    buck_id: b?.buck_id ?? null,
    method: b?.method ?? 'hand',
    bred_on: b?.bred_on ?? props.date ?? todayISO(),
    exposure_end: b?.exposure_end ?? '',
    fee: b?.service_fee_cents != null ? (b.service_fee_cents / 100).toFixed(2) : '',
    notes: b?.notes ?? '',
  })
})

const methodOptions = Object.entries(METHOD_LABELS).map(([value, label]) => ({ label, value }))
const due = computed(() =>
  form.bred_on ? dueWindow({ bred_on: form.bred_on, exposure_end: form.method === 'pen' ? form.exposure_end || null : null }) : null,
)

async function submit() {
  if (!form.doe_id) return toast.add({ color: 'error', title: 'Pick a doe' })
  const fee = form.fee.trim() ? Math.round(Number(form.fee) * 100) : null
  if (fee !== null && (!Number.isFinite(fee) || fee < 0)) return toast.add({ color: 'error', title: 'Fee must be an amount like 50 or 75.00' })
  try {
    await saveBreeding.mutateAsync({
      id: props.breeding?.id,
      values: {
        doe_id: form.doe_id,
        buck_id: form.buck_id,
        method: form.method,
        bred_on: form.bred_on,
        exposure_end: form.method === 'pen' && form.exposure_end ? form.exposure_end : null,
        service_fee_cents: fee,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save breeding', description: (e as Error).message })
  }
}

async function remove() {
  await removeBreeding.mutateAsync(props.breeding!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="breeding ? 'Edit breeding' : 'Record a breeding'">
    <template #body>
      <form id="breeding-form" class="space-y-3" @submit.prevent="submit">
        <UFormField v-if="!goatId && !breeding" label="Doe" required><DoePicker v-model="form.doe_id" /></UFormField>
        <UFormField label="Buck" hint="Type a name to add an outside buck">
          <GoatPicker v-model="form.buck_id" sex="buck" />
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Method">
            <USelect v-model="form.method" :items="methodOptions" class="w-full" />
          </UFormField>
          <UFormField :label="form.method === 'pen' ? 'Buck put in' : 'Bred on'" required>
            <UInput v-model="form.bred_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField v-if="form.method === 'pen'" label="Buck taken out">
            <UInput v-model="form.exposure_end" type="date" :min="form.bred_on" class="w-full" />
          </UFormField>
          <UFormField label="Stud fee" hint="$">
            <UInput v-model="form.fee" inputmode="decimal" placeholder="0.00" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" />
        </UFormField>
        <p v-if="due" class="text-sm text-muted">
          Due around <strong class="text-default">{{ formatDate(due.expected) }}</strong>
          ({{ formatDate(due.earliest) }} – {{ formatDate(due.latest) }})
        </p>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="breeding" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="breeding-form" :loading="saveBreeding.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
