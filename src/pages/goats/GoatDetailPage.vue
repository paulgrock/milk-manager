<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats'
import { formatDate } from '@/lib/dates'
import {
  BREED_CATEGORY_LABELS,
  HORN_LABELS,
  SEX_LABELS,
  STATUS_LABELS,
  formatAge,
  goatFullName,
  latestAppraisals,
  offspringOf,
} from '@/lib/goats'
import GoatAvatar from '@/components/goats/GoatAvatar.vue'
import PedigreeChart from '@/components/goats/PedigreeChart.vue'
import AppraisalSection from '@/components/goats/AppraisalSection.vue'
import PhotoSection from '@/components/goats/PhotoSection.vue'
import LactationSection from '@/components/milk/LactationSection.vue'
import LactationCurveCard from '@/components/milk/LactationCurveCard.vue'
import BreedingCard from '@/components/breeding/BreedingCard.vue'
import HealthCard from '@/components/health/HealthCard.vue'
import MilkTestsCard from '@/components/milk/MilkTestsCard.vue'
import GoatFinanceCard from '@/components/finances/GoatFinanceCard.vue'
import EntryModal from '@/components/finances/EntryModal.vue'
import { useHerd } from '@/composables/useHerd'
import { useRouter } from 'vue-router'
import { ageInYears } from '@/lib/goats'
import { useHealthData } from '@/composables/useHealth'
import { todayISO } from '@/lib/dates'
import { withdrawalOn } from '@/lib/health'

const route = useRoute()
const { goats, appraisals, photos, byId, find } = useHerdGoats()

const goat = computed(() => find(route.params.goat as string))
const router = useRouter()
// Links made with her id (older bookmarks, the add-goat form) end up at her name.
watch(
  goat,
  (g) => {
    if (g && route.params.goat !== g.slug) void router.replace({ path: `/goats/${g.slug}`, query: route.query })
  },
  { immediate: true },
)
const latest = computed(() => latestAppraisals(appraisals.data.value ?? []))
const goatAppraisals = computed(() => (appraisals.data.value ?? []).filter((a) => a.goat_id === goat.value?.id))
const goatPhotos = computed(() => (photos.data.value ?? []).filter((p) => p.goat_id === goat.value?.id))
const primary = computed(() => goatPhotos.value.find((p) => p.is_primary))
const primaryUrl = usePhotoUrls(() => (primary.value ? [primary.value.storage_path] : []))
const { isOwner } = useHerd()
// Arriving with ?recordSale=1 (just marked sold): offer to put the sale in the books.
const saleOpen = computed({
  get: () => route.query.recordSale === '1' && isOwner.value && !!goat.value,
  set: (open) => {
    if (!open) void router.replace({ query: {} })
  },
})
const saleDraft = computed(() => {
  const g = goat.value
  if (!g) return undefined
  const young = (ageInYears(g.birth_date, g.left_herd_on ?? todayISO()) ?? 99) < 1
  return {
    kind: 'income' as const,
    category: young ? 'kid_sale' : 'goat_sale',
    occurred_on: g.left_herd_on ?? todayISO(),
    description: `Sold ${g.barn_name || g.registered_name || ''}`.trim(),
    goat_id: g.id,
  }
})

const health = useHealthData()
const withdrawal = computed(() => (goat.value ? withdrawalOn(goat.value.id, health.data.value.treatments, todayISO()) : null))
const kids = computed(() => (goat.value ? offspringOf(goat.value.id, goats.data.value ?? []) : []))

const details = computed(() => {
  const g = goat.value
  if (!g) return []
  const tattoo = [g.tattoo_right && `R: ${g.tattoo_right}`, g.tattoo_left && `L: ${g.tattoo_left}`].filter(Boolean).join(' · ')
  return [
    { label: 'Born', value: g.birth_date ? `${formatDate(g.birth_date)} (${formatAge(g.birth_date)})` : '' },
    { label: 'Breed', value: [g.breed, g.breed_category && BREED_CATEGORY_LABELS[g.breed_category]].filter(Boolean).join(' · ') },
    { label: 'Color', value: g.color_markings },
    { label: 'Horns', value: g.horn_status === 'unknown' ? '' : HORN_LABELS[g.horn_status] },
    { label: 'Registration', value: [g.registry, g.registration_number].filter(Boolean).join(' ') },
    { label: 'Tattoo', value: tattoo },
    { label: 'Scrapie tag', value: g.scrapie_tag },
    { label: 'Microchip', value: g.microchip },
  ].filter((d) => d.value)
})
</script>

