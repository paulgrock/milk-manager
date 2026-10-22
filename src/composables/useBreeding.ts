import { computed } from 'vue'
import { refreshQueries } from '@/lib/queryClient'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import type { Breeding, BreedingData, Heat, Kid, Kidding, PregnancyCheck } from '@/lib/breeding'
import type { Database } from '@/lib/database.types'
import { useHerd } from './useHerd'
import { goatKeys } from './useGoats'
import { lactationsKey } from './useMilk'

type Tables = Database['public']['Tables']
type Insert<T extends keyof Tables> = Omit<Tables[T]['Insert'], 'herd_id'>

export const breedingKey = (herdId: string) => ['breeding', herdId] as const

export interface KidInput {
  sex: 'doe' | 'buck'
  outcome: 'alive' | 'stillborn' | 'died'
  birth_weight_g?: number | null
  add_to_herd: boolean
  name?: string
  notes?: string
}

/** All heats, breedings, checks, kiddings and kids for the herd. */
export function useBreedingData() {
  const { herdId } = useHerd()
  const query = useQuery({
    queryKey: computed(() => breedingKey(herdId.value)),
    queryFn: async (): Promise<BreedingData & { kids: Kid[] }> => {
      const page = <T>(table: 'heats' | 'breedings' | 'pregnancy_checks' | 'kiddings' | 'kids') =>
        fetchAll<T>((from, to) =>
          // Same shape for each table; typed per call by T.
          supabase.from(table as 'heats').select('*').eq('herd_id', herdId.value).order('id').range(from, to) as never,
        )
      const [heats, breedings, checks, kiddings, kids] = await Promise.all([
        page<Heat>('heats'),
        page<Breeding>('breedings'),
        page<PregnancyCheck>('pregnancy_checks'),
        page<Kidding>('kiddings'),
        page<Kid>('kids'),
      ])
      return { heats, breedings, checks, kiddings, kids }
    },
    enabled: computed(() => !!herdId.value),
  })
  const data = computed<BreedingData & { kids: Kid[] }>(
    () => query.data.value ?? { heats: [], breedings: [], checks: [], kiddings: [], kids: [] },
  )
  return { query, data }
}

export function useBreedingMutations() {
  const { herdId } = useHerd()
  const refresh = () => refreshQueries(breedingKey(herdId.value))

  function saver<T extends 'heats' | 'breedings' | 'pregnancy_checks'>(table: T) {
    return useMutation({
      mutationFn: async ({ id, values }: { id?: string; values: Insert<T> }) => {
        const from = supabase.from(table as 'heats')
        if (id) return unwrap(await from.update(values as never).eq('id', id))
        return unwrap(await from.insert({ ...values, herd_id: herdId.value } as never))
      },
      onSuccess: refresh,
    })
  }

  function remover(table: 'heats' | 'breedings' | 'pregnancy_checks' | 'kiddings') {
    return useMutation({
      mutationFn: async (id: string) => unwrap(await supabase.from(table).delete().eq('id', id)),
      onSuccess: refresh,
    })
  }

  const recordKidding = useMutation({
    mutationFn: async (v: {
      doeId: string
      kiddedOn: string
      breedingId: string | null
      difficulty: Database['public']['Enums']['kidding_difficulty']
      notes: string
      kids: KidInput[]
      startLactation: boolean
    }) =>
      unwrap(
        await supabase.rpc('record_kidding', {
          p_doe_id: v.doeId,
          p_kidded_on: v.kiddedOn,
          p_breeding_id: v.breedingId ?? undefined,
          p_difficulty: v.difficulty,
          p_notes: v.notes || undefined,
          p_kids: v.kids as never,
          p_start_lactation: v.startLactation,
        }),
      ),
    onSuccess: () =>
      Promise.all([
        refresh(),
        refreshQueries(goatKeys.goats(herdId.value)),
        refreshQueries(lactationsKey(herdId.value)),
      ]),
  })

  return {
    saveHeat: saver('heats'),
    saveBreeding: saver('breedings'),
    saveCheck: saver('pregnancy_checks'),
    removeHeat: remover('heats'),
    removeBreeding: remover('breedings'),
    removeCheck: remover('pregnancy_checks'),
    removeKidding: remover('kiddings'),
    recordKidding,
  }
}
