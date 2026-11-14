import { computed } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { useHerd } from './useHerd';
import { goatKeys } from './useGoats';
import { lactationsKey } from './useMilk';
export const breedingKey = (herdId) => ['breeding', herdId];
/** All heats, breedings, checks, kiddings and kids for the herd. */
export function useBreedingData() {
    const { herdId } = useHerd();
    const query = useQuery({
        queryKey: computed(() => breedingKey(herdId.value)),
        queryFn: async () => {
            const page = (table) => fetchAll((from, to) => 
            // Same shape for each table; typed per call by T.
            supabase.from(table).select('*').eq('herd_id', herdId.value).order('id').range(from, to));
            const [heats, breedings, checks, kiddings, kids] = await Promise.all([
                page('heats'),
                page('breedings'),
                page('pregnancy_checks'),
                page('kiddings'),
                page('kids'),
            ]);
            return { heats, breedings, checks, kiddings, kids };
        },
        enabled: computed(() => !!herdId.value),
    });
    const data = computed(() => query.data.value ?? { heats: [], breedings: [], checks: [], kiddings: [], kids: [] });
    return { query, data };
}
export function useBreedingMutations() {
    const { herdId } = useHerd();
    const refresh = () => refreshQueries(breedingKey(herdId.value));
    function saver(table) {
        return useMutation({
            mutationFn: async ({ id, values }) => {
                const from = supabase.from(table);
                if (id)
                    return unwrap(await from.update(values).eq('id', id));
                return unwrap(await from.insert({ ...values, herd_id: herdId.value }));
            },
            onSuccess: refresh,
        });
    }
    function remover(table) {
        return useMutation({
            mutationFn: async (id) => unwrap(await supabase.from(table).delete().eq('id', id)),
            onSuccess: refresh,
        });
    }
    const recordKidding = useMutation({
        mutationFn: async (v) => unwrap(await supabase.rpc('record_kidding', {
            p_doe_id: v.doeId,
            p_kidded_on: v.kiddedOn,
            p_breeding_id: v.breedingId ?? undefined,
            p_difficulty: v.difficulty,
            p_notes: v.notes || undefined,
            p_kids: v.kids,
            p_start_lactation: v.startLactation,
        })),
        onSuccess: () => Promise.all([
            refresh(),
            refreshQueries(goatKeys.goats(herdId.value)),
            refreshQueries(lactationsKey(herdId.value)),
        ]),
    });
    return {
        saveHeat: saver('heats'),
        saveBreeding: saver('breedings'),
        saveCheck: saver('pregnancy_checks'),
        removeHeat: remover('heats'),
        removeBreeding: remover('breedings'),
        removeCheck: remover('pregnancy_checks'),
        removeKidding: remover('kiddings'),
        recordKidding,
    };
}