<template>
  <div v-if="goats.isPending.value" class="space-y-3">
    <USkeleton class="h-24 w-full" />
    <USkeleton class="h-48 w-full" />
  </div>

  <UAlert v-else-if="!goat" color="error" variant="subtle" title="Goat not found" :actions="[{ label: 'Back to goats', to: '/goats' }]" />

  <div v-else class="space-y-4">
    <div class="flex items-start gap-4">
      <GoatAvatar :goat="goat" :url="primary ? primaryUrl[primary.storage_path] : undefined" size="3xl" />
      <div class="flex-1 min-w-0">
        <h1 class="text-xl sm:text-2xl font-semibold break-words">{{ goatFullName(goat) }}</h1>
        <p v-if="goat.barn_name && goat.registered_name" class="text-muted">"{{ goat.barn_name }}"</p>
        <div class="flex flex-wrap gap-1 mt-2">
          <UBadge color="neutral" variant="subtle">{{ SEX_LABELS[goat.sex] }}</UBadge>
          <UBadge :color="goat.status === 'active' ? 'primary' : 'neutral'" variant="subtle">{{ STATUS_LABELS[goat.status] }}</UBadge>
          <UBadge v-if="latest.get(goat.id)" color="neutral" variant="outline">LA {{ latest.get(goat.id)!.final_score }}</UBadge>
        </div>
      </div>
      <UButton :to="`/goats/${goat.slug}/edit`" color="neutral" variant="outline" icon="i-lucide-pencil">
        <span class="hidden sm:inline">Edit</span>
      </UButton>
    </div>

    <UAlert
      v-if="goat.status === 'deceased' || goat.status === 'sold'"
      color="neutral"
      variant="subtle"
      :icon="goat.status === 'deceased' ? 'i-lucide-flower-2' : 'i-lucide-hand-coins'"
      :title="`${goat.status === 'deceased' ? 'Died' : 'Sold'}${goat.left_herd_on ? ` ${formatDate(goat.left_herd_on)}` : ''}`"
      :description="goat.left_herd_reason ?? undefined"
    />

    <UAlert
      v-if="withdrawal"
      color="warning"
      variant="subtle"
      icon="i-lucide-milk-off"
      :title="`Milk withheld through ${formatDate(withdrawal.through)}`"
      :description="withdrawal.treatments.map((t) => t.medication).join(', ')"
    />

    <LactationCurveCard v-if="goat.sex === 'doe'" :goat="goat" />

    <div class="grid lg:grid-cols-2 gap-4 items-start">
      <div class="space-y-4">
        <UCard>
          <template #header><h2 class="font-semibold">Details</h2></template>
          <dl v-if="details.length" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <template v-for="d in details" :key="d.label">
              <dt class="text-muted">{{ d.label }}</dt>
              <dd class="break-words">{{ d.value }}</dd>
            </template>
          </dl>
          <p v-else class="text-muted">No details yet.</p>
          <UButton
            v-if="goat.pedigree_url"
            :to="goat.pedigree_url"
            target="_blank"
            variant="link"
            icon="i-lucide-external-link"
            class="px-0 mt-2"
          >
            Online pedigree
          </UButton>
        </UCard>

        <UCard>
          <template #header><h2 class="font-semibold">Pedigree</h2></template>
          <PedigreeChart :goat="goat" :by-id="byId" :latest="latest" />
        </UCard>

        <UCard v-if="goat.notes">
          <template #header><h2 class="font-semibold">Notes</h2></template>
          <p class="whitespace-pre-wrap">{{ goat.notes }}</p>
        </UCard>
      </div>

      <div class="space-y-4">
        <MilkTestsCard v-if="goat.sex === 'doe'" :goat="goat" />
        <HealthCard :goat="goat" />
        <GoatFinanceCard :goat="goat" />
        <BreedingCard v-if="goat.sex === 'doe'" :goat="goat" />
        <LactationSection v-if="goat.sex === 'doe'" :goat="goat" />
        <AppraisalSection :goat="goat" :appraisals="goatAppraisals" />
        <PhotoSection :goat="goat" :photos="goatPhotos" />

        <UCard>
          <template #header><h2 class="font-semibold">Offspring</h2></template>
          <p v-if="!kids.length" class="text-muted">None recorded.</p>
          <ul v-else class="divide-y divide-default -my-2">
            <li v-for="k in kids" :key="k.id">
              <RouterLink :to="`/goats/${k.slug}`" class="py-2 flex items-center gap-2 hover:underline">
                <span class="flex-1 truncate">{{ goatFullName(k) }}</span>
                <span class="text-sm text-muted">{{ SEX_LABELS[k.sex] }}<template v-if="k.birth_date"> · {{ formatDate(k.birth_date) }}</template></span>
              </RouterLink>
            </li>
          </ul>
        </UCard>
      </div>
    </div>

    <EntryModal v-model:open="saleOpen" :draft="saleDraft" />
  </div>
</template>
