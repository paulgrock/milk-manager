/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';
import { supabase, unwrap } from '@/lib/supabase';
import { useAuth } from '@/composables/useAuth';
import { useHerd } from '@/composables/useHerd';
import PendingInvites from '@/components/PendingInvites.vue';
const router = useRouter();
const { user, signOut } = useAuth();
const { refreshMemberships, selectHerd } = useHerd();
const herdName = ref('');
const createHerd = useMutation({
    mutationFn: async (name) => unwrap(await supabase.rpc('create_herd', { herd_name: name })),
    onSuccess: async (herd) => {
        await refreshMemberships();
        selectHerd(herd.id);
        await router.replace('/');
    },
});
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
    __VLS_withDotValue(router, {});
    __VLS_withDotValue(user, {});
    __VLS_withDotValue(createHerd, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "min-h-dvh flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-dvh']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full max-w-md space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_0 = PendingInvites;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onAccepted': {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onAccepted': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.accepted} */
        onAccepted: (...[$event]) => {
            void $event;
            return (router.value.replace('/'));
            // @ts-ignore
            [router,];
        },
    };
    void __VLS_6;
    var __VLS_3;
    var __VLS_4;
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    // @ts-ignore
    }));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    var __VLS_10;
    const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
    {
        const { header: __VLS_13 } = __VLS_nonNull(__VLS_10.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-lg font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (user.value?.email);
        // @ts-ignore
        [user,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (...[$event]) => {
                void $event;
                return (createHerd.value.mutate(__VLS_unwrap(herdName, {})));
                // @ts-ignore
                [createHerd, herdName,];
            } },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        // @ts-ignore
        label: "Herd or farm name", name: "herdName",
    }));
    const __VLS_16 = __VLS_15({
        label: "Herd or farm name",
        name: "herdName",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    var __VLS_17;
    const { default: __VLS_19 } = __VLS_nonNull(__VLS_17.slots);
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        modelValue: (__VLS_unwrap(herdName, {})), required: true, maxlength: "100", placeholder: "e.g. Bird's Eye Farm", ...{ class: "w-full" }, size: "xl",
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_unwrap(herdName, {})),
        required: true,
        maxlength: "100",
        placeholder: "e.g. Bird's Eye Farm",
        ...{ class: "w-full" },
        size: "xl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [herdName,];
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        type: "submit", block: true, size: "xl", loading: (createHerd.value.isPending.value),
    }));
    const __VLS_27 = __VLS_26({
        type: "submit",
        block: true,
        size: "xl",
        loading: (createHerd.value.isPending.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    var __VLS_28;
    const { default: __VLS_30 } = __VLS_nonNull(__VLS_28.slots);
    // @ts-ignore
    [createHerd,];
    if (createHerd.value.error.value) {
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            // @ts-ignore
            color: "error", variant: "subtle", description: (createHerd.value.error.value.message),
        }));
        const __VLS_33 = __VLS_32({
            color: "error",
            variant: "subtle",
            description: (createHerd.value.error.value.message),
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    }
    // @ts-ignore
    [createHerd, createHerd,];
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        // @ts-ignore
        ...{ 'onClick': {} }, variant: "link", color: "neutral", block: true,
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        variant: "link",
        color: "neutral",
        block: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    const __VLS_42 = {
        /** @type {typeof __VLS_41.click} */
        onClick: (onSignOut),
    };
    void __VLS_42;
    var __VLS_39;
    var __VLS_40;
    const { default: __VLS_43 } = __VLS_nonNull(__VLS_39.slots);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
