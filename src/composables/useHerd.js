import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useLocalStorage } from '@vueuse/core';
import { supabase, unwrap } from '@/lib/supabase';
import { queryClient, refreshQueries } from '@/lib/queryClient';
import { useAuth } from './useAuth';
export const membershipsKey = (userId) => ['memberships', userId];
async function fetchMemberships(userId) {
    const rows = unwrap(await supabase
        .from('herd_members')
        .select('role, herd:herds!inner(*)')
        .eq('user_id', userId)
        .order('created_at'));
    return rows.map(({ role, herd }) => ({ role, herd }));
}
/** For the router guard: cached memberships if we have them, otherwise fetched. */
export function loadMemberships(userId) {
    return queryClient.ensureQueryData({
        queryKey: membershipsKey(userId),
        queryFn: () => fetchMemberships(userId),
    });
}
const selectedHerdId = useLocalStorage('milk-manager-herd', null);
export function useHerd() {
    const { user } = useAuth();
    const userId = computed(() => user.value?.id ?? '');
    const memberships = useQuery({
        queryKey: computed(() => membershipsKey(userId.value)),
        queryFn: () => fetchMemberships(userId.value),
        enabled: computed(() => !!userId.value),
    });
    const current = computed(() => {
        const list = memberships.data.value ?? [];
        return list.find((m) => m.herd.id === selectedHerdId.value) ?? list[0];
    });
    return {
        memberships,
        herd: computed(() => current.value?.herd),
        herdId: computed(() => current.value?.herd.id ?? ''),
        role: computed(() => current.value?.role),
        isOwner: computed(() => current.value?.role === 'owner'),
        selectHerd: (id) => {
            selectedHerdId.value = id;
        },
        refreshMemberships: () => refreshQueries(membershipsKey(userId.value)),
    };
}
