<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHerdGoats } from '@/composables/useGoats'
import { STATUS_LABELS, goatFullName, type Goat, type GoatSex } from '@/lib/goats'
import QuickAddGoatModal from './QuickAddGoatModal.vue'

const props = defineProps<{ sex: GoatSex; excludeId?: string; placeholder?: string }>()
const model = defineModel<string | null>({ required: true })

const { goats } = useHerdGoats()

const items = computed(() =>
  (goats.data.value ?? [])
    .filter((g) => g.sex === props.sex && g.id !== props.excludeId)
    .map((g) => ({
      label: goatFullName(g),
      value: g.id,
      suffix: g.status === 'active' ? undefined : STATUS_LABELS[g.status],
    }))
    .sort((a, b) => a.label.localeCompare(b.label)),
)

const addOpen = ref(false)
const addName = ref('')

function onCreate(name: string) {
  addName.value = name
  addOpen.value = true
}

function onCreated(goat: Goat) {
  model.value = goat.id
}
</script>

<template>
  <div class="flex gap-1">
    <!-- Wait for the herd: given an id it has no item for yet, the menu shows the raw id. -->
    <USkeleton v-if="goats.isPending.value" class="h-8 flex-1" />
    <UInputMenu
      v-else
      :model-value="model ?? undefined"
      :items="items"
      value-key="value"
      :placeholder="placeholder ?? 'Search or add…'"
      create-item
      class="flex-1"
      @update:model-value="(v: unknown) => (model = (v as string) ?? null)"
      @create="onCreate"
    />
    <UButton v-if="model" color="neutral" variant="ghost" icon="i-lucide-x" aria-label="Clear" @click="model = null" />
    <QuickAddGoatModal v-model:open="addOpen" :sex="sex" :initial-name="addName" @created="onCreated" />
  </div>
</template>
