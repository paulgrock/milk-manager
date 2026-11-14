/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useToast } from '@nuxt/ui/composables';
import { useCheeseMutations } from '@/composables/useCheese';
const { defineProps, } = {};
const props = defineProps();
const toast = useToast();
const { saveType } = useCheeseMutations();
function update(values) {
    if (values.name !== undefined && !values.name.trim())
        return;
    saveType.mutate({ id: props.type.id, values: { name: props.type.name, ...values } }, { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) });
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-center gap-3" },
        ...{ class: (__VLS_ctx.type.hidden ? 'opacity-60' : '') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onChange': {} }, modelValue: (__VLS_ctx.type.name), maxlength: "60", ...{ class: "flex-1 min-w-40" }, 'aria-label': (`${__VLS_ctx.type.name} name`),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.type.name),
        maxlength: "60",
        ...{ class: "flex-1 min-w-40" },
        'aria-label': (`${__VLS_ctx.type.name} name`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.change} */
        onChange: ((e) => update({ name: e.target.value })),
    };
    void __VLS_6;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 ms-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
    UInputNumber;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        // @ts-ignore
        ...{ 'onUpdate:modelValue': {} }, modelValue: (__VLS_ctx.type.aging_days), min: (0), max: (1095), ...{ class: "w-28" }, 'aria-label': (`${__VLS_ctx.type.name} aging days`),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.type.aging_days),
        min: (0),
        max: (1095),
        ...{ class: "w-28" },
        'aria-label': (`${__VLS_ctx.type.name} aging days`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = {
        /** @type {typeof __VLS_12.'update:modelValue'} */
        'onUpdate:modelValue': ((v) => update({ aging_days: Number(v) || 0 })),
    };
    void __VLS_13;
    /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
    var __VLS_10;
    var __VLS_11;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        // @ts-ignore
        ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", ...{ class: "w-16 justify-center" },
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        size: "xs",
        color: "neutral",
        variant: "ghost",
        ...{ class: "w-16 justify-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_19;
    const __VLS_20 = {
        /** @type {typeof __VLS_19.click} */
        onClick: (...[$event]) => {
            void $event;
            return (update({ hidden: !__VLS_ctx.type.hidden }));
            // @ts-ignore
            [type, type, type, type, type, type,];
        },
    };
    void __VLS_20;
    /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    var __VLS_17;
    var __VLS_18;
    const { default: __VLS_21 } = __VLS_nonNull(__VLS_17.slots);
    (__VLS_ctx.type.hidden ? 'Restore' : 'Hide');
    // @ts-ignore
    [type,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
