<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useBreedingMutations } from '@/composables/useBreeding'
import { todayISO } from '@/lib/dates'
import type { Heat } from '@/lib/breeding'
import DoePicker from './DoePicker.vue'

const props = defineProps<{ goatId?: string; heat?: Heat }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { saveHeat, removeHeat } = useBreedingMutations()
const form = reactive({ goat_id: null as string | null, observed_on: todayISO(), signs: '' })

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(form, {
      goat_id: props.heat?.goat_id ?? props.goatId ?? null,
      observed_on: props.heat?.observed_on ?? todayISO(),
      signs: props.heat?.signs ?? '',
    })
  }
})

async function submit() {
  if (!form.goat_id) return toast.add({ color: 'error', title: 'Pick a doe' })
  try {
    await saveHeat.mutateAsync({
      id: props.heat?.id,
      values: { goat_id: form.goat_id, observed_on: form.observed_on, signs: form.signs.trim() || null },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save heat', description: (e as Error).message })
  }
}

async function remove() {
  await removeHeat.mutateAsync(props.heat!.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="heat ? 'Edit heat' : 'Log a heat'">
    <template #body>
      <form id="heat-form" class="space-y-3" @submit.prevent="submit">
        <UFormField v-if="!goatId && !heat" label="Doe" required><DoePicker v-model="form.goat_id" /></UFormField>
        <UFormField label="Seen in heat on" required>
          <UInput v-model="form.observed_on" type="date" required class="w-full" />
        </UFormField>
        <UFormField label="Signs" hint="Flagging, mucus, bleating…">
          <UInput v-model="form.signs" maxlength="500" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="heat" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="heat-form" :loading="saveHeat.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
