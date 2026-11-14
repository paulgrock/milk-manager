/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useHerdGoats } from '@/composables/useGoats';
import { useBreedingData } from '@/composables/useBreeding';
import { useLactations } from '@/composables/useMilk';
import { useHerd } from '@/composables/useHerd';
import { addMonths, formatDate, relativeDays, todayISO } from '@/lib/dates';
import { STATUS_LABELS, addDays, daysBetween, doeBreedingState } from '@/lib/breeding';
import { STATUS_COLOR } from '@/lib/breedingStatusColors';
import { CURRENT_STATUSES, goatFullName, goatName } from '@/lib/goats';
import { formatWeight, lactationOn } from '@/lib/milk';
import HeatModal from '@/components/breeding/HeatModal.vue';
import BreedingModal from '@/components/breeding/BreedingModal.vue';
const DUE_WITHIN_DAYS = 60;
const HEAT_WITHIN_DAYS = 7;
const today = todayISO();
const { herd, isOwner } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { goats, byId, pathOf } = useHerdGoats();
const { query, data } = useBreedingData();
const lactations = useLactations();
const name = (g) => g.barn_name || goatName(g);
const does = computed(() => (goats.data.value ?? []).filter((g) => g.sex === 'doe' && CURRENT_STATUSES.includes(g.status)));
const states = computed(() => does.value.map((goat) => ({ goat, state: doeBreedingState(goat.id, data.value, today) })));
const dueSoon = computed(() => states.value
    .filter((x) => !!x.state.current && x.state.current.daysToDue <= DUE_WITHIN_DAYS)
    .sort((a, b) => a.state.current.due.expected.localeCompare(b.state.current.due.expected))
    .map((x) => ({
    ...x,
    // Still being milked past her dry-off date.
    dryOffNow: x.state.current.dryOffBy <= today && !!lactationOn(lactations.data.value ?? [], x.goat.id, today),
})));
const bredLater = computed(() => states.value.filter((x) => x.state.current && x.state.current.daysToDue > DUE_WITHIN_DAYS).length);
const heatWatch = computed(() => states.value
    .filter((x) => x.state.nextHeat && x.state.nextHeat.date <= addDays(today, HEAT_WITHIN_DAYS))
    .sort((a, b) => a.state.nextHeat.date.localeCompare(b.state.nextHeat.date)));
