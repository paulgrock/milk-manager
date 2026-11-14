/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useGoatDayTotals, useLactations } from '@/composables/useMilk';
import { useHerd } from '@/composables/useHerd';
import { formatDate, todayISO } from '@/lib/dates';
import { formatWeight } from '@/lib/milk';
import { STANDARD_DAYS, summarizeLactation } from '@/lib/lactation';
import LactationModal from './LactationModal.vue';
import { useMilkTests } from '@/composables/useMilkTests';
import { officialFigures, withTestDays } from '@/lib/dhia';
const { defineProps, } = {};
const props = defineProps();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const lactations = useLactations();
const dayTotals = useGoatDayTotals(() => props.goat.id);
const milkTests = useMilkTests();
const today = todayISO();
const rows = computed(() => (lactations.data.value ?? [])
    .filter((l) => l.goat_id === props.goat.id)
    .map((l) => ({
    lactation: l,
    inMilk: !l.dried_off_on || l.dried_off_on >= today,
    summary: summarizeLactation(l, withTestDays(dayTotals.data.value ?? [], props.goat.id, milkTests.data.value.tests, milkTests.data.value.results), today, officialFigures(l, milkTests.data.value.tests, milkTests.data.value.results)),
})));
const current = computed(() => rows.value.find((r) => r.inMilk)?.lactation);
const modal = ref({ open: false, mode: 'start' });
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
    __VLS_withDotValue(current, {});
    __VLS_withDotValue(modal, {});
    __VLS_withDotValue(rows, {});
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        if (current.value) {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", variant: "soft", color: "neutral", icon: "i-lucide-moon",
            }));
            const __VLS_9 = __VLS_8({
                ...{ 'onClick': {} },
                size: "sm",
                variant: "soft",
                color: "neutral",
                icon: "i-lucide-moon",
            }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            let __VLS_12;
            const __VLS_13 = {
                /** @type {typeof __VLS_12.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(current.value))
                        throw 0;
                    return (modal.value = { open: true, mode: 'dryOff', lactation: current.value });
                    // @ts-ignore
                    [current, current, modal,];
                },
            };
            void __VLS_13;
            var __VLS_10;
            var __VLS_11;
            const { default: __VLS_14 } = __VLS_nonNull(__VLS_10.slots);
            // @ts-ignore
            [];
        }
        else {
            let __VLS_15;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-plus",
            }));
            const __VLS_17 = __VLS_16({
                ...{ 'onClick': {} },
                size: "sm",
                variant: "soft",
                icon: "i-lucide-plus",
            }, ...__VLS_functionalComponentArgsRest(__VLS_16));
            let __VLS_20;
            const __VLS_21 = {
                /** @type {typeof __VLS_20.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!!(current.value))
                        throw 0;
                    return (modal.value = { open: true, mode: 'start' });
                    // @ts-ignore
                    [modal,];
                },
            };
            void __VLS_21;
            var __VLS_18;
            var __VLS_19;
            const { default: __VLS_22 } = __VLS_nonNull(__VLS_18.slots);
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    if (!rows.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default -my-2" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
        const __VLS_23 = __VLS_tryAsConstant((rows.value));
        for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_23))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (r.lactation.id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(!rows.value.length))
                            throw 0;
                        return (modal.value = { open: true, mode: 'edit', lactation: r.lactation });
                        // @ts-ignore
                        [modal, rows, rows,];
                    } },
                type: "button",
                ...{ class: "w-full py-2 flex items-center gap-3 text-start hover:bg-elevated/50 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-semibold w-8" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
            (r.lactation.lactation_number);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "block text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_unwrap(formatDate, {})(r.lactation.freshened_on));
            (r.inMilk ? 'in milk' : __VLS_unwrap(formatDate, {})(r.lactation.dried_off_on));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "block text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (r.inMilk ? `DIM ${r.summary.currentDim}` : `${r.summary.currentDim} days`);
            if (r.summary.daysRecorded) {
                (r.summary.daysRecorded);
                (r.summary.daysRecorded === 1 ? 'day' : 'days');
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "block font-medium tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (__VLS_unwrap(formatWeight, {})(r.summary.totalG, __VLS_unwrap(unit, {}), true));
            if (r.summary.projected305G !== null) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-xs text-muted tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                (r.inMilk && r.summary.currentDim < __VLS_unwrap(STANDARD_DAYS, {}) ? 'proj.' : '');
                (__VLS_unwrap(formatWeight, {})(r.summary.projected305G, __VLS_unwrap(unit, {})));
            }
            // @ts-ignore
            [formatDate, formatDate, formatWeight, formatWeight, unit, unit, STANDARD_DAYS,];
        }
    }
    const __VLS_24 = LactationModal;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        // @ts-ignore
        open: (modal.value.open), mode: (modal.value.mode), lactation: (modal.value.lactation), goatId: (__VLS_ctx.goat.id),
    }));
    const __VLS_26 = __VLS_25({
        open: (modal.value.open),
        mode: (modal.value.mode),
        lactation: (modal.value.lactation),
        goatId: (__VLS_ctx.goat.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore
    [modal, modal, modal, goat,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
