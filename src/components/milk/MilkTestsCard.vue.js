/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useLactations } from '@/composables/useMilk';
import { useMilkTests } from '@/composables/useMilkTests';
import { formatDate } from '@/lib/dates';
import { SCC_LIMIT, TEST_KIND_LABELS, componentGrams, formatScc, isMiniature, oneDayPoints } from '@/lib/dhia';
import { daysInMilk, formatWeight, lactationOn } from '@/lib/milk';
const { defineProps, } = {};
const props = defineProps();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { data } = useMilkTests();
const lactations = useLactations();
const rows = computed(() => {
    const tests = new Map(data.value.tests.map((t) => [t.id, t]));
    return data.value.results
        .filter((r) => r.goat_id === props.goat.id && tests.has(r.test_id))
        .map((r) => {
        const test = tests.get(r.test_id);
        const lactation = lactationOn(lactations.data.value ?? [], props.goat.id, test.tested_on);
        const dim = lactation ? daysInMilk(lactation.freshened_on, test.tested_on) : null;
        const points = test.kind === 'one_day' && r.milk_g !== null && r.butterfat_pct !== null && dim !== null
            ? oneDayPoints({ milkG: r.milk_g, butterfatPct: r.butterfat_pct, dim, miniature: isMiniature(props.goat.breed) })
            : null;
        return {
            r,
            test,
            dim,
            fatG: componentGrams(r.milk_g, r.butterfat_pct),
            proteinG: componentGrams(r.milk_g, r.protein_pct),
            points,
        };
    })
        .sort((a, b) => b.test.tested_on.localeCompare(a.test.tested_on));
});
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
    __VLS_withDotValue(rows, {});
    __VLS_withDotValue(TEST_KIND_LABELS, {});
    if (rows.value.length) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_2 = __VLS_1({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        var __VLS_3;
        const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
        {
            const { header: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [rows,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "overflow-x-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
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
            ...{ class: "px-3 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
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
            ...{ class: "px-3 py-2 text-end font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        const __VLS_7 = __VLS_tryAsConstant((rows.value));
        for (const [row] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
                key: (row.r.id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                ...{ class: "border-t border-default" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            let __VLS_8;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                // @ts-ignore
                to: (`/milk/tests/${row.test.id}`), ...{ class: "hover:underline" },
            }));
            const __VLS_10 = __VLS_9({
                to: (`/milk/tests/${row.test.id}`),
                ...{ class: "hover:underline" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
            var __VLS_11;
            const { default: __VLS_13 } = __VLS_nonNull(__VLS_11.slots);
            (__VLS_unwrap(formatDate, {})(row.test.tested_on));
            // @ts-ignore
            [rows, formatDate,];
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "block text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (TEST_KIND_LABELS.value[row.test.kind]);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-2 text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            (row.dim ?? '—');
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-2 text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            (row.r.milk_g === null ? '—' : __VLS_unwrap(formatWeight, {})(row.r.milk_g, __VLS_unwrap(unit, {}), true));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-2 text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            if (row.r.butterfat_pct !== null) {
                (Number(row.r.butterfat_pct));
                if (row.fatG !== null) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(formatWeight, {})(row.fatG, __VLS_unwrap(unit, {}), true));
                }
            }
            else {
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-2 text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            if (row.r.protein_pct !== null) {
                (Number(row.r.protein_pct));
                if (row.proteinG !== null) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(formatWeight, {})(row.proteinG, __VLS_unwrap(unit, {}), true));
                }
            }
            else {
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end" },
                ...{ class: (row.r.scc !== null && row.r.scc >= __VLS_unwrap(SCC_LIMIT, {}) ? 'text-warning font-semibold' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            (row.r.scc === null ? '—' : __VLS_unwrap(formatScc, {})(row.r.scc));
            if (row.r.scc !== null && row.r.scc >= __VLS_unwrap(SCC_LIMIT, {})) {
                let __VLS_14;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                    // @ts-ignore
                    name: "i-lucide-triangle-alert", ...{ class: "align-middle" }, 'aria-label': "Over 1.5 million, the Grade A limit",
                }));
                const __VLS_16 = __VLS_15({
                    name: "i-lucide-triangle-alert",
                    ...{ class: "align-middle" },
                    'aria-label': "Over 1.5 million, the Grade A limit",
                }, ...__VLS_functionalComponentArgsRest(__VLS_15));
                /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
            }
            if (row.points) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    colspan: "6",
                    ...{ class: "px-3 pb-2 text-xs" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                let __VLS_19;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
                    // @ts-ignore
                    color: (row.points.earned ? 'success' : 'neutral'), variant: "subtle", size: "sm", icon: (row.points.earned ? 'i-lucide-star' : undefined),
                }));
                const __VLS_21 = __VLS_20({
                    color: (row.points.earned ? 'success' : 'neutral'),
                    variant: "subtle",
                    size: "sm",
                    icon: (row.points.earned ? 'i-lucide-star' : undefined),
                }, ...__VLS_functionalComponentArgsRest(__VLS_20));
                var __VLS_22;
                const { default: __VLS_24 } = __VLS_nonNull(__VLS_22.slots);
                (row.points.total);
                (row.points.needed);
                (row.points.earned ? ' · *M' : '');
                // @ts-ignore
                [TEST_KIND_LABELS, formatWeight, formatWeight, formatWeight, unit, unit, unit, SCC_LIMIT, SCC_LIMIT, formatScc,];
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted ms-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['ms-2']} */ ;
                (row.points.milk);
                (row.points.butterfat);
                (row.points.daysInMilk);
            }
            // @ts-ignore
            [];
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
