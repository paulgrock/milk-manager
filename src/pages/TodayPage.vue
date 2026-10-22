<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useAuth } from '@/composables/useAuth'
import { useLactations, useMilkDay } from '@/composables/useMilk'
import { useCalendarEvents } from '@/composables/useCalendar'
import { useHerdGoats } from '@/composables/useGoats'
import { inHerdOn } from '@/lib/goats'
import { formatDate, todayISO } from '@/lib/dates'
import { addDays } from '@/lib/breeding'
import { needsAttention } from '@/lib/calendar'
import { AM, PM, formatWeight, lactationOn } from '@/lib/milk'
import PendingInvites from '@/components/PendingInvites.vue'
import CalendarEventItem from '@/components/CalendarEventItem.vue'
import LogCareModal from '@/components/health/LogCareModal.vue'

const WEEK = 7
const { herd, role } = useHerd()
const { user } = useAuth()

const today = todayISO()
const day = useMilkDay(today)
const lactations = useLactations()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')

const { goats } = useHerdGoats()
const inMilk = computed(
  () => (goats.data.value ?? []).filter((g) => inHerdOn(g, today) && lactationOn(lactations.data.value ?? [], g.id, today)).length,
)
const milk = computed(() => {
  const rows = day.data.value ?? []
  const sum = (m: number) => rows.filter((r) => r.milking === m).reduce((s, r) => s + r.weight_g, 0)
  return { am: sum(AM), pm: sum(PM), total: rows.reduce((s, r) => s + r.weight_g, 0) }
})

const { events, loading } = useCalendarEvents(today, addDays(today, WEEK))
const attention = computed(() => needsAttention(events.value, today))
// The rest of the week, by day: upcoming things, not records.
const week = computed(() => {
  const upcoming = events.value.filter((e) => !e.done && !attention.value.includes(e))
  const days = new Map<string, typeof upcoming>()
  for (const e of upcoming) days.set(e.date, [...(days.get(e.date) ?? []), e])
  return [...days].map(([date, list]) => ({ date, list }))
})

const careOpen = ref(false)
const weekday = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString(undefined, { weekday: 'long' })
}
</script>

<template>
  <div class="space-y-4">
    <PendingInvites />
    <div class="flex flex-wrap items-end gap-2">
      <div class="flex-1">
        <h1 class="text-2xl font-semibold">Today</h1>
        <p class="text-muted">{{ formatDate(today) }} · {{ role === 'owner' ? 'Owner' : 'Helper' }} of {{ herd?.name }}</p>
      </div>
      <UButton to="/milk" icon="i-lucide-milk">Enter milk</UButton>
      <UButton variant="soft" icon="i-lucide-clipboard-check" @click="careOpen = true">Log care</UButton>
      <UButton variant="soft" icon="i-lucide-baby" to="/breeding/kidding">Record kidding</UButton>
    </div>

    <RouterLink to="/milk" class="block">
      <UCard class="hover:bg-elevated/40">
        <div class="flex flex-wrap items-end gap-x-6 gap-y-1">
          <div>
            <p class="text-sm text-muted">Milk today · {{ inMilk }} {{ inMilk === 1 ? 'doe' : 'does' }} in milk</p>
            <p class="text-3xl font-semibold tabular-nums">{{ formatWeight(milk.total, unit, true) }}</p>
          </div>
          <div class="text-sm text-muted tabular-nums">AM {{ formatWeight(milk.am, unit) }} · PM {{ formatWeight(milk.pm, unit) }}</div>
          <UIcon name="i-lucide-chevron-right" class="ms-auto size-5 text-muted" />
        </div>
      </UCard>
    </RouterLink>

    <div v-if="loading" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-14 w-full" /></div>
    <template v-else>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <h2 class="font-semibold">Needs attention</h2>
          <p class="text-sm text-muted">Overdue, or due today</p>
        </template>
        <p v-if="!attention.length" class="p-4 text-muted">Nothing overdue. Nice.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="e in attention" :key="`${e.kind}-${e.title}`"><CalendarEventItem :event="e" /></li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center">
            <h2 class="font-semibold flex-1">This week</h2>
            <UButton to="/calendar" variant="link" size="sm" trailing-icon="i-lucide-arrow-right">Calendar</UButton>
          </div>
        </template>
        <p v-if="!week.length" class="p-4 text-muted">Nothing coming up this week.</p>
        <section v-for="d in week" :key="d.date" class="border-t border-default first:border-0">
          <h3 class="px-4 pt-3 text-xs font-medium text-muted uppercase tracking-wide">
            {{ weekday(d.date) }} · {{ formatDate(d.date) }}
          </h3>
          <ul>
            <li v-for="e in d.list" :key="`${e.kind}-${e.title}`"><CalendarEventItem :event="e" /></li>
          </ul>
        </section>
      </UCard>
    </template>

    <p class="text-xs text-muted">Signed in as {{ user?.email }}</p>
    <LogCareModal v-model:open="careOpen" />
  </div>
</template>