// Doelings under breeding age aren't "not bred" yet.
const BREEDING_AGE_MONTHS = 6;
const open = computed(() => states.value.filter((x) => !x.state.current && (!x.goat.birth_date || x.goat.birth_date <= addMonths(today, -BREEDING_AGE_MONTHS))));
const recentKiddings = computed(() => data.value.kiddings
    .filter((k) => k.kidded_on >= addDays(today, -90))
    .sort((a, b) => b.kidded_on.localeCompare(a.kidded_on))
    .map((k) => {
    const kids = data.value.kids.filter((x) => x.kidding_id === k.id);
    return { kidding: k, doe: byId.value.get(k.doe_id), kids };
}));
const heatOpen = ref(false);
const breedingOpen = ref(false);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(heatOpen, {});
    __VLS_withDotValue(breedingOpen, {});
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(bredLater, {});
    __VLS_withDotValue(dueSoon, {});
    __VLS_withDotValue(STATUS_COLOR, {});
    __VLS_withDotValue(STATUS_LABELS, {});
    __VLS_withDotValue(byId, {});
    __VLS_withDotValue(heatWatch, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(recentKiddings, {});
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
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            to: "/breeding/adoptions", color: "neutral", variant: "ghost", icon: "i-lucide-heart-handshake",
        }));
        const __VLS_2 = __VLS_1({
            to: "/breeding/adoptions",
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-heart-handshake",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        var __VLS_3;
        const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
        // @ts-ignore
        [isOwner,];
    }
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-flame",
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onClick': {} },
        variant: "soft",
        icon: "i-lucide-flame",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_11;
    const __VLS_12 = {
        /** @type {typeof __VLS_11.click} */
        onClick: (...[$event]) => {
            void $event;
            return (heatOpen.value = true);
            // @ts-ignore
            [heatOpen,];
        },
    };
    void __VLS_12;
    var __VLS_9;
    var __VLS_10;
    const { default: __VLS_13 } = __VLS_nonNull(__VLS_9.slots);
    // @ts-ignore
    [];
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        // @ts-ignore
        ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-heart",
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        variant: "soft",
        icon: "i-lucide-heart",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_19;
    const __VLS_20 = {
        /** @type {typeof __VLS_19.click} */
        onClick: (...[$event]) => {
            void $event;
            return (breedingOpen.value = true);
            // @ts-ignore
            [breedingOpen,];
        },
    };
    void __VLS_20;
    var __VLS_17;
    var __VLS_18;
    const { default: __VLS_21 } = __VLS_nonNull(__VLS_17.slots);
    // @ts-ignore
    [];
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        // @ts-ignore
        icon: "i-lucide-baby", to: "/breeding/kidding",
    }));
    const __VLS_24 = __VLS_23({
        icon: "i-lucide-baby",
        to: "/breeding/kidding",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    var __VLS_25;
    const { default: __VLS_27 } = __VLS_nonNull(__VLS_25.slots);
    // @ts-ignore
    [];
    if (query.value.isPending.value || goats.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_28 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_28))) {
            let __VLS_29;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                // @ts-ignore
                key: (i), ...{ class: "h-24 w-full" },
            }));
            const __VLS_31 = __VLS_30({
                key: (i),
                ...{ class: "h-24 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [query, goats,];
        }
    }
    else {
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_36 = __VLS_35({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_37;
        const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
        {
            const { header: __VLS_40 } = __VLS_nonNull(__VLS_37.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(DUE_WITHIN_DAYS, {}));
            if (bredLater.value) {
                (bredLater.value);
            }
            // @ts-ignore
            [DUE_WITHIN_DAYS, bredLater, bredLater,];
        }
        if (!dueSoon.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(DUE_WITHIN_DAYS, {}));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_41 = __VLS_tryAsConstant((dueSoon.value));
            for (const [{ goat, state, dryOffNow }] of __VLS_vFor(__VLS_nonNull(__VLS_41))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (goat.id),
                });
                let __VLS_42;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                    // @ts-ignore
                    to: (`/goats/${goat.slug}`), ...{ class: "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-elevated/50" },
                }));
                const __VLS_44 = __VLS_43({
                    to: (`/goats/${goat.slug}`),
                    ...{ class: "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-y-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_45;
                const { default: __VLS_47 } = __VLS_nonNull(__VLS_45.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-medium min-w-24" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-24']} */ ;
                (__VLS_unwrap(name, {})(goat));
                let __VLS_48;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
                    // @ts-ignore
                    color: (STATUS_COLOR.value[state.current.status]), variant: "subtle", size: "sm",
                }));
                const __VLS_50 = __VLS_49({
                    color: (STATUS_COLOR.value[state.current.status]),
                    variant: "subtle",
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_49));
                var __VLS_51;
                const { default: __VLS_53 } = __VLS_nonNull(__VLS_51.slots);
                (STATUS_LABELS.value[state.current.status]);
                // @ts-ignore
                [DUE_WITHIN_DAYS, dueSoon, dueSoon, name, STATUS_COLOR, STATUS_LABELS,];
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted flex-1 min-w-40" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
                (state.current.breeding.buck_id && byId.value.get(state.current.breeding.buck_id) ? __VLS_unwrap(goatFullName, {})(byId.value.get(state.current.breeding.buck_id)) : 'unknown buck');
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-end" },
                });
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (__VLS_unwrap(formatDate, {})(state.current.due.expected));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(relativeDays, {})(state.current.daysToDue));
                if (dryOffNow) {
                    let __VLS_54;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                        // @ts-ignore
                        color: "warning", variant: "subtle", icon: "i-lucide-moon", ...{ class: "basis-full sm:basis-auto w-fit" },
                    }));
                    const __VLS_56 = __VLS_55({
                        color: "warning",
                        variant: "subtle",
                        icon: "i-lucide-moon",
                        ...{ class: "basis-full sm:basis-auto w-fit" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
                    /** @type {__VLS_StyleScopedClasses['basis-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['sm:basis-auto']} */ ;
                    /** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
                    var __VLS_57;
                    const { default: __VLS_59 } = __VLS_nonNull(__VLS_57.slots);
                    (__VLS_unwrap(formatDate, {})(state.current.dryOffBy));
                    // @ts-ignore
                    [byId, byId, goatFullName, formatDate, formatDate, relativeDays,];
                }
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid md:grid-cols-2 gap-4 items-start" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        let __VLS_60;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_62 = __VLS_61({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        var __VLS_63;
        const { default: __VLS_65 } = __VLS_nonNull(__VLS_63.slots);
        {
            const { header: __VLS_66 } = __VLS_nonNull(__VLS_63.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(HEAT_WITHIN_DAYS, {}));
            // @ts-ignore
            [HEAT_WITHIN_DAYS,];
        }
        if (!heatWatch.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_67 = __VLS_tryAsConstant((heatWatch.value));
            for (const [{ goat, state }] of __VLS_vFor(__VLS_nonNull(__VLS_67))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (goat.id),
                });
                let __VLS_68;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                    // @ts-ignore
                    to: (`/goats/${goat.slug}`), ...{ class: "flex items-center gap-3 px-4 py-3 hover:bg-elevated/50" },
                }));
                const __VLS_70 = __VLS_69({
                    to: (`/goats/${goat.slug}`),
                    ...{ class: "flex items-center gap-3 px-4 py-3 hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_69));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_71;
                const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-medium flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (__VLS_unwrap(name, {})(goat));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (state.nextHeat.reason === 'return' ? 'Did she settle?' : 'Cycle');
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-end" },
                });
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                (__VLS_unwrap(formatDate, {})(state.nextHeat.date));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(relativeDays, {})(__VLS_unwrap(daysBetween, {})(__VLS_unwrap(today, {}), state.nextHeat.date)));
                // @ts-ignore
                [name, formatDate, relativeDays, heatWatch, heatWatch, daysBetween, today,];
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_76 = __VLS_75({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        var __VLS_77;
        const { default: __VLS_79 } = __VLS_nonNull(__VLS_77.slots);
        {
            const { header: __VLS_80 } = __VLS_nonNull(__VLS_77.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (open.value.length);
            (open.value.length === 1 ? 'doe' : 'does');
            // @ts-ignore
            [open, open,];
        }
        if (!open.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_81 = __VLS_tryAsConstant((open.value));
            for (const [{ goat, state }] of __VLS_vFor(__VLS_nonNull(__VLS_81))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (goat.id),
                });
                let __VLS_82;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                    // @ts-ignore
                    to: (`/goats/${goat.slug}`), ...{ class: "flex items-center gap-3 px-4 py-2 hover:bg-elevated/50" },
                }));
                const __VLS_84 = __VLS_83({
                    to: (`/goats/${goat.slug}`),
                    ...{ class: "flex items-center gap-3 px-4 py-2 hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_83));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_85;
                const { default: __VLS_87 } = __VLS_nonNull(__VLS_85.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (__VLS_unwrap(name, {})(goat));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (state.lastKidding ? `Kidded ${__VLS_unwrap(formatDate, {})(state.lastKidding.kidded_on)}` : 'No kiddings recorded');
                // @ts-ignore
                [name, formatDate, open, open,];
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        let __VLS_88;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_90 = __VLS_89({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        var __VLS_91;
        const { default: __VLS_93 } = __VLS_nonNull(__VLS_91.slots);
        {
            const { header: __VLS_94 } = __VLS_nonNull(__VLS_91.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!recentKiddings.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_95 = __VLS_tryAsConstant((recentKiddings.value));
            for (const [{ kidding, doe, kids }] of __VLS_vFor(__VLS_nonNull(__VLS_95))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (kidding.id),
                    ...{ class: "px-4 py-3" },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                if (doe) {
                    let __VLS_96;
                    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                    RouterLink;
                    // @ts-ignore
                    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
                        // @ts-ignore
                        to: (`/goats/${doe.slug}`), ...{ class: "font-medium hover:underline" },
                    }));
                    const __VLS_98 = __VLS_97({
                        to: (`/goats/${doe.slug}`),
                        ...{ class: "font-medium hover:underline" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
                    var __VLS_99;
                    const { default: __VLS_101 } = __VLS_nonNull(__VLS_99.slots);
                    (__VLS_unwrap(name, {})(doe));
                    // @ts-ignore
                    [name, recentKiddings, recentKiddings,];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (__VLS_unwrap(formatDate, {})(kidding.kidded_on));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                (kids.length);
                (kids.length === 1 ? 'kid' : 'kids');
                __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                    ...{ class: "mt-1 flex flex-wrap gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                const __VLS_102 = __VLS_tryAsConstant((kids));
                for (const [kid] of __VLS_vFor(__VLS_nonNull(__VLS_102))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (kid.id),
                    });
                    let __VLS_103;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
                        // @ts-ignore
                        color: (kid.outcome === 'alive' ? 'neutral' : 'error'), variant: "outline", size: "sm",
                    }));
                    const __VLS_105 = __VLS_104({
                        color: (kid.outcome === 'alive' ? 'neutral' : 'error'),
                        variant: "outline",
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
                    var __VLS_106;
                    const { default: __VLS_108 } = __VLS_nonNull(__VLS_106.slots);
                    if (kid.goat_id) {
                        let __VLS_109;
                        /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                        RouterLink;
                        // @ts-ignore
                        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                            // @ts-ignore
                            to: (__VLS_unwrap(pathOf, {})(kid.goat_id)), ...{ class: "hover:underline" },
                        }));
                        const __VLS_111 = __VLS_110({
                            to: (__VLS_unwrap(pathOf, {})(kid.goat_id)),
                            ...{ class: "hover:underline" },
                        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
                        /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
                        var __VLS_112;
                        const { default: __VLS_114 } = __VLS_nonNull(__VLS_112.slots);
                        (byId.value.get(kid.goat_id) ? __VLS_unwrap(name, {})(byId.value.get(kid.goat_id)) : kid.sex === 'doe' ? 'Doeling' : 'Buckling');
                        // @ts-ignore
                        [name, byId, byId, formatDate, pathOf,];
                    }
                    else {
                        (kid.sex === 'doe' ? 'Doeling' : 'Buckling');
                    }
                    if (kid.birth_weight_g) {
                        (__VLS_unwrap(formatWeight, {})(kid.birth_weight_g, __VLS_unwrap(unit, {}), true));
                    }
                    if (kid.outcome !== 'alive') {
                        (kid.outcome);
                    }
                    // @ts-ignore
                    [formatWeight, unit,];
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
    }
    const __VLS_115 = HeatModal;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        // @ts-ignore
        open: (heatOpen.value),
    }));
    const __VLS_117 = __VLS_116({
        open: (heatOpen.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const __VLS_120 = BreedingModal;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        // @ts-ignore
        open: (breedingOpen.value),
    }));
    const __VLS_122 = __VLS_121({
        open: (breedingOpen.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    // @ts-ignore
    [heatOpen, breedingOpen,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
