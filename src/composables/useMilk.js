import { computed, toValue } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { keepPreviousData, useMutation, useMutationState, useQuery } from '@tanstack/vue-query';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { toISODate, parseDate } from '@/lib/dates';
import { useLocalStorage } from '@vueuse/core';
import { CLEAR_MILKING, RECORD_MILKING, milkKeys } from '@/lib/milkSync';
import { useHerd } from './useHerd';
export const lactationsKey = (herdId) => ['lactations', herdId];
/** Every milking recorded for the herd on one day. */
export function useMilkDay(date) {
    const { herdId } = useHerd();
    return useQuery({
        queryKey: computed(() => milkKeys.day(herdId.value, toValue(date))),
        queryFn: async () => unwrap(await supabase.from('milk_weights').select('*').eq('herd_id', herdId.value).eq('milked_on', toValue(date))),
        enabled: computed(() => !!herdId.value),
    });
}
/** Per-doe day totals for the herd from a date on, newest first. */
export function useHerdDayTotals(since) {
    const { herdId } = useHerd();
    return useQuery({
        queryKey: computed(() => [...milkKeys.totals(herdId.value), toValue(since)]),
        queryFn: () => fetchAll((from, to) => supabase
            .from('milk_day_totals')
            .select('*')
            .eq('herd_id', herdId.value)
            .gte('milked_on', toValue(since))
            .order('milked_on', { ascending: false })
            .order('goat_id')
            .range(from, to)),
        enabled: computed(() => !!herdId.value && !!toValue(since)),
        // Moving the start date (e.g. a wider chart window) keeps showing what's loaded instead of blanking.
        placeholderData: keepPreviousData,
    });
}
/** All of one doe's day totals, oldest first. */
export function useGoatDayTotals(goatId) {
    return useQuery({
        queryKey: computed(() => milkKeys.goat(toValue(goatId))),
        queryFn: () => fetchAll((from, to) => supabase.from('milk_day_totals').select('*').eq('goat_id', toValue(goatId)).order('milked_on').range(from, to)),
        enabled: computed(() => !!toValue(goatId)),
    });
}
export function useLactations() {
    const { herdId } = useHerd();
    return useQuery({
        queryKey: computed(() => lactationsKey(herdId.value)),
        queryFn: async () => unwrap(await supabase
            .from('lactations')
            .select('*')
            .eq('herd_id', herdId.value)
            .order('freshened_on', { ascending: false })),
        enabled: computed(() => !!herdId.value),
    });
}
/** Milk saves. Uses the offline-safe defaults from milkSync.ts. */
export function useMilkSaves() {
    const record = useMutation({ mutationKey: RECORD_MILKING });
    const clear = useMutation({ mutationKey: CLEAR_MILKING });
    // Saves not yet confirmed by the server, so rows can show "waiting".
    const pending = useMutationState({
        filters: { mutationKey: ['milk'], status: 'pending' },
        select: (m) => ({
            vars: m.state.variables,
            // Offline, or online but the request keeps failing.
            paused: m.state.isPaused || m.state.failureCount > 0,
        }),
    });
    const pendingFor = (goatId, date) => pending.value.filter((p) => p.vars.goatId === goatId && p.vars.milkedOn === date);
    return { record, clear, pending, pendingFor };
}
export function useLactationMutations() {
    const { herdId } = useHerd();
    const refresh = () => refreshQueries(lactationsKey(herdId.value));
    const save = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('lactations').update(values).eq('id', id));
            return unwrap(await supabase.from('lactations').insert({
                ...values,
                herd_id: herdId.value,
            }));
        },
        onSuccess: refresh,
    });
    const remove = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('lactations').delete().eq('id', id)),
        onSuccess: refresh,
    });
    return { save, remove };
}
/** 'YYYY-MM-DD' shifted by whole days. */
export function shiftDate(date, days) {
    const d = parseDate(date);
    d.setDate(d.getDate() + days);
    return toISODate(d);
}
// Ounces by default: a scale reading at milking time. Kept per device.
const entryUnitChoice = useLocalStorage('milk-entry-unit', 'oz');
/**
 * The herd's unit, for totals, and the unit weights are typed in. Pound
 * herds can type in ounces or pounds; kilogram herds type kilograms.
 */
export function useMilkUnits() {
    const { herd } = useHerd();
    const unit = computed(() => herd.value?.weight_unit ?? 'lb');
    const entryUnit = computed({
        get: () => (unit.value === 'kg' ? 'kg' : entryUnitChoice.value),
        set: (v) => {
            if (v === 'oz' || v === 'lb')
                entryUnitChoice.value = v;
        },
    });
    return { unit, entryUnit };
}
