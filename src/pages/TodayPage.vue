<script setup lang="ts">
import { computed } from 'vue'
import { useHerd } from '@/composables/useHerd'
import { useAuth } from '@/composables/useAuth'
import { useLactations, useMilkDay } from '@/composables/useMilk'
import { todayISO } from '@/lib/dates'
import { AM, PM, formatWeight, lactationOn } from '@/lib/milk'
import PendingInvites from '@/components/PendingInvites.vue'

const { herd, role } = useHerd()
const { user } = useAuth()

const today = todayISO()
const day = useMilkDay(today)
const lactations = useLactations()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')

const inMilk = computed(() => {
  const ids = new Set((lactations.data.value ?? []).map((l) => l.goat_id))
  return [...ids].filter((id) => lactationOn(lactations.data.value ?? [], id, today)).length
})
const milk = computed(() => {
  const rows = day.data.value ?? []
  const sum = (m: number) => rows.filter((r) => r.milking === m).reduce((s, r) => s + r.weight_g, 0)
  return { am: sum(AM), pm: sum(PM), total: rows.reduce((s, r) => s + r.weight_g, 0) }
})
</script>

<template>
  <div class="space-y-4">
    <PendingInvites />
    <div>
      <h1 class="text-2xl font-semibold">Today</h1>
      <p class="text-muted">
        Signed in as {{ user?.email }} · {{ role === 'owner' ? 'Owner' : 'Helper' }} of {{ herd?.name }}
      </p>
    </div>

    <RouterLink to="/milk" class="block">
      <UCard class="hover:bg-elevated/40">
        <div class="flex items-end gap-6">
          <div>
            <p class="text-sm text-muted">Milk today · {{ inMilk }} {{ inMilk === 1 ? 'doe' : 'does' }} in milk</p>
            <p class="text-3xl font-semibold tabular-nums">{{ formatWeight(milk.total, unit, true) }}</p>
          </div>
          <div class="text-sm text-muted tabular-nums">
            AM {{ formatWeight(milk.am, unit) }} · PM {{ formatWeight(milk.pm, unit) }}
          </div>
          <UIcon name="i-lucide-chevron-right" class="ms-auto size-5 text-muted" />
        </div>
      </UCard>
    </RouterLink>

    <UCard>
      <p class="text-muted">What's due (kiddings, hoof trims, copper) will show up here once those sections are built.</p>
    </UCard>
  </div>
</template>
