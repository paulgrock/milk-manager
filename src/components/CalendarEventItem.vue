<script setup lang="ts">
import type { CalendarEvent, EventKind } from '@/lib/calendar'

defineProps<{ event: CalendarEvent; showDate?: string }>()

const ICONS: Record<EventKind, string> = {
  'kidding-due': 'i-lucide-baby',
  'dry-off': 'i-lucide-moon',
  heat: 'i-lucide-flame',
  'preg-check': 'i-lucide-test-tube',
  'care-due': 'i-lucide-clipboard-check',
  'withdrawal-ends': 'i-lucide-milk',
  'dim-305': 'i-lucide-flag',
  kidded: 'i-lucide-baby',
  bred: 'i-lucide-heart',
  'care-done': 'i-lucide-check',
  treated: 'i-lucide-pill',
  'test-day': 'i-lucide-flask-conical',
  'cheese-ready': 'i-lucide-cylinder',
}
</script>

<template>
  <RouterLink :to="event.href" class="flex items-start gap-3 px-4 py-2 hover:bg-elevated/50" :class="event.done ? 'text-muted' : ''">
    <UIcon :name="ICONS[event.kind]" class="size-4 mt-0.5 shrink-0" :class="event.overdue ? 'text-warning' : ''" />
    <span class="flex-1 min-w-0">
      <span class="block" :class="event.done ? '' : 'font-medium'">{{ event.title }}</span>
      <span v-if="event.detail" class="block text-xs text-muted truncate">{{ event.detail }}</span>
    </span>
    <UBadge v-if="event.overdue" color="warning" variant="subtle" size="sm">Overdue</UBadge>
    <span v-else-if="showDate" class="text-xs text-muted shrink-0">{{ showDate }}</span>
  </RouterLink>
</template>
