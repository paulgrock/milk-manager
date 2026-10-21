<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import { useHerd } from '@/composables/useHerd'
import { useHerdGoats } from '@/composables/useGoats'
import { useBreedingData, useBreedingMutations, type KidInput } from '@/composables/useBreeding'
import { formatDate, todayISO } from '@/lib/dates'
import { breedingStatus, dueWindow, type Breeding } from '@/lib/breeding'
import { goatFullName, goatName } from '@/lib/goats'
import { parseWeightInput } from '@/lib/milk'
import DoePicker from '@/components/breeding/DoePicker.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { byId } = useHerdGoats()
const { data } = useBreedingData()
const { recordKidding } = useBreedingMutations()

const doeId = ref<string | null>((route.query.doe as string) ?? null)
const kiddedOn = ref(todayISO())
const difficulty = ref<'unassisted' | 'assisted' | 'vet'>('unassisted')
const notes = ref('')
const startLactation = ref(true)

// Her breedings that could be this kidding, newest first.
const breedings = computed(() =>
  data.value.breedings
    .filter((b) => b.doe_id === doeId.value && b.bred_on < kiddedOn.value)
    .filter((b) => breedingStatus(b, data.value, kiddedOn.value) !== 'kidded')
    .sort((a, b) => b.bred_on.localeCompare(a.bred_on)),
)
const breedingLabel = (b: Breeding) => {
  const buck = b.buck_id ? byId.value.get(b.buck_id) : undefined
  return `${formatDate(b.bred_on)}${buck ? ` to ${goatFullName(buck)}` : ''} · due ${formatDate(dueWindow(b).expected)}`
}
const breedingOptions = computed(() => [
  ...breedings.value.map((b) => ({ label: breedingLabel(b), value: b.id })),
  { label: 'No breeding on record', value: 'none' },
])
const breedingId = ref<string>((route.query.breeding as string) ?? 'none')
watch(breedings, (list) => {
  if (!list.some((b) => b.id === breedingId.value)) breedingId.value = list[0]?.id ?? 'none'
})

const sire = computed(() => {
  const b = data.value.breedings.find((x) => x.id === breedingId.value)
  return b?.buck_id ? byId.value.get(b.buck_id) : undefined
})
const doe = computed(() => (doeId.value ? byId.value.get(doeId.value) : undefined))

type KidRow = { sex: 'doe' | 'buck'; outcome: KidInput['outcome']; weight: string; name: string; add_to_herd: boolean; error: string }
const newKid = (sex: 'doe' | 'buck' = 'doe'): KidRow => ({ sex, outcome: 'alive', weight: '', name: '', add_to_herd: true, error: '' })
const kids = reactive<KidRow[]>([newKid()])

const sexOptions = [
  { label: 'Doeling', value: 'doe' },
  { label: 'Buckling', value: 'buck' },
]
const outcomeOptions = [
  { label: 'Alive', value: 'alive' },
  { label: 'Stillborn', value: 'stillborn' },
  { label: 'Died', value: 'died' },
]
const difficultyOptions = [
  { label: 'Unassisted', value: 'unassisted' },
  { label: 'Assisted', value: 'assisted' },
  { label: 'Vet needed', value: 'vet' },
]

async function submit() {
  if (!doeId.value) return toast.add({ color: 'error', title: 'Pick the doe that kidded' })
  let ok = true
  const kidInputs: KidInput[] = kids.map((k) => {
    k.error = ''
    const parsed = parseWeightInput(k.weight, unit.value)
    if (parsed.kind === 'invalid' || (parsed.kind === 'ok' && parsed.portions)) {
      k.error = 'Birth weight should be one number, like 2.4'
      ok = false
    }
    return {
      sex: k.sex,
      outcome: k.outcome,
      birth_weight_g: parsed.kind === 'ok' ? parsed.grams : null,
      add_to_herd: k.outcome === 'alive' && k.add_to_herd,
      name: k.name.trim() || undefined,
    }
  })
  if (!ok) return
  try {
    await recordKidding.mutateAsync({
      doeId: doeId.value,
      kiddedOn: kiddedOn.value,
      breedingId: breedingId.value === 'none' ? null : breedingId.value,
      difficulty: difficulty.value,
      notes: notes.value,
      kids: kidInputs,
      startLactation: startLactation.value,
    })
    toast.add({ color: 'success', title: 'Kidding recorded' })
    await router.replace(`/goats/${doeId.value}`)
  } catch (e) {
    toast.add({ color: 'error', title: 'Could not record kidding', description: (e as Error).message })
  }
}
</script>

