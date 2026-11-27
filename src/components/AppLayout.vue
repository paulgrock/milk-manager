<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHerd } from '@/composables/useHerd'
import { usePreferences } from '@/composables/usePreferences'
import { SETTINGS, sectionsFor, tabPaths } from '@/lib/nav'

const { herd, herdId, memberships, selectHerd, isOwner } = useHerd()
const { preferences } = usePreferences()
const online = useOnline()
const route = useRoute()

// Helpers don't get the owners-only sections (Finances).
const sections = computed(() => sectionsFor(isOwner.value))
const settings = SETTINGS

// The sections this person picked in Settings (or the daily ones), one tap away in the phone's tab bar.
const tabs = computed(() => {
  const paths = tabPaths(preferences.data.value?.nav_tabs, sections.value)
  return paths.map((to) => sections.value.find((s) => s.to === to)!)
})

// Everything else sits under More on a phone.
const more = computed(() => sections.value.filter((s) => !tabs.value.includes(s)))

// The desktop sidebar lists everything in one fixed order, with Settings set apart at the bottom.
const sidebar = computed<NavigationMenuItem[][]>(() => [
  sections.value.map((s) => ({ label: s.label, icon: s.icon, to: s.to, exact: s.to === '/' })),
  [settings],
])

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
  <!--
    Bars pinned to the bottom of the page use these to stay clear of the navigation:
    --app-nav-h is the phone tab bar's height (64px of tabs plus its 1px top border),
    --app-sidebar-w the desktop sidebar's width (14rem, border included).
    isolate keeps the header's and tab bar's z-index inside the app, so pop-ups (drawn at the end
    of <body>) always sit over them, instead of the bars hiding a pop-up's title and Save button.
  -->
  <div
    class="isolate min-h-dvh flex flex-col [--app-nav-h:calc(4rem+1px+env(safe-area-inset-bottom))] [--app-sidebar-w:0px] lg:[--app-nav-h:0px] lg:[--app-sidebar-w:14rem]"
  >
    <header class="sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur">
      <div class="px-4 h-14 flex items-center gap-3">
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

    <div class="flex-1 lg:flex">
      <!-- Tinted, and runs the full height of the window, so it reads as separate from the page. -->
      <aside
        class="hidden lg:block w-56 shrink-0 sticky top-[calc(3.5rem+1px)] h-[calc(100dvh-3.5rem-1px)] overflow-y-auto border-r border-default bg-muted px-3 py-4"
      >
        <UNavigationMenu
          :items="sidebar"
          orientation="vertical"
          aria-label="Main"
          :ui="{ separator: 'my-2', link: 'data-active:before:bg-accented hover:before:bg-accented/50' }"
        />
      </aside>

      <main class="flex-1 min-w-0 mx-auto w-full max-w-5xl p-4 pb-[calc(var(--app-nav-h)+1rem)]">
        <RouterView />
      </main>
    </div>

    <nav
      aria-label="Main"
      class="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-default bg-muted pb-[env(safe-area-inset-bottom)]"
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
