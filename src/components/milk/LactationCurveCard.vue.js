/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref, watch } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useGoatDayTotals, useHerdDayTotals, useLactations } from '@/composables/useMilk';
import { MAX_SERIES } from '@/composables/useChartTheme';
import { todayISO } from '@/lib/dates';
import { goatName } from '@/lib/goats';
import { CONFIDENCE_LABELS, STANDARD_DAYS, dailySeries, summarizeLactation, woodAt } from '@/lib/lactation';
import { useMilkTests } from '@/composables/useMilkTests';
import { dhirRequirement, officialFigures, officialProduction, productionOver, starOutlook, withTestDays } from '@/lib/dhia';
import { daysInMilk } from '@/lib/milk';
import { formatWeight } from '@/lib/milk';
import LactationChart from '@/components/charts/LactationChart.vue';
const { defineProps, } = {};
const props = defineProps();
const today = todayISO();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { byId } = useHerdGoats();
const lactations = useLactations();
const ownTotalsQuery = useGoatDayTotals(() => props.goat.id);
const milkTests = useMilkTests();
// Her daily weights with official test-day weights folded in.
const ownTotals = {
    isPending: ownTotalsQuery.isPending,
    data: computed(() => withTestDays(ownTotalsQuery.data.value ?? [], props.goat.id, milkTests.data.value.tests, milkTests.data.value.results)),
};
const own = computed(() => (lactations.data.value ?? [])
    .filter((l) => l.goat_id === props.goat.id)
    .sort((a, b) => b.freshened_on.localeCompare(a.freshened_on)));
const selectedId = ref();
watch(own, (list) => {
    if (!list.some((l) => l.id === selectedId.value))
        selectedId.value = list[0]?.id;
}, { immediate: true });
const selected = computed(() => own.value.find((l) => l.id === selectedId.value));
const lactationLabel = (l) => {
    if (l.goat_id === props.goat.id)
        return `Lactation ${l.lactation_number}`;
    const g = byId.value.get(l.goat_id);
    return `${g ? g.barn_name || goatName(g) : 'Doe'} · L${l.lactation_number}`;
};
const lactationOptions = computed(() => own.value.map((l) => ({ label: `${lactationLabel(l)} (${l.freshened_on.slice(0, 4)})`, value: l.id })));
// Up to two other lactations to compare: her earlier ones, or other does'.
const compareIds = ref([]);
const compareOptions = computed(() => (lactations.data.value ?? [])
    .filter((l) => l.id !== selectedId.value)
    .sort((a, b) => Number(b.goat_id === props.goat.id) - Number(a.goat_id === props.goat.id) || b.freshened_on.localeCompare(a.freshened_on))
    .map((l) => ({ label: `${lactationLabel(l)} (${l.freshened_on.slice(0, 4)})`, value: l.id })));
watch(compareIds, (ids) => {
    if (ids.length > MAX_SERIES - 1)
        compareIds.value = ids.slice(0, MAX_SERIES - 1);
});
watch(selectedId, () => (compareIds.value = compareIds.value.filter((id) => id !== selectedId.value)));
const compared = computed(() => compareIds.value.map((id) => (lactations.data.value ?? []).find((l) => l.id === id)).filter((l) => !!l));
// Other does' milk is only loaded when one is being compared.
const otherSince = computed(() => compared.value
    .filter((l) => l.goat_id !== props.goat.id)
    .map((l) => l.freshened_on)
    .sort()[0] ?? '');
