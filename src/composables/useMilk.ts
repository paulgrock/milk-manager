import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { refreshQueries } from '@/lib/queryClient'
import { useMutation, useMutationState, useQuery } from '@tanstack/vue-query'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import { toISODate, parseDate } from '@/lib/dates'
import type { DayTotal, Lactation, MilkRow } from '@/lib/milk'
import { CLEAR_MILKING, RECORD_MILKING, milkKeys, type ClearVars, type RecordVars } from '@/lib/milkSync'
import { useHerd } from './useHerd'

export const lactationsKey = (herdId: string) => ['lactations', herdId] as const

/** Every milking recorded for the herd on one day. */
export function useMilkDay(date: MaybeRefOrGetter<string>) {
  const { herdId } = useHerd()
  return useQuery({
    queryKey: computed(() => milkKeys.day(herdId.value, toValue(date))),
    queryFn: async (): Promise<MilkRow[]> =>
      unwrap(
        await supabase.from('milk_weights').select('*').eq('herd_id', herdId.value).eq('milked_on', toValue(date)),
      ),
    enabled: computed(() => !!herdId.value),
  })
}

/** Per-doe day totals for the herd from a date on, newest first. */
export function useHerdDayTotals(since: MaybeRefOrGetter<string>) {
  const { herdId } = useHerd()
  return useQuery({
    queryKey: computed(() => [...milkKeys.totals(herdId.value), toValue(since)] as const),
    queryFn: (): Promise<DayTotal[]> =>
      fetchAll((from, to) =>
        supabase
          .from('milk_day_totals')
          .select('*')
          .eq('herd_id', herdId.value)
          .gte('milked_on', toValue(since))
          .order('milked_on', { ascending: false })
          .order('goat_id')
          .range(from, to),
      ),
    enabled: computed(() => !!herdId.value && !!toValue(since)),
  })
}

/** All of one doe's day totals, oldest first. */
export function useGoatDayTotals(goatId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => milkKeys.goat(toValue(goatId))),
    queryFn: (): Promise<DayTotal[]> =>
      fetchAll((from, to) =>
        supabase.from('milk_day_totals').select('*').eq('goat_id', toValue(goatId)).order('milked_on').range(from, to),
      ),
    enabled: computed(() => !!toValue(goatId)),
  })
}

export function useLactations() {
  const { herdId } = useHerd()
  return useQuery({
    queryKey: computed(() => lactationsKey(herdId.value)),
    queryFn: async (): Promise<Lactation[]> =>
      unwrap(
        await supabase
          .from('lactations')
          .select('*')
          .eq('herd_id', herdId.value)
          .order('freshened_on', { ascending: false }),
      ),
    enabled: computed(() => !!herdId.value),
  })
}

/** Milk saves. Uses the offline-safe defaults from milkSync.ts. */
export function useMilkSaves() {
  const record = useMutation<MilkRow[], Error, RecordVars>({ mutationKey: RECORD_MILKING })
  const clear = useMutation<unknown, Error, ClearVars>({ mutationKey: CLEAR_MILKING })

  // Saves not yet confirmed by the server, so rows can show "waiting".
  const pending = useMutationState({
    filters: { mutationKey: ['milk'], status: 'pending' },
    select: (m) => ({
      vars: m.state.variables as RecordVars | ClearVars,
      // Offline, or online but the request keeps failing.
      paused: m.state.isPaused || m.state.failureCount > 0,
    }),
  })

  const pendingFor = (goatId: string, date: string) =>
    pending.value.filter((p) => p.vars.goatId === goatId && p.vars.milkedOn === date)

  return { record, clear, pending, pendingFor }
}

type LactationInsert = Omit<Lactation, 'id' | 'herd_id' | 'created_at' | 'created_by'>

export function useLactationMutations() {
  const { herdId } = useHerd()
  const refresh = () => refreshQueries(lactationsKey(herdId.value))

  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<LactationInsert> & { goat_id: string } }) => {
      if (id) return unwrap(await supabase.from('lactations').update(values).eq('id', id))
      return unwrap(
        await supabase.from('lactations').insert({
          ...(values as LactationInsert),
          herd_id: herdId.value,
        }),
      )
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await supabase.from('lactations').delete().eq('id', id)),
    onSuccess: refresh,
  })

  return { save, remove }
}

/** 'YYYY-MM-DD' shifted by whole days. */
export function shiftDate(date: string, days: number): string {
  const d = parseDate(date)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}
