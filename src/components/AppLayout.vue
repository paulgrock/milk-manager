<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHerd } from '@/composables/useHerd'

const { herd, herdId, memberships, selectHerd, isOwner } = useHerd()
const online = useOnline()
const route = useRoute()

type NavItem = NavigationMenuItem & { to: string; label: string; icon: string }

// The sections used every day, kept one tap away in the phone's tab bar.
const tabs: NavItem[] = [
  { label: 'Today', icon: 'i-lucide-sun', to: '/', exact: true },
  { label: 'Milk', icon: 'i-lucide-milk', to: '/milk' },
  { label: 'Goats', icon: 'i-lucide-list', to: '/goats' },
  { label: 'Chores', icon: 'i-lucide-list-checks', to: '/chores' },
]

// Everything else sits under More on a phone.
const allMore: NavItem[] = [
  { label: 'Cheese', icon: 'i-lucide-cylinder', to: '/cheese' },
  { label: 'Breeding', icon: 'i-lucide-heart', to: '/breeding' },
  { label: 'Health', icon: 'i-lucide-stethoscope', to: '/health' },
  { label: 'Calendar', icon: 'i-lucide-calendar', to: '/calendar' },
  { label: 'Finances', icon: 'i-lucide-wallet', to: '/finances' },
]
const settings: NavItem = { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }

// Finances are owners-only, so helpers don't get the menu item.
const more = computed(() => allMore.filter((item) => item.to !== '/finances' || isOwner.value))

// The desktop sidebar lists everything, with Settings set apart at the bottom.
const sidebar = computed<NavigationMenuItem[][]>(() => [[...tabs, ...more.value], [settings]])

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)
const moreActive = computed(() => [...more.value, settings].some((item) => isActive(item.to)))

const moreOpen = ref(false)
watch(
  () => route.fullPath,
  () => (moreOpen.value = false),
)

const herdOptions = computed(() =>
  (memberships.data.value ?? []).map((m) => ({ label: m.herd.name, value: m.herd.id })),
)
</script>

<template>
  <!-- --app-nav-h is the height of the phone tab bar (64px of tabs plus its 1px top border), so other bars pinned to the bottom can sit above it. -->
  <div class="min-h-dvh flex flex-col [--app-nav-h:calc(4rem+1px+env(safe-area-inset-bottom))] lg:[--app-nav-h:0px]">
    <header class="sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur">
      <div class="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        <img
          :src="herd?.logo ?? '/favicon.svg'"
          :alt="herd?.logo ? `${herd.name} logo` : ''"
          class="size-8 rounded-[22%] object-cover"
        />
        <USelect
          v-if="herdOptions.length > 1"
          :model-value="herdId"
          :items="herdOptions"
          variant="ghost"
          class="font-semibold min-w-0"
          @update:model-value="(id: unknown) => selectHerd(String(id))"
        />
        <span v-else class="font-semibold truncate">{{ herd?.name }}</span>
        <UBadge v-if="!online" class="ml-auto shrink-0" color="warning" variant="subtle" icon="i-lucide-wifi-off">
          Offline
        </UBadge>
      </div>
    </header>

    <div class="flex-1 mx-auto w-full max-w-6xl lg:flex lg:gap-6 lg:px-4">
      <aside class="hidden lg:block w-52 shrink-0 sticky top-14 self-start py-4">
        <UNavigationMenu :items="sidebar" orientation="vertical" aria-label="Main" :ui="{ separator: 'my-2' }" />
      </aside>

      <main class="flex-1 min-w-0 p-4 pb-[calc(var(--app-nav-h)+1rem)] lg:px-0">
        <RouterView />
      </main>
    </div>

    <nav
      aria-label="Main"
      class="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-default bg-default/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul class="grid grid-cols-5 h-16">
        <li v-for="tab in tabs" :key="tab.to">
          <RouterLink
            :to="tab.to"
            :aria-current="isActive(tab.to) ? 'page' : undefined"
            class="h-full flex flex-col items-center justify-center gap-0.5 text-xs"
            :class="isActive(tab.to) ? 'text-primary' : 'text-muted'"
          >
            <UIcon :name="tab.icon" class="size-6" />
            {{ tab.label }}
          </RouterLink>
        </li>
        <li>
          <button
            type="button"
            class="w-full h-full flex flex-col items-center justify-center gap-0.5 text-xs"
            :class="moreActive ? 'text-primary' : 'text-muted'"
            :aria-expanded="moreOpen"
            @click="moreOpen = true"
          >
            <UIcon name="i-lucide-ellipsis" class="size-6" />
            More
          </button>
        </li>
      </ul>
    </nav>

    <!-- Above the tab bar: while the sheet is open the page behind it can't be tapped anyway. -->
    <UDrawer v-model:open="moreOpen" title="More" :ui="{ header: 'sr-only', overlay: 'z-30', content: 'z-30' }">
      <template #body>
        <nav aria-label="More" class="pb-[env(safe-area-inset-bottom)]">
          <ul>
            <li v-for="item in more" :key="item.to">
              <RouterLink
                :to="item.to"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                class="flex items-center gap-3 rounded-md px-3 py-3"
                :class="isActive(item.to) ? 'bg-elevated text-primary' : ''"
              >
                <UIcon :name="item.icon" class="size-5 text-muted" />
                {{ item.label }}
              </RouterLink>
            </li>
            <li class="mt-1 pt-1 border-t border-default">
              <RouterLink
                :to="settings.to"
                :aria-current="isActive(settings.to) ? 'page' : undefined"
                class="flex items-center gap-3 rounded-md px-3 py-3"
                :class="isActive(settings.to) ? 'bg-elevated text-primary' : ''"
              >
                <UIcon :name="settings.icon" class="size-5 text-muted" />
                {{ settings.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>
      </template>
    </UDrawer>
  </div>
</template>
