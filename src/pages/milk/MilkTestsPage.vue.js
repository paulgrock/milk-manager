/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useMilkTests } from '@/composables/useMilkTests';
import { formatDate } from '@/lib/dates';
import { SCC_LIMIT, TEST_KIND_LABELS, formatScc } from '@/lib/dhia';
import { formatWeight } from '@/lib/milk';
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { query, data } = useMilkTests();
const rows = computed(() => data.value.tests.map((test) => {
    const results = data.value.results.filter((r) => r.test_id === test.id);
    const avg = (key) => {
        const values = results.map((r) => r[key]).filter((v) => v !== null).map(Number);
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };
    return { test, count: results.length, milk: avg('milk_g'), fat: avg('butterfat_pct'), protein: avg('protein_pct'), scc: avg('scc') };
}));
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(rows, {});
    __VLS_withDotValue(TEST_KIND_LABELS, {});
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
        ...{ class: "text-2xl font-semibold flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        to: "/milk/tests/new", icon: "i-lucide-plus",
    }));
    const __VLS_7 = __VLS_6({
        to: "/milk/tests/new",
        icon: "i-lucide-plus",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    var __VLS_8;
    const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_11 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_11))) {
            let __VLS_12;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                // @ts-ignore
                key: (i), ...{ class: "h-12 w-full" },
            }));
            const __VLS_14 = __VLS_13({
                key: (i),
                ...{ class: "h-12 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [query,];
        }
    }
    else if (!rows.value.length) {
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            // @ts-ignore
            ...{ class: "text-center" },
        }));
        const __VLS_19 = __VLS_18({
            ...{ class: "text-center" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        var __VLS_20;
        const { default: __VLS_22 } = __VLS_nonNull(__VLS_20.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            to: "/milk/tests/new", icon: "i-lucide-plus",
        }));
        const __VLS_25 = __VLS_24({
            to: "/milk/tests/new",
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        // @ts-ignore
        [rows,];
        // @ts-ignore
        [];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "overflow-x-auto rounded-lg border border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
            ...{ class: "w-full text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
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
        const __VLS_29 = __VLS_tryAsConstant((rows.value));
        for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_29))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (r.test.id),
                ...{ class: "border-t border-default hover:bg-elevated/50" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                // @ts-ignore
                to: (`/milk/tests/${r.test.id}`), ...{ class: "font-medium hover:underline" },
            }));
            const __VLS_32 = __VLS_31({
                to: (`/milk/tests/${r.test.id}`),
                ...{ class: "font-medium hover:underline" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
            var __VLS_33;
            const { default: __VLS_35 } = __VLS_nonNull(__VLS_33.slots);
            (__VLS_unwrap(formatDate, {})(r.test.tested_on));
            // @ts-ignore
            [rows, formatDate,];
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            (TEST_KIND_LABELS.value[r.test.kind]);
            if (r.test.lab) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (r.test.lab);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (r.count);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (r.milk === null ? '—' : __VLS_unwrap(formatWeight, {})(r.milk, __VLS_unwrap(unit, {}), true));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (r.fat === null ? '—' : `${r.fat.toFixed(1)}%`);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (r.protein === null ? '—' : `${r.protein.toFixed(1)}%`);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 text-end tabular-nums" },
                ...{ class: (r.scc !== null && r.scc >= __VLS_unwrap(SCC_LIMIT, {}) ? 'text-warning' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (r.scc === null ? '—' : __VLS_unwrap(formatScc, {})(r.scc));
            // @ts-ignore
            [TEST_KIND_LABELS, formatWeight, unit, SCC_LIMIT, formatScc,];
        }
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
