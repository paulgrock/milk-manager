<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useGoatMutations } from '@/composables/useGoats'
import { goatName, type Goat } from '@/lib/goats'

const props = defineProps<{ goats: Goat[] }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { setMilkingOrder } = useGoatMutations()

const order = ref<Goat[]>([])
watch(open, (isOpen) => {
  if (isOpen) order.value = [...props.goats]
})

const name = (g: Goat) => g.barn_name || goatName(g)
function move(index: number, by: number) {
  const next = [...order.value]
  const [goat] = next.splice(index, 1)
  next.splice(index + by, 0, goat!)
  order.value = next
}

function save() {
  setMilkingOrder.mutate(
    order.value.map((g) => g.id),
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save the order', description: e.message }) },
  )
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Milking order" description="The order does come onto the stand. Entry follows it.">
    <template #body>
      <ol class="rounded-md border border-default divide-y divide-default">
        <li v-for="(goat, i) in order" :key="goat.id" class="flex items-center gap-2 px-3 py-1.5">
          <span class="w-6 text-sm text-muted tabular-nums">{{ i + 1 }}</span>
          <span class="flex-1 font-medium">{{ name(goat) }}</span>
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-arrow-up" :aria-label="`Move ${name(goat)} up`" :disabled="i === 0" @click="move(i, -1)" />
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-down"
            :aria-label="`Move ${name(goat)} down`"
            :disabled="i === order.length - 1"
            @click="move(i, 1)"
          />
        </li>
      </ol>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton @click="save">Save order</UButton>
      </div>
    </template>
  </UModal>
</template>
