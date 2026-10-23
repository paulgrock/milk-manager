<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useGoatMutations, useHerdGoats } from '@/composables/useGoats'
import { useHerd } from '@/composables/useHerd'
import {
  BREED_CATEGORY_LABELS,
  HORN_LABELS,
  SEX_LABELS,
  STATUS_LABELS,
  goatFullName,
  type Goat,
  type GoatInsert,
  type GoatSex,
  type GoatStatus,
  type HornStatus,
} from '@/lib/goats'
import GoatPicker from '@/components/goats/GoatPicker.vue'

const DAIRY_BREEDS = [
  'Alpine',
  'Guernsey',
  'LaMancha',
  'Nigerian Dwarf',
  'Nubian',
  'Oberhasli',
  'Saanen',
  'Sable',
  'Toggenburg',
  'Mini Alpine',
  'Mini LaMancha',
  'Mini Nubian',
  'Mini Oberhasli',
  'Mini Saanen',
  'Mini Toggenburg',
]
const REGISTRIES = ['ADGA', 'AGS', 'AMGRA', 'MDGA', 'NDGA', 'TMGR']

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { isOwner } = useHerd()
const { goats, find } = useHerdGoats()
const { saveGoat, deleteGoat } = useGoatMutations()

const goatRef = computed(() => route.params.goat as string | undefined)
const existing = computed(() => find(goatRef.value))
const goatId = computed(() => existing.value?.id)
watch(
  existing,
  (g) => {
    if (g && goatRef.value !== g.slug) void router.replace(`/goats/${g.slug}/edit`)
  },
  { immediate: true },
)

type FormState = {
  registered_name: string
  barn_name: string
  title_prefix: string
  title_suffix: string
  sex: GoatSex
  breed: string
  breed_category: string
  birth_date: string
  color_markings: string
  horn_status: HornStatus
  registry: string
  registration_number: string
  pedigree_url: string
  tattoo_left: string
  tattoo_right: string
  scrapie_tag: string
  microchip: string
  sire_id: string | null
  dam_id: string | null
  status: GoatStatus
  left_herd_on: string
  left_herd_reason: string
  notes: string
}

function fromGoat(g?: Goat): FormState {
  return {
    registered_name: g?.registered_name ?? '',
    barn_name: g?.barn_name ?? '',
    title_prefix: g?.title_prefix ?? '',
    title_suffix: g?.title_suffix ?? '',
    sex: g?.sex ?? ((route.query.sex as GoatSex) || 'doe'),
    breed: g?.breed ?? '',
    breed_category: g?.breed_category ?? 'none',
    birth_date: g?.birth_date ?? '',
    color_markings: g?.color_markings ?? '',
    horn_status: g?.horn_status ?? 'disbudded',
    registry: g?.registry ?? 'ADGA',
    registration_number: g?.registration_number ?? '',
    pedigree_url: g?.pedigree_url ?? '',
    tattoo_left: g?.tattoo_left ?? '',
    tattoo_right: g?.tattoo_right ?? '',
    scrapie_tag: g?.scrapie_tag ?? '',
    microchip: g?.microchip ?? '',
    sire_id: g?.sire_id ?? null,
    dam_id: g?.dam_id ?? null,
    status: g?.status ?? 'active',
    left_herd_on: g?.left_herd_on ?? '',
    left_herd_reason: g?.left_herd_reason ?? '',
    notes: g?.notes ?? '',
  }
}

const form = reactive<FormState>(fromGoat())
const loadedFor = ref<string>()
watch(
  existing,
  (g) => {
    if (g && loadedFor.value !== g.id) {
      Object.assign(form, fromGoat(g))
      loadedFor.value = g.id
    }
  },
  { immediate: true },
)

const sexOptions = Object.entries(SEX_LABELS).map(([value, label]) => ({ label, value }))
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }))
const hornOptions = Object.entries(HORN_LABELS).map(([value, label]) => ({ label, value }))
const categoryOptions = [
  { label: 'Not set', value: 'none' },
  ...Object.entries(BREED_CATEGORY_LABELS).map(([value, label]) => ({ label, value })),
]
const breedItems = computed(() =>
  [...new Set([...DAIRY_BREEDS, ...(goats.data.value ?? []).map((g) => g.breed).filter((b): b is string => !!b)])].sort(),
)
const registryItems = computed(() => [...new Set([...REGISTRIES, form.registry].filter(Boolean))])

