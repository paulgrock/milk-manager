<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCareLog, useHealthData } from '@/composables/useHealth'
import { useHerd } from '@/composables/useHerd'
import { formatDate, relativeDays, todayISO } from '@/lib/dates'
import type { Goat } from '@/lib/goats'
import {
  ROUTE_LABELS,
  careStatus,
  famachaConcern,
  latestMeasures,
  withholdThrough,
  type CareEvent,
  type DiseaseTest,
  type HealthObservation,
  type Treatment,
} from '@/lib/health'
import { formatWeight } from '@/lib/milk'
import LogCareModal from './LogCareModal.vue'
import TreatmentModal from './TreatmentModal.vue'
import ObservationModal from './ObservationModal.vue'
import TestModal from './TestModal.vue'

const props = defineProps<{ goat: Goat }>()
const today = todayISO()
const { herd } = useHerd()
const unit = computed(() => herd.value?.weight_unit ?? 'lb')
const { data } = useHealthData()
const { removeCare } = useCareLog()

const care = computed(() =>
  data.value.careTypes.filter((t) => !t.archived).map((t) => careStatus(props.goat.id, t, data.value.careEvents, today)),
)
const measures = computed(() => latestMeasures(props.goat.id, data.value.observations))

type Event =
  | { kind: 'care'; date: string; care: CareEvent }
  | { kind: 'treatment'; date: string; treatment: Treatment }
  | { kind: 'check'; date: string; observation: HealthObservation }
  | { kind: 'test'; date: string; test: DiseaseTest }

const history = computed<Event[]>(() => {
  const id = props.goat.id
  const d = data.value
  return [
    ...d.careEvents.filter((e) => e.goat_id === id).map((care) => ({ kind: 'care' as const, date: care.done_on, care })),
    ...d.treatments.filter((t) => t.goat_id === id).map((treatment) => ({ kind: 'treatment' as const, date: treatment.started_on, treatment })),
    ...d.observations.filter((o) => o.goat_id === id).map((observation) => ({ kind: 'check' as const, date: observation.observed_on, observation })),
    ...d.tests.filter((t) => t.goat_id === id).map((test) => ({ kind: 'test' as const, date: test.tested_on, test })),
  ].sort((a, b) => b.date.localeCompare(a.date))
})
const showAll = ref(false)
const shownHistory = computed(() => (showAll.value ? history.value : history.value.slice(0, 8)))
const typeName = (id: string) => data.value.careTypes.find((t) => t.id === id)?.name ?? 'Care'
const typeUnit = (id: string) => data.value.careTypes.find((t) => t.id === id)?.dose_unit ?? ''

function observationText(o: HealthObservation) {
  return [
    o.famacha !== null && `FAMACHA ${o.famacha}`,
    o.body_condition !== null && `BCS ${Number(o.body_condition)}`,
    o.weight_g !== null && formatWeight(o.weight_g, unit.value, true),
  ]
    .filter(Boolean)
    .join(' · ')
}

const careModal = ref<{ open: boolean; careTypeId?: string }>({ open: false })
const treatmentModal = ref<{ open: boolean; treatment?: Treatment }>({ open: false })
const observationModal = ref<{ open: boolean; observation?: HealthObservation }>({ open: false })
const testModal = ref<{ open: boolean; test?: DiseaseTest }>({ open: false })

