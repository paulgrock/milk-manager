import { computed } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { refreshQueries } from '@/lib/queryClient';
import { fetchAll, supabase, unwrap } from '@/lib/supabase';
import { goatKeys } from './useGoats';
import { financesKey } from './useFinances';
import { useHerd } from './useHerd';
export const salesKey = (herdId) => ['sales', herdId];
const empty = { buyers: [], reservations: [], sales: [] };
/** Owners only (RLS): helpers get nothing back. */
export function useSalesData() {
    const { herdId, isOwner } = useHerd();
    const query = useQuery({
        queryKey: computed(() => salesKey(herdId.value)),
        queryFn: async () => {
            const [buyers, reservations, sales] = await Promise.all([
                fetchAll((from, to) => supabase.from('buyers').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
                fetchAll((from, to) => supabase.from('reservations').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
                fetchAll((from, to) => supabase.from('sales').select('*').eq('herd_id', herdId.value).order('id').range(from, to)),
            ]);
            buyers.sort((a, b) => a.name.localeCompare(b.name));
            return { buyers, reservations, sales };
        },
        enabled: computed(() => !!herdId.value && isOwner.value),
    });
    return { query, data: computed(() => query.data.value ?? empty) };
}
/** Saved online. Deposits and sales also change Finances and goats (done by the database), so those refresh too. */
export function useSalesMutations() {
    const { herdId } = useHerd();
    const onSuccess = () => Promise.all([refreshQueries(salesKey(herdId.value)), refreshQueries(financesKey(herdId.value)), refreshQueries(goatKeys.goats(herdId.value))]);
    const saveBuyer = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('buyers').update(values).eq('id', id).select().single());
            return unwrap(await supabase.from('buyers').insert({ ...values, herd_id: herdId.value }).select().single());
        },
        onSuccess,
    });
    const removeBuyer = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('buyers').delete().eq('id', id)),
        onSuccess,
    });
    const saveReservation = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('reservations').update(values).eq('id', id));
            return unwrap(await supabase.from('reservations').insert({ ...values, herd_id: herdId.value }));
        },
        onSuccess,
    });
    const removeReservation = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('reservations').delete().eq('id', id)),
        onSuccess,
    });
    /** Renumbers a line of reservations in the order given. */
    const setLineOrder = useMutation({
        mutationFn: async (ids) => {
            const results = await Promise.all(ids.map((id, i) => supabase.from('reservations').update({ position: i + 1 }).eq('id', id)));
            results.forEach((r) => unwrap(r));
        },
        onSuccess,
    });
    const saveSale = useMutation({
        mutationFn: async ({ id, values }) => {
            if (id)
                return unwrap(await supabase.from('sales').update(values).eq('id', id));
            return unwrap(await supabase.from('sales').insert({ ...values, herd_id: herdId.value }));
        },
        onSuccess,
    });
    const removeSale = useMutation({
        mutationFn: async (id) => unwrap(await supabase.from('sales').delete().eq('id', id)),
        onSuccess,
    });
    return { saveBuyer, removeBuyer, saveReservation, removeReservation, setLineOrder, saveSale, removeSale };
}
