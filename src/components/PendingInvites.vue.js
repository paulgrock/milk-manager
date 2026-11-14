/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useToast } from '@nuxt/ui/composables';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { supabase, unwrap } from '@/lib/supabase';
import { useHerd } from '@/composables/useHerd';
const { defineEmits, } = {};
const emit = defineEmits();
const { refreshMemberships, selectHerd } = useHerd();
const toast = useToast();
const invites = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: async () => unwrap(await supabase.rpc('pending_invites')),
});
const accept = useMutation({
    mutationFn: async (inviteId) => unwrap(await supabase.rpc('accept_invite', { invite_id: inviteId })),
    onSuccess: async (member) => {
        await refreshMemberships();
        await invites.refetch();
        selectHerd(member.herd_id);
        emit('accepted', member.herd_id);
    },
    onError: (e) => toast.add({ color: 'error', title: 'Could not join herd', description: e.message }),
});
const decline = useMutation({
    mutationFn: async (inviteId) => unwrap(await supabase.from('herd_invites').delete().eq('id', inviteId)),
    onSuccess: () => invites.refetch(),
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(invites, {});
    __VLS_withDotValue(accept, {});
    __VLS_withDotValue(decline, {});
    if (invites.value.data.value?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((invites.value.data.value));
        for (const [invite] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            let __VLS_1;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
                // @ts-ignore
                key: (invite.id), color: "primary", variant: "subtle", icon: "i-lucide-mail-open", title: (`You're invited to ${invite.herd_name}`), description: (`As ${invite.role === 'owner' ? 'an owner' : 'a helper'}`), actions: ([{ label: 'Join', loading: accept.value.isPending.value, onClick: () => accept.value.mutate(invite.id) }, { label: 'Decline', color: 'neutral', variant: 'ghost', onClick: () => decline.value.mutate(invite.id) },]),
            }));
            const __VLS_3 = __VLS_2({
                key: (invite.id),
                color: "primary",
                variant: "subtle",
                icon: "i-lucide-mail-open",
                title: (`You're invited to ${invite.herd_name}`),
                description: (`As ${invite.role === 'owner' ? 'an owner' : 'a helper'}`),
                actions: ([
                    { label: 'Join', loading: accept.value.isPending.value, onClick: () => accept.value.mutate(invite.id) },
                    { label: 'Decline', color: 'neutral', variant: 'ghost', onClick: () => decline.value.mutate(invite.id) },
                ]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_2));
            // @ts-ignore
            [invites, invites, accept, accept, decline,];
        }
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
