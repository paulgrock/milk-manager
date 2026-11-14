/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { refreshQueries } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useToast } from '@nuxt/ui/composables';
import { passkeysSupported, supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/dates';
import { deviceName, passkeyErrorMessage } from '@/lib/passkeys';
const toast = useToast();
const key = ['passkeys'];
const passkeys = useQuery({
    queryKey: key,
    queryFn: async () => {
        const { data, error } = await supabase.auth.passkey.list();
        if (error)
            throw error;
        return data ?? [];
    },
    enabled: passkeysSupported,
});
const refresh = () => refreshQueries(key);
const add = useMutation({
    mutationFn: async () => {
        const { data, error } = await supabase.auth.registerPasskey();
        if (error)
            throw error;
        // Name it after this device so the list makes sense later.
        await supabase.auth.passkey.update({ passkeyId: data.id, friendlyName: deviceName(navigator.userAgent) });
    },
    onSuccess: async () => {
        await refresh();
        toast.add({ color: 'success', title: 'Passkey added', description: 'Next time, sign in with your face, fingerprint or device PIN.' });
    },
    onError: (e) => toast.add({ color: 'error', title: 'Could not add passkey', description: passkeyErrorMessage(e) }),
});
const renaming = ref();
const rename = useMutation({
    mutationFn: async (v) => {
        const { error } = await supabase.auth.passkey.update({ passkeyId: v.id, friendlyName: v.name.trim().slice(0, 120) });
        if (error)
            throw error;
    },
    onSuccess: async () => {
        renaming.value = undefined;
        await refresh();
    },
});
const remove = useMutation({
    mutationFn: async (id) => {
        const { error } = await supabase.auth.passkey.delete({ passkeyId: id });
        if (error)
            throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.add({ color: 'error', title: 'Could not remove passkey', description: e.message }),
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(passkeysSupported, {});
    __VLS_withDotValue(passkeys, {});
    __VLS_withDotValue(renaming, {});
    __VLS_withDotValue(rename, {});
    __VLS_withDotValue(remove, {});
    __VLS_withDotValue(add, {});
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    if (!passkeysSupported.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    else {
        if (passkeys.value.data.value?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default -mt-2 mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['-mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            const __VLS_7 = __VLS_tryAsConstant((passkeys.value.data.value));
            for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (p.id),
                    ...{ class: "py-2 flex flex-wrap items-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                if (renaming.value?.id === p.id) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
                        ...{ onSubmit: (...[$event]) => {
                                void $event;
                                __VLS_withDotValue(passkeysSupported, {});
                                if (!!(!passkeysSupported.value))
                                    throw 0;
                                if (!(passkeys.value.data.value?.length))
                                    throw 0;
                                if (!(renaming.value?.id === p.id))
                                    throw 0;
                                return (rename.value.mutate(renaming.value));
                                // @ts-ignore
                                [passkeysSupported, passkeys, passkeys, renaming, renaming, rename,];
                            } },
                        ...{ class: "flex flex-1 gap-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    let __VLS_8;
                    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                    UInput;
                    // @ts-ignore
                    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                        // @ts-ignore
                        modelValue: (renaming.value.name), maxlength: "120", autofocus: true, ...{ class: "flex-1" }, 'aria-label': "Passkey name",
                    }));
                    const __VLS_10 = __VLS_9({
                        modelValue: (renaming.value.name),
                        maxlength: "120",
                        autofocus: true,
                        ...{ class: "flex-1" },
                        'aria-label': "Passkey name",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    let __VLS_13;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                        // @ts-ignore
                        type: "submit", size: "sm", loading: (rename.value.isPending.value),
                    }));
                    const __VLS_15 = __VLS_14({
                        type: "submit",
                        size: "sm",
                        loading: (rename.value.isPending.value),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
                    var __VLS_16;
                    const { default: __VLS_18 } = __VLS_nonNull(__VLS_16.slots);
                    // @ts-ignore
                    [renaming, rename,];
                    let __VLS_19;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost",
                    }));
                    const __VLS_21 = __VLS_20({
                        ...{ 'onClick': {} },
                        size: "sm",
                        color: "neutral",
                        variant: "ghost",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
                    let __VLS_24;
                    const __VLS_25 = {
                        /** @type {typeof __VLS_24.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            __VLS_withDotValue(passkeysSupported, {});
                            if (!!(!passkeysSupported.value))
                                throw 0;
                            if (!(passkeys.value.data.value?.length))
                                throw 0;
                            if (!(renaming.value?.id === p.id))
                                throw 0;
                            return (renaming.value = undefined);
                            // @ts-ignore
                            [renaming,];
                        },
                    };
                    void __VLS_25;
                    var __VLS_22;
                    var __VLS_23;
                    const { default: __VLS_26 } = __VLS_nonNull(__VLS_22.slots);
                    // @ts-ignore
                    [];
                }
                else {
                    let __VLS_27;
                    /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                    UIcon;
                    // @ts-ignore
                    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                        // @ts-ignore
                        name: "i-lucide-key-round", ...{ class: "text-muted" },
                    }));
                    const __VLS_29 = __VLS_28({
                        name: "i-lucide-key-round",
                        ...{ class: "text-muted" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "flex-1 min-w-32" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['min-w-32']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block font-medium" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    (p.friendly_name || 'Passkey');
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(formatDate, {})(p.created_at.slice(0, 10)));
                    if (p.last_used_at) {
                        (__VLS_unwrap(formatDate, {})(p.last_used_at.slice(0, 10)));
                    }
                    let __VLS_32;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost",
                    }));
                    const __VLS_34 = __VLS_33({
                        ...{ 'onClick': {} },
                        size: "xs",
                        color: "neutral",
                        variant: "ghost",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
                    let __VLS_37;
                    const __VLS_38 = {
                        /** @type {typeof __VLS_37.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            __VLS_withDotValue(passkeysSupported, {});
                            if (!!(!passkeysSupported.value))
                                throw 0;
                            if (!(passkeys.value.data.value?.length))
                                throw 0;
                            if (!!(renaming.value?.id === p.id))
                                throw 0;
                            return (renaming.value = { id: p.id, name: p.friendly_name ?? '' });
                            // @ts-ignore
                            [renaming, formatDate, formatDate,];
                        },
                    };
                    void __VLS_38;
                    var __VLS_35;
                    var __VLS_36;
                    const { default: __VLS_39 } = __VLS_nonNull(__VLS_35.slots);
                    // @ts-ignore
                    [];
                    let __VLS_40;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", color: "error", variant: "ghost", 'aria-label': (`Remove ${p.friendly_name || 'passkey'}`),
                    }));
                    const __VLS_42 = __VLS_41({
                        ...{ 'onClick': {} },
                        size: "xs",
                        color: "error",
                        variant: "ghost",
                        'aria-label': (`Remove ${p.friendly_name || 'passkey'}`),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                    let __VLS_45;
                    const __VLS_46 = {
                        /** @type {typeof __VLS_45.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            __VLS_withDotValue(passkeysSupported, {});
                            if (!!(!passkeysSupported.value))
                                throw 0;
                            if (!(passkeys.value.data.value?.length))
                                throw 0;
                            if (!!(renaming.value?.id === p.id))
                                throw 0;
                            return (remove.value.mutate(p.id));
                            // @ts-ignore
                            [remove,];
                        },
                    };
                    void __VLS_46;
                    var __VLS_43;
                    var __VLS_44;
                    const { default: __VLS_47 } = __VLS_nonNull(__VLS_43.slots);
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
            }
        }
        let __VLS_48;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            // @ts-ignore
            ...{ 'onClick': {} }, icon: "i-lucide-fingerprint", variant: "soft", loading: (add.value.isPending.value),
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            icon: "i-lucide-fingerprint",
            variant: "soft",
            loading: (add.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_53;
        const __VLS_54 = {
            /** @type {typeof __VLS_53.click} */
            onClick: (...[$event]) => {
                void $event;
                __VLS_withDotValue(passkeysSupported, {});
                if (!!(!passkeysSupported.value))
                    throw 0;
                return (add.value.mutate());
                // @ts-ignore
                [add, add,];
            },
        };
        void __VLS_54;
        var __VLS_51;
        var __VLS_52;
        const { default: __VLS_55 } = __VLS_nonNull(__VLS_51.slots);
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-2 text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
