/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { shiftDate, useHerdDayTotals } from '@/composables/useMilk';
import { formatDate, todayISO } from '@/lib/dates';
import { goatName } from '@/lib/goats';
import { formatWeight } from '@/lib/milk';
const { herd } = useHerd();
const { byId } = useHerdGoats();
const totals = useHerdDayTotals(shiftDate(todayISO(), -60));
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const DAYS = 30;
const days = computed(() => {
    const rows = totals.data.value ?? [];
    const today = todayISO();
    return Array.from({ length: DAYS }, (_, i) => {
        const date = shiftDate(today, -i);
        const dayRows = rows.filter((r) => r.milked_on === date);
        // Today's PM may just not have happened yet.
        const incomplete = date === today ? [] : dayRows.filter((r) => !r.is_day_total && r.has_am !== r.has_pm);
        return {
            date,
            totalG: dayRows.reduce((s, r) => s + (r.total_g ?? 0), 0),
            does: dayRows.length,
            incomplete: incomplete.map((r) => {
                const g = byId.value.get(r.goat_id);
                return g ? g.barn_name || goatName(g) : '?';
            }),
        };
    });
});
const maxG = computed(() => Math.max(1, ...days.value.map((d) => d.totalG)));
const week = computed(() => {
    const recent = days.value.slice(0, 7).filter((d) => d.totalG > 0);
    return recent.length ? recent.reduce((s, d) => s + d.totalG, 0) / recent.length : 0;
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(totals, {});
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
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    // @ts-ignore
    }));
    const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
    var __VLS_8;
    const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-2xl font-semibold tabular-nums" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
    (__VLS_unwrap(formatWeight, {})(Math.round(__VLS_unwrap(week, {})), __VLS_unwrap(unit, {}), true));
    // @ts-ignore
    [formatWeight, week, unit,];
    if (totals.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_11 = __VLS_tryAsConstant((6));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_11))) {
            let __VLS_12;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                // @ts-ignore
                key: (i), ...{ class: "h-10 w-full" },
            }));
            const __VLS_14 = __VLS_13({
                key: (i),
                ...{ class: "h-10 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [totals,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default rounded-lg border border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        const __VLS_17 = __VLS_tryAsConstant((__VLS_unwrap(days, {})));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_17))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (d.date),
            });
            let __VLS_18;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                // @ts-ignore
                to: ({ path: '/milk', query: { date: d.date } }), ...{ class: "flex items-center gap-3 px-3 py-2 hover:bg-elevated/50" },
            }));
            const __VLS_20 = __VLS_19({
                to: ({ path: '/milk', query: { date: d.date } }),
                ...{ class: "flex items-center gap-3 px-3 py-2 hover:bg-elevated/50" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            var __VLS_21;
            const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-28 shrink-0 text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_unwrap(formatDate, {})(d.date));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1 h-2 rounded bg-elevated overflow-hidden" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                ...{ class: "block h-full bg-primary rounded" },
                ...{ style: ({ width: `${(d.totalG / __VLS_unwrap(maxG, {})) * 100}%` }) },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-20 text-end tabular-nums font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (d.totalG ? __VLS_unwrap(formatWeight, {})(d.totalG, __VLS_unwrap(unit, {})) : '—');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-14 text-end text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (d.does ? `${d.does} ${d.does === 1 ? 'doe' : 'does'}` : '');
            // @ts-ignore
            [formatWeight, unit, days, formatDate, maxG,];
            if (d.incomplete.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "px-3 pb-2 -mt-1 text-xs text-warning" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['-mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
                (d.incomplete.join(', '));
            }
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
