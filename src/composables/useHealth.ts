import { computed } from 'vue'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import { DELETE_CARE, LOG_CARE, healthKey, type DeleteCareVars, type HealthData, type LogCareVars } from '@/lib/healthSync'
import type { CareEvent } from '@/lib/health'
import type { Database } from '@/lib/database.types'
import { useHerd } from './useHerd'
import { useAuth } from './useAuth'

type Tables = Database['public']['Tables']
type Insert<T extends keyof Tables> = Omit<Tables[T]['Insert'], 'herd_id'>
type HealthTable = 'care_types' | 'care_events' | 'treatments' | 'health_observations' | 'disease_tests'

const empty: HealthData = { careTypes: [], careEvents: [], treatments: [], observations: [], tests: [] }

export function useHealthData() {
  const { herdId } = useHerd()
  const query = useQuery({
    queryKey: computed(() => healthKey(herdId.value)),
    queryFn: async (): Promise<HealthData> => {
      const all = <T>(table: HealthTable) =>
        // Same shape for each table; typed per call by T.
        fetchAll<T>((from, to) => supabase.from(table as 'treatments').select('*').eq('herd_id', herdId.value).order('id').range(from, to) as never)
      const [careTypes, careEvents, treatments, observations, tests] = await Promise.all([
        all<HealthData['careTypes'][number]>('care_types'),
        all<HealthData['careEvents'][number]>('care_events'),
        all<HealthData['treatments'][number]>('treatments'),
        all<HealthData['observations'][number]>('health_observations'),
        all<HealthData['tests'][number]>('disease_tests'),
      ])
      careTypes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      return { careTypes, careEvents, treatments, observations, tests }
    },
    enabled: computed(() => !!herdId.value),
  })
  return { query, data: computed(() => query.data.value ?? empty) }
}

/** Logging care works offline (see healthSync.ts). */
export function useCareLog() {
  const { herdId } = useHerd()
  const { user } = useAuth()
  const log = useMutation<unknown, Error, LogCareVars>({ mutationKey: LOG_CARE })
  const remove = useMutation<unknown, Error, DeleteCareVars>({ mutationKey: DELETE_CARE })
  const waiting = useMutationState({
    filters: { mutationKey: ['care'], status: 'pending' },
    select: (m) => m.state.isPaused || m.state.failureCount > 0,
  })

  function logCare(input: { careTypeId: string; goatIds: string[]; doneOn: string; dose: number | null; notes: string }) {
    const events: CareEvent[] = input.goatIds.map((goatId) => ({
      id: crypto.randomUUID(),
      herd_id: herdId.value,
      goat_id: goatId,
      care_type_id: input.careTypeId,
      done_on: input.doneOn,
      dose: input.dose,
      notes: input.notes.trim() || null,
      created_by: user.value?.id ?? null,
      created_at: new Date().toISOString(),
    }))
    return log.mutateAsync({ herdId: herdId.value, events })
  }

  return {
    logCare,
    removeCare: (id: string) => remove.mutate({ herdId: herdId.value, id }),
    waitingCount: computed(() => waiting.value.filter(Boolean).length),
  }
}

/** Treatments, health checks, tests and the care routine: saved online. */
export function useHealthMutations() {
  const queryClient = useQueryClient()
  const { herdId } = useHerd()
  const refresh = () => queryClient.invalidateQueries({ queryKey: healthKey(herdId.value) })

  function saver<T extends Exclude<HealthTable, 'care_events'>>(table: T) {
    return useMutation({
      mutationFn: async ({ id, values }: { id?: string; values: Insert<T> }) => {
        const from = supabase.from(table as 'treatments')
        if (id) return unwrap(await from.update(values as never).eq('id', id))
        return unwrap(await from.insert({ ...values, herd_id: herdId.value } as never))
      },
      onSuccess: refresh,
    })
  }
  function remover(table: Exclude<HealthTable, 'care_events'>) {
    return useMutation({
      mutationFn: async (id: string) => unwrap(await supabase.from(table).delete().eq('id', id)),
      onSuccess: refresh,
    })
  }

  return {
    saveCareType: saver('care_types'),
    saveTreatment: saver('treatments'),
    saveObservation: saver('health_observations'),
    saveTest: saver('disease_tests'),
    removeCareType: remover('care_types'),
    removeTreatment: remover('treatments'),
    removeObservation: remover('health_observations'),
    removeTest: remover('disease_tests'),
  }
}
