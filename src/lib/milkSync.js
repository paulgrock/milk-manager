// Milk saves, registered as mutation defaults so a save made offline can be
// restored from the device cache and sent later, even after a reload.
import { queryClient, saveCacheNow, refreshQueries } from './queryClient';
import { supabase, unwrap } from './supabase';
import { applyRecord } from './milk';
import { retry, retryDelay } from './offlineRetry';
export const milkKeys = {
    all: ['milk'],
    day: (herdId, date) => ['milk', 'day', herdId, date],
    totals: (herdId) => ['milk', 'totals', herdId],
    goat: (goatId) => ['milk', 'goat', goatId],
};
export const RECORD_MILKING = ['milk', 'record'];
export const CLEAR_MILKING = ['milk', 'clear'];
function setGoatDay(herdId, date, goatId, update) {
    queryClient.setQueryData(milkKeys.day(herdId, date), (all = []) => [
        ...all.filter((r) => r.goat_id !== goatId),
        ...update(all.filter((r) => r.goat_id === goatId)),
    ]);
}
function refreshAfter(herdId, goatId) {
    void refreshQueries(milkKeys.totals(herdId));
    void refreshQueries(milkKeys.goat(goatId));
}
// One queue for all milk saves: they reach the server in the order they
// were made, so a correction never lands before the weight it corrects.
const scope = { id: 'milk' };
queryClient.setMutationDefaults(RECORD_MILKING, {
    scope,
    retry,
    retryDelay,
    mutationFn: async (v) => unwrap(await supabase.rpc('record_milking', {
        p_goat_id: v.goatId,
        p_milked_on: v.milkedOn,
        p_milking: v.milking,
        p_weight_g: v.grams,
        p_portions_g: v.portions ?? undefined,
        p_note: v.note ?? undefined,
    })),
    onMutate: async (v) => {
        await queryClient.cancelQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) });
        setGoatDay(v.herdId, v.milkedOn, v.goatId, (rows) => applyRecord(rows, v));
        await saveCacheNow();
    },
    onSuccess: (rows, v) => {
        setGoatDay(v.herdId, v.milkedOn, v.goatId, () => rows);
    },
    onError: (_e, v) => {
        // The server said no; reload the day so the screen shows what's really saved.
        void refreshQueries(milkKeys.day(v.herdId, v.milkedOn));
    },
    onSettled: (_d, _e, v) => refreshAfter(v.herdId, v.goatId),
});
queryClient.setMutationDefaults(CLEAR_MILKING, {
    scope,
    retry,
    retryDelay,
    mutationFn: async (v) => unwrap(await supabase.rpc('clear_milking', { p_goat_id: v.goatId, p_milked_on: v.milkedOn, p_milking: v.milking })),
    onMutate: async (v) => {
        await queryClient.cancelQueries({ queryKey: milkKeys.day(v.herdId, v.milkedOn) });
        setGoatDay(v.herdId, v.milkedOn, v.goatId, (rows) => rows.filter((r) => r.milking !== v.milking));
        await saveCacheNow();
    },
    onError: (_e, v) => {
        void refreshQueries(milkKeys.day(v.herdId, v.milkedOn));
    },
    onSettled: (_d, _e, v) => refreshAfter(v.herdId, v.goatId),
});
