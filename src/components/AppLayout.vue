<script setup lang="ts">
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHerd } from '@/composables/useHerd'

const { herd, herdId, memberships, selectHerd } = useHerd()
const online = useOnline()

const nav: NavigationMenuItem[] = [
  { label: 'Today', icon: 'i-lucide-sun', to: '/', exact: true },
  { label: 'Goats', icon: 'i-lucide-list', to: '/goats' },
  { label: 'Milk', icon: 'i-lucide-milk', to: '/milk' },
  { label: 'Breeding', icon: 'i-lucide-heart', to: '/breeding' },
  { label: 'Health', icon: 'i-lucide-stethoscope', to: '/health' },
  { label: 'Calendar', icon: 'i-lucide-calendar', to: '/calendar' },
  { label: 'Finances', icon: 'i-lucide-wallet', to: '/finances' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
]

const herdOptions = computed(() =>
  (memberships.data.value ?? []).map((m) => ({ label: m.herd.name, value: m.herd.id })),
)
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
        <img src="/favicon.svg" alt="" class="size-8" />
        <USelect
          v-if="herdOptions.length > 1"
          :model-value="herdId"
          :items="herdOptions"
          variant="ghost"
          class="font-semibold"
          @update:model-value="(id: unknown) => selectHerd(String(id))"
        />
        <span v-else class="font-semibold truncate">{{ herd?.name }}</span>
        <UBadge v-if="!online" class="ml-auto" color="warning" variant="subtle" icon="i-lucide-wifi-off">
          Offline
        </UBadge>
      </div>
      <UNavigationMenu
        :items="nav"
        class="mx-auto max-w-5xl px-2 overflow-x-auto"
        :ui="{ list: 'w-max', item: 'shrink-0', linkLabel: 'overflow-visible' }"
      />
    </header>

    <main class="flex-1 mx-auto w-full max-w-5xl p-4">
      <RouterView />
    </main>
  </div>
</template>
