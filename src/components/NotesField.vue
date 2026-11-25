<script setup lang="ts">
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

// A notes box that can be opened over the whole screen, for writing or rereading long notes on a phone.
const notes = defineModel<string>({ required: true })
defineProps<{ placeholder?: string }>()
const full = ref(false)

// The on-screen keyboard covers the page without resizing it (and iOS slides the page up behind it),
// so fit the editor to the part of the screen that's showing.
const visible = ref({ top: 0, height: 0 })
function measure() {
  const v = window.visualViewport
  visible.value = { top: v?.offsetTop ?? 0, height: v?.height ?? window.innerHeight }
}
measure()
useEventListener(window.visualViewport, ['resize', 'scroll'], measure)

function openFull() {
  measure()
  full.value = true
}
</script>

<template>
  <UFormField label="Notes">
    <template #hint>
      <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-maximize-2" @click="openFull">
        Full screen
      </UButton>
    </template>
    <UTextarea v-model="notes" :placeholder="placeholder" :rows="4" autoresize maxlength="10000" class="w-full" />
  </UFormField>

  <!-- Over the app header and tab bar, which sit above ordinary modals. -->
  <UModal v-model:open="full" title="Notes" fullscreen :ui="{ content: 'z-50' }">
    <template #content>
      <div
        class="flex flex-col pt-[env(safe-area-inset-top)]"
        :style="{ marginTop: `${visible.top}px`, height: `${visible.height}px` }"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-default px-4 py-2">
          <p class="font-semibold" aria-hidden="true">Notes</p>
          <UButton @click="full = false">Done</UButton>
        </div>
        <UTextarea
          v-model="notes"
          aria-label="Notes"
          variant="none"
          maxlength="10000"
          :placeholder="placeholder"
          :autofocus="!notes"
          class="mx-auto w-full max-w-3xl min-h-0 flex-1"
          :ui="{
            base: 'h-full resize-none overscroll-contain px-4 py-3 text-base/6 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          }"
        />
      </div>
    </template>
  </UModal>
</template>
