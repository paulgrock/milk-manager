// Marking chores done, registered as mutation defaults like care logs
// (healthSync.ts): waterers and milking equipment are done in the barn, so a
// chore marked done with no signal is kept on the device and sent later.
import { queryClient, saveCacheNow, refreshQueries } from './queryClient';
import { supabase, unwrap } from './supabase';
import { retry, retryDelay } from './offlineRetry';
export const choresKey = (herdId) => ['chores', herdId];
export const MARK_DONE = ['chores', 'done'];
export const DELETE_DONE = ['chores', 'delete'];
const scope = { id: 'chores' };
function update(herdId, change) {
    queryClient.setQueryData(choresKey(herdId), (data) => (data ? { ...data, done: change(data.done) } : data));
}
queryClient.setMutationDefaults(MARK_DONE, {
    scope,
    retry,
    retryDelay,
    // An id made on the device, with duplicates ignored, makes a replay harmless.
    mutationFn: async (v) => {
        const { created_at: _c, created_by: _b, ...done } = v.done;
        return unwrap(await supabase.from('chores_done').upsert(done, { onConflict: 'id', ignoreDuplicates: true }));
    },
    onMutate: async (v) => {
        await queryClient.cancelQueries({ queryKey: choresKey(v.herdId) });
        update(v.herdId, (done) => [...done.filter((d) => d.id !== v.done.id), v.done]);
        await saveCacheNow();
    },
    onError: (_e, v) => void refreshQueries(choresKey(v.herdId)),
    onSettled: (_d, _e, v) => void refreshQueries(choresKey(v.herdId)),
});
queryClient.setMutationDefaults(DELETE_DONE, {
    scope,
    retry,
    retryDelay,
    mutationFn: async (v) => unwrap(await supabase.from('chores_done').delete().eq('id', v.id)),
    onMutate: async (v) => {
        await queryClient.cancelQueries({ queryKey: choresKey(v.herdId) });
        update(v.herdId, (done) => done.filter((d) => d.id !== v.id));
        await saveCacheNow();
    },
    onError: (_e, v) => void refreshQueries(choresKey(v.herdId)),
});