const leftHerd = computed(() => form.status === 'sold' || form.status === 'deceased')
const hasName = computed(() => !!form.registered_name.trim() || !!form.barn_name.trim())

const blank = (s: string) => s.trim() || null

function toValues(): Omit<GoatInsert, 'herd_id'> {
  return {
    registered_name: blank(form.registered_name),
    barn_name: blank(form.barn_name),
    title_prefix: blank(form.title_prefix),
    title_suffix: blank(form.title_suffix),
    sex: form.sex,
    breed: blank(form.breed),
    breed_category: form.breed_category === 'none' ? null : form.breed_category,
    birth_date: form.birth_date || null,
    color_markings: blank(form.color_markings),
    horn_status: form.horn_status,
    registry: blank(form.registry),
    registration_number: blank(form.registration_number),
    pedigree_url: blank(form.pedigree_url),
    tattoo_left: blank(form.tattoo_left),
    tattoo_right: blank(form.tattoo_right),
    scrapie_tag: blank(form.scrapie_tag),
    microchip: blank(form.microchip),
    sire_id: form.sire_id,
    dam_id: form.dam_id,
    status: form.status,
    left_herd_on: leftHerd.value ? form.left_herd_on || null : null,
    left_herd_reason: leftHerd.value ? blank(form.left_herd_reason) : null,
    notes: blank(form.notes),
  }
}

async function submit() {
  if (!hasName.value) {
    toast.add({ color: 'error', title: 'Give the goat a registered name or a barn name' })
    return
  }
  try {
    const wasSold = existing.value?.status === 'sold'
    const saved = await saveGoat.mutateAsync({ id: goatId.value, values: toValues() })
    // Just marked sold: the goat page offers to record the sale (owners only).
    const recordSale = saved.status === 'sold' && !wasSold && isOwner.value
    await router.replace({ path: `/goats/${saved.slug}`, query: recordSale ? { recordSale: '1' } : {} })
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not save goat', description: (e as Error).message })
  }
}

const confirmDelete = ref(false)
async function remove() {
  if (!existing.value) return
  try {
    await deleteGoat.mutateAsync(existing.value)
    confirmDelete.value = false
    await router.replace('/goats')
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not delete goat', description: (e as Error).message })
  }
}
</script>

