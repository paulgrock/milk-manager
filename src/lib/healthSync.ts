// Routine care logs, registered as mutation defaults like milk saves
// (milkSync.ts): hoof trims and copper happen in the barn, so a log made
// with no signal is kept on the device and sent later.
import { queryClient, saveCacheNow } from './queryClient'
import { supabase, unwrap } from './supabase'
import type { CareEvent, CareType, DiseaseTest, HealthObservation, Treatment } from './health'
import { retry, retryDelay } from './offlineRetry'

export const healthKey = (herdId: string) => ['health', herdId] as const

export const LOG_CARE = ['care', 'log'] as const
export const DELETE_CARE = ['care', 'delete'] as const

export type HealthData = {
  careTypes: CareType[]
  careEvents: CareEvent[]
  treatments: Treatment[]
  observations: HealthObservation[]
  tests: DiseaseTest[]
}

export type LogCareVars = { herdId: string; events: CareEvent[] }
export type DeleteCareVars = { herdId: string; id: string }

const scope = { id: 'care' }

function update(herdId: string, change: (events: CareEvent[]) => CareEvent[]) {
  queryClient.setQueryData<HealthData>(healthKey(herdId), (data) => (data ? { ...data, careEvents: change(data.careEvents) } : data))
}

queryClient.setMutationDefaults<unknown, Error, LogCareVars>(LOG_CARE, {
  scope,
  retry,
  retryDelay,
  // Inserting with ids made on the device and ignoring duplicates makes a
  // replayed log harmless.
  mutationFn: async (v) =>
    unwrap(
      await supabase
        .from('care_events')
        .upsert(
          v.events.map(({ created_at: _c, created_by: _b, ...e }) => e),
          { onConflict: 'id', ignoreDuplicates: true },
        ),
    ),
  onMutate: async (v) => {
    await queryClient.cancelQueries({ queryKey: healthKey(v.herdId) })
    const ids = new Set(v.events.map((e) => e.id))
    update(v.herdId, (events) => [...events.filter((e) => !ids.has(e.id)), ...v.events])
    await saveCacheNow()
  },
  onError: (_e, v) => void queryClient.invalidateQueries({ queryKey: healthKey(v.herdId) }),
  onSettled: (_d, _e, v) => void queryClient.invalidateQueries({ queryKey: healthKey(v.herdId) }),
})

queryClient.setMutationDefaults<unknown, Error, DeleteCareVars>(DELETE_CARE, {
  scope,
  retry,
  retryDelay,
  mutationFn: async (v) => unwrap(await supabase.from('care_events').delete().eq('id', v.id)),
  onMutate: async (v) => {
    await queryClient.cancelQueries({ queryKey: healthKey(v.herdId) })
    update(v.herdId, (events) => events.filter((e) => e.id !== v.id))
    await saveCacheNow()
  },
  onError: (_e, v) => void queryClient.invalidateQueries({ queryKey: healthKey(v.herdId) }),
})
