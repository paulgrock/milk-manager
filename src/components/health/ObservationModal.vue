<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHealthMutations } from '@/composables/useHealth'
import { useHerd } from '@/composables/useHerd'
import { todayISO } from '@/lib/dates'
import type { HealthObservation } from '@/lib/health'
import { formatWeight, parseWeightInput } from '@/lib/milk'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

const props = defineProps<{ goatId?: string; observation?: HealthObservation }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { saveObservation, removeObservation } = useHealthMutations()

const form = reactive({
  goat_id: null as string | null,
  observed_on: todayISO(),
  famacha: null as number | null,
  body_condition: 'none' as string,
  weight: '',
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const o = props.observation
  Object.assign(form, {
    goat_id: o?.goat_id ?? props.goatId ?? null,
    observed_on: o?.observed_on ?? todayISO(),
    famacha: o?.famacha ?? null,
    body_condition: o?.body_condition != null ? String(Number(o.body_condition)) : 'none',
    weight: o?.weight_g ? formatWeight(o.weight_g, unit.value) : '',
    notes: o?.notes ?? '',
  })
})

const bcsOptions = [{ label: 'Not scored', value: 'none' }, ...[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => ({ label: String(v), value: String(v) }))]

async function submit() {
  if (!form.goat_id) return toast.add({ color: 'error', title: 'Pick a goat' })
  const weight = parseWeightInput(form.weight, unit.value, { grams: 200_000, message: 'That is heavier than any goat' })
  if (weight.kind === 'invalid') return toast.add({ color: 'error', title: weight.message })
  if (weight.kind === 'ok' && weight.portions) return toast.add({ color: 'error', title: 'Weight should be one number' })
  const bcs = form.body_condition === 'none' ? null : Number(form.body_condition)
  if (form.famacha === null && bcs === null && weight.kind === 'empty') return toast.add({ color: 'error', title: 'Record at least one of FAMACHA, body condition or weight' })
  try {
    await saveObservation.mutateAsync({
      id: props.observation?.id,
      values: {
        goat_id: form.goat_id,
        observed_on: form.observed_on,
        famacha: form.famacha,
        body_condition: bcs,
        weight_g: weight.kind === 'ok' ? weight.grams : null,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save', description: (e as Error).message })
  }
}

async function remove() {
  await removeObservation.mutateAsync(props.observation!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="observation ? 'Edit health check' : 'Health check'">
    <template #body>
      <form id="observation-form" class="space-y-3" @submit.prevent="submit">
        <UFormField v-if="!goatId && !observation" label="Goat" required><HerdGoatPicker v-model="form.goat_id" sex="any" /></UFormField>
        <UFormField label="Date" required>
          <UInput v-model="form.observed_on" type="date" required class="w-full" />
        </UFormField>
        <UFormField label="FAMACHA" hint="1 red (healthy) – 5 white (anemic)">
          <div class="flex gap-1" role="radiogroup" aria-label="FAMACHA">
            <UButton
              v-for="n in 5"
              :key="n"
              :variant="form.famacha === n ? 'solid' : 'outline'"
              :color="n >= 4 ? 'error' : n === 3 ? 'warning' : 'primary'"
              role="radio"
              :aria-checked="form.famacha === n"
              :aria-label="`FAMACHA ${n}`"
              class="w-10 justify-center"
              @click="form.famacha = form.famacha === n ? null : n"
            >
              {{ n }}
            </UButton>
          </div>
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Body condition">
            <USelect v-model="form.body_condition" :items="bcsOptions" class="w-full" />
          </UFormField>
          <UFormField :label="`Weight (${unit})`">
            <UInput v-model="form.weight" inputmode="decimal" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UInput v-model="form.notes" maxlength="1000" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="observation" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="observation-form" :loading="saveObservation.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
