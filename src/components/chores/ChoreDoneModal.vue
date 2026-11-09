<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useChoreLog, useChoresData } from '@/composables/useChores'
import { useHerdMembers } from '@/composables/useHerdMembers'
import { formatDate, todayISO } from '@/lib/dates'
import type { Chore } from '@/lib/chores'

const props = defineProps<{ chore?: Chore }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { data } = useChoresData()
const { markDone, removeDone } = useChoreLog()
const { nameOf } = useHerdMembers()

const today = todayISO()
const form = reactive({ doneOn: today, notes: '' })
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, { doneOn: today, notes: '' })
})

const history = computed(() =>
  data.value.done
    .filter((d) => d.chore_id === props.chore?.id)
    .sort((a, b) => b.done_on.localeCompare(a.done_on) || b.created_at.localeCompare(a.created_at)),
)

function submit() {
  if (!props.chore || !form.doneOn) return
  // Doesn't wait for the server: with no signal it's kept on the phone and sent later.
  markDone({ choreId: props.chore.id, doneOn: form.doneOn, notes: form.notes }).saved.catch((e: Error) =>
    toast.add({ color: 'error', title: 'Could not save', description: e.message }),
  )
  toast.add({ color: 'success', title: `${props.chore.name} done ${form.doneOn === today ? 'today' : formatDate(form.doneOn)}` })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="chore?.name ?? 'Chore'">
    <template #body>
      <form id="chore-form" class="space-y-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Done on" required>
            <UInput v-model="form.doneOn" type="date" :max="today" required class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UInput v-model="form.notes" maxlength="10000" class="w-full" />
        </UFormField>
      </form>
      <section class="mt-6">
        <h3 class="text-sm font-medium mb-1">History</h3>
        <p v-if="!history.length" class="text-sm text-muted">Not recorded yet.</p>
        <ul v-else class="max-h-64 overflow-y-auto rounded-md border border-default divide-y divide-default text-sm">
          <li v-for="d in history" :key="d.id" class="flex items-start gap-2 px-3 py-2">
            <span class="flex-1 min-w-0">
              <span>{{ formatDate(d.done_on) }}</span>
              <span v-if="nameOf(d.created_by)" class="text-muted"> · {{ nameOf(d.created_by) }}</span>
              <span v-if="d.notes" class="block text-muted">{{ d.notes }}</span>
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              :aria-label="`Delete ${formatDate(d.done_on)}`"
              @click="removeDone(d.id)"
            />
          </li>
        </ul>
      </section>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="chore-form">Mark done</UButton>
      </div>
    </template>
  </UModal>
</template>
