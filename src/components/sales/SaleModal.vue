<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useSalesData, useSalesMutations } from '@/composables/useSales'
import { todayISO } from '@/lib/dates'
import { formatMoney, parseMoney } from '@/lib/finances'
import type { Sale, SeasonKid } from '@/lib/sales'
import BuyerPicker from './BuyerPicker.vue'
import HerdGoatPicker from '@/components/HerdGoatPicker.vue'

/** Records an adoption: a matched kid going home, an unmatched kid, or a goat from the herd. */
const props = defineProps<{ sale?: Sale; kid?: SeasonKid; kids?: SeasonKid[] }>()
const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const today = todayISO()
const { data } = useSalesData()
const { saveSale, removeSale } = useSalesMutations()

const form = reactive({
  buyer_id: null as string | null,
  what: 'kid' as 'kid' | 'goat',
  kid_id: null as string | null,
  goat_id: null as string | null,
  price: '',
  sold_on: today,
  pickup_on: '',
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const s = props.sale
  Object.assign(form, {
    buyer_id: s?.buyer_id ?? null,
    what: s && !s.kid_id ? 'goat' : 'kid',
    kid_id: s?.kid_id ?? props.kid?.kid.id ?? null,
    goat_id: s?.goat_id ?? null,
    price: s?.price_cents ? (s.price_cents / 100).toFixed(2) : '',
    sold_on: s?.sold_on ?? today,
    pickup_on: s?.pickup_on ?? '',
    notes: s?.notes ?? '',
  })
})

// What's being sold is fixed once matched or chosen from a kid.
const fixed = computed(() => !!props.sale || !!props.kid)
const kidItems = computed(() => (props.kids ?? []).map((k) => ({ label: k.label, value: k.kid.id })))
const whatOptions = [
  { label: 'A kid', value: 'kid' },
  { label: 'A goat', value: 'goat' },
]
const reservation = computed(() => data.value.reservations.find((r) => r.id === props.sale?.reservation_id))
const buyerFixed = computed(() => !!reservation.value)

// The deposit comes off the price: either already (this sale used it) or when it's saved.
const deposit = computed(() => {
  if (props.sale?.deposit_applied_cents) return props.sale.deposit_applied_cents
  return reservation.value?.deposit_status === 'held' ? (reservation.value.deposit_cents ?? 0) : 0
})
const price = computed(() => parseMoney(form.price))
const balance = computed(() => (typeof price.value === 'number' ? Math.max(0, price.value - Math.min(deposit.value, price.value)) : null))

async function submit() {
  if (!form.buyer_id) return toast.add({ color: 'error', title: 'Pick a buyer' })
  if (typeof price.value !== 'number') return toast.add({ color: 'error', title: 'Enter the price, like 450 or 450.00' })
  const kid = (props.kids ?? []).find((k) => k.kid.id === form.kid_id) ?? props.kid
  const values =
    form.what === 'kid' || props.sale?.kid_id
      ? { kid_id: form.kid_id, goat_id: kid?.kid.goat_id ?? props.sale?.goat_id ?? null }
      : { kid_id: null, goat_id: form.goat_id }
  if (!values.kid_id && !values.goat_id) return toast.add({ color: 'error', title: form.what === 'kid' ? 'Pick the kid' : 'Pick the goat' })
  try {
    await saveSale.mutateAsync({
      id: props.sale?.id,
      values: {
        ...values,
        buyer_id: form.buyer_id,
        reservation_id: props.sale?.reservation_id ?? null,
        price_cents: price.value,
        sold_on: form.sold_on,
        pickup_on: form.pickup_on || null,
        notes: form.notes.trim() || null,
      },
    })
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save adoption', description: (e as Error).message })
  }
}

// An adoption from a reservation goes back to matched; any other is removed.
async function undo() {
  const s = props.sale!
  try {
    if (s.reservation_id) await saveSale.mutateAsync({ id: s.id, values: { ...s, sold_on: null, pickup_on: null } })
    else await removeSale.mutateAsync(s.id)
    open.value = false
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not undo', description: (e as Error).message })
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="sale?.sold_on ? 'Edit adoption' : 'Record an adoption'">
    <template #body>
      <form id="sale-form" class="space-y-3" @submit.prevent="submit">
        <UFormField label="Buyer" required>
          <BuyerPicker v-if="!buyerFixed" v-model="form.buyer_id" />
          <p v-else class="text-sm">{{ data.buyers.find((b) => b.id === form.buyer_id)?.name }} (from their reservation)</p>
        </UFormField>
        <template v-if="!fixed">
          <UTabs v-model="form.what" :items="whatOptions" :content="false" size="sm" :ui="{ list: 'w-auto' }" />
          <UFormField v-if="form.what === 'kid'" label="Kid" required>
            <USelect v-model="form.kid_id" :items="kidItems" placeholder="Pick a kid born this season" class="w-full" />
          </UFormField>
          <UFormField v-else label="Goat" required>
            <HerdGoatPicker v-model="form.goat_id" sex="any" />
          </UFormField>
        </template>
        <div class="grid grid-cols-3 gap-3">
          <UFormField label="Price" required>
            <UInput v-model="form.price" inputmode="decimal" class="w-full">
              <template #leading><span class="text-muted">$</span></template>
            </UInput>
          </UFormField>
          <UFormField label="Adopted on" required>
            <UInput v-model="form.sold_on" type="date" required class="w-full" />
          </UFormField>
          <UFormField label="Pickup">
            <UInput v-model="form.pickup_on" type="date" :min="form.sold_on" class="w-full" />
          </UFormField>
        </div>
        <p v-if="deposit && balance !== null" class="text-sm text-muted">
          Less the {{ formatMoney(Math.min(deposit, price as number)) }} deposit: {{ formatMoney(balance) }} goes into Finances.
        </p>
        <p v-else-if="balance !== null" class="text-sm text-muted">{{ formatMoney(balance) }} goes into Finances.</p>
        <UFormField label="Notes">
          <UTextarea v-model="form.notes" :rows="2" maxlength="2000" class="w-full" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton v-if="sale?.sold_on" color="error" variant="ghost" @click="undo">{{ sale.reservation_id ? 'Not adopted' : 'Delete adoption' }}</UButton>
        <UButton class="ms-auto" color="neutral" variant="ghost" @click="open = false">Cancel</UButton>
        <UButton type="submit" form="sale-form" :loading="saveSale.isPending.value">Save adoption</UButton>
      </div>
    </template>
  </UModal>
</template>
