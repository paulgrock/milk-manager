/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useGoatMutations } from '@/composables/useGoats';
import { goatName } from '@/lib/goats';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { setMilkingOrder } = useGoatMutations();
const order = ref([]);
watch(open, (isOpen) => {
    if (isOpen)
        order.value = [...props.goats];
});
const name = (g) => g.barn_name || goatName(g);
function move(index, by) {
    const next = [...order.value];
    const [goat] = next.splice(index, 1);
    next.splice(index + by, 0, goat);
    order.value = next;
}
function save() {
    setMilkingOrder.mutate(order.value.map((g) => g.id), { onError: (e) => toast.add({ color: 'error', title: 'Could not save the order', description: e.message }) });
    open.value = false;
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
    __VLS_withDotValue(order, {});
    __VLS_withDotValue(open, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: "Milking order", description: "The order does come onto the stand. Entry follows it.",
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: "Milking order",
        description: "The order does come onto the stand. Entry follows it.",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
            ...{ class: "rounded-md border border-default divide-y divide-default" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        const __VLS_7 = __VLS_tryAsConstant((order.value));
        for (const [goat, i] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (goat.id),
                ...{ class: "flex items-center gap-2 px-3 py-1.5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-6 text-sm text-muted tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (i + 1);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1 font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_unwrap(name, {})(goat));
            let __VLS_8;
            /** @ts-ignore @type { | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-up", 'aria-label': (`Move ${__VLS_unwrap(name, {})(goat)} up`), disabled: (i === 0),
            }));
            const __VLS_10 = __VLS_9({
                ...{ 'onClick': {} },
                size: "sm",
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-arrow-up",
                'aria-label': (`Move ${__VLS_unwrap(name, {})(goat)} up`),
                disabled: (i === 0),
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            let __VLS_13;
            const __VLS_14 = {
                /** @type {typeof __VLS_13.click} */
                onClick: (...[$event]) => {
                    void $event;
                    return (move(i, -1));
                    // @ts-ignore
                    [open, order, name, name,];
                },
            };
            void __VLS_14;
            var __VLS_11;
            var __VLS_12;
            let __VLS_15;
            /** @ts-ignore @type { | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-down", 'aria-label': (`Move ${__VLS_unwrap(name, {})(goat)} down`), disabled: (i === order.value.length - 1),
            }));
            const __VLS_17 = __VLS_16({
                ...{ 'onClick': {} },
                size: "sm",
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-arrow-down",
                'aria-label': (`Move ${__VLS_unwrap(name, {})(goat)} down`),
                disabled: (i === order.value.length - 1),
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            let __VLS_20;
            const __VLS_21 = {
                /** @type {typeof __VLS_20.click} */
                onClick: (...[$event]) => {
                    void $event;
                    return (move(i, 1));
                    // @ts-ignore
                    [order, name,];
                },
            };
            void __VLS_21;
            var __VLS_18;
            var __VLS_19;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_22 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_25 = __VLS_24({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        let __VLS_28;
        const __VLS_29 = {
            /** @type {typeof __VLS_28.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_29;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_26;
        var __VLS_27;
        const { default: __VLS_30 } = __VLS_nonNull(__VLS_26.slots);
        // @ts-ignore
        [];
        let __VLS_31;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            // @ts-ignore
            ...{ 'onClick': {} },
        }));
        const __VLS_33 = __VLS_32({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_36;
        const __VLS_37 = {
            /** @type {typeof __VLS_36.click} */
            onClick: (save),
        };
        void __VLS_37;
        var __VLS_34;
        var __VLS_35;
        const { default: __VLS_38 } = __VLS_nonNull(__VLS_34.slots);
        // @ts-ignore
        [];
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
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
