/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useCareLog, useHealthData } from '@/composables/useHealth';
import { formatDate } from '@/lib/dates';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { default: false });
const { data } = useHealthData();
const { removeCare } = useCareLog();
const typeName = computed(() => data.value.careTypes.find((t) => t.id === props.event?.care_type_id)?.name ?? 'care');
const title = computed(() => `Delete ${typeName.value}?`);
const description = computed(() => {
    if (!props.event)
        return '';
    const who = props.goatName ? ` for ${props.goatName}` : '';
    return `This removes the ${typeName.value} logged${who} on ${formatDate(props.event.done_on)}. It can't be undone.`;
});
function confirm() {
    if (props.event)
        removeCare(props.event.id);
    open.value = false;
}
const __VLS_defaultModels = {
    'open': false,
};
void __VLS_defaultModels;
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
    __VLS_withDotValue(open, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_unwrap(title, {})), description: (__VLS_unwrap(description, {})),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_unwrap(title, {})),
        description: (__VLS_unwrap(description, {})),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { footer: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-end gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "ghost",
        }));
        const __VLS_9 = __VLS_8({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        let __VLS_12;
        const __VLS_13 = {
            /** @type {typeof __VLS_12.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open, open, title, description,];
            },
        };
        void __VLS_13;
        var __VLS_10;
        var __VLS_11;
        const { default: __VLS_14 } = __VLS_nonNull(__VLS_10.slots);
        // @ts-ignore
        [];
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "error",
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onClick': {} },
            color: "error",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_20;
        const __VLS_21 = {
            /** @type {typeof __VLS_20.click} */
            onClick: (confirm),
        };
        void __VLS_21;
        var __VLS_18;
        var __VLS_19;
        const { default: __VLS_22 } = __VLS_nonNull(__VLS_18.slots);
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
