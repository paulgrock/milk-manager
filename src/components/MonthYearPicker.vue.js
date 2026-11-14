/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// The month title as a button that opens month and year wheels, like the
// iOS calendar. The month changes as the wheels settle.
import { computed } from 'vue';
import { todayISO } from '@/lib/dates';
import WheelColumn from './WheelColumn.vue';
const { defineModel, } = {};
/** 'YYYY-MM'. */
const model = defineModel({ required: true });
const year = computed({
    get: () => Number(model.value.slice(0, 4)),
    set: (y) => (model.value = `${y}-${model.value.slice(5, 7)}`),
});
const month = computed({
    get: () => Number(model.value.slice(5, 7)),
    set: (m) => (model.value = `${model.value.slice(0, 4)}-${String(m).padStart(2, '0')}`),
});
const title = computed(() => new Date(year.value, month.value - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i, 1).toLocaleDateString(undefined, { month: 'long' }),
    value: i + 1,
}));
const thisYear = Number(todayISO().slice(0, 4));
const years = computed(() => {
    const from = Math.min(thisYear - 15, year.value);
    const to = Math.max(thisYear + 5, year.value);
    return Array.from({ length: to - from + 1 }, (_, i) => ({ label: String(from + i), value: from + i }));
});
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
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UPopover | typeof __VLS_components.UPopover} */
    UPopover;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        content: ({ align: 'center' }),
    }));
    const __VLS_2 = __VLS_1({
        content: ({ align: 'center' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        color: "neutral", variant: "ghost", trailingIcon: "i-lucide-chevron-down", ...{ class: "w-full font-medium text-base justify-center whitespace-nowrap px-1 gap-1" }, 'aria-live': "polite",
    }));
    const __VLS_8 = __VLS_7({
        color: "neutral",
        variant: "ghost",
        trailingIcon: "i-lucide-chevron-down",
        ...{ class: "w-full font-medium text-base justify-center whitespace-nowrap px-1 gap-1" },
        'aria-live': "polite",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    var __VLS_9;
    const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
    (__VLS_unwrap(title, {}));
    // @ts-ignore
    [title,];
    {
        const { content: __VLS_12 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-1 p-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        const __VLS_13 = WheelColumn;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (__VLS_unwrap(month, {})), items: (__VLS_unwrap(months, {})), label: "Month", ...{ class: "w-36" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (__VLS_unwrap(month, {})),
            items: (__VLS_unwrap(months, {})),
            label: "Month",
            ...{ class: "w-36" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-36']} */ ;
        const __VLS_18 = WheelColumn;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            modelValue: (__VLS_unwrap(year, {})), items: (__VLS_unwrap(years, {})), label: "Year", ...{ class: "w-24" },
        }));
        const __VLS_20 = __VLS_19({
            modelValue: (__VLS_unwrap(year, {})),
            items: (__VLS_unwrap(years, {})),
            label: "Year",
            ...{ class: "w-24" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
        // @ts-ignore
        [month, months, year, years,];
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
