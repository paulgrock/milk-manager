/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese';
import { formatDate, todayISO } from '@/lib/dates';
import { LB_PER_GALLON, STATUS_ICONS, makeStatus, milkLabel, readyLabel } from '@/lib/cheese';
import MakeModal from '@/components/cheese/MakeModal.vue';
const today = todayISO();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { query, data } = useCheeseData();
const { saveMake } = useCheeseMutations();
const make = computed(() => data.value.makes.find((m) => m.id === route.params.make));
const type = computed(() => data.value.types.find((t) => t.id === make.value?.cheese_type_id));
const status = computed(() => (make.value ? makeStatus(make.value, today) : 'aging'));
const backTo = computed(() => (type.value ? `/cheese/types/${type.value.id}` : '/cheese'));
// The form keeps the make it opened with, so it can still close and report a delete once the make is gone.
const editing = ref({ open: false, backTo: '/cheese' });
function openEdit() {
    editing.value = { open: true, make: make.value, backTo: backTo.value };
}
// Once it's deleted there's nothing to show here, so go back to its cheese.
function onDeleted() {
    void router.replace(editing.value.backTo);
}
function markFinished() {
    const m = make.value;
    saveMake.mutate({
        id: m.id,
        values: { cheese_type_id: m.cheese_type_id, made_on: m.made_on, ready_on: m.ready_on, milk_gallons: m.milk_gallons, notes: m.notes, finished_on: today },
    }, { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) });
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(make, {});
    __VLS_withDotValue(type, {});
    __VLS_withDotValue(status, {});
    __VLS_withDotValue(STATUS_ICONS, {});
    __VLS_withDotValue(saveMake, {});
    __VLS_withDotValue(editing, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ...{ class: "h-12 w-full" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-12 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ class: "h-48 w-full" },
        }));
        const __VLS_7 = __VLS_6({
            ...{ class: "h-48 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['h-48']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else if (!make.value) {
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            // @ts-ignore
            color: "error", variant: "subtle", title: "Make not found", actions: ([{ label: 'Back to cheese', to: '/cheese' }]),
        }));
        const __VLS_12 = __VLS_11({
            color: "error",
            variant: "subtle",
            title: "Make not found",
            actions: ([{ label: 'Back to cheese', to: '/cheese' }]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    }
    else {
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
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            // @ts-ignore
            to: (__VLS_unwrap(backTo, {})), color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': (`Back to ${type.value?.name ?? 'cheese'}`),
        }));
        const __VLS_17 = __VLS_16({
            to: (__VLS_unwrap(backTo, {})),
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-arrow-left",
            'aria-label': (`Back to ${type.value?.name ?? 'cheese'}`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (type.value?.name ?? 'Cheese');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(formatDate, {})(make.value.made_on));
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-pencil",
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "outline",
            icon: "i-lucide-pencil",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_25;
        const __VLS_26 = {
            /** @type {typeof __VLS_25.click} */
            onClick: (openEdit),
        };
        void __VLS_26;
        var __VLS_23;
        var __VLS_24;
        const { default: __VLS_27 } = __VLS_nonNull(__VLS_23.slots);
        // @ts-ignore
        [query, make, make, backTo, type, type, formatDate,];
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        // @ts-ignore
        }));
        const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
        var __VLS_31;
        const { default: __VLS_33 } = __VLS_nonNull(__VLS_31.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center gap-2 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            color: (status.value === 'ready' || status.value === 'fresh' ? 'primary' : 'neutral'), variant: "subtle", icon: (STATUS_ICONS.value[status.value]),
        }));
        const __VLS_36 = __VLS_35({
            color: (status.value === 'ready' || status.value === 'fresh' ? 'primary' : 'neutral'),
            variant: "subtle",
            icon: (STATUS_ICONS.value[status.value]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_37;
        const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
        (__VLS_unwrap(readyLabel, {})(make.value, __VLS_unwrap(today, {})));
        // @ts-ignore
        [make, status, status, status, STATUS_ICONS, readyLabel, today,];
        if (status.value !== 'finished') {
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "xs", variant: "soft", ...{ class: "ms-auto" }, loading: (saveMake.value.isPending.value),
            }));
            const __VLS_42 = __VLS_41({
                ...{ 'onClick': {} },
                size: "xs",
                variant: "soft",
                ...{ class: "ms-auto" },
                loading: (saveMake.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            let __VLS_45;
            const __VLS_46 = {
                /** @type {typeof __VLS_45.click} */
                onClick: (markFinished),
            };
            void __VLS_46;
            /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
            var __VLS_43;
            var __VLS_44;
            const { default: __VLS_47 } = __VLS_nonNull(__VLS_43.slots);
            // @ts-ignore
            [status, saveMake,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
            ...{ class: "grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-[auto_1fr]']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-x-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
        (__VLS_unwrap(formatDate, {})(make.value.made_on));
        __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
        (__VLS_unwrap(formatDate, {})(make.value.ready_on));
        __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
        if (__VLS_unwrap(milkLabel, {})(make.value)) {
            (__VLS_unwrap(milkLabel, {})(make.value));
            if (make.value.milk_gallons != null) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (Math.round(Number(make.value.milk_gallons) * __VLS_unwrap(LB_PER_GALLON, {})));
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        if (make.value.finished_on) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
            (__VLS_unwrap(formatDate, {})(make.value.finished_on));
        }
        // @ts-ignore
        [make, make, make, make, make, make, make, make, formatDate, formatDate, formatDate, milkLabel, milkLabel, LB_PER_GALLON,];
        let __VLS_48;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        // @ts-ignore
        }));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        var __VLS_51;
        const { default: __VLS_53 } = __VLS_nonNull(__VLS_51.slots);
        {
            const { header: __VLS_54 } = __VLS_nonNull(__VLS_51.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (make.value.notes) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "whitespace-pre-line" },
            });
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
            (make.value.notes);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        }
        // @ts-ignore
        [make, make,];
    }
    const __VLS_55 = MakeModal;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        // @ts-ignore
        ...{ 'onDeleted': {} }, open: (editing.value.open), make: (editing.value.make),
    }));
    const __VLS_57 = __VLS_56({
        ...{ 'onDeleted': {} },
        open: (editing.value.open),
        make: (editing.value.make),
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    let __VLS_60;
    const __VLS_61 = {
        /** @type {typeof __VLS_60.deleted} */
        onDeleted: (onDeleted),
    };
    void __VLS_61;
    var __VLS_58;
    var __VLS_59;
    // @ts-ignore
    [editing, editing,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
