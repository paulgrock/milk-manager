<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useBreedingData } from '@/composables/useBreeding'
import { useSalesData, useSalesMutations } from '@/composables/useSales'
import { todayISO } from '@/lib/dates'
import { parseMoney } from '@/lib/finances'
import { DEPOSIT_LABELS, WANTS_LABELS, defaultSeason, reservationProgress, type DepositStatus, type Reservation } from '@/lib/sales'
import BuyerPicker from './BuyerPicker.vue'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

const props = defineProps<{ reservation?: Reservation; season?: number; doeId?: string | null }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const today = todayISO()
const { data: breeding } = useBreedingData()
const { data } = useSalesData()
const { saveReservation, removeReservation } = useSalesMutations()

const form = reactive({
  buyer_id: null as string | null,
  doe_id: null as string | null,
  season: 0,
  wants: 'any',
  kid_count: 1,
  deposit: '',
  deposit_on: today,
  deposit_status: 'held' as DepositStatus,
  cancelled: false,
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const r = props.reservation
  const doe = r ? r.doe_id : (props.doeId ?? null)
  Object.assign(form, {
    buyer_id: r?.buyer_id ?? null,
    doe_id: doe,
    season: r?.season ?? props.season ?? defaultSeason(doe, breeding.value, today),
    wants: r?.wants ?? 'any',
    kid_count: r?.kid_count ?? 1,
    deposit: r?.deposit_cents ? (r.deposit_cents / 100).toFixed(2) : '',
    deposit_on: r?.deposit_on ?? today,
    deposit_status: (r?.deposit_status ?? 'held') as DepositStatus,
    cancelled: !!r?.cancelled_on,
    notes: r?.notes ?? '',
  })
})

// A new reservation for a bred doe defaults to the season she's due.
watch(
  () => form.doe_id,
  (doe) => {
    if (open.value && !props.reservation) form.season = props.season ?? defaultSeason(doe, breeding.value, today)
  },
)

const wantsOptions = Object.entries(WANTS_LABELS).map(([value, label]) => ({ label, value }))
// Once a sale has used the deposit, it's settled there.
const depositLocked = computed(() => props.reservation?.deposit_status === 'applied')
const statusOptions = (['held', 'refunded', 'kept'] as const).map((value) => ({ label: DEPOSIT_LABELS[value], value }))
const progress = computed(() => (props.reservation ? reservationProgress(props.reservation, data.value.sales) : undefined))

async function submit() {
  if (!form.buyer_id) return toast.add({ color: 'error', title: 'Pick a buyer' })
  const deposit = parseMoney(form.deposit)
  if (deposit === 'invalid') return toast.add({ color: 'error', title: 'Deposit must be an amount like 100 or 100.00' })
  // A new reservation goes to the end of its doe's line.
  const line = data.value.reservations.filter((r) => r.season === form.season && r.doe_id === form.doe_id && r.id !== props.reservation?.id)
  const position = props.reservation && props.reservation.season === form.season && props.reservation.doe_id === form.doe_id
    ? props.reservation.position
    : Math.max(0, ...line.map((r) => r.position)) + 1
  try {
    await saveReservation.mutateAsync({
      id: props.reservation?.id,
      values: {
        buyer_id: form.buyer_id,
        doe_id: form.doe_id,
        season: form.season,
        wants: form.wants,
        kid_count: form.kid_count,
        position,
        ...(depositLocked.value
          ? {}
          : { deposit_cents: deposit, deposit_on: deposit ? form.deposit_on : null, deposit_status: deposit ? form.deposit_status : 'held' }),
        cancelled_on: form.cancelled ? (props.reservation?.cancelled_on ?? today) : null,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save reservation', description: (e as Error).message })
  }
}

async function remove() {
  try {
    await removeReservation.mutateAsync(props.reservation!.id)
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not delete', description: (e as Error).message })
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="reservation ? 'Edit reservation' : 'New reservation'">
    <template #body>
      <form id="reservation-form" class="space-y-3" @submit.prevent="submit">
        <UFormField label="Buyer" required><BuyerPicker v-model="form.buyer_id" /></UFormField>
        <UFormField label="Kids from" hint="Leave empty for any doe">
          <HerdGoatPicker v-model="form.doe_id" placeholder="Any doe" />
        </UFormField>
        <div class="grid grid-cols-3 gap-3">
          <UFormField label="Season">
            <UInputNumber v-model="form.season" :min="2000" :max="2100" :format-options="{ useGrouping: false }" class="w-full" />
          </UFormField>
          <UFormField label="Wants">
            <USelect v-model="form.wants" :items="wantsOptions" class="w-full" />
          </UFormField>
          <UFormField label="How many">
            <UInputNumber v-model="form.kid_count" :min="1" :max="10" class="w-full" />
          </UFormField>
        </div>
        <p v-if="depositLocked" class="text-sm text-muted">The deposit has been taken off a sale's price.</p>
        <div v-else class="grid grid-cols-3 gap-3">
          <UFormField label="Deposit">
            <UInput v-model="form.deposit" inputmode="decimal" class="w-full">
              <template #leading><span class="text-muted">$</span></template>
            </UInput>
          </UFormField>
          <UFormField v-if="form.deposit.trim()" label="Received">
            <UInput v-model="form.deposit_on" type="date" :max="today" class="w-full" />
          </UFormField>
          <UFormField v-if="form.deposit.trim() && reservation?.deposit_cents" label="Deposit is">
            <USelect v-model="form.deposit_status" :items="statusOptions" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" maxlength="2000" class="w-full" />
        </UFormField>
        <UCheckbox v-if="reservation" v-model="form.cancelled" label="Cancelled" />
        <p v-if="progress?.matched" class="text-xs text-muted">
          {{ progress.matched }} {{ progress.matched === 1 ? 'kid' : 'kids' }} matched, {{ progress.sold }} sold.
        </p>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="reservation && !progress?.matched" color="error" variant="ghost" @click="remove">Delete</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="reservation-form" :loading="saveReservation.isPending.value">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
