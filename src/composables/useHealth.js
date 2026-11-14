import { computed } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { useMutation, useMutationState, useQuery } from '@tanstack/vue-query';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { DELETE_CARE, LOG_CARE, healthKey } from '@/lib/healthSync';
import { useHerd } from './useHerd';
import { useAuth } from './useAuth';
const empty = { careTypes: [], careEvents: [], treatments: [] };
export function useHealthData() {
    const { herdId } = useHerd();
    const query = useQuery({
        queryKey: computed(() => healthKey(herdId.value)),
        queryFn: async () => {
            const all = (table) => 
            // Same shape for each table; typed per call by T.
            fetchAll((from, to) => supabase.from(table).select('*').eq('herd_id', herdId.value).order('id').range(from, to));
            const [careTypes, careEvents, treatments] = await Promise.all([
                all('care_types'),
                all('care_events'),
                all('treatments'),
            ]);
            careTypes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
            return { careTypes, careEvents, treatments };
        },
        enabled: computed(() => !!herdId.value),
    });
    return { query, data: computed(() => query.data.value ?? empty) };
}
/** Logging care works offline (see healthSync.ts). */
export function useCareLog() {
    const { herdId } = useHerd();
    const { user } = useAuth();
    const log = useMutation({ mutationKey: LOG_CARE });
    const remove = useMutation({ mutationKey: DELETE_CARE });
    const waiting = useMutationState({
        filters: { mutationKey: ['care'], status: 'pending' },
        select: (m) => m.state.isPaused || m.state.failureCount > 0,
    });
    function logCare(input) {
        const events = input.goatIds.map((goatId) => ({
            id: crypto.randomUUID(),
            herd_id: herdId.value,
            goat_id: goatId,
            care_type_id: input.careTypeId,
            done_on: input.doneOn,
            dose: input.dose,
            notes: input.notes.trim() || null,
            created_by: user.value?.id ?? null,
            created_at: new Date().toISOString(),
        }));
        return log.mutateAsync({ herdId: herdId.value, events });
    }
    return {
        logCare,
        removeCare: (id) => remove.mutate({ herdId: herdId.value, id }),
        waitingCount: computed(() => waiting.value.filter(Boolean).length),
    };
}
/** Treatments and the care routine: saved online. */
export function useHealthMutations() {
    const { herdId } = useHerd();
    const refresh = () => refreshQueries(healthKey(herdId.value));
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
    return {
        saveCareType: saver('care_types'),
        saveTreatment: saver('treatments'),
        removeCareType: remover('care_types'),
        removeTreatment: remover('treatments'),
    };
}
