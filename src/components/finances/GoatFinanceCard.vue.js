/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useFinances } from '@/composables/useFinances';
import { useHerd } from '@/composables/useHerd';
import { formatDate } from '@/lib/dates';
import { categoryLabel, formatMoney } from '@/lib/finances';
import EntryModal from './EntryModal.vue';
const { defineProps, } = {};
const props = defineProps();
const { isOwner } = useHerd();
const { entries } = useFinances();
const mine = computed(() => entries.value.filter((e) => e.goat_id === props.goat.id));
const net = computed(() => mine.value.reduce((s, e) => s + (e.kind === 'income' ? 1 : -1) * e.amount_cents, 0));
const modal = ref({ open: false });
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
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(mine, {});
    __VLS_withDotValue(modal, {});
    if (isOwner.value && mine.value.length) {
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
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm tabular-nums" },
                ...{ class: (__VLS_unwrap(net, {}) < 0 ? 'text-error' : 'text-success') },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (__VLS_unwrap(net, {}) < 0 ? '−' : '+');
            (__VLS_unwrap(formatMoney, {})(Math.abs(__VLS_unwrap(net, {}))));
            // @ts-ignore
            [isOwner, mine, net, net, net, formatMoney,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        const __VLS_7 = __VLS_tryAsConstant((mine.value));
        for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (e.id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(isOwner.value && mine.value.length))
                            throw 0;
                        return (modal.value = { open: true, entry: e });
                        // @ts-ignore
                        [mine, modal,];
                    } },
                type: "button",
                ...{ class: "w-full flex gap-3 px-4 py-2 text-start text-sm hover:bg-elevated/50" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-24 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(formatDate, {})(e.occurred_on));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1 truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (e.description || __VLS_unwrap(categoryLabel, {})(e.kind, e.category));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (e.kind === 'income' ? '+' : '−');
            (__VLS_unwrap(formatMoney, {})(e.amount_cents));
            // @ts-ignore
            [formatMoney, formatDate, categoryLabel,];
        }
        const __VLS_8 = EntryModal;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            // @ts-ignore
            open: (modal.value.open), entry: (modal.value.entry),
        }));
        const __VLS_10 = __VLS_9({
            open: (modal.value.open),
            entry: (modal.value.entry),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        // @ts-ignore
        [modal, modal,];
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