function open(e: Event) {
  if (e.kind === 'treatment') treatmentModal.value = { open: true, treatment: e.treatment }
  else if (e.kind === 'check') observationModal.value = { open: true, observation: e.observation }
  else if (e.kind === 'test') testModal.value = { open: true, test: e.test }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="font-semibold flex-1">Health</h2>
        <UButton size="sm" variant="soft" icon="i-lucide-clipboard-check" @click="careModal = { open: true }">Log care</UButton>
        <UButton size="sm" variant="soft" icon="i-lucide-pill" @click="treatmentModal = { open: true }">Treatment</UButton>
        <UButton size="sm" variant="soft" icon="i-lucide-stethoscope" @click="observationModal = { open: true }">Check</UButton>
        <UButton size="sm" variant="soft" icon="i-lucide-flask-conical" @click="testModal = { open: true }">Test</UButton>
      </div>
    </template>

    <div class="space-y-4">
      <ul class="grid sm:grid-cols-2 gap-2">
        <li v-for="c in care" :key="c.type.id" class="rounded-md border border-default px-3 py-2">
          <div class="flex items-center gap-2">
            <span class="font-medium flex-1 text-sm">{{ c.type.name }}</span>
            <UBadge v-if="c.state === 'overdue'" color="warning" variant="subtle" size="sm" icon="i-lucide-alarm-clock">Overdue</UBadge>
            <UBadge v-else-if="c.state === 'due'" color="neutral" variant="subtle" size="sm">Due soon</UBadge>
          </div>
          <p class="text-xs text-muted">
            <template v-if="c.last">Last {{ formatDate(c.last.done_on) }}</template>
            <template v-else>Never recorded</template>
            <template v-if="c.nextDue"> · next {{ relativeDays(c.daysUntilDue!) }}</template>
          </p>
        </li>
      </ul>

      <dl v-if="measures.famacha || measures.bodyCondition || measures.weightG" class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div v-if="measures.famacha">
          <dt class="text-xs text-muted">FAMACHA</dt>
          <dd :class="famachaConcern(measures.famacha.value) === 'treat' ? 'text-error font-semibold' : ''">
            {{ measures.famacha.value }} <span class="text-xs text-muted">{{ formatDate(measures.famacha.on) }}</span>
          </dd>
        </div>
        <div v-if="measures.bodyCondition">
          <dt class="text-xs text-muted">Body condition</dt>
          <dd>{{ measures.bodyCondition.value }} <span class="text-xs text-muted">{{ formatDate(measures.bodyCondition.on) }}</span></dd>
        </div>
        <div v-if="measures.weightG">
          <dt class="text-xs text-muted">Weight</dt>
          <dd>{{ formatWeight(measures.weightG.value, unit, true) }} <span class="text-xs text-muted">{{ formatDate(measures.weightG.on) }}</span></dd>
        </div>
      </dl>

      <ul v-if="history.length" class="divide-y divide-default border-t border-default">
        <li v-for="e in shownHistory" :key="`${e.kind}-${e.kind === 'care' ? e.care.id : e.kind === 'treatment' ? e.treatment.id : e.kind === 'check' ? e.observation.id : e.test.id}`" class="flex items-center gap-2">
          <button type="button" class="flex-1 py-2 flex gap-3 text-start text-sm hover:bg-elevated/50 rounded" :disabled="e.kind === 'care'" @click="open(e)">
            <span class="w-24 shrink-0 text-muted">{{ formatDate(e.date) }}</span>
            <span class="flex-1">
              <template v-if="e.kind === 'care'">
                {{ typeName(e.care.care_type_id) }}<template v-if="e.care.dose"> · {{ Number(e.care.dose) }} {{ typeUnit(e.care.care_type_id) }}</template>
                <template v-if="e.care.notes"> · {{ e.care.notes }}</template>
              </template>
              <template v-else-if="e.kind === 'treatment'">
                {{ e.treatment.medication }}<template v-if="e.treatment.reason"> for {{ e.treatment.reason }}</template>
                <span class="text-muted">
                  <template v-if="e.treatment.dose"> · {{ e.treatment.dose }}</template>
                  <template v-if="e.treatment.route"> {{ ROUTE_LABELS[e.treatment.route].toLowerCase() }}</template>
                  <template v-if="withholdThrough(e.treatment)"> · milk withheld through {{ formatDate(withholdThrough(e.treatment)) }}</template>
                </span>
              </template>
              <template v-else-if="e.kind === 'check'">{{ observationText(e.observation) }}</template>
              <template v-else>{{ e.test.disease }}: {{ e.test.result }}<span v-if="e.test.lab" class="text-muted"> · {{ e.test.lab }}</span></template>
            </span>
          </button>
          <UButton
            v-if="e.kind === 'care'"
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            :aria-label="`Delete ${typeName(e.care.care_type_id)} on ${formatDate(e.date)}`"
            @click="removeCare(e.care.id)"
          />
        </li>
      </ul>
      <UButton v-if="history.length > 8" size="xs" variant="link" color="neutral" @click="showAll = !showAll">
        {{ showAll ? 'Show less' : `Show all ${history.length}` }}
      </UButton>
    </div>

    <LogCareModal v-model:open="careModal.open" :care-type-id="careModal.careTypeId" :goat-ids="[goat.id]" />
    <TreatmentModal v-model:open="treatmentModal.open" :goat-id="goat.id" :treatment="treatmentModal.treatment" />
    <ObservationModal v-model:open="observationModal.open" :goat-id="goat.id" :observation="observationModal.observation" />
    <TestModal v-model:open="testModal.open" :goat-id="goat.id" :test="testModal.test" />
  </UCard>
</template>
