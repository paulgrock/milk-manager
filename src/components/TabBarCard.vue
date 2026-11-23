<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { usePreferences } from '@/composables/usePreferences'
import { DEFAULT_TABS, placeTab, sectionsFor, tabPaths } from '@/lib/nav'

const { isOwner } = useHerd()
const { preferences, save } = usePreferences()

const sections = computed(() => sectionsFor(isOwner.value))
const options = computed(() => sections.value.map((s) => ({ label: s.label, value: s.to, icon: s.icon })))
const tabs = computed(() => tabPaths(preferences.data.value?.nav_tabs, sections.value))
const isDefault = computed(() => tabs.value.join() === DEFAULT_TABS.join())

function pick(index: number, to: unknown) {
  if (typeof to === 'string' && to !== tabs.value[index]) save({ nav_tabs: placeTab(tabs.value, index, to) })
}
</script>

<template>
  <UCard as="section" aria-labelledby="tab-bar-heading">
    <template #header>
      <h2 id="tab-bar-heading" class="font-semibold">Tab bar</h2>
      <p class="text-sm text-muted">
        The sections along the bottom of the screen on a phone. Everything else is under More. Just for you, in every
        herd.
      </p>
    </template>

    <ol class="grid gap-3 sm:grid-cols-2">
      <li v-for="(to, i) in tabs" :key="i">
        <UFormField :label="`Tab ${i + 1}`">
          <USelect :model-value="to" :items="options" class="w-full" @update:model-value="(v: unknown) => pick(i, v)" />
        </UFormField>
      </li>
    </ol>

    <UButton
      v-if="!isDefault"
      class="mt-4"
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-lucide-rotate-ccw"
      @click="save({ nav_tabs: null })"
    >
      Back to the usual tabs
    </UButton>
  </UCard>
</template>