const otherTotals = useHerdDayTotals(otherSince);
const officialFor = (l) => officialFigures(l, milkTests.data.value.tests, milkTests.data.value.results);
const summary = computed(() => selected.value ? summarizeLactation(selected.value, ownTotals.data.value ?? [], today, officialFor(selected.value)) : null);
const series = computed(() => {
    if (!selected.value || !summary.value)
        return [];
    const inMilk = !selected.value.dried_off_on || selected.value.dried_off_on >= today;
    return [
        {
            id: selected.value.id,
            label: lactationLabel(selected.value),
            summary: summary.value,
            showProjection: inMilk,
            testPoints: testPoints.value.filter((t) => t.grams !== null).map((t) => ({ dim: t.dim, grams: t.grams })),
        },
        ...compared.value.map((l) => ({
            id: l.id,
            label: lactationLabel(l),
            summary: summarizeLactation(l, withTestDays(l.goat_id === props.goat.id ? (ownTotals.data.value ?? []) : (otherTotals.data.value ?? []), l.goat_id, milkTests.data.value.tests, milkTests.data.value.results), today, officialFor(l)),
            showProjection: false,
        })),
    ];
});
const inMilk = computed(() => !!selected.value && (!selected.value.dried_off_on || selected.value.dried_off_on >= today));
// Average of her own weigh-ins over the last week; only shown once she's
// being weighed most days, since a test day or two isn't a weekly average.
const lastWeek = computed(() => {
    const s = summary.value;
    if (!inMilk.value || !s)
        return null;
    const recent = s.points.filter((p) => p.dim > s.currentDim - 7);
    return recent.length >= 3 ? { avgG: recent.reduce((t, p) => t + p.grams, 0) / recent.length, days: recent.length } : null;
});
// Her test days in this lactation.
const testPoints = computed(() => {
    const l = selected.value;
    if (!l)
        return [];
    const end = l.dried_off_on ?? today;
    const dates = new Map(milkTests.data.value.tests.map((t) => [t.id, t.tested_on]));
    return milkTests.data.value.results
        .filter((r) => r.goat_id === props.goat.id)
        .map((r) => ({ r, date: dates.get(r.test_id) }))
        .filter((x) => !!x.date && x.date >= l.freshened_on && x.date <= end)
        .map(({ r, date }) => ({
        dim: daysInMilk(l.freshened_on, date),
        grams: r.milk_g,
        butterfatPct: r.butterfat_pct === null ? null : Number(r.butterfat_pct),
        proteinPct: r.protein_pct === null ? null : Number(r.protein_pct),
    }));
});
// DHIR star (ADGA): requirement for her age at kidding vs. her first 305 days.
const star = computed(() => {
    const l = selected.value;
    const s = summary.value;
    if (!l || !s)
        return null;
    const requirement = dhirRequirement({ breed: props.goat.breed, birthDate: props.goat.birth_date, freshenedOn: l.freshened_on });
    if (!requirement)
        return { requirement: null };
    // The report's own figures when there are any; otherwise estimate from her
    // weights, filling the days between them the way DHI does.
    const official = officialProduction(officialFor(l), !inMilk.value);
    if (official) {
        return { requirement, ...official, source: 'official', outlook: starOutlook(requirement, official.toDate, official.projected) };
    }
    const days = dailySeries(s.points, Math.min(s.currentDim, STANDARD_DAYS), { lactationNumber: l.lactation_number, carryToEnd: !inMilk.value });
    const toDate = productionOver(days, testPoints.value);
    let projected = null;
    if (inMilk.value && s.fit && s.currentDim < STANDARD_DAYS) {
        const lastDim = days.at(-1)?.dim ?? 0;
        const rest = Array.from({ length: STANDARD_DAYS - lastDim }, (_, i) => ({ dim: lastDim + i + 1, grams: woodAt(s.fit, lastDim + i + 1) }));
        projected = productionOver([...days, ...rest], testPoints.value);
    }
    return { requirement, toDate, projected, source: 'estimated', outlook: starOutlook(requirement, toDate, projected) };
});
const OUTLOOK = {
    earned: { label: 'Star earned', color: 'success', icon: 'i-lucide-star' },
    'on-track': { label: 'On track', color: 'primary', icon: 'i-lucide-trending-up' },
    short: { label: 'Short on current pace', color: 'warning', icon: 'i-lucide-triangle-alert' },
    unknown: { label: 'Not enough data yet', color: 'neutral', icon: 'i-lucide-circle-help' },
};
const confidenceColor = { low: 'warning', medium: 'neutral', high: 'success' };
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
    __VLS_withDotValue(own, {});
    __VLS_withDotValue(ownTotals, {});
    __VLS_withDotValue(summary, {});
    __VLS_withDotValue(inMilk, {});
    __VLS_withDotValue(confidenceColor, {});
    __VLS_withDotValue(CONFIDENCE_LABELS, {});
    __VLS_withDotValue(lastWeek, {});
    __VLS_withDotValue(star, {});
    __VLS_withDotValue(OUTLOOK, {});
    __VLS_withDotValue(testPoints, {});
    if (own.value.length) {
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
                ...{ class: "flex flex-wrap items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            if (own.value.length > 1) {
                let __VLS_7;
                /** @ts-ignore @type { | typeof __VLS_components.USelect} */
                USelect;
                // @ts-ignore
                const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                    // @ts-ignore
                    modelValue: (__VLS_unwrap(selectedId, {})), items: (__VLS_unwrap(lactationOptions, {})), size: "sm", ...{ class: "w-48" }, 'aria-label': "Lactation",
                }));
                const __VLS_9 = __VLS_8({
                    modelValue: (__VLS_unwrap(selectedId, {})),
                    items: (__VLS_unwrap(lactationOptions, {})),
                    size: "sm",
                    ...{ class: "w-48" },
                    'aria-label': "Lactation",
                }, ...__VLS_functionalComponentArgsRest(__VLS_8));
                /** @type {__VLS_StyleScopedClasses['w-48']} */ ;
            }
            // @ts-ignore
            [own, own, selectedId, lactationOptions,];
        }
        if (ownTotals.value.isPending.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            let __VLS_12;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                // @ts-ignore
                ...{ class: "h-16 w-full" },
            }));
            const __VLS_14 = __VLS_13({
                ...{ class: "h-16 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            let __VLS_17;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
                // @ts-ignore
                ...{ class: "h-64 w-full" },
            }));
            const __VLS_19 = __VLS_18({
                ...{ class: "h-64 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_18));
            /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        }
        else if (summary.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
                ...{ class: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (inMilk.value ? 'So far' : 'Total');
            __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                ...{ class: "text-xl font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            (__VLS_unwrap(formatWeight, {})(summary.value.totalG, __VLS_unwrap(unit, {}), true));
            __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (summary.value.totalSource === 'official' ? 'DHI report' : 'Estimated');
            (summary.value.totalAsOfDim);
            if (inMilk.value) {
                (summary.value.currentDim);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (inMilk.value && summary.value.currentDim < __VLS_unwrap(STANDARD_DAYS, {}) ? 'Projected 305-day' : '305-day');
            if (summary.value.projected305G !== null) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "text-xl font-semibold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                (__VLS_unwrap(formatWeight, {})(summary.value.projected305G, __VLS_unwrap(unit, {}), true));
                if (summary.value.projectedSource === 'official') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
                    let __VLS_22;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                        // @ts-ignore
                        color: "neutral", variant: "subtle", size: "sm", icon: "i-lucide-file-check",
                    }));
                    const __VLS_24 = __VLS_23({
                        color: "neutral",
                        variant: "subtle",
                        size: "sm",
                        icon: "i-lucide-file-check",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
                    var __VLS_25;
                    const { default: __VLS_27 } = __VLS_nonNull(__VLS_25.slots);
                    // @ts-ignore
                    [ownTotals, summary, summary, summary, summary, summary, summary, summary, summary, summary, inMilk, inMilk, inMilk, formatWeight, formatWeight, unit, unit, STANDARD_DAYS,];
                }
                else if (inMilk.value && summary.value.confidence && summary.value.currentDim < __VLS_unwrap(STANDARD_DAYS, {})) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
                    let __VLS_28;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
                        // @ts-ignore
                        color: (confidenceColor.value[summary.value.confidence]), variant: "subtle", size: "sm", icon: (summary.value.confidence === 'low' ? 'i-lucide-triangle-alert' : summary.value.confidence === 'high' ? 'i-lucide-circle-check' : 'i-lucide-circle-dot'),
                    }));
                    const __VLS_30 = __VLS_29({
                        color: (confidenceColor.value[summary.value.confidence]),
                        variant: "subtle",
                        size: "sm",
                        icon: (summary.value.confidence === 'low' ? 'i-lucide-triangle-alert' : summary.value.confidence === 'high' ? 'i-lucide-circle-check' : 'i-lucide-circle-dot'),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
                    var __VLS_31;
                    const { default: __VLS_33 } = __VLS_nonNull(__VLS_31.slots);
                    (CONFIDENCE_LABELS.value[summary.value.confidence]);
                    // @ts-ignore
                    [summary, summary, summary, summary, summary, summary, inMilk, STANDARD_DAYS, confidenceColor, CONFIDENCE_LABELS,];
                }
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "text-xl font-semibold text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (summary.value.projectionNote);
            }
            if (lastWeek.value) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "text-xl font-semibold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                (__VLS_unwrap(formatWeight, {})(lastWeek.value.avgG, __VLS_unwrap(unit, {}), true));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm font-normal text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (lastWeek.value.days);
            }
            if (!summary.value.points.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            }
            else {
                const __VLS_34 = LactationChart;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    // @ts-ignore
                    series: (__VLS_unwrap(series, {})), unit: (__VLS_unwrap(unit, {})),
                }));
                const __VLS_36 = __VLS_35({
                    series: (__VLS_unwrap(series, {})),
                    unit: (__VLS_unwrap(unit, {})),
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                if (star.value) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "mt-4 rounded-md border border-default p-3 space-y-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex flex-wrap items-center gap-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                        ...{ class: "font-medium flex-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    if (star.value.requirement) {
                        let __VLS_39;
                        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                        UBadge;
                        // @ts-ignore
                        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                            // @ts-ignore
                            color: (OUTLOOK.value[star.value.outlook].color), variant: "subtle", icon: (OUTLOOK.value[star.value.outlook].icon),
                        }));
                        const __VLS_41 = __VLS_40({
                            color: (OUTLOOK.value[star.value.outlook].color),
                            variant: "subtle",
                            icon: (OUTLOOK.value[star.value.outlook].icon),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
                        var __VLS_42;
                        const { default: __VLS_44 } = __VLS_nonNull(__VLS_42.slots);
                        (OUTLOOK.value[star.value.outlook].label);
                        // @ts-ignore
                        [summary, summary, formatWeight, unit, unit, lastWeek, lastWeek, lastWeek, series, star, star, star, star, star, OUTLOOK, OUTLOOK, OUTLOOK,];
                    }
                    if (!star.value.requirement) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-sm text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    }
                    else {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-sm text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        (star.value.requirement.ageAtKidding.years);
                        (star.value.requirement.ageAtKidding.months);
                        (star.value.requirement.miniature ? 'miniature' : 'standard');
                        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
                            ...{ class: "w-full text-sm tabular-nums" },
                        });
                        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
                        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                            ...{ class: "text-xs text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                            ...{ class: "text-start font-normal py-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                            ...{ class: "text-end font-normal py-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                            ...{ class: "text-end font-normal py-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                        if (star.value.projected) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                                ...{ class: "text-end font-normal py-1" },
                            });
                            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                        }
                        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
                        const __VLS_45 = __VLS_tryAsConstant(([
                            { label: 'Milk', need: star.value.requirement.milkLb, now: star.value.toDate.milkLb, proj: star.value.projected?.milkLb },
                            { label: 'Butterfat', need: star.value.requirement.butterfatLb, now: star.value.toDate.butterfatLb, proj: star.value.projected?.butterfatLb },
                            { label: 'Protein', need: star.value.requirement.proteinLb, now: star.value.toDate.proteinLb, proj: star.value.projected?.proteinLb },
                        ]));
                        for (const [m] of __VLS_vFor(__VLS_nonNull(__VLS_45))) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                                key: (m.label),
                                ...{ class: "border-t border-default" },
                            });
                            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                                ...{ class: "py-1" },
                            });
                            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                            (m.label);
                            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                                ...{ class: "py-1 text-end" },
                            });
                            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                            (m.need.toLocaleString());
                            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                                ...{ class: "py-1 text-end" },
                                ...{ class: (m.now !== null && m.now >= m.need ? 'text-success font-semibold' : '') },
                            });
                            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                            (m.now === null ? 'needs a test' : `${m.now.toLocaleString()} lb`);
                            if (star.value.projected) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                                    ...{ class: "py-1 text-end" },
                                    ...{ class: (m.proj != null && m.proj >= m.need ? 'text-success font-semibold' : '') },
                                });
                                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                                (m.proj == null ? '—' : `${m.proj.toLocaleString()} lb`);
                            }
                            // @ts-ignore
                            [star, star, star, star, star, star, star, star, star, star, star, star, star, star, star,];
                        }
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-xs text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        if (star.value.source === 'official') {
                        }
                        else {
                            if (testPoints.value.length) {
                                (testPoints.value.length);
                                (testPoints.value.length === 1 ? 'day' : 'days');
                            }
                        }
                    }
                }
                let __VLS_46;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                    // @ts-ignore
                    label: "Compare with", ...{ class: "mt-3" }, hint: (`Up to ${__VLS_unwrap(MAX_SERIES, {}) - 1}`),
                }));
                const __VLS_48 = __VLS_47({
                    label: "Compare with",
                    ...{ class: "mt-3" },
                    hint: (`Up to ${__VLS_unwrap(MAX_SERIES, {}) - 1}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_47));
                /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
                var __VLS_49;
                const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
                let __VLS_52;
                /** @ts-ignore @type { | typeof __VLS_components.USelectMenu} */
                USelectMenu;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                    // @ts-ignore
                    modelValue: (__VLS_unwrap(compareIds, {})), items: (__VLS_unwrap(compareOptions, {})), valueKey: "value", multiple: true, placeholder: "Earlier lactations or other does", ...{ class: "w-full sm:w-96" },
                }));
                const __VLS_54 = __VLS_53({
                    modelValue: (__VLS_unwrap(compareIds, {})),
                    items: (__VLS_unwrap(compareOptions, {})),
                    valueKey: "value",
                    multiple: true,
                    placeholder: "Earlier lactations or other does",
                    ...{ class: "w-full sm:w-96" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['sm:w-96']} */ ;
                // @ts-ignore
                [star, testPoints, testPoints, testPoints, MAX_SERIES, compareIds, compareOptions,];
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
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
