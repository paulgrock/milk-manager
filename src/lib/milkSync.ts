// Milk saves, registered as mutation defaults so a save made offline can be
// restored from the device cache and sent later, even after a reload.
import { queryClient, saveCacheNow } from './queryClient'
import { supabase, unwrap } from './supabase'
import { applyRecord, type MilkRow, type RecordInput } from './milk'
import { retry, retryDelay } from './offlineRetry'

export const milkKeys = {
  all: ['milk'] as const,
  day: (herdId: string, date: string) => ['milk', 'day', herdId, date] as const,
  totals: (herdId: string) => ['milk', 'totals', herdId] as const,
  goat: (goatId: string) => ['milk', 'goat', goatId] as const,
}

export const RECORD_MILKING = ['milk', 'record'] as const
export const CLEAR_MILKING = ['milk', 'clear'] as const

export type RecordVars = RecordInput & { herdId: string }
export type ClearVars = { herdId: string; goatId: string; milkedOn: string; milking: number }

function setGoatDay(herdId: string, date: string, goatId: string, update: (rows: MilkRow[]) => MilkRow[]) {
  queryClient.setQueryData<MilkRow[]>(milkKeys.day(herdId, date), (all = []) => [
    ...all.filter((r) => r.goat_id !== goatId),
    ...update(all.filter((r) => r.goat_id === goatId)),
  ])
}

function refreshAfter(herdId: string, goatId: string) {
  void queryClient.invalidateQueries({ queryKey: milkKeys.totals(herdId) })
  void queryClient.invalidateQueries({ queryKey: milkKeys.goat(goatId) })
}

// One queue for all milk saves: they reach the server in the order they
// were made, so a correction never lands before the weight it corrects.
const scope = { id: 'milk' }

queryClient.setMutationDefaults<MilkRow[], Error, RecordVars>(RECORD_MILKING, {
  scope,
  retry,
  retryDelay,
  mutationFn: async (v: RecordVars): Promise<MilkRow[]> =>
    unwrap(
      await supabase.rpc('record_milking', {
        p_goat_id: v.goatId,
        p_milked_on: v.milkedOn,
        p_milking: v.milking,
        p_weight_g: v.grams,
        p_portions_g: v.portions ?? undefined,
        p_note: v.note ?? undefined,
      }),
    ),
  onMutate: async (v: RecordVars) => {
    await queryClient.cancelQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) })
    setGoatDay(v.herdId, v.milkedOn, v.goatId, (rows) => applyRecord(rows, v))
    await saveCacheNow()
  },
  onSuccess: (rows: MilkRow[], v: RecordVars) => {
    setGoatDay(v.herdId, v.milkedOn, v.goatId, () => rows)
  },
  onError: (_e: Error, v: RecordVars) => {
    // The server said no; reload the day so the screen shows what's really saved.
    void queryClient.invalidateQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) })
  },
  onSettled: (_d: unknown, _e: unknown, v: RecordVars) => refreshAfter(v.herdId, v.goatId),
})

queryClient.setMutationDefaults<unknown, Error, ClearVars>(CLEAR_MILKING, {
  scope,
  retry,
  retryDelay,
  mutationFn: async (v: ClearVars) =>
    unwrap(
      await supabase.rpc('clear_milking', { p_goat_id: v.goatId, p_milked_on: v.milkedOn, p_milking: v.milking }),
    ),
  onMutate: async (v: ClearVars) => {
    await queryClient.cancelQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) })
    setGoatDay(v.herdId, v.milkedOn, v.goatId, (rows) => rows.filter((r) => r.milking !== v.milking))
    await saveCacheNow()
  },
  onError: (_e: Error, v: ClearVars) => {
    void queryClient.invalidateQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) })
  },
  onSettled: (_d: unknown, _e: unknown, v: ClearVars) => refreshAfter(v.herdId, v.goatId),
})