<template>
  <div class="space-y-4 max-w-3xl">
    <div class="flex items-center gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        :to="existing ? `/goats/${existing.slug}` : '/goats'"
        aria-label="Back"
      />
      <h1 class="text-2xl font-semibold truncate">
        {{ existing ? `Edit ${goatFullName(existing)}` : 'Add goat' }}
      </h1>
    </div>

    <UAlert v-if="goatRef && !existing && !goats.isPending.value" color="error" variant="subtle" title="Goat not found" />

    <!-- Editing: wait for her details, or the empty form would be typed over, or saved as a new goat. -->
    <div v-else-if="goatRef && !existing" class="space-y-4" aria-label="Loading goat">
      <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <UCard>
        <template #header><h2 class="font-semibold">Name and titles</h2></template>
        <div class="space-y-3">
          <UFormField label="Registered name" hint="Including herd name, e.g. Bird's Eye Farm Ina May">
            <UInput v-model="form.registered_name" class="w-full" maxlength="200" />
          </UFormField>
          <div class="grid sm:grid-cols-3 gap-3">
            <UFormField label="Barn name">
              <UInput v-model="form.barn_name" class="w-full" maxlength="100" />
            </UFormField>
            <UFormField label="Title before name" hint="GCH, SGCH">
              <UInput v-model="form.title_prefix" class="w-full" maxlength="50" />
            </UFormField>
            <UFormField label="Title after name" hint="5*M *D, +*B">
              <UInput v-model="form.title_suffix" class="w-full" maxlength="50" />
            </UFormField>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header><h2 class="font-semibold">Details</h2></template>
        <div class="grid sm:grid-cols-2 gap-3">
          <UFormField label="Sex" required>
            <USelect v-model="form.sex" :items="sexOptions" class="w-full" />
          </UFormField>
          <UFormField label="Born">
            <UInput v-model="form.birth_date" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Breed">
            <UInputMenu
              v-model="form.breed"
              :items="breedItems"
              create-item
              class="w-full"
              @create="(b: string) => (form.breed = b)"
            />
          </UFormField>
          <UFormField label="Breed category">
            <USelect v-model="form.breed_category" :items="categoryOptions" class="w-full" />
          </UFormField>
          <UFormField label="Color and markings">
            <UInput v-model="form.color_markings" class="w-full" maxlength="200" />
          </UFormField>
          <UFormField label="Horns">
            <USelect v-model="form.horn_status" :items="hornOptions" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header><h2 class="font-semibold">Registration and ID</h2></template>
        <div class="grid sm:grid-cols-2 gap-3">
          <UFormField label="Registry">
            <UInputMenu
              v-model="form.registry"
              :items="registryItems"
              create-item
              class="w-full"
              @create="(r: string) => (form.registry = r)"
            />
          </UFormField>
          <UFormField label="Registration #">
            <UInput v-model="form.registration_number" class="w-full" maxlength="50" />
          </UFormField>
          <UFormField label="Online pedigree link" class="sm:col-span-2">
            <UInput v-model="form.pedigree_url" type="url" placeholder="https://" class="w-full" />
          </UFormField>
          <UFormField label="Tattoo, right ear" hint="Herd letters">
            <UInput v-model="form.tattoo_right" class="w-full" maxlength="20" />
          </UFormField>
          <UFormField label="Tattoo, left ear" hint="Year letter + number">
            <UInput v-model="form.tattoo_left" class="w-full" maxlength="20" />
          </UFormField>
          <UFormField label="Scrapie tag">
            <UInput v-model="form.scrapie_tag" class="w-full" maxlength="50" />
          </UFormField>
          <UFormField label="Microchip">
            <UInput v-model="form.microchip" class="w-full" maxlength="50" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">Parents</h2>
          <p class="text-sm text-muted">Pick from your herd, or type a name to add an outside sire or dam.</p>
        </template>
        <div class="grid sm:grid-cols-2 gap-3">
          <UFormField label="Sire">
            <GoatPicker v-model="form.sire_id" sex="buck" :exclude-id="goatId" />
          </UFormField>
          <UFormField label="Dam">
            <GoatPicker v-model="form.dam_id" sex="doe" :exclude-id="goatId" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header><h2 class="font-semibold">Status and notes</h2></template>
        <div class="space-y-3">
          <UFormField label="Status" hint="Reference = an outside goat kept for pedigrees">
            <USelect v-model="form.status" :items="statusOptions" class="w-full sm:w-60" />
          </UFormField>
          <div v-if="leftHerd" class="grid sm:grid-cols-2 gap-3">
            <UFormField :label="form.status === 'sold' ? 'Date sold' : 'Date died'">
              <UInput v-model="form.left_herd_on" type="date" class="w-full" />
            </UFormField>
            <UFormField :label="form.status === 'sold' ? 'Sold to / notes' : 'Cause'">
              <UInput v-model="form.left_herd_reason" class="w-full" maxlength="500" />
            </UFormField>
          </div>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" :rows="4" autoresize class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton type="submit" size="lg" :loading="saveGoat.isPending.value">
          {{ existing ? 'Save changes' : 'Add goat' }}
        </UButton>
        <UButton color="neutral" variant="ghost" size="lg" :to="existing ? `/goats/${existing.slug}` : '/goats'">Cancel</UButton>
        <UButton
          v-if="existing && isOwner"
          class="ms-auto"
          color="error"
          variant="ghost"
          size="lg"
          icon="i-lucide-trash-2"
          @click="confirmDelete = true"
        >
          Delete
        </UButton>
      </div>
    </form>

    <UModal
      v-model:open="confirmDelete"
      :title="`Delete ${existing ? goatFullName(existing) : 'goat'}?`"
      description="This removes the goat, its appraisals and photos. Offspring keep their records but lose the link to this parent. To keep the history, set the status to Sold or Deceased instead."
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="confirmDelete = false">Cancel</UButton>
          <UButton color="error" :loading="deleteGoat.isPending.value" @click="remove">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
