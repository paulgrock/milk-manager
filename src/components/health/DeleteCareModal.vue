<script setup lang="ts">
import { computed } from 'vue'
import { useCareLog, useHealthData } from '@/composables/useHealth'
import { formatDate } from '@/lib/dates'
import type { CareEvent } from '@/lib/health'

const props = defineProps<{ event?: CareEvent; goatName?: string }>()
const open = defineModel<boolean>('open', { default: false })
const { data } = useHealthData()
const { removeCare } = useCareLog()

const typeName = computed(() => data.value.careTypes.find((t) => t.id === props.event?.care_type_id)?.name ?? 'care')
const title = computed(() => `Delete ${typeName.value}?`)
const description = computed(() => {
  if (!props.event) return ''
  const who = props.goatName ? ` for ${props.goatName}` : ''
  return `This removes the ${typeName.value} logged${who} on ${formatDate(props.event.done_on)}. It can't be undone.`
})

function confirm() {
  if (props.event) removeCare(props.event.id)
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton color="error" @click="confirm">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
