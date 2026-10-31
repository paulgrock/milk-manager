<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese'
import { formatDate, todayISO } from '@/lib/dates'
import { parseGallons, readyDate, type CheeseMake, type CheeseType } from '@/lib/cheese'
import { formatWeight, parseWeightInput } from '@/lib/milk'

const props = defineProps<{ make?: CheeseMake }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { data } = useCheeseData()
const { saveMake, removeMake, saveType } = useCheeseMutations()

const form = reactive({
  typeId: undefined as string | undefined,
  madeOn: todayISO(),
  readyOn: todayISO(),
  gallons: '',
  pieces: undefined as number | undefined,
  weight: '',
  notes: '',
  finished: false,
})
// The ready date follows the type and made date until it's changed by hand.
const readyEdited = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  const m = props.make
  Object.assign(form, {
    typeId: m?.cheese_type_id,
    madeOn: m?.made_on ?? todayISO(),
    readyOn: m?.ready_on ?? todayISO(),
    gallons: m?.milk_gallons != null ? String(Number(m.milk_gallons)) : '',
    pieces: m?.pieces ?? undefined,
    weight: m?.cheese_weight_g ? formatWeight(m.cheese_weight_g, 'lb') : '',
    notes: m?.notes ?? '',
    finished: !!m?.finished_on,
  })
  readyEdited.value = !!m
  newType.value = undefined
})

const types = computed(() => data.value.types.filter((t) => !t.hidden || t.id === form.typeId))
const typeItems = computed(() =>
  types.value.map((t) => ({ label: t.name, value: t.id, suffix: t.aging_months ? `${t.aging_months} mo` : 'fresh' })),
)
const type = computed(() => data.value.types.find((t) => t.id === form.typeId))

watch([() => form.typeId, () => form.madeOn], () => {
  if (!readyEdited.value && type.value && form.madeOn) form.readyOn = readyDate(form.madeOn, type.value.aging_months)
})

// A cheese that isn't in the list yet: typed into the dropdown, added here.
const newType = ref<{ name: string; months: number }>()
function onCreate(name: string) {
  newType.value = { name: name.trim(), months: 0 }
}
async function addType() {
  if (!newType.value?.name) return
  try {
    const created: CheeseType = await saveType.mutateAsync({
      values: { name: newType.value.name, aging_months: newType.value.months, sort_order: data.value.types.length + 1 },
    })
    form.typeId = created.id
    readyEdited.value = false
    form.readyOn = readyDate(form.madeOn, created.aging_months)
    newType.value = undefined
  } catch (e) {
    const message = (e as Error).message
    toast.add({ color: 'error', title: 'Could not add cheese', description: message.includes('duplicate') ? 'That cheese is already in the list.' : message })
  }
}

async function submit() {
  if (!form.typeId) return toast.add({ color: 'error', title: 'Pick the cheese' })
  if (form.readyOn < form.madeOn) return toast.add({ color: 'error', title: 'Ready date can’t be before the day it was made' })
  const gallons = parseGallons(form.gallons)
  if (!gallons.ok) return toast.add({ color: 'error', title: gallons.message })
  const weight = parseWeightInput(form.weight, 'lb', { grams: 1_000_000, message: 'That is more cheese than one make' })
  if (weight.kind === 'invalid') return toast.add({ color: 'error', title: 'Cheese weight should be in pounds, like 2.5' })
  try {
    await saveMake.mutateAsync({
      id: props.make?.id,
      values: {
        cheese_type_id: form.typeId,
        made_on: form.madeOn,
        ready_on: form.readyOn,
        milk_gallons: gallons.value,
        pieces: form.pieces || null,
        cheese_weight_g: weight.kind === 'ok' ? weight.grams : null,
        notes: form.notes.trim() || null,
        finished_on: form.finished ? (props.make?.finished_on ?? todayISO()) : null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save', description: (e as Error).message })
  }
}

async function onDelete() {
  await removeMake.mutateAsync(props.make!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="make ? 'Edit make' : 'New make'">
    <template #body>
      <form id="make-form" class="space-y-3" @submit.prevent="submit">
        <UFormField label="Cheese" required>
          <UInputMenu
            v-model="form.typeId"
            :items="typeItems"
            value-key="value"
            placeholder="Pick or type a new one…"
            create-item
            open-on-click
            class="w-full"
            @create="onCreate"
          />
        </UFormField>
        <div v-if="newType" class="rounded-md border border-default p-3 space-y-2">
          <p class="text-sm">Add <strong>{{ newType.name }}</strong> to your cheeses</p>
          <div class="flex items-end gap-2">
            <UFormField label="Usually ages (months)" class="flex-1">
              <UInputNumber v-model="newType.months" :min="0" :max="36" class="w-full" />
            </UFormField>
            <UButton :loading="saveType.isPending.value" @click="addType">Add</UButton>
            <UButton color="neutral" variant="ghost" @click="newType = undefined">Cancel</UButton>
          </div>
          <p class="text-xs text-muted">0 for fresh cheese, ready the day it’s made.</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Made" required>
            <UInput v-model="form.madeOn" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Ready" required :hint="type && !readyEdited ? (type.aging_months ? `${type.aging_months} mo` : 'fresh') : undefined">
            <UInput v-model="form.readyOn" type="date" :min="form.madeOn" required class="w-full" @update:model-value="readyEdited = true" />
          </UFormField>
          <UFormField label="Milk used" hint="Optional">
            <UInput v-model="form.gallons" inputmode="decimal" class="w-full">
              <template #trailing><span class="text-xs text-muted">gal</span></template>
            </UInput>
          </UFormField>
          <UFormField label="Wheels or pieces" hint="Optional">
            <UInputNumber v-model="form.pieces" :min="1" :max="1000" class="w-full" />
          </UFormField>
          <UFormField label="Cheese weight" hint="Optional">
            <UInput v-model="form.weight" inputmode="decimal" class="w-full">
              <template #trailing><span class="text-xs text-muted">lb</span></template>
            </UInput>
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" autoresize maxlength="2000" class="w-full" />
        </UFormField>
        <UCheckbox
          v-if="make"
          v-model="form.finished"
          :label="make.finished_on ? `Finished ${formatDate(make.finished_on)}` : 'Finished: all eaten, sold or given away'"
        />
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="make" color="error" variant="ghost" :loading="removeMake.isPending.value" @click="onDelete">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="make-form" :loading="saveMake.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
