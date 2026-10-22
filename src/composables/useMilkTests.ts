import { computed } from 'vue'
import { refreshQueries } from '@/lib/queryClient'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { fetchAll, supabase, unwrap } from '@/lib/supabase'
import type { MilkTest, MilkTestKind, MilkTestResult } from '@/lib/dhia'
import { useHerd } from './useHerd'

export const milkTestsKey = (herdId: string) => ['milkTests', herdId] as const

export function useMilkTests() {
  const { herdId } = useHerd()
  const query = useQuery({
    queryKey: computed(() => milkTestsKey(herdId.value)),
    queryFn: async () => {
      const [tests, results] = await Promise.all([
        fetchAll<MilkTest>((from, to) =>
          supabase.from('milk_tests').select('*').eq('herd_id', herdId.value).order('tested_on', { ascending: false }).order('id').range(from, to),
        ),
        fetchAll<MilkTestResult>((from, to) =>
          supabase.from('milk_test_results').select('*').eq('herd_id', herdId.value).order('id').range(from, to),
        ),
      ])
      return { tests, results }
    },
    enabled: computed(() => !!herdId.value),
  })
  return { query, data: computed(() => query.data.value ?? { tests: [], results: [] }) }
}

export type ResultInput = Pick<MilkTestResult, 'goat_id' | 'milk_g' | 'butterfat_pct' | 'protein_pct' | 'scc'>

export function useMilkTestMutations() {
  const { herdId } = useHerd()
  const refresh = () => refreshQueries(milkTestsKey(herdId.value))

  /** Saves the test and replaces its results with `results` (does left blank are removed). */
  const save = useMutation({
    mutationFn: async (v: {
      id?: string
      test: { tested_on: string; kind: MilkTestKind; lab: string | null; tester: string | null; notes: string | null }
      results: ResultInput[]
    }) => {
      const test: MilkTest = v.id
        ? unwrap(await supabase.from('milk_tests').update(v.test).eq('id', v.id).select().single())!
        : unwrap(await supabase.from('milk_tests').insert({ ...v.test, herd_id: herdId.value }).select().single())!
      const keep = v.results.map((r) => r.goat_id)
      if (v.id) {
        const stale = supabase.from('milk_test_results').delete().eq('test_id', test.id)
        unwrap(await (keep.length ? stale.not('goat_id', 'in', `(${keep.join(',')})`) : stale))
      }
      if (v.results.length) {
        unwrap(
          await supabase
            .from('milk_test_results')
            .upsert(v.results.map((r) => ({ ...r, test_id: test.id, herd_id: herdId.value })), { onConflict: 'test_id,goat_id' }),
        )
      }
      return test
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await supabase.from('milk_tests').delete().eq('id', id)),
    onSuccess: refresh,
  })

  return { save, remove }
}
