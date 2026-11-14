/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { appraisalSummary, buildPedigree, goatFullName } from '@/lib/goats';
const { defineProps, } = {};
const props = defineProps();
const tree = computed(() => buildPedigree(props.goat, props.byId, 2));
// Rows in the order Bird's Eye-style pedigrees read: S, SS, SD, D, DS, DD.
const cells = computed(() => {
    const t = tree.value;
    // Parents span two grid rows, each grandparent takes one.
    const cell = (label, node, generation, row) => ({
        label,
        goat: node?.goat ?? null,
        generation,
        gridRow: generation === 1 ? `${row} / span 2` : `${row}`,
    });
    return [
        cell('Sire', t.sire, 1, 1),
        cell('SS', t.sire?.sire ?? null, 2, 1),
        cell('SD', t.sire?.dam ?? null, 2, 2),
        cell('Dam', t.dam, 1, 3),
        cell('DS', t.dam?.sire ?? null, 2, 3),
        cell('DD', t.dam?.dam ?? null, 2, 4),
    ];
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-[minmax(0,1fr)_minmax(0,1fr)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-y-2']} */ ;
    const __VLS_0 = __VLS_tryAsConstant((__VLS_unwrap(cells, {})));
    for (const [c] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
            key: (c.label),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: ([
                    'rounded-md border border-default p-2 min-w-0 flex flex-col justify-center',
                    c.generation === 1 ? 'col-start-1 bg-elevated/40' : 'col-start-2',
                ]) },
            ...{ style: ({ gridRow: c.gridRow }) },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (c.label);
        if (c.goat) {
            let __VLS_1;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
                // @ts-ignore
                to: (`/goats/${c.goat.slug}`), ...{ class: "font-medium hover:underline break-words" },
            }));
            const __VLS_3 = __VLS_2({
                to: (`/goats/${c.goat.slug}`),
                ...{ class: "font-medium hover:underline break-words" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_2));
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
            /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
            var __VLS_4;
            const { default: __VLS_6 } = __VLS_nonNull(__VLS_4.slots);
            (__VLS_unwrap(goatFullName, {})(c.goat));
            // @ts-ignore
            [cells, goatFullName,];
            if (__VLS_ctx.latest.get(c.goat.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(appraisalSummary, {})(__VLS_ctx.latest.get(c.goat.id)));
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted italic" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        }
        // @ts-ignore
        [latest, latest, appraisalSummary,];
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
