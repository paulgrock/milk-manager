/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useHealthData } from '@/composables/useHealth';
import { formatDate, relativeDays, todayISO } from '@/lib/dates';
import { ROUTE_LABELS, careStatus, withholdThrough, } from '@/lib/health';
import LogCareModal from './LogCareModal.vue';
import TreatmentModal from './TreatmentModal.vue';
import DeleteCareModal from './DeleteCareModal.vue';
const { defineProps, } = {};
const props = defineProps();
const today = todayISO();
const { data } = useHealthData();
const care = computed(() => data.value.careTypes.filter((t) => !t.archived).map((t) => careStatus(props.goat.id, t, data.value.careEvents, today)));
const history = computed(() => {
    const id = props.goat.id;
    const d = data.value;
    return [
        ...d.careEvents.filter((e) => e.goat_id === id).map((care) => ({ kind: 'care', date: care.done_on, care })),
        ...d.treatments.filter((t) => t.goat_id === id).map((treatment) => ({ kind: 'treatment', date: treatment.started_on, treatment })),
    ].sort((a, b) => b.date.localeCompare(a.date));
});
const showAll = ref(false);
const shownHistory = computed(() => (showAll.value ? history.value : history.value.slice(0, 8)));
const typeName = (id) => data.value.careTypes.find((t) => t.id === id)?.name ?? 'Care';
const typeUnit = (id) => data.value.careTypes.find((t) => t.id === id)?.dose_unit ?? '';
const careModal = ref({ open: false });
const treatmentModal = ref({ open: false });
const deleteModal = ref({ open: false });
function open(e) {
    if (e.kind === 'treatment')
        treatmentModal.value = { open: true, treatment: e.treatment };
}
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
    __VLS_withDotValue(careModal, {});
    __VLS_withDotValue(treatmentModal, {});
    __VLS_withDotValue(history, {});
    __VLS_withDotValue(ROUTE_LABELS, {});
    __VLS_withDotValue(deleteModal, {});
    __VLS_withDotValue(showAll, {});
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
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-clipboard-check",
        }));
        const __VLS_9 = __VLS_8({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-clipboard-check",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        let __VLS_12;
        const __VLS_13 = {
            /** @type {typeof __VLS_12.click} */
            onClick: (...[$event]) => {
                void $event;
                return (careModal.value = { open: true });
                // @ts-ignore
                [careModal,];
            },
        };
        void __VLS_13;
        var __VLS_10;
        var __VLS_11;
        const { default: __VLS_14 } = __VLS_nonNull(__VLS_10.slots);
        // @ts-ignore
        [];
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-pill",
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-pill",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_20;
        const __VLS_21 = {
            /** @type {typeof __VLS_20.click} */
            onClick: (...[$event]) => {
                void $event;
                return (treatmentModal.value = { open: true });
                // @ts-ignore
                [treatmentModal,];
            },
        };
        void __VLS_21;
        var __VLS_18;
        var __VLS_19;
        const { default: __VLS_22 } = __VLS_nonNull(__VLS_18.slots);
        // @ts-ignore
        [];
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "grid sm:grid-cols-2 gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    const __VLS_23 = __VLS_tryAsConstant((__VLS_unwrap(care, {})));
    for (const [c] of __VLS_vFor(__VLS_nonNull(__VLS_23))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (c.type.id),
            ...{ class: "rounded-md border border-default px-3 py-2" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-medium flex-1 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (c.type.name);
        if (c.state === 'overdue') {
            let __VLS_24;
            /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
            UBadge;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                // @ts-ignore
                color: "warning", variant: "subtle", size: "sm", icon: "i-lucide-alarm-clock",
            }));
            const __VLS_26 = __VLS_25({
                color: "warning",
                variant: "subtle",
                size: "sm",
                icon: "i-lucide-alarm-clock",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            var __VLS_27;
            const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
            // @ts-ignore
            [care,];
        }
        else if (c.state === 'due') {
            let __VLS_30;
            /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
            UBadge;
            // @ts-ignore
            const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                // @ts-ignore
                color: "neutral", variant: "subtle", size: "sm",
            }));
            const __VLS_32 = __VLS_31({
                color: "neutral",
                variant: "subtle",
                size: "sm",
            }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            var __VLS_33;
            const { default: __VLS_35 } = __VLS_nonNull(__VLS_33.slots);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        if (c.last) {
            (__VLS_unwrap(formatDate, {})(c.last.done_on));
        }
        else {
        }
        if (c.nextDue) {
            (__VLS_unwrap(relativeDays, {})(c.daysUntilDue));
        }
        // @ts-ignore
        [formatDate, relativeDays,];
    }
    if (history.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default border-t border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        const __VLS_36 = __VLS_tryAsConstant((__VLS_unwrap(shownHistory, {})));
        for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_36))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (`${e.kind}-${e.kind === 'care' ? e.care.id : e.treatment.id}`),
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(history.value.length))
                            throw 0;
                        return (open(e));
                        // @ts-ignore
                        [history, shownHistory,];
                    } },
                type: "button",
                ...{ class: "flex-1 py-2 flex gap-3 text-start text-sm hover:bg-elevated/50 rounded" },
                disabled: (e.kind === 'care'),
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-24 shrink-0 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(formatDate, {})(e.date));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            if (e.kind === 'care') {
                (__VLS_unwrap(typeName, {})(e.care.care_type_id));
                if (e.care.dose) {
                    (Number(e.care.dose));
                    (__VLS_unwrap(typeUnit, {})(e.care.care_type_id));
                }
                if (e.care.notes) {
                    (e.care.notes);
                }
            }
            else {
                (e.treatment.medication);
                if (e.treatment.reason) {
                    (e.treatment.reason);
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                if (e.treatment.dose) {
                    (e.treatment.dose);
                }
                if (e.treatment.route) {
                    (ROUTE_LABELS.value[e.treatment.route].toLowerCase());
                }
                if (__VLS_unwrap(withholdThrough, {})(e.treatment)) {
                    (__VLS_unwrap(formatDate, {})(__VLS_unwrap(withholdThrough, {})(e.treatment)));
                }
            }
            if (e.kind === 'care') {
                let __VLS_37;
                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", icon: "i-lucide-trash-2", 'aria-label': (`Delete ${__VLS_unwrap(typeName, {})(e.care.care_type_id)} on ${__VLS_unwrap(formatDate, {})(e.date)}`),
                }));
                const __VLS_39 = __VLS_38({
                    ...{ 'onClick': {} },
                    size: "xs",
                    color: "neutral",
                    variant: "ghost",
                    icon: "i-lucide-trash-2",
                    'aria-label': (`Delete ${__VLS_unwrap(typeName, {})(e.care.care_type_id)} on ${__VLS_unwrap(formatDate, {})(e.date)}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_38));
                let __VLS_42;
                const __VLS_43 = {
                    /** @type {typeof __VLS_42.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!(history.value.length))
                            throw 0;
                        if (!(e.kind === 'care'))
                            throw 0;
                        return (deleteModal.value = { open: true, event: e.care });
                        // @ts-ignore
                        [formatDate, formatDate, formatDate, typeName, typeName, typeUnit, ROUTE_LABELS, withholdThrough, withholdThrough, deleteModal,];
                    },
                };
                void __VLS_43;
                var __VLS_40;
                var __VLS_41;
            }
            // @ts-ignore
            [];
        }
    }
    if (history.value.length > 8) {
        let __VLS_44;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "xs", variant: "link", color: "neutral",
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            size: "xs",
            variant: "link",
            color: "neutral",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_49;
        const __VLS_50 = {
            /** @type {typeof __VLS_49.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(history.value.length > 8))
                    throw 0;
                return (showAll.value = !showAll.value);
                // @ts-ignore
                [history, showAll, showAll,];
            },
        };
        void __VLS_50;
        var __VLS_47;
        var __VLS_48;
        const { default: __VLS_51 } = __VLS_nonNull(__VLS_47.slots);
        (showAll.value ? 'Show less' : `Show all ${history.value.length}`);
        // @ts-ignore
        [history, showAll,];
    }
    const __VLS_52 = LogCareModal;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        // @ts-ignore
        open: (careModal.value.open), careTypeId: (careModal.value.careTypeId), goatIds: ([__VLS_ctx.goat.id]),
    }));
    const __VLS_54 = __VLS_53({
        open: (careModal.value.open),
        careTypeId: (careModal.value.careTypeId),
        goatIds: ([__VLS_ctx.goat.id]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_57 = TreatmentModal;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        // @ts-ignore
        open: (treatmentModal.value.open), goatId: (__VLS_ctx.goat.id), treatment: (treatmentModal.value.treatment),
    }));
    const __VLS_59 = __VLS_58({
        open: (treatmentModal.value.open),
        goatId: (__VLS_ctx.goat.id),
        treatment: (treatmentModal.value.treatment),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_62 = DeleteCareModal;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        // @ts-ignore
        open: (deleteModal.value.open), event: (deleteModal.value.event),
    }));
    const __VLS_64 = __VLS_63({
        open: (deleteModal.value.open),
        event: (deleteModal.value.event),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    // @ts-ignore
    [careModal, careModal, treatmentModal, treatmentModal, deleteModal, deleteModal, goat, goat,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
