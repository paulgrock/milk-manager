<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdMembers } from '@/composables/useHerdMembers'
import { useChoreLog, useChoreMutations, useChoresData } from '@/composables/useChores'
import { formatDate, relativeDays, todayISO } from '@/lib/dates'
import { choreStatus, repeatLabel, sortByDue, type Chore, type ChoreStatus } from '@/lib/chores'
import ChoreDoneModal from '@/components/chores/ChoreDoneModal.vue'

const today = todayISO()
const toast = useToast()
const { isOwner } = useHerd()
const { nameOf } = useHerdMembers()
const { query, data } = useChoresData()
const { markDone, removeDone, waitingCount } = useChoreLog()
const { saveChore } = useChoreMutations()

const statuses = computed(() => sortByDue(data.value.chores.filter((c) => !c.hidden).map((c) => choreStatus(c, data.value.done, today))))

function dueLabel(s: ChoreStatus) {
  const days = s.daysUntilDue!
  if (days < 0) return `${-days} ${days === -1 ? 'day' : 'days'} overdue`
  return days === 0 ? 'Due today' : `Due ${relativeDays(days)}`
}
function lastLabel(s: ChoreStatus) {
  if (!s.last) return 'Not recorded yet'
  const who = nameOf.value(s.last.created_by)
  return `Last done ${s.last.done_on === today ? 'today' : formatDate(s.last.done_on)}${who ? ` by ${who}` : ''}`
}

function doneToday(chore: Chore) {
  const { id, saved } = markDone({ choreId: chore.id, doneOn: today })
  saved.catch((e: Error) => toast.add({ color: 'error', title: 'Could not save', description: e.message }))
  toast.add({
    color: 'success',
    title: `${chore.name} done`,
    actions: [{ label: 'Undo', color: 'neutral', variant: 'outline', onClick: () => removeDone(id) }],
  })
}

const modal = ref<{ open: boolean; chore?: Chore }>({ open: false })

// The chore list: anyone can add; owners rename, change how often and hide.
const draft = reactive({ name: '', interval: undefined as number | undefined })
async function addChore() {
  if (!draft.name.trim() || !draft.interval) return
  try {
    await saveChore.mutateAsync({ values: { name: draft.name.trim(), interval_days: draft.interval, sort_order: data.value.chores.length + 1 } })
    Object.assign(draft, { name: '', interval: undefined })
  } catch (e) {
    const message = (e as Error).message
    toast.add({ color: 'error', title: 'Could not add', description: message.includes('duplicate') ? 'That chore is already in the list.' : message })
  }
}
function updateChore(c: Chore, values: Partial<Pick<Chore, 'name' | 'interval_days' | 'hidden'>>) {
  if (values.name !== undefined && !values.name.trim()) return
  if (values.interval_days !== undefined && !values.interval_days) return
  saveChore.mutate(
    { id: c.id, values: { name: c.name, interval_days: c.interval_days, ...values } },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) },
  )
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Chores</h1>

    <UAlert
      v-if="waitingCount"
      color="warning"
      variant="subtle"
      icon="i-lucide-cloud-off"
      :title="`${waitingCount} ${waitingCount === 1 ? 'chore is' : 'chores are'} saved on this phone`"
      description="They will upload automatically when you have signal."
    />

    <div v-if="query.isPending.value" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-16 w-full" /></div>

    <template v-else>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <p v-if="!statuses.length" class="p-4 text-muted">No chores. Add one below.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="s in statuses" :key="s.chore.id" class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <button type="button" class="flex-1 min-w-48 text-start" @click="modal = { open: true, chore: s.chore }">
              <span class="block font-medium">{{ s.chore.name }}</span>
              <span class="block text-sm text-muted">{{ lastLabel(s) }} · {{ repeatLabel(s.chore.interval_days) }}</span>
            </button>
            <div class="flex items-center gap-2 ms-auto">
              <UBadge v-if="s.state === 'overdue'" color="warning" variant="subtle" icon="i-lucide-alarm-clock">{{ dueLabel(s) }}</UBadge>
              <UBadge v-else-if="s.state === 'due'" color="neutral" variant="subtle">{{ dueLabel(s) }}</UBadge>
              <span v-else-if="s.state === 'ok'" class="text-sm text-muted">{{ dueLabel(s) }}</span>
              <UButton v-else size="sm" color="neutral" variant="ghost" @click="modal = { open: true, chore: s.chore }">Enter last done</UButton>
              <UButton
                v-if="s.last?.done_on === today"
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-check"
                disabled
              >
                Done
              </UButton>
              <UButton v-else size="sm" icon="i-lucide-check" :variant="s.state === 'overdue' || s.state === 'due' ? 'solid' : 'soft'" @click="doneToday(s.chore)">
                Done today
              </UButton>
            </div>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">Chores we do</h2>
          <p class="text-sm text-muted">How often each one is due. {{ isOwner ? '' : 'Only owners can rename, change or hide these.' }}</p>
        </template>
        <ul class="divide-y divide-default -my-2">
          <li v-for="c in data.chores" :key="c.id" class="py-2 flex flex-wrap items-center gap-3" :class="c.hidden ? 'opacity-60' : ''">
            <template v-if="isOwner">
              <UInput
                :model-value="c.name"
                maxlength="60"
                class="flex-1 min-w-40"
                :aria-label="`${c.name} name`"
                @change="(e: Event) => updateChore(c, { name: (e.target as HTMLInputElement).value })"
              />
              <!-- Kept together, so on a phone they wrap as one line under the name. -->
              <div class="flex items-center gap-2 ms-auto">
                <span class="text-sm text-muted">every</span>
                <UInputNumber
                  :model-value="c.interval_days"
                  :min="1"
                  :max="1095"
                  class="w-28"
                  :aria-label="`${c.name} every how many days`"
                  @update:model-value="(v: unknown) => updateChore(c, { interval_days: Number(v) })"
                />
                <span class="text-sm text-muted">days</span>
                <UButton size="xs" color="neutral" variant="ghost" class="w-16 justify-center" @click="updateChore(c, { hidden: !c.hidden })">
                  {{ c.hidden ? 'Restore' : 'Hide' }}
                </UButton>
              </div>
            </template>
            <template v-else>
              <span class="flex-1 font-medium">{{ c.name }}</span>
              <span class="text-sm text-muted">{{ repeatLabel(c.interval_days) }}{{ c.hidden ? ' · hidden' : '' }}</span>
            </template>
          </li>
        </ul>
        <form class="flex flex-wrap items-end gap-2 mt-4" @submit.prevent="addChore">
          <UFormField label="Add a chore" class="flex-1 min-w-40">
            <UInput v-model="draft.name" placeholder="Check fences, spread manure…" maxlength="60" class="w-full" />
          </UFormField>
          <UFormField label="Every (days)">
            <UInputNumber v-model="draft.interval" :min="1" :max="1095" class="w-28" />
          </UFormField>
          <UButton type="submit" variant="soft" :loading="saveChore.isPending.value">Add</UButton>
        </form>
      </UCard>
    </template>

    <ChoreDoneModal v-model:open="modal.open" :chore="modal.chore" />
  </div>
</template>
