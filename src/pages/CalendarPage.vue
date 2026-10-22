<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { useCalendarEvents } from '@/composables/useCalendar'
import { addMonths, formatDate, parseDate, toISODate, todayISO } from '@/lib/dates'
import { GROUP_LABELS, type CalendarEvent, type EventGroup } from '@/lib/calendar'
import CalendarEventItem from '@/components/CalendarEventItem.vue'
import MonthYearPicker from '@/components/MonthYearPicker.vue'

const route = useRoute()
const router = useRouter()
const today = todayISO()

const month = computed(() => {
  const q = route.query.month
  return typeof q === 'string' && /^\d{4}-\d{2}$/.test(q) ? q : today.slice(0, 7)
})
const first = computed(() => `${month.value}-01`)
const last = computed(() => {
  const d = parseDate(first.value)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
})
const goMonth = (delta: number) => router.replace({ query: { month: addMonths(first.value, delta).slice(0, 7) } })
const pickedMonth = computed({
  get: () => month.value,
  set: (m: string) => router.replace({ query: m === today.slice(0, 7) ? {} : { month: m } }),
})

const groups = useLocalStorage<EventGroup[]>('calendar.groups', ['breeding', 'health', 'milk'])
const showDone = useLocalStorage('calendar.showDone', true)
function toggle(g: EventGroup) {
  groups.value = groups.value.includes(g) ? groups.value.filter((x) => x !== g) : [...groups.value, g]
}

const { events, loading } = useCalendarEvents(first, last)
const shown = computed(() => events.value.filter((e) => groups.value.includes(e.group) && (showDone.value || !e.done)))
const byDay = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of shown.value) map.set(e.date, [...(map.get(e.date) ?? []), e])
  return map
})

// Month grid, weeks starting Sunday.
const cells = computed(() => {
  const start = parseDate(first.value)
  const lead = start.getDay()
  const days = parseDate(last.value).getDate()
  const out: (string | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= days; d++) out.push(`${month.value}-${String(d).padStart(2, '0')}`)
  while (out.length % 7) out.push(null)
  return out
})
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) => new Date(2026, 1, i + 1).toLocaleDateString(undefined, { weekday: 'short' })),
)
const agenda = computed(() => [...byDay.value].sort(([a], [b]) => a.localeCompare(b)))
const dayLabel = (iso: string) => parseDate(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Calendar</h1>
      <!-- Kept together so the arrows never wrap apart from the month. -->
      <div class="flex items-center gap-1 ms-auto">
        <!-- Left of the arrows, so they don't move when it appears. -->
        <UButton v-if="month !== today.slice(0, 7)" variant="link" class="whitespace-nowrap px-1" @click="router.replace({ query: {} })">This month</UButton>
        <UButton color="neutral" variant="outline" icon="i-lucide-chevron-left" aria-label="Previous month" @click="goMonth(-1)" />
        <MonthYearPicker v-model="pickedMonth" class="w-40" />
        <UButton color="neutral" variant="outline" icon="i-lucide-chevron-right" aria-label="Next month" @click="goMonth(1)" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Show">
      <UButton
        v-for="(label, g) in GROUP_LABELS"
        :key="g"
        size="sm"
        :variant="groups.includes(g) ? 'solid' : 'outline'"
        color="neutral"
        :aria-pressed="groups.includes(g)"
        @click="toggle(g)"
      >
        {{ label }}
      </UButton>
      <UCheckbox v-model="showDone" label="Show past records" class="ms-2" />
    </div>

    <div v-if="loading" class="space-y-2"><USkeleton class="h-64 w-full" /></div>
    <template v-else>
      <div class="hidden md:grid grid-cols-7 gap-px rounded-lg border border-default bg-(--ui-border) overflow-hidden" aria-hidden="true">
        <div v-for="w in weekdays" :key="w" class="bg-elevated/60 px-2 py-1 text-xs text-muted">{{ w }}</div>
        <div v-for="(date, i) in cells" :key="i" class="bg-default min-h-24 p-1.5 text-xs">
          <template v-if="date">
            <span class="inline-flex size-6 items-center justify-center rounded-full" :class="date === today ? 'bg-primary text-inverted font-semibold' : 'text-muted'">
              {{ Number(date.slice(8)) }}
            </span>
            <ul class="mt-1 space-y-0.5">
              <li
                v-for="e in (byDay.get(date) ?? []).slice(0, 3)"
                :key="`${e.kind}-${e.title}`"
                class="truncate rounded px-1"
                :class="e.overdue ? 'bg-warning/15 text-warning' : e.done ? 'text-muted' : 'bg-elevated'"
              >
                {{ e.title }}
              </li>
              <li v-if="(byDay.get(date)?.length ?? 0) > 3" class="text-muted px-1">+{{ byDay.get(date)!.length - 3 }} more</li>
            </ul>
          </template>
        </div>
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <p v-if="!agenda.length" class="p-4 text-muted">Nothing this month.</p>
        <section v-for="[date, list] in agenda" :key="date" class="border-t border-default first:border-0">
          <h2 class="px-4 pt-3 text-xs font-medium uppercase tracking-wide" :class="date === today ? 'text-primary' : 'text-muted'">
            {{ date === today ? 'Today · ' : '' }}{{ dayLabel(date) }}
          </h2>
          <ul>
            <li v-for="e in list" :key="`${e.kind}-${e.title}`"><CalendarEventItem :event="e" /></li>
          </ul>
        </section>
      </UCard>
      <p class="text-xs text-muted">Upcoming dates are worked out from your records, so they update as soon as something is recorded. {{ formatDate(first) }} – {{ formatDate(last) }}.</p>
    </template>
  </div>
</template>
