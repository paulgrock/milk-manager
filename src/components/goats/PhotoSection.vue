<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useGoatMutations, usePhotoUrls } from '@/composables/useGoats'
import { goatName, type Goat, type GoatPhoto } from '@/lib/goats'

const props = defineProps<{ goat: Goat; photos: GoatPhoto[] }>()

const KIND_LABELS = { conformation: 'Conformation', head: 'Head', udder: 'Udder', other: 'Other' } as const
type Kind = keyof typeof KIND_LABELS
const kindOptions = Object.entries(KIND_LABELS).map(([value, label]) => ({ label, value }))

const toast = useToast()
const { uploadPhoto, deletePhoto, setPrimaryPhoto } = useGoatMutations()
const urls = usePhotoUrls(() => props.photos.map((p) => p.storage_path))

const kind = ref<Kind>('conformation')
const fileInput = ref<HTMLInputElement>()
const viewing = ref<GoatPhoto>()
const viewerOpen = computed({
  get: () => !!viewing.value,
  set: (open) => {
    if (!open) viewing.value = undefined
  },
})

async function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  for (const [i, file] of files.entries()) {
    try {
      await uploadPhoto.mutateAsync({
        goat: props.goat,
        file,
        kind: kind.value,
        makePrimary: props.photos.length === 0 && i === 0,
      })
    } catch (e) {
      toast.add({ color: 'error', title: `Could not upload ${file.name}`, description: (e as Error).message })
    }
  }
}

async function remove(photo: GoatPhoto) {
  await deletePhoto.mutateAsync(photo)
  viewing.value = undefined
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="font-semibold flex-1">Photos</h2>
        <USelect v-model="kind" :items="kindOptions" size="sm" class="w-36" aria-label="Photo type" />
        <UButton size="sm" variant="soft" icon="i-lucide-camera" :loading="uploadPhoto.isPending.value" @click="fileInput?.click()">
          Add
        </UButton>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFiles" />
      </div>
    </template>

    <p v-if="!photos.length" class="text-muted">No photos yet.</p>
    <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
      <button
        v-for="p in photos"
        :key="p.id"
        type="button"
        class="relative aspect-square rounded-md overflow-hidden bg-elevated"
        @click="viewing = p"
      >
        <img v-if="urls[p.storage_path]" :src="urls[p.storage_path]" :alt="`${goatName(goat)}, ${KIND_LABELS[p.kind as Kind]}`" class="size-full object-cover" />
        <span class="absolute bottom-1 left-1 text-xs bg-black/60 text-white rounded px-1">{{ KIND_LABELS[p.kind as Kind] }}</span>
        <UIcon v-if="p.is_primary" name="i-lucide-star" class="absolute top-1 right-1 text-yellow-400 size-5" />
      </button>
    </div>

    <UModal v-model:open="viewerOpen" :title="viewing ? KIND_LABELS[viewing.kind as Kind] : ''" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <img v-if="viewing && urls[viewing.storage_path]" :src="urls[viewing.storage_path]" alt="" class="w-full rounded-md" />
      </template>
      <template #footer>
        <div v-if="viewing" class="flex gap-2 w-full">
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :loading="deletePhoto.isPending.value" @click="remove(viewing)">
            Delete
          </UButton>
          <UButton
            v-if="!viewing.is_primary"
            class="ms-auto"
            variant="soft"
            icon="i-lucide-star"
            :loading="setPrimaryPhoto.isPending.value"
            @click="setPrimaryPhoto.mutateAsync(viewing.id).then(() => (viewing = undefined))"
          >
            Use as main photo
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
