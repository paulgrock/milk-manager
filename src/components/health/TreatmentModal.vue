<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHealthMutations } from '@/composables/useHealth'
import { formatDate, todayISO } from '@/lib/dates'
import { ROUTE_LABELS, withholdThrough, type Treatment, type TreatmentRoute } from '@/lib/health'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

const props = defineProps<{ goatId?: string; treatment?: Treatment }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { saveTreatment, removeTreatment } = useHealthMutations()

const form = reactive({
  goat_id: null as string | null,
  started_on: todayISO(),
  ended_on: '',
  reason: '',
  medication: '',
  dose: '',
  route: 'none' as TreatmentRoute | 'none',
  lot_number: '',
  milk_withdrawal_days: 0 as number | undefined,
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const t = props.treatment
  Object.assign(form, {
    goat_id: t?.goat_id ?? props.goatId ?? null,
    started_on: t?.started_on ?? todayISO(),
    ended_on: t?.ended_on ?? '',
    reason: t?.reason ?? '',
    medication: t?.medication ?? '',
    dose: t?.dose ?? '',
    route: t?.route ?? 'none',
    lot_number: t?.lot_number ?? '',
    milk_withdrawal_days: t?.milk_withdrawal_days ?? 0,
    notes: t?.notes ?? '',
  })
})

const routeOptions = [{ label: 'Not recorded', value: 'none' }, ...Object.entries(ROUTE_LABELS).map(([value, label]) => ({ label, value }))]
const through = computed(() =>
  withholdThrough({ started_on: form.started_on, ended_on: form.ended_on || null, milk_withdrawal_days: Number(form.milk_withdrawal_days) || 0 }),
)

async function submit() {
  if (!form.goat_id) return toast.add({ color: 'error', title: 'Pick a goat' })
  try {
    await saveTreatment.mutateAsync({
      id: props.treatment?.id,
      values: {
        goat_id: form.goat_id,
        started_on: form.started_on,
        ended_on: form.ended_on || null,
        reason: form.reason.trim() || null,
        medication: form.medication.trim(),
        dose: form.dose.trim() || null,
        route: form.route === 'none' ? null : form.route,
        lot_number: form.lot_number.trim() || null,
        milk_withdrawal_days: Number(form.milk_withdrawal_days) || 0,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save treatment', description: (e as Error).message })
  }
}

async function remove() {
  await removeTreatment.mutateAsync(props.treatment!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="treatment ? 'Edit treatment' : 'Add treatment'">
    <template #body>
      <form id="treatment-form" class="space-y-3" @submit.prevent="submit">
        <UFormField v-if="!goatId && !treatment" label="Goat" required><HerdGoatPicker v-model="form.goat_id" sex="any" /></UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Medication" required class="col-span-2">
            <UInput v-model="form.medication" required maxlength="120" class="w-full" />
          </UFormField>
          <UFormField label="For" class="col-span-2">
            <UInput v-model="form.reason" maxlength="200" placeholder="Mastitis, cocci, injury…" class="w-full" />
          </UFormField>
          <UFormField label="First dose" required>
            <UInput v-model="form.started_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Last dose" hint="If more than one">
            <UInput v-model="form.ended_on" type="date" :min="form.started_on" class="w-full" />
          </UFormField>
          <UFormField label="Dose">
            <UInput v-model="form.dose" maxlength="60" placeholder="5 ml" class="w-full" />
          </UFormField>
          <UFormField label="Given">
            <USelect v-model="form.route" :items="routeOptions" class="w-full" />
          </UFormField>
          <UFormField label="Lot #">
            <UInput v-model="form.lot_number" maxlength="60" class="w-full" />
          </UFormField>
          <UFormField label="Milk withdrawal (days)">
            <UInputNumber v-model="form.milk_withdrawal_days" :min="0" :max="365" class="w-full" />
          </UFormField>
        </div>
        <UAlert
          v-if="through"
          color="warning"
          variant="subtle"
          icon="i-lucide-milk-off"
          :title="`Withhold milk through ${formatDate(through)}`"
        />
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="treatment" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="treatment-form" :loading="saveTreatment.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
