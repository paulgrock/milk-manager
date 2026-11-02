<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useSalesData, useSalesMutations } from '@/composables/useSales'

/** Picks an adopter, or adds one by typing a new name. */
const model = defineModel<string | null>({ required: true })
const toast = useToast()
const { data } = useSalesData()
const { saveBuyer } = useSalesMutations()

const items = computed(() => data.value.buyers.map((b) => ({ label: b.town ? `${b.name} (${b.town})` : b.name, value: b.id })))

// A new adopter typed in: name now, contact details optional.
const draft = ref<{ name: string; phone: string; email: string }>()
async function add() {
  if (!draft.value?.name.trim()) return
  try {
    const buyer = await saveBuyer.mutateAsync({
      values: { name: draft.value.name.trim(), phone: draft.value.phone.trim() || null, email: draft.value.email.trim() || null },
    })
    model.value = buyer.id
    draft.value = undefined
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not add adopter', description: (e as Error).message })
  }
}
</script>

<template>
  <div class="space-y-2">
    <UInputMenu
      :model-value="model ?? undefined"
      :items="items"
      value-key="value"
      placeholder="Search or add an adopter…"
      create-item
      open-on-click
      class="w-full"
      aria-label="Adopter"
      @update:model-value="(v: unknown) => (model = (v as string) ?? null)"
      @create="(name: string) => (draft = { name: name.trim(), phone: '', email: '' })"
    />
    <div v-if="draft" class="rounded-md border border-default p-3 space-y-2">
      <p class="text-sm font-medium">New adopter: {{ draft.name }}</p>
      <div class="grid grid-cols-2 gap-2">
        <UInput v-model="draft.phone" type="tel" placeholder="Phone" aria-label="New adopter phone" />
        <UInput v-model="draft.email" type="email" placeholder="Email" aria-label="New adopter email" />
      </div>
      <div class="flex gap-2 justify-end">
        <UButton size="xs" color="neutral" variant="ghost" @click="draft = undefined">Cancel</UButton>
        <UButton size="xs" :loading="saveBuyer.isPending.value" @click="add">Add adopter</UButton>
      </div>
    </div>
  </div>
</template>
