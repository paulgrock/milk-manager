/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useBreedingData } from '@/composables/useBreeding';
import { useHerdGoats } from '@/composables/useGoats';
import { useHerd } from '@/composables/useHerd';
import { formatDate, relativeDays, todayISO } from '@/lib/dates';
import { METHOD_LABELS, STATUS_LABELS, breedingStatus, daysBetween, doeBreedingState, dueWindow, } from '@/lib/breeding';
import { goatFullName } from '@/lib/goats';
import { formatWeight } from '@/lib/milk';
import { STATUS_COLOR } from '@/lib/breedingStatusColors';
import HeatModal from './HeatModal.vue';
import BreedingModal from './BreedingModal.vue';
import CheckModal from './CheckModal.vue';
const { defineProps, } = {};
const props = defineProps();
const today = todayISO();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { data } = useBreedingData();
const { byId } = useHerdGoats();
const state = computed(() => doeBreedingState(props.goat.id, data.value, today));
const buckName = (id) => (id && byId.value.get(id) ? goatFullName(byId.value.get(id)) : 'unknown buck');
const events = computed(() => {
    const d = data.value;
    const mine = new Set(d.breedings.filter((b) => b.doe_id === props.goat.id).map((b) => b.id));
    return [
        ...d.heats.filter((h) => h.goat_id === props.goat.id).map((heat) => ({ kind: 'heat', date: heat.observed_on, heat })),
        ...d.breedings
            .filter((b) => mine.has(b.id))
            .map((breeding) => ({ kind: 'breeding', date: breeding.bred_on, breeding, status: breedingStatus(breeding, d, today) })),
        ...d.checks.filter((c) => mine.has(c.breeding_id)).map((check) => ({ kind: 'check', date: check.checked_on, check })),
        ...d.kiddings
            .filter((k) => k.doe_id === props.goat.id)
            .map((k) => {
            const kids = d.kids.filter((x) => x.kidding_id === k.id);
            const parts = kids.map((x) => `${x.sex === 'doe' ? 'doeling' : 'buckling'}${x.birth_weight_g ? ` ${formatWeight(x.birth_weight_g, unit.value, true)}` : ''}${x.outcome !== 'alive' ? ` (${x.outcome})` : ''}`);
            return { kind: 'kidding', date: k.kidded_on, id: k.id, summary: `${kids.length} ${kids.length === 1 ? 'kid' : 'kids'}${parts.length ? `: ${parts.join(', ')}` : ''}` };
        }),
    ].sort((a, b) => b.date.localeCompare(a.date));
});
const heatModal = ref({ open: false });
const breedingModal = ref({ open: false });
const checkModal = ref({ open: false, breedingId: '' });
const CHECK_LABELS = { pregnant: 'pregnant', open: 'open', unsure: 'unsure' };
const CHECK_METHODS = { blood: 'Blood test', ultrasound: 'Ultrasound', observation: 'Observed' };
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
    __VLS_withDotValue(state, {});
    __VLS_withDotValue(STATUS_COLOR, {});
    __VLS_withDotValue(STATUS_LABELS, {});
    __VLS_withDotValue(heatModal, {});
    __VLS_withDotValue(breedingModal, {});
    __VLS_withDotValue(checkModal, {});
    __VLS_withDotValue(events, {});
    __VLS_withDotValue(METHOD_LABELS, {});
    __VLS_withDotValue(CHECK_METHODS, {});
    __VLS_withDotValue(CHECK_LABELS, {});
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    if (state.value.current) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rounded-md border border-default p-3 space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            color: (STATUS_COLOR.value[state.value.current.status]), variant: "subtle",
        }));
        const __VLS_9 = __VLS_8({
            color: (STATUS_COLOR.value[state.value.current.status]),
            variant: "subtle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        (STATUS_LABELS.value[state.value.current.status]);
        // @ts-ignore
        [state, state, state, STATUS_COLOR, STATUS_LABELS,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_unwrap(buckName, {})(state.value.current.breeding.buck_id));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-lg font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_unwrap(formatDate, {})(state.value.current.due.expected));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm font-normal text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(relativeDays, {})(state.value.current.daysToDue));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(formatDate, {})(state.value.current.due.earliest));
        (__VLS_unwrap(formatDate, {})(state.value.current.due.latest));
        (__VLS_unwrap(formatDate, {})(state.value.current.dryOffBy));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    if (state.value.nextHeat) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
        UIcon;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            name: "i-lucide-calendar-clock", ...{ class: "align-middle me-1" },
        }));
        const __VLS_15 = __VLS_14({
            name: "i-lucide-calendar-clock",
            ...{ class: "align-middle me-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
        /** @type {__VLS_StyleScopedClasses['me-1']} */ ;
        (state.value.nextHeat.reason === 'return' ? 'Watch for a return to heat' : 'Next heat expected');
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(formatDate, {})(state.value.nextHeat.date));
        (__VLS_unwrap(relativeDays, {})(__VLS_unwrap(daysBetween, {})(__VLS_unwrap(today, {}), state.value.nextHeat.date)));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        // @ts-ignore
        ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-flame",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        size: "sm",
        variant: "soft",
        icon: "i-lucide-flame",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = {
        /** @type {typeof __VLS_23.click} */
        onClick: (...[$event]) => {
            void $event;
            return (heatModal.value = { open: true });
            // @ts-ignore
            [state, state, state, state, state, state, state, state, state, state, buckName, formatDate, formatDate, formatDate, formatDate, formatDate, relativeDays, relativeDays, daysBetween, today, heatModal,];
        },
    };
    void __VLS_24;
    var __VLS_21;
    var __VLS_22;
    const { default: __VLS_25 } = __VLS_nonNull(__VLS_21.slots);
    // @ts-ignore
    [];
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        // @ts-ignore
        ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-heart",
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClick': {} },
        size: "sm",
        variant: "soft",
        icon: "i-lucide-heart",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    const __VLS_32 = {
        /** @type {typeof __VLS_31.click} */
        onClick: (...[$event]) => {
            void $event;
            return (breedingModal.value = { open: true });
            // @ts-ignore
            [breedingModal,];
        },
    };
    void __VLS_32;
    var __VLS_29;
    var __VLS_30;
    const { default: __VLS_33 } = __VLS_nonNull(__VLS_29.slots);
    // @ts-ignore
    [];
    if (state.value.current) {
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-test-tube",
        }));
        const __VLS_36 = __VLS_35({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-test-tube",
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_39;
        const __VLS_40 = {
            /** @type {typeof __VLS_39.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(state.value.current))
                    throw 0;
                return (checkModal.value = { open: true, breedingId: state.value.current.breeding.id });
                // @ts-ignore
                [state, state, checkModal,];
            },
        };
        void __VLS_40;
        var __VLS_37;
        var __VLS_38;
        const { default: __VLS_41 } = __VLS_nonNull(__VLS_37.slots);
        // @ts-ignore
        [];
    }
    let __VLS_42;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        // @ts-ignore
        size: "sm", variant: "soft", icon: "i-lucide-baby", to: ({ path: '/breeding/kidding', query: { doe: __VLS_ctx.goat.id, ...(state.value.current ? { breeding: state.value.current.breeding.id } : {}) } }),
    }));
    const __VLS_44 = __VLS_43({
        size: "sm",
        variant: "soft",
        icon: "i-lucide-baby",
        to: ({ path: '/breeding/kidding', query: { doe: __VLS_ctx.goat.id, ...(state.value.current ? { breeding: state.value.current.breeding.id } : {}) } }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    var __VLS_45;
    const { default: __VLS_47 } = __VLS_nonNull(__VLS_45.slots);
    // @ts-ignore
    [state, state, goat,];
    if (events.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default border-t border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        const __VLS_48 = __VLS_tryAsConstant((events.value));
        for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_48))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (`${e.kind}-${e.date}-${'id' in e ? e.id : e.kind === 'heat' ? e.heat.id : e.kind === 'breeding' ? e.breeding.id : e.check.id}`),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(events.value.length))
                            throw 0;
                        return (e.kind === 'heat'
                            ? (heatModal.value = { open: true, heat: e.heat })
                            : e.kind === 'breeding'
                                ? (breedingModal.value = { open: true, breeding: e.breeding })
                                : e.kind === 'check'
                                    ? (checkModal.value = { open: true, breedingId: e.check.breeding_id, check: e.check })
                                    : undefined);
                        // @ts-ignore
                        [heatModal, breedingModal, checkModal, events, events,];
                    } },
                type: "button",
                ...{ class: "w-full py-2 flex gap-3 text-start text-sm hover:bg-elevated/50 rounded disabled:hover:bg-transparent" },
                disabled: (e.kind === 'kidding'),
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:hover:bg-transparent']} */ ;
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
            if (e.kind === 'heat') {
                if (e.heat.signs) {
                    (e.heat.signs);
                }
            }
            else if (e.kind === 'breeding') {
                (METHOD_LABELS.value[e.breeding.method]);
                (__VLS_unwrap(buckName, {})(e.breeding.buck_id));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(formatDate, {})(__VLS_unwrap(dueWindow, {})(e.breeding).expected));
            }
            else if (e.kind === 'check') {
                (CHECK_METHODS.value[e.check.method]);
                (CHECK_LABELS.value[e.check.result]);
            }
            else {
                (e.summary);
            }
            if (e.kind === 'breeding') {
                let __VLS_49;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
                    // @ts-ignore
                    color: (STATUS_COLOR.value[e.status]), variant: "subtle", size: "sm",
                }));
                const __VLS_51 = __VLS_50({
                    color: (STATUS_COLOR.value[e.status]),
                    variant: "subtle",
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_50));
                var __VLS_52;
                const { default: __VLS_54 } = __VLS_nonNull(__VLS_52.slots);
                (STATUS_LABELS.value[e.status]);
                // @ts-ignore
                [STATUS_COLOR, STATUS_LABELS, buckName, formatDate, formatDate, METHOD_LABELS, dueWindow, CHECK_METHODS, CHECK_LABELS,];
            }
            // @ts-ignore
            [];
        }
    }
    const __VLS_55 = HeatModal;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        // @ts-ignore
        open: (heatModal.value.open), goatId: (__VLS_ctx.goat.id), heat: (heatModal.value.heat),
    }));
    const __VLS_57 = __VLS_56({
        open: (heatModal.value.open),
        goatId: (__VLS_ctx.goat.id),
        heat: (heatModal.value.heat),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const __VLS_60 = BreedingModal;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        // @ts-ignore
        open: (breedingModal.value.open), goatId: (__VLS_ctx.goat.id), breeding: (breedingModal.value.breeding),
    }));
    const __VLS_62 = __VLS_61({
        open: (breedingModal.value.open),
        goatId: (__VLS_ctx.goat.id),
        breeding: (breedingModal.value.breeding),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    const __VLS_65 = CheckModal;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        // @ts-ignore
        open: (checkModal.value.open), breedingId: (checkModal.value.breedingId), check: (checkModal.value.check),
    }));
    const __VLS_67 = __VLS_66({
        open: (checkModal.value.open),
        breedingId: (checkModal.value.breedingId),
        check: (checkModal.value.check),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    // @ts-ignore
    [heatModal, heatModal, breedingModal, breedingModal, checkModal, checkModal, checkModal, goat, goat,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
