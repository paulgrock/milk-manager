<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

// The filters switched off, so a filter added later (like Cheese) starts on.
const hiddenGroups = useLocalStorage<EventGroup[]>('calendar.hiddenGroups', [])
const groups = computed(() => (Object.keys(GROUP_LABELS) as EventGroup[]).filter((g) => !hiddenGroups.value.includes(g)))
const showDone = useLocalStorage('calendar.showDone', true)
function toggle(g: EventGroup) {
  hiddenGroups.value = hiddenGroups.value.includes(g) ? hiddenGroups.value.filter((x) => x !== g) : [...hiddenGroups.value, g]
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

// Phone grid: a dot per event (up to three), overdue first so it isn't the one cut off.
const dotRank = (e: CalendarEvent) => (e.overdue ? 0 : e.done ? 2 : 1)
const dots = (date: string) => [...(byDay.value.get(date) ?? [])].sort((a, b) => dotRank(a) - dotRank(b)).slice(0, 3)
const dayButtonLabel = (date: string) => {
  const n = byDay.value.get(date)?.length ?? 0
  return `${dayLabel(date)}, ${n} ${n === 1 ? 'event' : 'events'}`
}
const selectedDay = ref<string | null>(null)
watch(month, () => (selectedDay.value = null))
function pickDay(date: string) {
  selectedDay.value = date
  document.getElementById(`day-${date}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
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
      <!-- Phones: too narrow for titles, so day numbers with a dot per event. Tapping a day jumps to it in the list. -->
      <div class="md:hidden">
        <div class="grid grid-cols-7 gap-0.5 text-center" role="group" aria-label="Month">
          <div v-for="w in weekdays" :key="w" class="pb-1 text-xs text-muted" aria-hidden="true">{{ w }}</div>
          <template v-for="(date, i) in cells" :key="i">
            <div v-if="!date" />
            <button
              v-else-if="byDay.has(date)"
              type="button"
              class="flex h-11 flex-col items-center gap-0.5 rounded-md pt-1 text-sm hover:bg-elevated/60"
              :class="selectedDay === date ? 'bg-primary/10' : ''"
              :aria-label="dayButtonLabel(date)"
              :aria-pressed="selectedDay === date"
              @click="pickDay(date)"
            >
              <span class="inline-flex size-6 items-center justify-center rounded-full" :class="date === today ? 'bg-primary text-inverted font-semibold' : ''">
                {{ Number(date.slice(8)) }}
              </span>
              <span class="flex h-1.5 gap-0.5" aria-hidden="true">
                <span
                  v-for="(e, j) in dots(date)"
                  :key="j"
                  class="size-1.5 rounded-full"
                  :class="e.overdue ? 'bg-warning' : e.done ? 'border border-(--ui-text-dimmed)' : 'bg-(--ui-text-toned)'"
                />
              </span>
            </button>
            <div v-else class="flex h-11 justify-center pt-1 text-sm" aria-hidden="true">
              <span class="inline-flex size-6 items-center justify-center rounded-full" :class="date === today ? 'bg-primary text-inverted font-semibold' : 'text-dimmed'">
                {{ Number(date.slice(8)) }}
              </span>
            </div>
          </template>
        </div>
        <div class="mt-1 flex gap-3 text-xs text-muted" aria-hidden="true">
          <span class="flex items-center gap-1"><span class="size-1.5 rounded-full bg-(--ui-text-toned)" />Upcoming</span>
          <span class="flex items-center gap-1"><span class="size-1.5 rounded-full bg-warning" />Overdue</span>
          <span class="flex items-center gap-1"><span class="size-1.5 rounded-full border border-(--ui-text-dimmed)" />Done</span>
        </div>
      </div>

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
                class="break-words leading-snug rounded px-1 py-0.5"
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
        <section
          v-for="[date, list] in agenda"
          :id="`day-${date}`"
          :key="date"
          class="scroll-mt-32 border-t border-default first:border-0 transition-colors"
          :class="selectedDay === date ? 'bg-primary/10' : ''"
          :data-selected="selectedDay === date || undefined"
        >
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
