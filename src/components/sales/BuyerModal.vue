<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useSalesMutations } from '@/composables/useSales'
import type { Buyer } from '@/lib/sales'

const props = defineProps<{ buyer?: Buyer }>()
const open = defineModel<boolean>('open', { required: true })
const toast = useToast()
const { saveBuyer, removeBuyer } = useSalesMutations()

const form = reactive({ name: '', phone: '', email: '', town: '', notes: '' })
watch(open, (isOpen) => {
  if (!isOpen) return
  const b = props.buyer
  Object.assign(form, { name: b?.name ?? '', phone: b?.phone ?? '', email: b?.email ?? '', town: b?.town ?? '', notes: b?.notes ?? '' })
})

const blankToNull = (s: string) => s.trim() || null
async function submit() {
  if (!form.name.trim()) return toast.add({ color: 'error', title: 'Enter a name' })
  try {
    await saveBuyer.mutateAsync({
      id: props.buyer?.id,
      values: { name: form.name.trim(), phone: blankToNull(form.phone), email: blankToNull(form.email), town: blankToNull(form.town), notes: blankToNull(form.notes) },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save adopter', description: (e as Error).message })
  }
}
async function remove() {
  try {
    await removeBuyer.mutateAsync(props.buyer!.id)
    open.value = false
  } catch (e) {
    const message = (e as Error).message
    toast.add({ color: 'error', title: 'Could not delete', description: message.includes('foreign key') ? 'They have reservations or adoptions.' : message })
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="buyer ? 'Edit adopter' : 'New adopter'">
    <template #body>
      <form id="buyer-form" class="space-y-3" @submit.prevent="submit">
        <UFormField label="Name" required><UInput v-model="form.name" maxlength="100" class="w-full" /></UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Phone"><UInput v-model="form.phone" type="tel" maxlength="40" class="w-full" /></UFormField>
          <UFormField label="Email"><UInput v-model="form.email" type="email" maxlength="200" class="w-full" /></UFormField>
        </div>
        <UFormField label="Town"><UInput v-model="form.town" maxlength="100" class="w-full" /></UFormField>
        <UFormField label="Notes"><UTextarea v-model="form.notes" :rows="2" maxlength="2000" class="w-full" /></UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="buyer" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="buyer-form" :loading="saveBuyer.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
