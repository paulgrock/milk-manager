import { computed } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { refreshQueries } from '@/lib/queryClient';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { useHerd } from './useHerd';
export const cheeseKey = (herdId) => ['cheese', herdId];
const empty = { types: [], makes: [] };
export function useCheeseData() {
    const { herdId } = useHerd();
    const query = useQuery({
        queryKey: computed(() => cheeseKey(herdId.value)),
        queryFn: async () => {
            const [types, makes] = await Promise.all([
                fetchAll((from, to) => supabase.from('cheese_types').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
                fetchAll((from, to) => supabase.from('cheese_makes').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
            ]);
            // Alphabetical, ignoring case and accents (Chèvre sits with the Cs).
            types.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            makes.sort((a, b) => b.made_on.localeCompare(a.made_on) || b.created_at.localeCompare(a.created_at));
            return { types, makes };
        },
        enabled: computed(() => !!herdId.value),
    });
    return { query, data: computed(() => query.data.value ?? empty) };
}
/** Makes and cheese types: saved online. */
export function useCheeseMutations() {
    const { herdId } = useHerd();
    const onSuccess = () => refreshQueries(cheeseKey(herdId.value));
    const saveMake = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('cheese_makes').update(values).eq('id', id).select().single());
            return unwrap(await supabase.from('cheese_makes').insert({ ...values, herd_id: herdId.value }).select().single());
        },
        onSuccess,
    });
    const removeMake = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('cheese_makes').delete().eq('id', id)),
        onSuccess,
    });
    const saveType = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('cheese_types').update(values).eq('id', id).select().single());
            return unwrap(await supabase.from('cheese_types').insert({ ...values, herd_id: herdId.value }).select().single());
        },
        onSuccess,
    });
    return { saveMake, removeMake, saveType };
}
