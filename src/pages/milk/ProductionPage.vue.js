/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { shiftDate, useHerdDayTotals, useLactations } from '@/composables/useMilk';
import { useChartTheme } from '@/composables/useChartTheme';
import { addMonths, parseDate, todayISO } from '@/lib/dates';
import { goatName, inHerdOn } from '@/lib/goats';
import { CONFIDENCE_LABELS, STANDARD_DAYS, summarizeLactation } from '@/lib/lactation';
import { formatWeight, lactationOn } from '@/lib/milk';
import HerdTrendChart from '@/components/charts/HerdTrendChart.vue';
import { useMilkTests } from '@/composables/useMilkTests';
import { officialFigures, withTestDays } from '@/lib/dhia';
const RANGE_UNITS = [
    { label: 'days', value: 'days' },
    { label: 'weeks', value: 'weeks' },
    { label: 'months', value: 'months' },
];
const RANGE_PRESETS = [
    { label: '30d', amount: 30, unit: 'days' },
    { label: '90d', amount: 90, unit: 'days' },
    { label: '6mo', amount: 6, unit: 'months' },
    { label: '305d', amount: 305, unit: 'days' },
    { label: '1yr', amount: 12, unit: 'months' },
];
// Ten years is plenty, and keeps a typo from loading the whole database.
const MAX_TREND_DAYS = 3650;
const today = todayISO();
// Kept per device, like other view preferences.
const range = useLocalStorage('production-trend-range', { amount: 90, unit: 'days' });
const rangeAmount = computed({
    get: () => range.value.amount,
    set: (v) => (range.value = { ...range.value, amount: Math.max(1, Math.round(v || 1)) }),
});
const rangeUnit = computed({
    get: () => range.value.unit,
    set: (v) => (range.value = { ...range.value, unit: v }),
});
/** Days in the chart window, today included. Months count back by the calendar. */
const trendDays = computed(() => {
    const { amount, unit } = range.value;
    const days = unit === 'months'
        ? Math.round((parseDate(today).getTime() - parseDate(addMonths(today, -amount)).getTime()) / 86_400_000)
        : amount * (unit === 'weeks' ? 7 : 1);
    return Math.min(MAX_TREND_DAYS, Math.max(1, days));
});
const rangeLabel = computed(() => {
    const { amount, unit } = range.value;
    return `last ${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
});
const isPreset = (p) => p.amount === range.value.amount && p.unit === range.value.unit;
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { goats } = useHerdGoats();
const lactations = useLactations();
const theme = useChartTheme();
const milkTests = useMilkTests();
const active = computed(() => (goats.data.value ?? [])
    .filter((g) => inHerdOn(g, today))
    .map((g) => ({ goat: g, lactation: lactationOn(lactations.data.value ?? [], g.id, today) }))
    .filter((x) => !!x.lactation));
// Enough history for the trend and for every current lactation's curve.
const since = computed(() => [shiftDate(today, -(trendDays.value + 7)), ...active.value.map((x) => x.lactation.freshened_on)].sort()[0]);
const totals = useHerdDayTotals(since);
const herdByDate = computed(() => {
    const map = new Map();
    for (const r of totals.data.value ?? [])
        map.set(r.milked_on, (map.get(r.milked_on) ?? 0) + (r.total_g ?? 0));
    return map;
});
function averageOver(endDate, days) {
    const values = Array.from({ length: days }, (_, i) => herdByDate.value.get(shiftDate(endDate, -i))).filter((v) => v !== undefined);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}
const trend = computed(() => Array.from({ length: trendDays.value }, (_, i) => {
    const date = shiftDate(today, i - trendDays.value + 1);
    return { date, grams: herdByDate.value.get(date) ?? null, avgG: averageOver(date, 7) };
}));
const thisWeek = computed(() => averageOver(today, 7));
const lastWeek = computed(() => averageOver(shiftDate(today, -7), 7));
const weekChange = computed(() => thisWeek.value !== null && lastWeek.value ? (thisWeek.value - lastWeek.value) / lastWeek.value : null);
const producers = computed(() => active.value
    .map(({ goat, lactation }) => {
    const summary = summarizeLactation(lactation, withTestDays(totals.data.value ?? [], goat.id, milkTests.data.value.tests, milkTests.data.value.results), today, officialFigures(lactation, milkTests.data.value.tests, milkTests.data.value.results));
    const recent = summary.points.filter((p) => p.dim > summary.currentDim - 7);
    return {
        goat,
        lactation: lactation,
        summary,
        weekAvgG: recent.length ? recent.reduce((s, p) => s + p.grams, 0) / recent.length : null,
    };
})
    .sort((a, b) => (b.weekAvgG ?? -1) - (a.weekAvgG ?? -1)));
const maxWeekAvg = computed(() => Math.max(1, ...producers.value.map((p) => p.weekAvgG ?? 0)));
const herdProjected = computed(() => producers.value.reduce((s, p) => s + (p.summary.projected305G ?? 0), 0));
const projectedCount = computed(() => producers.value.filter((p) => p.summary.projected305G !== null).length);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(totals, {});
    __VLS_withDotValue(lactations, {});
    __VLS_withDotValue(herdByDate, {});
    __VLS_withDotValue(today, {});
    __VLS_withDotValue(thisWeek, {});
    __VLS_withDotValue(weekChange, {});
    __VLS_withDotValue(active, {});
    __VLS_withDotValue(projectedCount, {});
    __VLS_withDotValue(range, {});
    __VLS_withDotValue(trendDays, {});
    __VLS_withDotValue(MAX_TREND_DAYS, {});
    __VLS_withDotValue(producers, {});
    __VLS_withDotValue(theme, {});
    __VLS_withDotValue(CONFIDENCE_LABELS, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/milk", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': "Back to milk entry",
    }));
    const __VLS_2 = __VLS_1({
        to: "/milk",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-arrow-left",
        'aria-label': "Back to milk entry",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    if (totals.value.isPending.value || lactations.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ class: "h-20 w-full" },
        }));
        const __VLS_7 = __VLS_6({
            ...{ class: "h-20 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            // @ts-ignore
            ...{ class: "h-64 w-full" },
        }));
        const __VLS_12 = __VLS_11({
            ...{ class: "h-64 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 sm:grid-cols-4 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_17 = __VLS_16({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        var __VLS_18;
        const { default: __VLS_20 } = __VLS_nonNull(__VLS_18.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_unwrap(formatWeight, {})(herdByDate.value.get(today.value) ?? 0, __VLS_unwrap(unit, {}), true));
        // @ts-ignore
        [totals, lactations, formatWeight, herdByDate, today, unit,];
        let __VLS_21;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_23 = __VLS_22({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        var __VLS_24;
        const { default: __VLS_26 } = __VLS_nonNull(__VLS_24.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (thisWeek.value === null ? '—' : __VLS_unwrap(formatWeight, {})(thisWeek.value, __VLS_unwrap(unit, {}), true));
        if (weekChange.value !== null) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs" },
                ...{ class: (weekChange.value >= 0 ? 'text-success' : 'text-muted') },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (weekChange.value >= 0 ? '▲' : '▼');
            (Math.abs(Math.round(weekChange.value * 100)));
        }
        // @ts-ignore
        [formatWeight, unit, thisWeek, thisWeek, weekChange, weekChange, weekChange, weekChange,];
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_29 = __VLS_28({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        var __VLS_30;
        const { default: __VLS_32 } = __VLS_nonNull(__VLS_30.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (active.value.length);
        // @ts-ignore
        [active,];
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_35 = __VLS_34({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        var __VLS_36;
        const { default: __VLS_38 } = __VLS_nonNull(__VLS_36.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (projectedCount.value ? __VLS_unwrap(formatWeight, {})(__VLS_unwrap(herdProjected, {}), __VLS_unwrap(unit, {}), true) : '—');
        if (projectedCount.value < active.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (projectedCount.value);
            (active.value.length);
        }
        // @ts-ignore
        [formatWeight, unit, active, active, projectedCount, projectedCount, projectedCount, herdProjected,];
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        // @ts-ignore
        }));
        const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
        var __VLS_42;
        const { default: __VLS_44 } = __VLS_nonNull(__VLS_42.slots);
        {
            const { header: __VLS_45 } = __VLS_nonNull(__VLS_42.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap items-center justify-between gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            (__VLS_unwrap(rangeLabel, {}));
            if (totals.value.isPlaceholderData.value) {
                let __VLS_46;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                    // @ts-ignore
                    name: "i-lucide-loader-circle", ...{ class: "size-4 animate-spin align-middle text-muted" },
                }));
                const __VLS_48 = __VLS_47({
                    name: "i-lucide-loader-circle",
                    ...{ class: "size-4 animate-spin align-middle text-muted" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_47));
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
                /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.UFieldGroup | typeof __VLS_components.UFieldGroup} */
            UFieldGroup;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                // @ts-ignore
                size: "sm",
            }));
            const __VLS_53 = __VLS_52({
                size: "sm",
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            var __VLS_54;
            const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
            const __VLS_57 = __VLS_tryAsConstant((__VLS_unwrap(RANGE_PRESETS, {})));
            for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_57))) {
                let __VLS_58;
                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                    // @ts-ignore
                    ...{ 'onClick': {} }, key: (p.label), label: (p.label), color: "neutral", variant: (__VLS_unwrap(isPreset, {})(p) ? 'solid' : 'outline'),
                }));
                const __VLS_60 = __VLS_59({
                    ...{ 'onClick': {} },
                    key: (p.label),
                    label: (p.label),
                    color: "neutral",
                    variant: (__VLS_unwrap(isPreset, {})(p) ? 'solid' : 'outline'),
                }, ...__VLS_functionalComponentArgsRest(__VLS_59));
                let __VLS_63;
                const __VLS_64 = {
                    /** @type {typeof __VLS_63.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(totals.value.isPending.value || lactations.value.isPending.value))
                            throw 0;
                        return (range.value = { amount: p.amount, unit: p.unit });
                        // @ts-ignore
                        [totals, rangeLabel, RANGE_PRESETS, isPreset, range,];
                    },
                };
                void __VLS_64;
                var __VLS_61;
                var __VLS_62;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            let __VLS_65;
            /** @ts-ignore @type { | typeof __VLS_components.UFieldGroup | typeof __VLS_components.UFieldGroup} */
            UFieldGroup;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                // @ts-ignore
                size: "sm",
            }));
            const __VLS_67 = __VLS_66({
                size: "sm",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            var __VLS_68;
            const { default: __VLS_70 } = __VLS_nonNull(__VLS_68.slots);
            let __VLS_71;
            /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
            UInputNumber;
            // @ts-ignore
            const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                // @ts-ignore
                modelValue: (__VLS_unwrap(rangeAmount, {})), min: (1), max: (3650), formatOptions: ({ useGrouping: false }), ...{ class: "w-24" }, 'aria-label': "Timeframe length",
            }));
            const __VLS_73 = __VLS_72({
                modelValue: (__VLS_unwrap(rangeAmount, {})),
                min: (1),
                max: (3650),
                formatOptions: ({ useGrouping: false }),
                ...{ class: "w-24" },
                'aria-label': "Timeframe length",
            }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            let __VLS_76;
            /** @ts-ignore @type { | typeof __VLS_components.USelect} */
            USelect;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                // @ts-ignore
                modelValue: (__VLS_unwrap(rangeUnit, {})), items: (__VLS_unwrap(RANGE_UNITS, {})), ...{ class: "w-24" }, 'aria-label': "Timeframe unit",
            }));
            const __VLS_78 = __VLS_77({
                modelValue: (__VLS_unwrap(rangeUnit, {})),
                items: (__VLS_unwrap(RANGE_UNITS, {})),
                ...{ class: "w-24" },
                'aria-label': "Timeframe unit",
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            // @ts-ignore
            [rangeAmount, rangeUnit, RANGE_UNITS,];
            if (trendDays.value === MAX_TREND_DAYS.value) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-muted mt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            }
            // @ts-ignore
            [trendDays, MAX_TREND_DAYS,];
        }
        const __VLS_81 = HerdTrendChart;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
            // @ts-ignore
            days: (__VLS_unwrap(trend, {})), unit: (__VLS_unwrap(unit, {})), rangeLabel: (__VLS_unwrap(rangeLabel, {})),
        }));
        const __VLS_83 = __VLS_82({
            days: (__VLS_unwrap(trend, {})),
            unit: (__VLS_unwrap(unit, {})),
            rangeLabel: (__VLS_unwrap(rangeLabel, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        // @ts-ignore
        [unit, rangeLabel, trend,];
        let __VLS_86;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_88 = __VLS_87({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        var __VLS_89;
        const { default: __VLS_91 } = __VLS_nonNull(__VLS_89.slots);
        {
            const { header: __VLS_92 } = __VLS_nonNull(__VLS_89.slots);
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
        if (!producers.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "overflow-x-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
                ...{ class: "w-full text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                ...{ class: "text-muted text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-3 py-2 text-start font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-3 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-3 py-2 text-start font-normal min-w-40" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
            (__VLS_unwrap(unit, {}));
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-3 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-3 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
            const __VLS_93 = __VLS_tryAsConstant((producers.value));
            for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_93))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                    key: (p.goat.id),
                    ...{ class: "border-t border-default" },
                });
                /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-3 py-2" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                let __VLS_94;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
                    // @ts-ignore
                    to: (`/goats/${p.goat.slug}`), ...{ class: "font-medium hover:underline" },
                }));
                const __VLS_96 = __VLS_95({
                    to: (`/goats/${p.goat.slug}`),
                    ...{ class: "font-medium hover:underline" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_95));
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
                var __VLS_97;
                const { default: __VLS_99 } = __VLS_nonNull(__VLS_97.slots);
                (p.goat.barn_name || __VLS_unwrap(goatName, {})(p.goat));
                // @ts-ignore
                [unit, producers, producers, goatName,];
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (p.lactation.lactation_number);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-3 py-2 text-end tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                (p.summary.currentDim);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-3 py-2" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                if (p.weekAvgG !== null) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center gap-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "flex-1 h-2 rounded-full bg-elevated overflow-hidden" },
                        'aria-hidden': "true",
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
                    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                        ...{ class: "block h-full rounded-full" },
                        ...{ style: ({ width: `${(p.weekAvgG / __VLS_unwrap(maxWeekAvg, {})) * 100}%`, background: theme.value.sequential }) },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "w-10 text-end tabular-nums" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                    (__VLS_unwrap(formatWeight, {})(p.weekAvgG, __VLS_unwrap(unit, {})));
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-3 py-2 text-end tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                (__VLS_unwrap(formatWeight, {})(p.summary.totalG, __VLS_unwrap(unit, {})));
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-3 py-2 text-end tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                if (p.summary.projected305G !== null) {
                    (__VLS_unwrap(formatWeight, {})(p.summary.projected305G, __VLS_unwrap(unit, {})));
                    if (p.summary.confidence && p.summary.currentDim < __VLS_unwrap(STANDARD_DAYS, {})) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "block text-xs text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['block']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        (CONFIDENCE_LABELS.value[p.summary.confidence].replace(' confidence', ''));
                    }
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                        title: (p.summary.projectionNote ?? ''),
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                }
                // @ts-ignore
                [formatWeight, formatWeight, formatWeight, unit, unit, unit, maxWeekAvg, theme, STANDARD_DAYS, CONFIDENCE_LABELS,];
            }
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
