import { computed } from 'vue';
import { useMutation, useMutationState, useQuery } from '@tanstack/vue-query';
import { refreshQueries } from '@/lib/queryClient';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { DELETE_DONE, MARK_DONE, choresKey } from '@/lib/choresSync';
import { useHerd } from './useHerd';
import { useAuth } from './useAuth';
const empty = { chores: [], done: [] };
export function useChoresData() {
    const { herdId } = useHerd();
    const query = useQuery({
        queryKey: computed(() => choresKey(herdId.value)),
        queryFn: async () => {
            const [chores, done] = await Promise.all([
                fetchAll((from, to) => supabase.from('chores').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
                fetchAll((from, to) => supabase.from('chores_done').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
            ]);
            chores.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
            return { chores, done };
        },
        enabled: computed(() => !!herdId.value),
    });
    return { query, data: computed(() => query.data.value ?? empty) };
}
/** Marking chores done works offline (see choresSync.ts). */
export function useChoreLog() {
    const { herdId } = useHerd();
    const { user } = useAuth();
    const mark = useMutation({ mutationKey: MARK_DONE });
    const remove = useMutation({ mutationKey: DELETE_DONE });
    const waiting = useMutationState({
        filters: { mutationKey: ['chores'], status: 'pending' },
        select: (m) => m.state.isPaused || m.state.failureCount > 0,
    });
    /** Resolves with the new record's id once it's on the device, before it reaches the server. */
    function markDone(input) {
        const done = {
            id: crypto.randomUUID(),
            herd_id: herdId.value,
            chore_id: input.choreId,
            done_on: input.doneOn,
            notes: input.notes?.trim() || null,
            created_by: user.value?.id ?? null,
            created_at: new Date().toISOString(),
        };
        return { id: done.id, saved: mark.mutateAsync({ herdId: herdId.value, done }) };
    }
    return {
        markDone,
        removeDone: (id) => remove.mutate({ herdId: herdId.value, id }),
        waitingCount: computed(() => waiting.value.filter(Boolean).length),
    };
}
/** The chore list itself: saved online. */
export function useChoreMutations() {
    const { herdId } = useHerd();
    const saveChore = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('chores').update(values).eq('id', id));
            return unwrap(await supabase.from('chores').insert({ ...values, herd_id: herdId.value }));
        },
        onSuccess: () => refreshQueries(choresKey(herdId.value)),
    });
    return { saveChore };
}
