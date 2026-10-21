<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHerdGoats } from '@/composables/useGoats'
import { useLactationMutations, useLactations } from '@/composables/useMilk'
import { todayISO } from '@/lib/dates'
import { CURRENT_STATUSES, goatFullName } from '@/lib/goats'
import { lactationOn, nextLactationNumber, type Lactation } from '@/lib/milk'

const props = defineProps<{
  /** Edit this lactation; otherwise start a new one. */
  lactation?: Lactation
  /** Fix the doe (from her page); otherwise pick one. */
  goatId?: string
  /** Default freshening or dry-off date. */
  date?: string
  /** Just ask for a dry-off date. */
  mode?: 'start' | 'edit' | 'dryOff'
}>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { goats, byId } = useHerdGoats()
const lactations = useLactations()
const { save, remove } = useLactationMutations()

const mode = computed(() => props.mode ?? (props.lactation ? 'edit' : 'start'))

const form = reactive({
  goat_id: '' as string,
  lactation_number: 1,
  freshened_on: todayISO(),
  dried_off_on: '',
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const l = props.lactation
  const goatId = l?.goat_id ?? props.goatId ?? ''
  Object.assign(form, {
    goat_id: goatId,
    lactation_number: l?.lactation_number ?? nextLactationNumber(lactations.data.value ?? [], goatId),
    freshened_on: l?.freshened_on ?? props.date ?? todayISO(),
    dried_off_on: mode.value === 'dryOff' ? (props.date ?? todayISO()) : (l?.dried_off_on ?? ''),
    notes: l?.notes ?? '',
  })
})

// Does that could freshen on the chosen date.
const doeItems = computed(() =>
  (goats.data.value ?? [])
    .filter((g) => g.sex === 'doe' && CURRENT_STATUSES.includes(g.status))
    .filter((g) => !lactationOn(lactations.data.value ?? [], g.id, form.freshened_on))
    .map((g) => ({ label: goatFullName(g), value: g.id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
)

watch(
  () => form.goat_id,
  (id) => {
    if (mode.value === 'start' && id) form.lactation_number = nextLactationNumber(lactations.data.value ?? [], id)
  },
)

const doe = computed(() => byId.value.get(form.goat_id))
const title = computed(() => {
  const name = doe.value ? doe.value.barn_name || goatFullName(doe.value) : ''
  if (mode.value === 'dryOff') return `Dry off ${name}`
  if (mode.value === 'edit') return `Lactation ${form.lactation_number}${name ? ` · ${name}` : ''}`
  return name ? `${name} freshened` : 'Add a doe to the milk line'
})

function friendly(message: string) {
  if (message.includes('lactations_no_overlap')) return 'That overlaps another lactation for this doe.'
  if (message.includes('dried_off_on')) return 'Dry-off must be on or after freshening.'
  return message
}

async function submit() {
  if (!form.goat_id) {
    toast.add({ color: 'error', title: 'Pick a doe' })
    return
  }
  try {
    await save.mutateAsync({
      id: props.lactation?.id,
      values: {
        goat_id: form.goat_id,
        lactation_number: Number(form.lactation_number),
        freshened_on: form.freshened_on,
        dried_off_on: form.dried_off_on || null,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save', description: friendly((e as Error).message) })
  }
}

async function onDelete() {
  if (!props.lactation) return
  await remove.mutateAsync(props.lactation.id)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="mode === 'dryOff' ? 'She will leave the milk line after this date. Her milk records stay.' : undefined"
  >
    <template #body>
      <form id="lactation-form" class="space-y-3" @submit.prevent="submit">
        <template v-if="mode === 'dryOff'">
          <UFormField label="Last day milked" required>
            <UInput v-model="form.dried_off_on" type="date" required class="w-full" />
          </UFormField>
        </template>
        <template v-else>
          <UFormField v-if="!goatId && !lactation" label="Doe" required>
            <UInputMenu v-model="form.goat_id" :items="doeItems" value-key="value" placeholder="Search does…" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Freshened" required>
              <UInput v-model="form.freshened_on" type="date" required class="w-full" />
            </UFormField>
            <UFormField label="Lactation #" required>
              <UInputNumber v-model="form.lactation_number" :min="1" :max="30" class="w-full" />
            </UFormField>
          </div>
          <UFormField v-if="mode === 'edit'" label="Dried off" hint="Leave blank while in milk">
            <UInput v-model="form.dried_off_on" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" :rows="2" autoresize class="w-full" />
          </UFormField>
        </template>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="mode === 'edit'" color="error" variant="ghost" :loading="remove.isPending.value" @click="onDelete">
          Delete
        </UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="lactation-form" :loading="save.isPending.value">
          {{ mode === 'dryOff' ? 'Dry off' : 'Save' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
