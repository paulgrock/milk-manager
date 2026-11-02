<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useBreedingData } from '@/composables/useBreeding'
import { useSalesData, useSalesMutations } from '@/composables/useSales'
import { doeBreedingState } from '@/lib/breeding'
import { formatDate, todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/finances'
import { goatName } from '@/lib/goats'
import {
  DEPOSIT_LABELS,
  defaultSeason,
  inLine,
  kidFits,
  reservationProgress,
  seasonKids,
  type Buyer,
  type DepositStatus,
  type Reservation,
  type Sale,
  type SeasonKid,
} from '@/lib/sales'
import ReservationModal from '@/components/sales/ReservationModal.vue'
import SaleModal from '@/components/sales/SaleModal.vue'
import BuyerModal from '@/components/sales/BuyerModal.vue'

const today = todayISO()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { isOwner } = useHerd()
const { goats, byId } = useHerdGoats()
const { data: breeding, query: breedingQuery } = useBreedingData()
const { query, data } = useSalesData()
const { saveSale, removeSale, setLineOrder } = useSalesMutations()

const season = computed(() => {
  const q = Number(route.query.season)
  return Number.isInteger(q) && q >= 2000 && q <= 2100 ? q : defaultSeason(null, breeding.value, today)
})
const goToSeason = (s: number) => void router.replace({ query: { season: String(s) } })

const doeName = (id: string) => {
  const g = byId.value.get(id)
  return g ? g.barn_name || goatName(g) : 'Unknown doe'
}
const buyerName = (id: string) => data.value.buyers.find((b) => b.id === id)?.name ?? 'Unknown buyer'

const kids = computed(() => seasonKids(breeding.value.kiddings, breeding.value.kids, byId.value, season.value))
const kidById = computed(() => new Map(kids.value.map((k) => [k.kid.id, k])))
const takenKids = computed(() => new Set(data.value.sales.map((s) => s.kid_id).filter(Boolean)))
const freeKids = computed(() => kids.value.filter((k) => !takenKids.value.has(k.kid.id)))

const seasonReservations = computed(() => data.value.reservations.filter((r) => r.season === season.value))
const active = computed(() => seasonReservations.value.filter((r) => !r.cancelled_on))
const cancelled = computed(() => seasonReservations.value.filter((r) => r.cancelled_on))

// One line per doe with reservations or kids this season, then "any doe".
const groups = computed(() => {
  const does = new Set<string>([...active.value.map((r) => r.doe_id).filter((d): d is string => !!d), ...kids.value.map((k) => k.kidding.doe_id)])
  const list = [...does]
    .map((doeId) => ({ doeId: doeId as string | null, title: doeName(doeId), status: doeStatus(doeId) }))
    .sort((a, b) => a.title.localeCompare(b.title))
  if (active.value.some((r) => !r.doe_id)) list.push({ doeId: null, title: 'Any doe', status: '' })
  return list.map((g) => ({
    ...g,
    line: inLine(active.value.filter((r) => r.doe_id === g.doeId)),
    unreserved: freeKids.value.filter((k) => g.doeId && k.kidding.doe_id === g.doeId),
  }))
})

function doeStatus(doeId: string) {
  const born = kids.value.filter((k) => k.kidding.doe_id === doeId)
  if (born.length) {
    const doelings = born.filter((k) => k.kid.sex === 'doe').length
    const bucklings = born.length - doelings
    const parts = [doelings && `${doelings} ${doelings === 1 ? 'doeling' : 'doelings'}`, bucklings && `${bucklings} ${bucklings === 1 ? 'buckling' : 'bucklings'}`]
    return `Kidded ${formatDate(born[0]!.kidding.kidded_on)} · ${parts.filter(Boolean).join(', ')}`
  }
  const due = doeBreedingState(doeId, breeding.value, today).current?.due.expected
  return due && due.startsWith(`${season.value}-`) ? `Due ${formatDate(due)}` : ''
}

function wantsText(r: Reservation) {
  const word = r.wants === 'any' ? 'kid' : r.wants
  return `${r.kid_count} ${r.kid_count === 1 ? word : `${word}s`}`
}
function depositText(r: Reservation) {
  if (!r.deposit_cents) return 'No deposit'
  return `${formatMoney(r.deposit_cents)} deposit ${DEPOSIT_LABELS[r.deposit_status as DepositStatus]}`
}
const salesFor = (r: Reservation) => data.value.sales.filter((s) => s.reservation_id === r.id)
// A kid born this season by its label; otherwise the goat's name.
function saleLabel(s: Sale) {
  const kid = s.kid_id ? kidById.value.get(s.kid_id) : undefined
  if (kid) return kid.label
  const goat = s.goat_id ? byId.value.get(s.goat_id) : undefined
  return goat ? goat.barn_name || goatName(goat) : 'Kid'
}

// Kids that fit a reservation: from its doe (or any doe), the sex it wants, not already taken.
const fitting = (r: Reservation) => freeKids.value.filter((k) => (!r.doe_id || k.kidding.doe_id === r.doe_id) && kidFits(k.kid, r.wants))
function matchItems(r: Reservation) {
  return fitting(r).map((k) => ({ label: k.label, onSelect: () => match(r, k) }))
}
function match(r: Reservation, k: SeasonKid) {
  saveSale.mutate(
    { values: { buyer_id: r.buyer_id, reservation_id: r.id, kid_id: k.kid.id, goat_id: k.kid.goat_id } },
    { onError: (e) => toast.add({ color: 'error', title: 'Could not match', description: e.message }) },
  )
}
function unmatch(s: Sale) {
  removeSale.mutate(s.id, { onError: (e) => toast.add({ color: 'error', title: 'Could not unmatch', description: e.message }) })
}
function move(line: Reservation[], index: number, by: number) {
  const ids = line.map((r) => r.id)
  const [id] = ids.splice(index, 1)
  ids.splice(index + by, 0, id!)
  setLineOrder.mutate(ids, { onError: (e) => toast.add({ color: 'error', title: 'Could not reorder', description: e.message }) })
}

// Kids count toward the season they were born in, whenever they're sold; other goats by the year sold.
const seasonSales = computed(() =>
  data.value.sales
    .filter((s) => s.sold_on && (s.kid_id ? kidById.value.has(s.kid_id) : s.sold_on.startsWith(`${season.value}-`)))
    .sort((a, b) => b.sold_on!.localeCompare(a.sold_on!)),
)
const seasonTotal = computed(() => seasonSales.value.reduce((sum, s) => sum + (s.price_cents ?? 0), 0))
const purchases = (b: Buyer) => data.value.sales.filter((s) => s.buyer_id === b.id && s.sold_on).length

const reservationModal = ref<{ open: boolean; reservation?: Reservation; doeId?: string | null }>({ open: false })
const saleModal = ref<{ open: boolean; sale?: Sale; kid?: SeasonKid }>({ open: false })
const buyerModal = ref<{ open: boolean; buyer?: Buyer }>({ open: false })
const showCancelled = ref(false)
const loading = computed(() => query.isPending.value || breedingQuery.isPending.value || goats.isPending.value)
</script>

<template>
  <UAlert v-if="!isOwner" color="neutral" variant="subtle" icon="i-lucide-lock" title="Only owners can see sales." />
  <div v-else class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-semibold flex-1">Sales</h1>
      <UButton icon="i-lucide-plus" @click="reservationModal = { open: true }">New reservation</UButton>
      <UButton variant="soft" icon="i-lucide-handshake" @click="saleModal = { open: true }">Record a sale</UButton>
    </div>

    <div class="flex items-center gap-1">
      <UButton color="neutral" variant="outline" icon="i-lucide-chevron-left" aria-label="Previous season" @click="goToSeason(season - 1)" />
      <span class="px-3 font-medium tabular-nums">{{ season }} kidding season</span>
      <UButton color="neutral" variant="outline" icon="i-lucide-chevron-right" aria-label="Next season" @click="goToSeason(season + 1)" />
    </div>

    <div v-if="loading" class="space-y-2"><USkeleton v-for="i in 3" :key="i" class="h-20 w-full" /></div>

    <template v-else>
      <UCard v-if="!groups.length" class="text-center">
        <p class="text-muted">No reservations or kids for {{ season }} yet.</p>
      </UCard>

      <UCard v-for="g in groups" :key="g.doeId ?? 'any'" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-baseline gap-x-3">
            <h2 class="font-semibold flex-1">{{ g.title }}</h2>
            <span class="text-sm text-muted">{{ g.status }}</span>
          </div>
        </template>
        <ol class="divide-y divide-default">
          <li v-for="(r, i) in g.line" :key="r.id" class="px-4 py-3 space-y-2">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="w-5 text-sm text-muted tabular-nums">{{ i + 1 }}.</span>
              <button type="button" class="flex-1 min-w-40 text-start" @click="reservationModal = { open: true, reservation: r }">
                <span class="font-medium">{{ buyerName(r.buyer_id) }}</span>
                <span class="text-muted"> · {{ wantsText(r) }}</span>
                <span class="block text-xs text-muted">{{ depositText(r) }}</span>
              </button>
              <div class="flex items-center gap-1 ms-auto">
                <UDropdownMenu v-if="reservationProgress(r, data.sales).open && fitting(r).length" :items="matchItems(r)">
                  <UButton size="xs" variant="soft" icon="i-lucide-link">Match a kid</UButton>
                </UDropdownMenu>
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-arrow-up" :aria-label="`Move ${buyerName(r.buyer_id)} up`" :disabled="i === 0" @click="move(g.line, i, -1)" />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-down"
                  :aria-label="`Move ${buyerName(r.buyer_id)} down`"
                  :disabled="i === g.line.length - 1"
                  @click="move(g.line, i, 1)"
                />
              </div>
            </div>
            <ul v-if="salesFor(r).length" class="ps-8 space-y-1">
              <li v-for="s in salesFor(r)" :key="s.id" class="flex flex-wrap items-center gap-2 text-sm">
                <UIcon :name="s.sold_on ? 'i-lucide-check' : 'i-lucide-link'" class="text-muted" />
                <span class="flex-1">{{ saleLabel(s) }}</span>
                <template v-if="s.sold_on">
                  <button type="button" class="text-muted hover:underline" @click="saleModal = { open: true, sale: s }">
                    Sold {{ formatDate(s.sold_on) }} · {{ formatMoney(s.price_cents ?? 0) }}
                  </button>
                </template>
                <template v-else>
                  <UButton size="xs" @click="saleModal = { open: true, sale: s }">Sell</UButton>
                  <UButton size="xs" color="neutral" variant="ghost" :aria-label="`Unmatch ${saleLabel(s)}`" icon="i-lucide-x" @click="unmatch(s)" />
                </template>
              </li>
            </ul>
          </li>
          <li v-for="k in g.unreserved" :key="k.kid.id" class="px-4 py-2 flex items-center gap-3 text-sm">
            <span class="w-5" />
            <span class="flex-1 text-muted">{{ k.label }} · not matched yet</span>
            <UButton size="xs" variant="soft" @click="saleModal = { open: true, kid: k }">Sell</UButton>
          </li>
        </ol>
        <div v-if="g.doeId" class="px-4 py-2 border-t border-default">
          <UButton size="xs" color="neutral" variant="link" icon="i-lucide-plus" @click="reservationModal = { open: true, doeId: g.doeId }">
            Add to {{ g.title }}’s line
          </UButton>
        </div>
      </UCard>

      <div v-if="cancelled.length">
        <UButton color="neutral" variant="link" :icon="showCancelled ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" @click="showCancelled = !showCancelled">
          Cancelled ({{ cancelled.length }})
        </UButton>
        <ul v-if="showCancelled" class="divide-y divide-default rounded-lg border border-default">
          <li v-for="r in cancelled" :key="r.id">
            <button type="button" class="w-full text-start px-4 py-2 text-sm hover:bg-elevated/50" @click="reservationModal = { open: true, reservation: r }">
              {{ buyerName(r.buyer_id) }} · {{ r.doe_id ? doeName(r.doe_id) : 'Any doe' }} · {{ depositText(r) }}
            </button>
          </li>
        </ul>
      </div>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-baseline">
            <h2 class="font-semibold flex-1">Sold this season</h2>
            <span v-if="seasonSales.length" class="text-sm text-muted tabular-nums">{{ formatMoney(seasonTotal) }}</span>
          </div>
        </template>
        <p v-if="!seasonSales.length" class="p-4 text-muted">Nothing sold yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="s in seasonSales" :key="s.id">
            <button type="button" class="w-full text-start px-4 py-2 text-sm hover:bg-elevated/50 flex flex-wrap gap-x-3" @click="saleModal = { open: true, sale: s }">
              <span class="w-24 text-muted">{{ formatDate(s.sold_on) }}</span>
              <span class="flex-1">{{ saleLabel(s) }} to {{ buyerName(s.buyer_id) }}</span>
              <span class="tabular-nums">{{ formatMoney(s.price_cents ?? 0) }}</span>
              <span v-if="s.pickup_on" class="basis-full ps-27 text-xs text-muted">Pickup {{ formatDate(s.pickup_on) }}</span>
            </button>
          </li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center">
            <h2 class="font-semibold flex-1">Buyers</h2>
            <UButton size="xs" variant="soft" icon="i-lucide-plus" @click="buyerModal = { open: true }">Add buyer</UButton>
          </div>
        </template>
        <p v-if="!data.buyers.length" class="p-4 text-muted">No buyers yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="b in data.buyers" :key="b.id">
            <button type="button" class="w-full text-start px-4 py-2 text-sm hover:bg-elevated/50" @click="buyerModal = { open: true, buyer: b }">
              <span class="font-medium">{{ b.name }}</span>
              <span v-if="b.town" class="text-muted"> · {{ b.town }}</span>
              <span v-if="purchases(b)" class="text-muted"> · bought {{ purchases(b) }}</span>
              <span class="block text-xs text-muted">{{ [b.phone, b.email].filter(Boolean).join(' · ') }}</span>
            </button>
          </li>
        </ul>
      </UCard>
    </template>

    <ReservationModal v-model:open="reservationModal.open" :reservation="reservationModal.reservation" :doe-id="reservationModal.doeId" :season="reservationModal.reservation ? undefined : season" />
    <SaleModal v-model:open="saleModal.open" :sale="saleModal.sale" :kid="saleModal.kid" :kids="freeKids" />
    <BuyerModal v-model:open="buyerModal.open" :buyer="buyerModal.buyer" />
  </div>
</template>
