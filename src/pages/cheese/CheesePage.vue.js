/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese';
import { formatDate, todayISO } from '@/lib/dates';
import { STATUS_ICONS, agingLabel, isReadySoon, makeStatus, milkLabel, monthlyTotals, readyLabel } from '@/lib/cheese';
import MakeModal from '@/components/cheese/MakeModal.vue';
import TypeSettings from '@/components/cheese/TypeSettings.vue';
const today = todayISO();
const toast = useToast();
const { isOwner } = useHerd();
const { query, data } = useCheeseData();
const { saveType } = useCheeseMutations();
// Each cheese with its makes coming ready in the next week, soonest first. Fresh cheese never waits, so shows as a name only.
const byType = computed(() => data.value.types.map((type) => {
    const makes = data.value.makes.filter((m) => m.cheese_type_id === type.id);
    const current = makes.filter((m) => isReadySoon(m, today)).sort((a, b) => a.ready_on.localeCompare(b.ready_on));
    return { type, total: makes.length, current };
}));
const withCurrent = computed(() => byType.value.filter((t) => t.current.length));
// The rest stay a tap away; a hidden cheese never made is left out.
const others = computed(() => byType.value.filter((t) => !t.current.length && (t.total || !t.type.hidden)));
const months = computed(() => monthlyTotals(data.value.makes).slice(0, 6));
const monthLabel = (m) => new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
const modalOpen = ref(false);
// The cheese list: anyone can add; owners rename, change aging times and hide.
const draft = reactive({ name: '', days: 0 });
async function addType() {
    if (!draft.name.trim())
        return;
    try {
        await saveType.mutateAsync({ values: { name: draft.name.trim(), aging_days: draft.days, sort_order: data.value.types.length + 1 } });
        Object.assign(draft, { name: '', days: 0 });
    }
    catch (e) {
        const message = e.message;
        toast.add({ color: 'error', title: 'Could not add', description: message.includes('duplicate') ? 'That cheese is already in the list.' : message });
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(modalOpen, {});
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(withCurrent, {});
    __VLS_withDotValue(today, {});
    __VLS_withDotValue(STATUS_ICONS, {});
    __VLS_withDotValue(others, {});
    __VLS_withDotValue(months, {});
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(draft, {});
    __VLS_withDotValue(saveType, {});
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
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onClick': {} }, icon: "i-lucide-plus",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        icon: "i-lucide-plus",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.click} */
        onClick: (...[$event]) => {
            void $event;
            return (modalOpen.value = true);
            // @ts-ignore
            [modalOpen,];
        },
    };
    void __VLS_6;
    var __VLS_3;
    var __VLS_4;
    const { default: __VLS_7 } = __VLS_nonNull(__VLS_3.slots);
    // @ts-ignore
    [];
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_8 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_8))) {
            let __VLS_9;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
                // @ts-ignore
                key: (i), ...{ class: "h-20 w-full" },
            }));
            const __VLS_11 = __VLS_10({
                key: (i),
                ...{ class: "h-20 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_10));
            /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [query,];
        }
    }
    else {
        if (!withCurrent.value.length) {
            let __VLS_14;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
                // @ts-ignore
                ...{ class: "text-center" },
            }));
            const __VLS_16 = __VLS_15({
                ...{ class: "text-center" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            var __VLS_17;
            const { default: __VLS_19 } = __VLS_nonNull(__VLS_17.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            // @ts-ignore
            [withCurrent,];
        }
        const __VLS_20 = __VLS_tryAsConstant((withCurrent.value));
        for (const [{ type, current }] of __VLS_vFor(__VLS_nonNull(__VLS_20))) {
            let __VLS_21;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
                // @ts-ignore
                key: (type.id), ui: ({ header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }),
            }));
            const __VLS_23 = __VLS_22({
                key: (type.id),
                ui: ({ header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            var __VLS_24;
            const { default: __VLS_26 } = __VLS_nonNull(__VLS_24.slots);
            {
                const { header: __VLS_27 } = __VLS_nonNull(__VLS_24.slots);
                let __VLS_28;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
                    // @ts-ignore
                    to: (`/cheese/types/${type.id}`), ...{ class: "flex items-center gap-2 px-4 py-3 hover:bg-elevated/50" },
                }));
                const __VLS_30 = __VLS_29({
                    to: (`/cheese/types/${type.id}`),
                    ...{ class: "flex items-center gap-2 px-4 py-3 hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_29));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_31;
                const { default: __VLS_33 } = __VLS_nonNull(__VLS_31.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                    ...{ class: "font-semibold flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (type.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted font-normal" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                (current.length);
                let __VLS_34;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    // @ts-ignore
                    name: "i-lucide-chevron-right", ...{ class: "text-muted size-5" },
                }));
                const __VLS_36 = __VLS_35({
                    name: "i-lucide-chevron-right",
                    ...{ class: "text-muted size-5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
                // @ts-ignore
                [withCurrent,];
                // @ts-ignore
                [];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_39 = __VLS_tryAsConstant((current));
            for (const [make] of __VLS_vFor(__VLS_nonNull(__VLS_39))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (make.id),
                });
                let __VLS_40;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                    // @ts-ignore
                    to: (`/cheese/makes/${make.id}`), ...{ class: "px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1" },
                }));
                const __VLS_42 = __VLS_41({
                    to: (`/cheese/makes/${make.id}`),
                    ...{ class: "px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-y-1']} */ ;
                var __VLS_43;
                const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 min-w-40" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
                (__VLS_unwrap(formatDate, {})(make.made_on));
                if (__VLS_unwrap(milkLabel, {})(make)) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "whitespace-nowrap" },
                    });
                    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
                    (__VLS_unwrap(milkLabel, {})(make));
                }
                let __VLS_46;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                    // @ts-ignore
                    color: (__VLS_unwrap(makeStatus, {})(make, today.value) === 'aging' ? 'neutral' : 'primary'), variant: "subtle", icon: (STATUS_ICONS.value[__VLS_unwrap(makeStatus, {})(make, today.value)]),
                }));
                const __VLS_48 = __VLS_47({
                    color: (__VLS_unwrap(makeStatus, {})(make, today.value) === 'aging' ? 'neutral' : 'primary'),
                    variant: "subtle",
                    icon: (STATUS_ICONS.value[__VLS_unwrap(makeStatus, {})(make, today.value)]),
                }, ...__VLS_functionalComponentArgsRest(__VLS_47));
                var __VLS_49;
                const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
                (__VLS_unwrap(readyLabel, {})(make, today.value));
                // @ts-ignore
                [formatDate, milkLabel, milkLabel, makeStatus, makeStatus, today, today, today, STATUS_ICONS, readyLabel,];
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
        if (others.value.length) {
            let __VLS_52;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                // @ts-ignore
                ui: ({ body: 'p-0 sm:p-0' }),
            }));
            const __VLS_54 = __VLS_53({
                ui: ({ body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            var __VLS_55;
            const { default: __VLS_57 } = __VLS_nonNull(__VLS_55.slots);
            {
                const { header: __VLS_58 } = __VLS_nonNull(__VLS_55.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                    ...{ class: "font-semibold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                (withCurrent.value.length ? 'Other cheeses' : 'Cheeses');
                // @ts-ignore
                [withCurrent, others,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_59 = __VLS_tryAsConstant((others.value));
            for (const [{ type, total }] of __VLS_vFor(__VLS_nonNull(__VLS_59))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (type.id),
                });
                let __VLS_60;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                    // @ts-ignore
                    to: (`/cheese/types/${type.id}`), ...{ class: "px-4 py-2 hover:bg-elevated/50 flex items-center gap-3" },
                }));
                const __VLS_62 = __VLS_61({
                    to: (`/cheese/types/${type.id}`),
                    ...{ class: "px-4 py-2 hover:bg-elevated/50 flex items-center gap-3" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                var __VLS_63;
                const { default: __VLS_65 } = __VLS_nonNull(__VLS_63.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (type.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (total ? `${total} make${total === 1 ? '' : 's'}` : 'No makes yet');
                let __VLS_66;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
                    // @ts-ignore
                    name: "i-lucide-chevron-right", ...{ class: "text-muted size-4" },
                }));
                const __VLS_68 = __VLS_67({
                    name: "i-lucide-chevron-right",
                    ...{ class: "text-muted size-4" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_67));
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
                // @ts-ignore
                [others,];
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
        }
        if (months.value.length) {
            let __VLS_71;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                // @ts-ignore
                ui: ({ body: 'p-0 sm:p-0' }),
            }));
            const __VLS_73 = __VLS_72({
                ui: ({ body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            var __VLS_74;
            const { default: __VLS_76 } = __VLS_nonNull(__VLS_74.slots);
            {
                const { header: __VLS_77 } = __VLS_nonNull(__VLS_74.slots);
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
                [months,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
                ...{ class: "w-full text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({
                ...{ class: "text-muted text-start" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
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
                ...{ class: "px-4 py-2 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_78 = __VLS_tryAsConstant((months.value));
            for (const [m] of __VLS_vFor(__VLS_nonNull(__VLS_78))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                    key: (m.month),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-4 py-2 whitespace-nowrap" },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
                (__VLS_unwrap(monthLabel, {})(m.month));
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-2 py-2 text-end tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                (m.makes);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: "px-4 py-2 text-end tabular-nums" },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                if (m.gallons) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "whitespace-nowrap" },
                    });
                    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
                    (+m.gallons.toFixed(2));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted whitespace-nowrap" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
                    (Math.round(m.milkLb));
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                }
                // @ts-ignore
                [months, monthLabel,];
            }
            // @ts-ignore
            [];
        }
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
        // @ts-ignore
        }));
        const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
        var __VLS_82;
        const { default: __VLS_84 } = __VLS_nonNull(__VLS_82.slots);
        {
            const { header: __VLS_85 } = __VLS_nonNull(__VLS_82.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (isOwner.value ? '' : 'Only owners can rename or hide these.');
            // @ts-ignore
            [isOwner,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default -my-2" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
        const __VLS_86 = __VLS_tryAsConstant((data.value.types));
        for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_86))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (t.id),
                ...{ class: "py-2" },
            });
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            if (isOwner.value) {
                const __VLS_87 = TypeSettings;
                // @ts-ignore
                const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
                    // @ts-ignore
                    type: (t),
                }));
                const __VLS_89 = __VLS_88({
                    type: (t),
                }, ...__VLS_functionalComponentArgsRest(__VLS_88));
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex flex-wrap items-center gap-3" },
                    ...{ class: (t.hidden ? 'opacity-60' : '') },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (t.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(agingLabel, {})(t.aging_days));
                (t.hidden ? ' · hidden' : '');
            }
            // @ts-ignore
            [isOwner, data, agingLabel,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (addType) },
            ...{ class: "flex flex-wrap items-end gap-2 mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        let __VLS_92;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
            // @ts-ignore
            label: "Add a cheese", ...{ class: "flex-1 min-w-40" },
        }));
        const __VLS_94 = __VLS_93({
            label: "Add a cheese",
            ...{ class: "flex-1 min-w-40" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
        var __VLS_95;
        const { default: __VLS_97 } = __VLS_nonNull(__VLS_95.slots);
        let __VLS_98;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
            // @ts-ignore
            modelValue: (draft.value.name), placeholder: "Gouda, ricotta…", maxlength: "60", ...{ class: "w-full" },
        }));
        const __VLS_100 = __VLS_99({
            modelValue: (draft.value.name),
            placeholder: "Gouda, ricotta…",
            maxlength: "60",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [draft,];
        let __VLS_103;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            // @ts-ignore
            label: "Ages (days)",
        }));
        const __VLS_105 = __VLS_104({
            label: "Ages (days)",
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        var __VLS_106;
        const { default: __VLS_108 } = __VLS_nonNull(__VLS_106.slots);
        let __VLS_109;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
            // @ts-ignore
            modelValue: (draft.value.days), min: (0), max: (1095), ...{ class: "w-28" },
        }));
        const __VLS_111 = __VLS_110({
            modelValue: (draft.value.days),
            min: (0),
            max: (1095),
            ...{ class: "w-28" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
        // @ts-ignore
        [draft,];
        let __VLS_114;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
            // @ts-ignore
            type: "submit", variant: "soft", loading: (saveType.value.isPending.value),
        }));
        const __VLS_116 = __VLS_115({
            type: "submit",
            variant: "soft",
            loading: (saveType.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        var __VLS_117;
        const { default: __VLS_119 } = __VLS_nonNull(__VLS_117.slots);
        // @ts-ignore
        [saveType,];
        // @ts-ignore
        [];
    }
    const __VLS_120 = MakeModal;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        // @ts-ignore
        open: (modalOpen.value),
    }));
    const __VLS_122 = __VLS_121({
        open: (modalOpen.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    // @ts-ignore
    [modalOpen,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
