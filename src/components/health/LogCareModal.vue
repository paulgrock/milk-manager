<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHealthData, useCareLog } from '@/composables/useHealth'
import { useHerdGoats } from '@/composables/useGoats'
import { useLactations } from '@/composables/useMilk'
import { todayISO } from '@/lib/dates'
import { CURRENT_STATUSES, goatName, type Goat } from '@/lib/goats'
import { lactationOn } from '@/lib/milk'

const props = defineProps<{ careTypeId?: string; goatIds?: string[] }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { data } = useHealthData()
const { goats } = useHerdGoats()
const lactations = useLactations()
const { logCare } = useCareLog()

const today = todayISO()
const form = reactive({ careTypeId: '', doneOn: today, dose: '', notes: '', selected: new Set<string>() })

const types = computed(() => data.value.careTypes.filter((t) => !t.archived))
const herd = computed(() =>
  (goats.data.value ?? [])
    .filter((g) => CURRENT_STATUSES.includes(g.status))
    .sort((a, b) => (a.barn_name || goatName(a)).localeCompare(b.barn_name || goatName(b))),
)

watch(open, (isOpen) => {
  if (!isOpen) return
  form.careTypeId = props.careTypeId ?? types.value[0]?.id ?? ''
  form.doneOn = today
  form.dose = ''
  form.notes = ''
  form.selected = new Set(props.goatIds ?? [])
})

const type = computed(() => types.value.find((t) => t.id === form.careTypeId))
const typeOptions = computed(() => types.value.map((t) => ({ label: t.name, value: t.id })))

const groups: { label: string; pick: (g: Goat) => boolean }[] = [
  { label: 'Everyone', pick: () => true },
  { label: 'Does', pick: (g) => g.sex === 'doe' },
  { label: 'Bucks', pick: (g) => g.sex !== 'doe' },
  { label: 'In milk', pick: (g) => !!lactationOn(lactations.data.value ?? [], g.id, today) },
]
function selectGroup(pick: (g: Goat) => boolean) {
  form.selected = new Set(herd.value.filter(pick).map((g) => g.id))
}
function toggle(id: string, on: boolean) {
  const next = new Set(form.selected)
  if (on) next.add(id)
  else next.delete(id)
  form.selected = next
}

async function submit() {
  if (!type.value) return toast.add({ color: 'error', title: 'Pick what was done' })
  if (!form.selected.size) return toast.add({ color: 'error', title: 'Pick at least one goat' })
  const dose = form.dose.trim() ? Number(form.dose.replace(',', '.')) : null
  if (dose !== null && !(dose > 0)) return toast.add({ color: 'error', title: 'Dose must be a number above 0' })
  const count = form.selected.size
  // Doesn't wait for the server: with no signal it's kept on the phone and sent later.
  void logCare({ careTypeId: type.value.id, goatIds: [...form.selected], doneOn: form.doneOn, dose, notes: form.notes }).catch((e: Error) =>
    toast.add({ color: 'error', title: 'Could not save care', description: e.message }),
  )
  toast.add({ color: 'success', title: `${type.value.name} logged for ${count} ${count === 1 ? 'goat' : 'goats'}` })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Log care">
    <template #body>
      <form id="care-form" class="space-y-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="What was done" required>
            <USelect v-model="form.careTypeId" :items="typeOptions" class="w-full" />
          </UFormField>
          <UFormField label="Date" required>
            <UInput v-model="form.doneOn" type="date" :max="today" required class="w-full" />
          </UFormField>
          <UFormField v-if="type?.dose_unit" :label="`Dose (${type.dose_unit})`" hint="Each goat">
            <UInput v-model="form.dose" inputmode="decimal" class="w-full" />
          </UFormField>
        </div>
        <!-- A fieldset, not UFormField: the field's label would become every checkbox's name. -->
        <fieldset>
          <legend class="text-sm font-medium mb-1">Goats ({{ form.selected.size }})</legend>
          <div class="flex flex-wrap gap-1 mb-2">
            <UButton v-for="g in groups" :key="g.label" size="xs" variant="soft" color="neutral" @click="selectGroup(g.pick)">
              {{ g.label }}
            </UButton>
            <UButton size="xs" variant="ghost" color="neutral" @click="form.selected = new Set()">None</UButton>
          </div>
          <div class="max-h-64 overflow-y-auto rounded-md border border-default divide-y divide-default">
            <UCheckbox
              v-for="g in herd"
              :key="g.id"
              :model-value="form.selected.has(g.id)"
              :label="g.barn_name || goatName(g)"
              class="px-3 py-2"
              @update:model-value="(on: unknown) => toggle(g.id, !!on)"
            />
          </div>
        </fieldset>
        <UFormField label="Notes">
          <UInput v-model="form.notes" maxlength="500" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="care-form">Log for {{ form.selected.size }}</UButton>
      </div>
    </template>
  </UModal>
</template>
