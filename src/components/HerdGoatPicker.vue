<script setup lang="ts">
import { computed } from 'vue'
import { useHerdGoats } from '@/composables/useGoats'
import { CURRENT_STATUSES, goatFullName } from '@/lib/goats'

/** Picks a goat in the current herd: does by default, or any sex. */
const props = withDefaults(
  defineProps<{
    sex?: 'doe' | 'any'
    placeholder?: string
    /** Also list sold and deceased goats (never outside reference goats). */
    includeFormer?: boolean
  }>(),
  { sex: 'doe', placeholder: undefined, includeFormer: false },
)
const model = defineModel<string | null>({ required: true })
const { goats } = useHerdGoats()

const items = computed(() =>
  (goats.data.value ?? [])
    .filter((g) => props.sex === 'any' || g.sex === props.sex)
    .filter((g) => (props.includeFormer ? g.status !== 'reference' : CURRENT_STATUSES.includes(g.status)))
    .map((g) => ({ label: g.barn_name ? `${g.barn_name} (${goatFullName(g)})` : goatFullName(g), value: g.id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
)
</script>

<template>
  <!-- Wait for the herd: given an id it has no item for yet, the menu shows the raw id. -->
  <USkeleton v-if="goats.isPending.value" class="h-8 w-full" />
  <UInputMenu
    v-else
    :model-value="model ?? undefined"
    :items="items"
    value-key="value"
    :placeholder="placeholder ?? (sex === 'doe' ? 'Search does…' : 'Search goats…')"
    class="w-full"
    @update:model-value="(v: unknown) => (model = (v as string) ?? null)"
  />
</template>
