/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { supabase, unwrap } from '@/lib/supabase';
import { useAuth } from '@/composables/useAuth';
import { useHerd } from '@/composables/useHerd';
import { useHerdMembers } from '@/composables/useHerdMembers';
import PasskeysCard from '@/components/PasskeysCard.vue';
import { squareLogoDataUrl } from '@/lib/images';
const router = useRouter();
const toast = useToast();
const { user, signOut } = useAuth();
const { herd, herdId, isOwner, refreshMemberships } = useHerd();
const roleOptions = [
    { label: 'Owner', value: 'owner' },
    { label: 'Helper', value: 'helper' },
];
const unitOptions = [
    { label: 'Pounds (lb)', value: 'lb' },
    { label: 'Kilograms (kg)', value: 'kg' },
];
function onError(title) {
    return (e) => toast.add({ color: 'error', title, description: e.message });
}
// --- Herd details ----------------------------------------------------------
const details = reactive({ name: '', weight_unit: 'lb' });
watch(herd, (h) => {
    if (h)
        Object.assign(details, { name: h.name, weight_unit: h.weight_unit });
}, { immediate: true });
const saveDetails = useMutation({
    mutationFn: async () => unwrap(await supabase.from('herds').update({ name: details.name.trim(), weight_unit: details.weight_unit }).eq('id', herdId.value)),
    onSuccess: async () => {
        await refreshMemberships();
        toast.add({ color: 'success', title: 'Herd saved' });
    },
    onError: onError('Could not save herd'),
});
// --- Logo ------------------------------------------------------------------
// Shown in the header in place of the app icon.
const LOGO_SIZE = 192;
const logoInput = ref();
const saveLogo = useMutation({
    mutationFn: async (logo) => unwrap(await supabase.from('herds').update({ logo }).eq('id', herdId.value)),
    onSuccess: (_data, logo) => {
        void refreshMemberships();
        toast.add({ color: 'success', title: logo ? 'Logo updated' : 'Logo removed' });
    },
    onError: onError('Could not save logo'),
});
async function onLogoFile(e) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file)
        return;
    try {
        saveLogo.mutate(await squareLogoDataUrl(file, LOGO_SIZE));
    }
    catch {
        toast.add({ color: 'error', title: 'Could not read that picture', description: 'Try a PNG or JPEG.' });
    }
}
// --- Members ---------------------------------------------------------------
const { members, membersKey } = useHerdMembers();
const changeRole = useMutation({
    mutationFn: async ({ userId, role }) => unwrap(await supabase.from('herd_members').update({ role }).eq('herd_id', herdId.value).eq('user_id', userId)),
    onSettled: () => refreshQueries(membersKey.value),
    onError: onError('Could not change role'),
});
const removeMember = useMutation({
    mutationFn: async (userId) => unwrap(await supabase.from('herd_members').delete().eq('herd_id', herdId.value).eq('user_id', userId)),
    onSuccess: async (_data, userId) => {
        if (userId === user.value?.id) {
            await refreshMemberships();
            await router.replace('/');
        }
        else {
            await refreshQueries(membersKey.value);
        }
    },
    onError: onError('Could not remove member'),
});
// --- Invites ---------------------------------------------------------------
const invitesKey = computed(() => ['herdInvites', herdId.value]);
const invites = useQuery({
    queryKey: invitesKey,
    queryFn: async () => unwrap(await supabase.from('herd_invites').select('*').eq('herd_id', herdId.value).order('created_at')),
    enabled: computed(() => !!herdId.value && isOwner.value),
});
const invite = reactive({ email: '', role: 'helper' });
const lastInvited = ref('');
const sendInvite = useMutation({
    mutationFn: async () => unwrap(await supabase
        .from('herd_invites')
        .insert({ herd_id: herdId.value, email: invite.email.trim().toLowerCase(), role: invite.role })),
    onSuccess: async () => {
        lastInvited.value = invite.email.trim().toLowerCase();
        invite.email = '';
        await refreshQueries(invitesKey.value);
    },
    onError: (e) => toast.add({
        color: 'error',
        title: 'Could not invite',
        description: e.message.includes('duplicate') ? 'That email already has an invite.' : e.message,
    }),
});
const cancelInvite = useMutation({
    mutationFn: async (id) => unwrap(await supabase.from('herd_invites').delete().eq('id', id)),
    onSettled: () => refreshQueries(invitesKey.value),
});
const appUrl = window.location.origin;
async function onSignOut() {
    await signOut();
    await router.replace('/login');
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(herd, {});
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(saveLogo, {});
    __VLS_withDotValue(logoInput, {});
    __VLS_withDotValue(saveDetails, {});
    __VLS_withDotValue(details, {});
    __VLS_withDotValue(members, {});
    __VLS_withDotValue(user, {});
    __VLS_withDotValue(changeRole, {});
    __VLS_withDotValue(removeMember, {});
    __VLS_withDotValue(sendInvite, {});
    __VLS_withDotValue(invite, {});
    __VLS_withDotValue(lastInvited, {});
    __VLS_withDotValue(invites, {});
    __VLS_withDotValue(cancelInvite, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { header: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (herd.value?.logo ?? '/favicon.svg'),
        alt: (herd.value?.logo ? `${herd.value.name} logo` : ''),
        ...{ class: "size-14 rounded-[22%] object-cover bg-elevated" },
    });
    /** @type {__VLS_StyleScopedClasses['size-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[22%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    if (isOwner.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-image-up", loading: (saveLogo.value.isPending.value),
        }));
        const __VLS_9 = __VLS_8({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-image-up",
            loading: (saveLogo.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        let __VLS_12;
        const __VLS_13 = {
            /** @type {typeof __VLS_12.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(isOwner.value))
                    throw 0;
                return (logoInput.value?.click());
                // @ts-ignore
                [herd, herd, herd, isOwner, saveLogo, logoInput,];
            },
        };
        void __VLS_13;
        var __VLS_10;
        var __VLS_11;
        const { default: __VLS_14 } = __VLS_nonNull(__VLS_10.slots);
        (herd.value?.logo ? 'Change' : 'Upload');
        // @ts-ignore
        [herd,];
        if (herd.value?.logo) {
            let __VLS_15;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost",
            }));
            const __VLS_17 = __VLS_16({
                ...{ 'onClick': {} },
                size: "sm",
                color: "neutral",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            let __VLS_20;
            const __VLS_21 = {
                /** @type {typeof __VLS_20.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(isOwner.value))
                        throw 0;
                    if (!(herd.value?.logo))
                        throw 0;
                    return (saveLogo.value.mutate(null));
                    // @ts-ignore
                    [herd, saveLogo,];
                },
            };
            void __VLS_21;
            var __VLS_18;
            var __VLS_19;
            const { default: __VLS_22 } = __VLS_nonNull(__VLS_18.slots);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (onLogoFile) },
            ref: "logoInput",
            type: "file",
            accept: "image/*",
            ...{ class: "hidden" },
            'aria-label': "Logo file",
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (...[$event]) => {
                void $event;
                return (saveDetails.value.mutate());
                // @ts-ignore
                [saveDetails,];
            } },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_23;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        // @ts-ignore
        label: "Herd or farm name",
    }));
    const __VLS_25 = __VLS_24({
        label: "Herd or farm name",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    var __VLS_26;
    const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        // @ts-ignore
        modelValue: (details.value.name), disabled: (!isOwner.value), required: true, maxlength: "100", ...{ class: "w-full" },
    }));
    const __VLS_31 = __VLS_30({
        modelValue: (details.value.name),
        disabled: (!isOwner.value),
        required: true,
        maxlength: "100",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [isOwner, details,];
    let __VLS_34;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
        // @ts-ignore
        label: "Milk weight unit",
    }));
    const __VLS_36 = __VLS_35({
        label: "Milk weight unit",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    var __VLS_37;
    const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        // @ts-ignore
        modelValue: (details.value.weight_unit), items: (__VLS_unwrap(unitOptions, {})), disabled: (!isOwner.value), ...{ class: "w-full sm:w-60" },
    }));
    const __VLS_42 = __VLS_41({
        modelValue: (details.value.weight_unit),
        items: (__VLS_unwrap(unitOptions, {})),
        disabled: (!isOwner.value),
        ...{ class: "w-full sm:w-60" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-60']} */ ;
    // @ts-ignore
    [isOwner, details, unitOptions,];
    if (isOwner.value) {
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            // @ts-ignore
            type: "submit", loading: (saveDetails.value.isPending.value),
        }));
        const __VLS_47 = __VLS_46({
            type: "submit",
            loading: (saveDetails.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        var __VLS_48;
        const { default: __VLS_50 } = __VLS_nonNull(__VLS_48.slots);
        // @ts-ignore
        [isOwner, saveDetails,];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    // @ts-ignore
    [];
    let __VLS_51;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    // @ts-ignore
    }));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    var __VLS_54;
    const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
    {
        const { header: __VLS_57 } = __VLS_nonNull(__VLS_54.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "divide-y divide-default" },
    });
    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
    const __VLS_58 = __VLS_tryAsConstant((members.value.data.value));
    for (const [m] of __VLS_vFor(__VLS_nonNull(__VLS_58))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (m.user_id),
            ...{ class: "py-3 flex flex-wrap items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 min-w-40" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (m.display_name);
        if (m.user_id === user.value?.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-muted font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (m.email);
        if (isOwner.value) {
            let __VLS_59;
            /** @ts-ignore @type { | typeof __VLS_components.USelect} */
            USelect;
            // @ts-ignore
            const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
                // @ts-ignore
                ...{ 'onUpdate:modelValue': {} }, modelValue: (m.role), items: (__VLS_unwrap(roleOptions, {})), ...{ class: "w-32" },
            }));
            const __VLS_61 = __VLS_60({
                ...{ 'onUpdate:modelValue': {} },
                modelValue: (m.role),
                items: (__VLS_unwrap(roleOptions, {})),
                ...{ class: "w-32" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_60));
            let __VLS_64;
            const __VLS_65 = {
                /** @type {typeof __VLS_64.'update:modelValue'} */
                'onUpdate:modelValue': ((role) => changeRole.value.mutate({ userId: m.user_id, role: role })),
            };
            void __VLS_65;
            /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
            var __VLS_62;
            var __VLS_63;
        }
        else {
            let __VLS_66;
            /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
            UBadge;
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
                // @ts-ignore
                color: "neutral", variant: "subtle",
            }));
            const __VLS_68 = __VLS_67({
                color: "neutral",
                variant: "subtle",
            }, ...__VLS_functionalComponentArgsRest(__VLS_67));
            var __VLS_69;
            const { default: __VLS_71 } = __VLS_nonNull(__VLS_69.slots);
            (m.role === 'owner' ? 'Owner' : 'Helper');
            // @ts-ignore
            [isOwner, members, user, roleOptions, changeRole,];
        }
        if (isOwner.value || m.user_id === user.value?.id) {
            let __VLS_72;
            /** @ts-ignore @type { | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost", label: (m.user_id === user.value?.id ? 'Leave' : 'Remove'),
            }));
            const __VLS_74 = __VLS_73({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
                label: (m.user_id === user.value?.id ? 'Leave' : 'Remove'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_73));
            let __VLS_77;
            const __VLS_78 = {
                /** @type {typeof __VLS_77.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(isOwner.value || m.user_id === user.value?.id))
                        throw 0;
                    return (removeMember.value.mutate(m.user_id));
                    // @ts-ignore
                    [isOwner, user, user, removeMember,];
                },
            };
            void __VLS_78;
            var __VLS_75;
            var __VLS_76;
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    if (isOwner.value) {
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
        // @ts-ignore
        }));
        const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
        var __VLS_82;
        const { default: __VLS_84 } = __VLS_nonNull(__VLS_82.slots);
        {
            const { header: __VLS_85 } = __VLS_nonNull(__VLS_82.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [isOwner,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (...[$event]) => {
                    void $event;
                    if (!(isOwner.value))
                        throw 0;
                    return (sendInvite.value.mutate());
                    // @ts-ignore
                    [sendInvite,];
                } },
            ...{ class: "flex flex-wrap gap-3 items-end" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
        let __VLS_86;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            // @ts-ignore
            label: "Email", ...{ class: "flex-1 min-w-56" },
        }));
        const __VLS_88 = __VLS_87({
            label: "Email",
            ...{ class: "flex-1 min-w-56" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-56']} */ ;
        var __VLS_89;
        const { default: __VLS_91 } = __VLS_nonNull(__VLS_89.slots);
        let __VLS_92;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
            // @ts-ignore
            modelValue: (invite.value.email), type: "email", required: true, ...{ class: "w-full" },
        }));
        const __VLS_94 = __VLS_93({
            modelValue: (invite.value.email),
            type: "email",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [invite,];
        let __VLS_97;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
            // @ts-ignore
            label: "Role",
        }));
        const __VLS_99 = __VLS_98({
            label: "Role",
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        var __VLS_100;
        const { default: __VLS_102 } = __VLS_nonNull(__VLS_100.slots);
        let __VLS_103;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            // @ts-ignore
            modelValue: (invite.value.role), items: (__VLS_unwrap(roleOptions, {})), ...{ class: "w-32" },
        }));
        const __VLS_105 = __VLS_104({
            modelValue: (invite.value.role),
            items: (__VLS_unwrap(roleOptions, {})),
            ...{ class: "w-32" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        // @ts-ignore
        [roleOptions, invite,];
        let __VLS_108;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            // @ts-ignore
            type: "submit", loading: (sendInvite.value.isPending.value),
        }));
        const __VLS_110 = __VLS_109({
            type: "submit",
            loading: (sendInvite.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        var __VLS_111;
        const { default: __VLS_113 } = __VLS_nonNull(__VLS_111.slots);
        // @ts-ignore
        [sendInvite,];
        if (lastInvited.value) {
            let __VLS_114;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                // @ts-ignore
                ...{ class: "mt-4" }, color: "success", variant: "subtle", description: (`Invite saved. Ask ${lastInvited.value} to sign in at ${__VLS_unwrap(appUrl, {})} with that email. They'll see the invite there.`),
            }));
            const __VLS_116 = __VLS_115({
                ...{ class: "mt-4" },
                color: "success",
                variant: "subtle",
                description: (`Invite saved. Ask ${lastInvited.value} to sign in at ${__VLS_unwrap(appUrl, {})} with that email. They'll see the invite there.`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_115));
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        }
        if (invites.value.data.value?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "mt-4 divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_119 = __VLS_tryAsConstant((invites.value.data.value));
            for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_119))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (i.id),
                    ...{ class: "py-2 flex items-center gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (i.email);
                let __VLS_120;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
                    // @ts-ignore
                    color: "neutral", variant: "subtle",
                }));
                const __VLS_122 = __VLS_121({
                    color: "neutral",
                    variant: "subtle",
                }, ...__VLS_functionalComponentArgsRest(__VLS_121));
                var __VLS_123;
                const { default: __VLS_125 } = __VLS_nonNull(__VLS_123.slots);
                (i.role === 'owner' ? 'Owner' : 'Helper');
                // @ts-ignore
                [lastInvited, lastInvited, appUrl, invites, invites,];
                let __VLS_126;
                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
                    // @ts-ignore
                    ...{ 'onClick': {} }, color: "neutral", variant: "ghost", label: "Cancel",
                }));
                const __VLS_128 = __VLS_127({
                    ...{ 'onClick': {} },
                    color: "neutral",
                    variant: "ghost",
                    label: "Cancel",
                }, ...__VLS_functionalComponentArgsRest(__VLS_127));
                let __VLS_131;
                const __VLS_132 = {
                    /** @type {typeof __VLS_131.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!(isOwner.value))
                            throw 0;
                        if (!(invites.value.data.value?.length))
                            throw 0;
                        return (cancelInvite.value.mutate(i.id));
                        // @ts-ignore
                        [cancelInvite,];
                    },
                };
                void __VLS_132;
                var __VLS_129;
                var __VLS_130;
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
    }
    const __VLS_133 = PasskeysCard;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
    // @ts-ignore
    }));
    const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
    let __VLS_138;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-log-out",
    }));
    const __VLS_140 = __VLS_139({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-log-out",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    let __VLS_143;
    const __VLS_144 = {
        /** @type {typeof __VLS_143.click} */
        onClick: (onSignOut),
    };
    void __VLS_144;
    var __VLS_141;
    var __VLS_142;
    const { default: __VLS_145 } = __VLS_nonNull(__VLS_141.slots);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
