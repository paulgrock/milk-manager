import { computed } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { refreshQueries } from '@/lib/queryClient'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import type { CheeseMake, CheeseType } from '@/lib/cheese'
import type { Database } from '@/lib/database.types'
import { useHerd } from './useHerd'

type Tables = Database['public']['Tables']
export type MakeValues = Omit<Tables['cheese_makes']['Insert'], 'herd_id'>
export type TypeValues = Omit<Tables['cheese_types']['Insert'], 'herd_id'>

export const cheeseKey = (herdId: string) => ['cheese', herdId] as const

export type CheeseData = { types: CheeseType[]; makes: CheeseMake[] }
const empty: CheeseData = { types: [], makes: [] }

export function useCheeseData() {
  const { herdId } = useHerd()
  const query = useQuery({
    queryKey: computed(() => cheeseKey(herdId.value)),
    queryFn: async (): Promise<CheeseData> => {
      const [types, makes] = await Promise.all([
        fetchAll<CheeseType>((from, to) => supabase.from('cheese_types').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
        fetchAll<CheeseMake>((from, to) => supabase.from('cheese_makes').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
      ])
      types.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      makes.sort((a, b) => b.made_on.localeCompare(a.made_on) || b.created_at.localeCompare(a.created_at))
      return { types, makes }
    },
    enabled: computed(() => !!herdId.value),
  })
  return { query, data: computed(() => query.data.value ?? empty) }
}

/** Makes and cheese types: saved online. */
export function useCheeseMutations() {
  const { herdId } = useHerd()
  const onSuccess = () => refreshQueries(cheeseKey(herdId.value))

  const saveMake = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: MakeValues }) => {
      if (id) return unwrap(await supabase.from('cheese_makes').update(values).eq('id', id).select().single())
      return unwrap(await supabase.from('cheese_makes').insert({ ...values, herd_id: herdId.value }).select().single())
    },
    onSuccess,
  })
  const removeMake = useMutation({
    mutationFn: async (id: string) => unwrap(await supabase.from('cheese_makes').delete().eq('id', id)),
    onSuccess,
  })
  const saveType = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: TypeValues }): Promise<CheeseType> => {
      if (id) return unwrap(await supabase.from('cheese_types').update(values).eq('id', id).select().single())
      return unwrap(await supabase.from('cheese_types').insert({ ...values, herd_id: herdId.value }).select().single())
    },
    onSuccess,
  })

  return { saveMake, removeMake, saveType }
}
