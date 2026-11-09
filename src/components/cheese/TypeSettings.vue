<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables'
import { useCheeseMutations } from '@/composables/useCheese'
import type { CheeseType } from '@/lib/cheese'

// An owner's controls for one cheese type: name, aging time and hiding.
const props = defineProps<{ type: CheeseType }>()
const toast = useToast()
const { saveType } = useCheeseMutations()

function update(values: Partial<Pick<CheeseType, 'name' | 'aging_days' | 'hidden'>>) {
  if (values.name !== undefined && !values.name.trim()) return
  saveType.mutate(
    { id: props.type.id, values: { name: props.type.name, ...values } },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) },
  )
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3" :class="type.hidden ? 'opacity-60' : ''">
    <UInput
      :model-value="type.name"
      maxlength="60"
      class="flex-1 min-w-40"
      :aria-label="`${type.name} name`"
      @change="(e: Event) => update({ name: (e.target as HTMLInputElement).value })"
    />
    <!-- Kept together, so on a phone they wrap as one line under the name. -->
    <div class="flex items-center gap-2 ms-auto">
      <UInputNumber
        :model-value="type.aging_days"
        :min="0"
        :max="1095"
        class="w-28"
        :aria-label="`${type.name} aging days`"
        @update:model-value="(v: unknown) => update({ aging_days: Number(v) || 0 })"
      />
      <span class="text-sm text-muted">days</span>
      <UButton size="xs" color="neutral" variant="ghost" class="w-16 justify-center" @click="update({ hidden: !type.hidden })">
        {{ type.hidden ? 'Restore' : 'Hide' }}
      </UButton>
    </div>
  </div>
</template>
