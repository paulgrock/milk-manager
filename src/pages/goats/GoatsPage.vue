<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats'
import {
  CURRENT_STATUSES,
  SEX_LABELS,
  STATUS_LABELS,
  appraisalSummary,
  filterGoats,
  formatAge,
  goatFullName,
  latestAppraisals,
  type GoatSex,
  type GoatStatus,
} from '@/lib/goats'
import GoatAvatar from '@/components/goats/GoatAvatar.vue'
import { useLactations } from '@/composables/useMilk'
import { todayISO } from '@/lib/dates'
import { lactationOn } from '@/lib/milk'

const { goats, appraisals, photos } = useHerdGoats()

// Remembered per device so the list opens the way you left it.
const search = useLocalStorage('goats.search', '')
const view = useLocalStorage<'current' | 'in_milk' | 'all' | GoatStatus>('goats.view', 'current')
const sex = useLocalStorage<GoatSex | 'any'>('goats.sex', 'any')
const breed = useLocalStorage<string>('goats.breed', 'any')

const viewOptions = [
  { label: 'Current herd', value: 'current' },
  { label: 'In milk', value: 'in_milk' },
  { label: 'Everyone', value: 'all' },
  ...(['for_sale', 'sold', 'deceased', 'reference'] as const).map((s) => ({ label: STATUS_LABELS[s], value: s })),
]
const sexOptions = [{ label: 'Any sex', value: 'any' }, ...Object.entries(SEX_LABELS).map(([value, label]) => ({ label, value }))]
const breedOptions = computed(() => [
  { label: 'Any breed', value: 'any' },
  ...[...new Set((goats.data.value ?? []).map((g) => g.breed).filter((b): b is string => !!b))]
    .sort()
    .map((b) => ({ label: b, value: b })),
])

const lactations = useLactations()
const today = todayISO()

const filtered = computed(() => {
  const list = filterGoats(goats.data.value ?? [], {
    search: search.value,
    statuses: view.value === 'current' || view.value === 'in_milk' ? CURRENT_STATUSES : view.value === 'all' ? [] : [view.value],
    sex: sex.value === 'any' ? null : sex.value,
    breed: breed.value === 'any' ? null : breed.value,
  })
  return view.value === 'in_milk' ? list.filter((g) => lactationOn(lactations.data.value ?? [], g.id, today)) : list
})

const latest = computed(() => latestAppraisals(appraisals.data.value ?? []))
const primaryPhotos = computed(
  () => new Map((photos.data.value ?? []).filter((p) => p.is_primary).map((p) => [p.goat_id, p.storage_path])),
)
const photoUrls = usePhotoUrls(() => filtered.value.map((g) => primaryPhotos.value.get(g.id)).filter((p): p is string => !!p))

const hasFilters = computed(() => !!search.value || view.value !== 'current' || sex.value !== 'any' || breed.value !== 'any')
function clearFilters() {
  search.value = ''
  view.value = 'current'
  sex.value = 'any'
  breed.value = 'any'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-semibold flex-1">Goats</h1>
      <UButton to="/goats/new" icon="i-lucide-plus">Add goat</UButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Name, tattoo or registration #"
        class="w-full sm:flex-1 sm:min-w-64"
        :ui="{ trailing: 'pe-1' }"
      >
        <template v-if="search" #trailing>
          <UButton color="neutral" variant="link" icon="i-lucide-x" aria-label="Clear search" @click="search = ''" />
        </template>
      </UInput>
      <USelect v-model="view" :items="viewOptions" class="flex-1 sm:flex-none sm:w-40" />
      <USelect v-model="sex" :items="sexOptions" class="flex-1 sm:flex-none sm:w-32" />
      <USelect v-model="breed" :items="breedOptions" class="flex-1 sm:flex-none sm:w-44" />
    </div>

    <div v-if="goats.isPending.value" class="space-y-2">
      <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
    </div>

    <UCard v-else-if="!goats.data.value?.length" class="text-center">
      <p class="text-muted mb-3">No goats yet. Add your first doe or buck to get started.</p>
      <UButton to="/goats/new" icon="i-lucide-plus">Add goat</UButton>
    </UCard>

    <UCard v-else-if="!filtered.length" class="text-center">
      <p class="text-muted mb-3">No goats match these filters.</p>
      <UButton color="neutral" variant="outline" @click="clearFilters">Clear filters</UButton>
    </UCard>

    <template v-else>
      <p class="text-sm text-muted">
        {{ filtered.length }} {{ filtered.length === 1 ? 'goat' : 'goats' }}
        <UButton v-if="hasFilters" variant="link" size="sm" class="p-0 ms-2" @click="clearFilters">Clear filters</UButton>
      </p>
      <ul class="divide-y divide-default rounded-lg border border-default">
        <li v-for="g in filtered" :key="g.id">
          <RouterLink :to="`/goats/${g.slug}`" class="flex items-center gap-3 p-3 hover:bg-elevated/50">
            <GoatAvatar :goat="g" :url="photoUrls[primaryPhotos.get(g.id) ?? '']" />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ goatFullName(g) }}</p>
              <p class="text-sm text-muted truncate">
                <span v-if="g.barn_name && g.registered_name">"{{ g.barn_name }}" · </span>
                {{ SEX_LABELS[g.sex] }}
                <template v-if="g.breed"> · {{ g.breed }}</template>
                <template v-if="g.birth_date"> · {{ formatAge(g.birth_date) }}</template>
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <UBadge v-if="latest.get(g.id)" color="neutral" variant="subtle">
                {{ appraisalSummary(latest.get(g.id)!) }}
              </UBadge>
              <UBadge v-if="!CURRENT_STATUSES.includes(g.status) || g.status === 'for_sale'" color="neutral" variant="outline" size="sm">
                {{ STATUS_LABELS[g.status] }}
              </UBadge>
            </div>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