<template>
  <div class="space-y-4 max-w-2xl">
    <div class="flex items-center gap-2">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Back" @click="router.back()" />
      <h1 class="text-2xl font-semibold">Record a kidding</h1>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <UCard>
        <div class="space-y-3">
          <UFormField label="Doe" required><DoePicker v-model="doeId" /></UFormField>
          <div class="grid sm:grid-cols-2 gap-3">
            <UFormField label="Kidded on" required>
              <UInput v-model="kiddedOn" type="date" :max="todayISO()" required class="w-full" />
            </UFormField>
            <UFormField label="Kidding">
              <USelect v-model="difficulty" :items="difficultyOptions" class="w-full" />
            </UFormField>
          </div>
          <UFormField v-if="doeId" label="From breeding" :hint="sire ? `Sire: ${goatFullName(sire)}` : undefined">
            <USelect v-model="breedingId" :items="breedingOptions" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center">
            <h2 class="font-semibold flex-1">Kids</h2>
            <UButton v-if="kids.length < 8" size="sm" variant="soft" icon="i-lucide-plus" @click="kids.push(newKid('buck'))">
              Add kid
            </UButton>
          </div>
        </template>
        <div class="space-y-4">
          <fieldset v-for="(kid, i) in kids" :key="i" class="space-y-2 border-b border-default pb-4 last:border-0 last:pb-0">
            <legend class="sr-only">Kid {{ i + 1 }}</legend>
            <div class="flex flex-wrap items-end gap-2">
              <span class="font-medium w-12">Kid {{ i + 1 }}</span>
              <UFormField label="Sex" class="w-32">
                <USelect v-model="kid.sex" :items="sexOptions" class="w-full" :aria-label="`Kid ${i + 1} sex`" />
              </UFormField>
              <UFormField label="Born" class="w-32">
                <USelect v-model="kid.outcome" :items="outcomeOptions" class="w-full" :aria-label="`Kid ${i + 1} outcome`" />
              </UFormField>
              <UFormField :label="`Weight (${unit})`" class="w-28" :error="kid.error || undefined">
                <UInput v-model="kid.weight" inputmode="decimal" class="w-full" :aria-label="`Kid ${i + 1} weight`" />
              </UFormField>
              <UButton
                v-if="kids.length > 1"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                :aria-label="`Remove kid ${i + 1}`"
                @click="kids.splice(i, 1)"
              />
            </div>
            <div v-if="kid.outcome === 'alive'" class="flex flex-wrap items-center gap-3 ps-14">
              <UCheckbox v-model="kid.add_to_herd" :label="`Add to herd`" />
              <UInput
                v-if="kid.add_to_herd"
                v-model="kid.name"
                :placeholder="doe ? `${doe.barn_name || goatName(doe)} kid ${i + 1}` : 'Barn name'"
                maxlength="100"
                class="flex-1 min-w-40"
                :aria-label="`Kid ${i + 1} name`"
              />
            </div>
          </fieldset>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-3">
          <UCheckbox v-model="startLactation" label="Start her new lactation (adds her to the milk line)" />
          <UFormField label="Notes">
            <UTextarea v-model="notes" :rows="2" autoresize class="w-full" placeholder="Presentation, help needed, anything to remember" />
          </UFormField>
        </div>
      </UCard>

      <UAlert
        v-if="recordKidding.isPaused.value"
        color="warning"
        variant="subtle"
        icon="i-lucide-wifi-off"
        title="No signal. This kidding will save as soon as you are back online."
        description="Keep this screen open until it does."
      />
      <UButton type="submit" size="lg" :loading="recordKidding.isPending.value">Save kidding</UButton>
    </form>
  </div>
</template>
