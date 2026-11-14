/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useSalesData, useSalesMutations } from '@/composables/useSales';
const { defineModel, } = {};
/** Picks an adopter, or adds one by typing a new name. */
const model = defineModel({ required: true });
const toast = useToast();
const { data } = useSalesData();
const { saveBuyer } = useSalesMutations();
const items = computed(() => data.value.buyers.map((b) => ({ label: b.town ? `${b.name} (${b.town})` : b.name, value: b.id })));
// A new adopter typed in: name now, contact details optional.
const draft = ref();
async function add() {
    if (!draft.value?.name.trim())
        return;
    try {
        const buyer = await saveBuyer.mutateAsync({
            values: { name: draft.value.name.trim(), phone: draft.value.phone.trim() || null, email: draft.value.email.trim() || null },
        });
        model.value = buyer.id;
        draft.value = undefined;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not add adopter', description: e.message });
    }
}
let __VLS_modelEmit;
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
    __VLS_withDotValue(model, {});
    __VLS_withDotValue(draft, {});
    __VLS_withDotValue(saveBuyer, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
    UInputMenu;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onUpdate:modelValue': {} }, ...{ 'onCreate': {} }, modelValue: (model.value ?? undefined), items: (__VLS_unwrap(items, {})), valueKey: "value", placeholder: "Search or add an adopter…", createItem: true, openOnClick: true, ...{ class: "w-full" }, 'aria-label': "Adopter",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onUpdate:modelValue': {} },
        ...{ 'onCreate': {} },
        modelValue: (model.value ?? undefined),
        items: (__VLS_unwrap(items, {})),
        valueKey: "value",
        placeholder: "Search or add an adopter…",
        createItem: true,
        openOnClick: true,
        ...{ class: "w-full" },
        'aria-label': "Adopter",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.'update:modelValue'} */
        'onUpdate:modelValue': ((v) => (model.value = v ?? null)),
    };
    void __VLS_6;
    const __VLS_7 = {
        /** @type {typeof __VLS_5.create} */
        onCreate: ((name) => (draft.value = { name: name.trim(), phone: '', email: '' })),
    };
    void __VLS_7;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    var __VLS_3;
    var __VLS_4;
    if (draft.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-md border border-default p-3 space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (draft.value.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_8;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            // @ts-ignore
            modelValue: (draft.value.phone), type: "tel", placeholder: "Phone", 'aria-label': "New adopter phone",
        }));
        const __VLS_10 = __VLS_9({
            modelValue: (draft.value.phone),
            type: "tel",
            placeholder: "Phone",
            'aria-label': "New adopter phone",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (draft.value.email), type: "email", placeholder: "Email", 'aria-label': "New adopter email",
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (draft.value.email),
            type: "email",
            placeholder: "Email",
            'aria-label': "New adopter email",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 justify-end" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost",
        }));
        const __VLS_20 = __VLS_19({
            ...{ 'onClick': {} },
            size: "xs",
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_23;
        const __VLS_24 = {
            /** @type {typeof __VLS_23.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(draft.value))
                    throw 0;
                return (draft.value = undefined);
                // @ts-ignore
                [model, model, items, draft, draft, draft, draft, draft, draft,];
            },
        };
        void __VLS_24;
        var __VLS_21;
        var __VLS_22;
        const { default: __VLS_25 } = __VLS_nonNull(__VLS_21.slots);
        // @ts-ignore
        [];
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "xs", loading: (saveBuyer.value.isPending.value),
        }));
        const __VLS_28 = __VLS_27({
            ...{ 'onClick': {} },
            size: "xs",
            loading: (saveBuyer.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        let __VLS_31;
        const __VLS_32 = {
            /** @type {typeof __VLS_31.click} */
            onClick: (add),
        };
        void __VLS_32;
        var __VLS_29;
        var __VLS_30;
        const { default: __VLS_33 } = __VLS_nonNull(__VLS_29.slots);
        // @ts-ignore
        [saveBuyer,];
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
