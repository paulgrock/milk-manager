/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useBreedingData } from '@/composables/useBreeding';
import { useFinances } from '@/composables/useFinances';
import { useChartTheme } from '@/composables/useChartTheme';
import { formatDate, todayISO } from '@/lib/dates';
import { goatFullName, goatName } from '@/lib/goats';
import { categoryLabel, formatMoney, toCsv, yearSummary } from '@/lib/finances';
import EntryModal from '@/components/finances/EntryModal.vue';
const { herd, isOwner } = useHerd();
const { byId } = useHerdGoats();
const { data: breeding } = useBreedingData();
const { query, entries } = useFinances();
const theme = useChartTheme();
const thisYear = Number(todayISO().slice(0, 4));
const year = ref(thisYear);
const years = computed(() => {
    const found = new Set([thisYear, ...entries.value.map((e) => Number(e.occurred_on.slice(0, 4)))]);
    return [...found].sort((a, b) => b - a).map((y) => ({ label: String(y), value: y }));
});
const summary = computed(() => yearSummary(entries.value, year.value));
const yearEntries = computed(() => entries.value.filter((e) => Number(e.occurred_on.slice(0, 4)) === year.value));
const maxCategory = computed(() => Math.max(1, ...summary.value.byCategory.map((c) => c.cents)));
const monthName = (m) => new Date(2026, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });
const activeMonths = computed(() => summary.value.byMonth.filter((m) => m.income || m.expense));
const goatLabel = (id) => {
    const g = id ? byId.value.get(id) : undefined;
    return g ? g.barn_name || goatName(g) : undefined;
};
// Stud fees typed into breedings that aren't in the books yet.
const unrecordedFees = computed(() => {
    const recorded = new Set(entries.value.map((e) => e.breeding_id).filter(Boolean));
    return breeding.value.breedings
        .filter((b) => b.service_fee_cents && !recorded.has(b.id))
        .sort((a, b) => b.bred_on.localeCompare(a.bred_on));
});
const modal = ref({ open: false });
function recordFee(b) {
    const buck = b.buck_id ? byId.value.get(b.buck_id) : undefined;
    modal.value = {
        open: true,
        draft: {
            kind: 'expense',
            category: 'stud_fee',
            occurred_on: b.bred_on,
            amount_cents: b.service_fee_cents,
            description: `Stud fee${buck ? `: ${goatFullName(buck)}` : ''}`,
            goat_id: b.doe_id,
            breeding_id: b.id,
        },
    };
}
function downloadCsv() {
    const csv = toCsv(yearEntries.value, (id) => goatLabel(id));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(herd.value?.name ?? 'herd').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-finances-${year.value}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(yearEntries, {});
    __VLS_withDotValue(modal, {});
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(summary, {});
    __VLS_withDotValue(unrecordedFees, {});
    __VLS_withDotValue(theme, {});
    __VLS_withDotValue(activeMonths, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    if (isOwner.value) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            modelValue: (__VLS_unwrap(year, {})), items: (__VLS_unwrap(years, {})), ...{ class: "w-28" }, 'aria-label': "Year",
        }));
        const __VLS_2 = __VLS_1({
            modelValue: (__VLS_unwrap(year, {})),
            items: (__VLS_unwrap(years, {})),
            ...{ class: "w-28" },
            'aria-label': "Year",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-download", disabled: (!yearEntries.value.length),
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onClick': {} },
            variant: "soft",
            icon: "i-lucide-download",
            disabled: (!yearEntries.value.length),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = {
            /** @type {typeof __VLS_10.click} */
            onClick: (downloadCsv),
        };
        void __VLS_11;
        var __VLS_8;
        var __VLS_9;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_8.slots);
        // @ts-ignore
        [isOwner, year, years, yearEntries,];
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-plus",
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onClick': {} },
            variant: "soft",
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = {
            /** @type {typeof __VLS_18.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(isOwner.value))
                    throw 0;
                return (modal.value = { open: true, draft: { kind: 'income' } });
                // @ts-ignore
                [modal,];
            },
        };
        void __VLS_19;
        var __VLS_16;
        var __VLS_17;
        const { default: __VLS_20 } = __VLS_nonNull(__VLS_16.slots);
        // @ts-ignore
        [];
        let __VLS_21;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            // @ts-ignore
            ...{ 'onClick': {} }, icon: "i-lucide-plus",
        }));
        const __VLS_23 = __VLS_22({
            ...{ 'onClick': {} },
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_26;
        const __VLS_27 = {
            /** @type {typeof __VLS_26.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(isOwner.value))
                    throw 0;
                return (modal.value = { open: true, draft: { kind: 'expense' } });
                // @ts-ignore
                [modal,];
            },
        };
        void __VLS_27;
        var __VLS_24;
        var __VLS_25;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_24.slots);
        // @ts-ignore
        [];
    }
    if (!isOwner.value) {
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            color: "neutral", variant: "subtle", icon: "i-lucide-lock", title: "Only owners can see finances.",
        }));
        const __VLS_31 = __VLS_30({
            color: "neutral",
            variant: "subtle",
            icon: "i-lucide-lock",
            title: "Only owners can see finances.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    }
    else if (query.value.isPending.value) {
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            ...{ class: "h-24 w-full" },
        }));
        const __VLS_36 = __VLS_35({
            ...{ class: "h-24 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-3 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_41 = __VLS_40({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        var __VLS_42;
        const { default: __VLS_44 } = __VLS_nonNull(__VLS_42.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(year, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xl sm:text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_unwrap(formatMoney, {})(summary.value.income));
        // @ts-ignore
        [isOwner, year, query, formatMoney, summary,];
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_47 = __VLS_46({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        var __VLS_48;
        const { default: __VLS_50 } = __VLS_nonNull(__VLS_48.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(year, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xl sm:text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_unwrap(formatMoney, {})(summary.value.expense));
        // @ts-ignore
        [year, formatMoney, summary,];
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            // @ts-ignore
            ui: ({ body: 'p-3 sm:p-4' }),
        }));
        const __VLS_53 = __VLS_52({
            ui: ({ body: 'p-3 sm:p-4' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (summary.value.net >= 0 ? 'Profit' : 'Loss');
        (__VLS_unwrap(year, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xl sm:text-2xl font-semibold" },
            ...{ class: (summary.value.net < 0 ? 'text-error' : '') },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (summary.value.net < 0 ? '−' : '');
        (__VLS_unwrap(formatMoney, {})(Math.abs(summary.value.net)));
        // @ts-ignore
        [year, formatMoney, summary, summary, summary, summary,];
        if (unrecordedFees.value.length) {
            let __VLS_57;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
                // @ts-ignore
                color: "primary", variant: "subtle", icon: "i-lucide-heart", title: (`${unrecordedFees.value.length} stud ${unrecordedFees.value.length === 1 ? 'fee' : 'fees'} from breedings not in the books yet`),
            }));
            const __VLS_59 = __VLS_58({
                color: "primary",
                variant: "subtle",
                icon: "i-lucide-heart",
                title: (`${unrecordedFees.value.length} stud ${unrecordedFees.value.length === 1 ? 'fee' : 'fees'} from breedings not in the books yet`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            var __VLS_60;
            const { default: __VLS_62 } = __VLS_nonNull(__VLS_60.slots);
            {
                const { description: __VLS_63 } = __VLS_nonNull(__VLS_60.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                    ...{ class: "mt-2 space-y-1" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
                const __VLS_64 = __VLS_tryAsConstant((unrecordedFees.value));
                for (const [b] of __VLS_vFor(__VLS_nonNull(__VLS_64))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (b.id),
                        ...{ class: "flex flex-wrap items-center gap-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "flex-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    (__VLS_unwrap(formatDate, {})(b.bred_on));
                    (__VLS_unwrap(goatLabel, {})(b.doe_id));
                    (__VLS_unwrap(formatMoney, {})(b.service_fee_cents));
                    let __VLS_65;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", variant: "soft",
                    }));
                    const __VLS_67 = __VLS_66({
                        ...{ 'onClick': {} },
                        size: "xs",
                        variant: "soft",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                    let __VLS_70;
                    const __VLS_71 = {
                        /** @type {typeof __VLS_70.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(query.value.isPending.value))
                                throw 0;
                            if (!(unrecordedFees.value.length))
                                throw 0;
                            return (recordFee(b));
                            // @ts-ignore
                            [formatMoney, unrecordedFees, unrecordedFees, unrecordedFees, unrecordedFees, formatDate, goatLabel,];
                        },
                    };
                    void __VLS_71;
                    var __VLS_68;
                    var __VLS_69;
                    const { default: __VLS_72 } = __VLS_nonNull(__VLS_68.slots);
                    // @ts-ignore
                    [];
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid md:grid-cols-2 gap-4 items-start" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        // @ts-ignore
        }));
        const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
        var __VLS_76;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_76.slots);
        {
            const { header: __VLS_79 } = __VLS_nonNull(__VLS_76.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!summary.value.byCategory.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(year, {}));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            const __VLS_80 = __VLS_tryAsConstant((summary.value.byCategory));
            for (const [c] of __VLS_vFor(__VLS_nonNull(__VLS_80))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (`${c.kind}-${c.category}`),
                    ...{ class: "text-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_unwrap(categoryLabel, {})(c.kind, c.category));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (c.kind);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                (__VLS_unwrap(formatMoney, {})(c.cents));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "h-1.5 rounded-full bg-elevated overflow-hidden mt-1" },
                    'aria-hidden': "true",
                });
                /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
                    ...{ class: "h-full rounded-full" },
                    ...{ style: ({ width: `${(c.cents / __VLS_unwrap(maxCategory, {})) * 100}%`, background: c.kind === 'income' ? theme.value.series[0] : theme.value.series[1] }) },
                });
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                // @ts-ignore
                [year, formatMoney, summary, summary, categoryLabel, maxCategory, theme, theme,];
            }
        }
        // @ts-ignore
        [];
        let __VLS_81;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_83 = __VLS_82({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        var __VLS_84;
        const { default: __VLS_86 } = __VLS_nonNull(__VLS_84.slots);
        {
            const { header: __VLS_87 } = __VLS_nonNull(__VLS_84.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!activeMonths.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(year, {}));
        }
        else {
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
                ...{ class: "px-4 py-2 text-start font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-2 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-2 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ class: "px-4 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
            const __VLS_88 = __VLS_tryAsConstant((activeMonths.value));
            for (const [m] of __VLS_vFor(__VLS_nonNull(__VLS_88))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                    key: (m.month),
                    ...{ class: "border-t border-default" },
                });
                /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-4 py-2" },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                (__VLS_unwrap(monthName, {})(m.month));
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-2 py-2 text-end" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                (__VLS_unwrap(formatMoney, {})(m.income));
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-2 py-2 text-end" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                (__VLS_unwrap(formatMoney, {})(m.expense));
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-4 py-2 text-end" },
                    ...{ class: (m.income - m.expense < 0 ? 'text-error' : '') },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                (m.income - m.expense < 0 ? '−' : '');
                (__VLS_unwrap(formatMoney, {})(Math.abs(m.income - m.expense)));
                // @ts-ignore
                [year, formatMoney, formatMoney, formatMoney, activeMonths, activeMonths, monthName,];
            }
        }
        // @ts-ignore
        [];
        let __VLS_89;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_91 = __VLS_90({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        var __VLS_92;
        const { default: __VLS_94 } = __VLS_nonNull(__VLS_92.slots);
        {
            const { header: __VLS_95 } = __VLS_nonNull(__VLS_92.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!yearEntries.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(year, {}));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_96 = __VLS_tryAsConstant((yearEntries.value));
            for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_96))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (e.id),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(query.value.isPending.value))
                                throw 0;
                            if (!!(!yearEntries.value.length))
                                throw 0;
                            return (modal.value = { open: true, entry: e });
                            // @ts-ignore
                            [year, yearEntries, yearEntries, modal,];
                        } },
                    type: "button",
                    ...{ class: "w-full flex items-center gap-3 px-4 py-2 text-start text-sm hover:bg-elevated/50" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "w-24 shrink-0 text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(formatDate, {})(e.occurred_on));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 min-w-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (e.description || __VLS_unwrap(categoryLabel, {})(e.kind, e.category));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-xs text-muted truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (__VLS_unwrap(categoryLabel, {})(e.kind, e.category));
                if (e.party) {
                    (e.party);
                }
                if (__VLS_unwrap(goatLabel, {})(e.goat_id)) {
                    (__VLS_unwrap(goatLabel, {})(e.goat_id));
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tabular-nums font-medium" },
                    ...{ class: (e.kind === 'income' ? 'text-success' : '') },
                });
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (e.kind === 'income' ? '+' : '−');
                (__VLS_unwrap(formatMoney, {})(e.amount_cents));
                // @ts-ignore
                [formatMoney, formatDate, goatLabel, goatLabel, categoryLabel, categoryLabel,];
            }
        }
        // @ts-ignore
        [];
    }
    const __VLS_97 = EntryModal;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        // @ts-ignore
        open: (modal.value.open), entry: (modal.value.entry), draft: (modal.value.draft),
    }));
    const __VLS_99 = __VLS_98({
        open: (modal.value.open),
        entry: (modal.value.entry),
        draft: (modal.value.draft),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    // @ts-ignore
    [modal, modal, modal,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
