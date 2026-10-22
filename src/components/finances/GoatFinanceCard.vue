<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFinances } from '@/composables/useFinances'
import { useHerd } from '@/composables/useHerd'
import { formatDate } from '@/lib/dates'
import type { Goat } from '@/lib/goats'
import { categoryLabel, formatMoney, type FinanceEntry } from '@/lib/finances'
import EntryModal from './EntryModal.vue'

const props = defineProps<{ goat: Goat }>()
const { isOwner } = useHerd()
const { entries } = useFinances()

const mine = computed(() => entries.value.filter((e) => e.goat_id === props.goat.id))
const net = computed(() => mine.value.reduce((s, e) => s + (e.kind === 'income' ? 1 : -1) * e.amount_cents, 0))
const modal = ref<{ open: boolean; entry?: FinanceEntry }>({ open: false })
</script>

<template>
  <UCard v-if="isOwner && mine.length" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center">
        <h2 class="font-semibold flex-1">Finances</h2>
        <span class="text-sm tabular-nums" :class="net < 0 ? 'text-error' : 'text-success'">
          {{ net < 0 ? '−' : '+' }}{{ formatMoney(Math.abs(net)) }}
        </span>
      </div>
    </template>
    <ul class="divide-y divide-default">
      <li v-for="e in mine" :key="e.id">
        <button type="button" class="w-full flex gap-3 px-4 py-2 text-start text-sm hover:bg-elevated/50" @click="modal = { open: true, entry: e }">
          <span class="w-24 text-muted">{{ formatDate(e.occurred_on) }}</span>
          <span class="flex-1 truncate">{{ e.description || categoryLabel(e.kind, e.category) }}</span>
          <span class="tabular-nums">{{ e.kind === 'income' ? '+' : '−' }}{{ formatMoney(e.amount_cents) }}</span>
        </button>
      </li>
    </ul>
    <EntryModal v-model:open="modal.open" :entry="modal.entry" />
  </UCard>
</template>
