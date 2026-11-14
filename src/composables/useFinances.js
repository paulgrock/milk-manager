import { computed } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { useHerd } from './useHerd';
export const financesKey = (herdId) => ['finances', herdId];
/** Owners only; the database returns nothing to helpers anyway. */
export function useFinances() {
    const { herdId, isOwner } = useHerd();
    const query = useQuery({
        queryKey: computed(() => financesKey(herdId.value)),
        queryFn: () => fetchAll((from, to) => supabase.from('finance_entries').select('*').eq('herd_id', herdId.value).order('occurred_on', { ascending: false }).order('id').range(from, to)),
        enabled: computed(() => !!herdId.value && isOwner.value),
    });
    return { query, entries: computed(() => query.data.value ?? []) };
}
export function useFinanceMutations() {
    const { herdId } = useHerd();
    const refresh = () => refreshQueries(financesKey(herdId.value));
    const save = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('finance_entries').update(values).eq('id', id));
            return unwrap(await supabase.from('finance_entries').insert({ ...values, herd_id: herdId.value }));
        },
        onSuccess: refresh,
    });
    const remove = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('finance_entries').delete().eq('id', id)),
        onSuccess: refresh,
    });
    return { save, remove };
}
