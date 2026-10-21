<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useGoatMutations } from '@/composables/useGoats'
import { SEX_LABELS, type Goat, type GoatSex } from '@/lib/goats'

const props = defineProps<{ sex: GoatSex; initialName: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ created: [goat: Goat] }>()

const toast = useToast()
const { saveGoat } = useGoatMutations()
const form = reactive({ title_prefix: '', registered_name: '', title_suffix: '', registration_number: '', breed: '' })

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(form, { title_prefix: '', registered_name: props.initialName, title_suffix: '', registration_number: '', breed: '' })
  }
})

async function submit() {
  try {
    const goat = await saveGoat.mutateAsync({
      values: {
        sex: props.sex,
        status: 'reference',
        title_prefix: form.title_prefix.trim() || null,
        registered_name: form.registered_name.trim(),
        title_suffix: form.title_suffix.trim() || null,
        registration_number: form.registration_number.trim() || null,
        breed: form.breed.trim() || null,
      },
    })
    emit('created', goat)
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not add goat', description: (e as Error).message })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Add an outside ${SEX_LABELS[sex].toLowerCase()}`"
    description="Saved as a reference goat so the pedigree can link to it. You can fill in its own parents later."
  >
    <template #body>
      <form id="quick-add-goat" class="space-y-3" @submit.prevent="submit">
        <UFormField label="Registered name" required>
          <UInput v-model="form.registered_name" required autofocus class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Title before" hint="e.g. GCH">
            <UInput v-model="form.title_prefix" class="w-full" />
          </UFormField>
          <UFormField label="Title after" hint="e.g. +*B">
            <UInput v-model="form.title_suffix" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Registration #">
            <UInput v-model="form.registration_number" class="w-full" />
          </UFormField>
          <UFormField label="Breed">
            <UInput v-model="form.breed" class="w-full" />
          </UFormField>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="quick-add-goat" :loading="saveGoat.isPending.value">Add</UButton>
      </div>
    </template>
  </UModal>
</template>
