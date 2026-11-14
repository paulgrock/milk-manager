/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useHerd } from '@/composables/useHerd';
import { useCheeseData } from '@/composables/useCheese';
import { formatDate, todayISO } from '@/lib/dates';
import { STATUS_LABELS, agingLabel, makeStatus, milkLabel } from '@/lib/cheese';
import MakeModal from '@/components/cheese/MakeModal.vue';
import TypeSettings from '@/components/cheese/TypeSettings.vue';
const today = todayISO();
const route = useRoute();
const { isOwner } = useHerd();
const { query, data } = useCheeseData();
const type = computed(() => data.value.types.find((t) => t.id === route.params.type));
// Every make of this cheese, newest first. Notes wait for the make's own page.
const makes = computed(() => data.value.makes.filter((m) => m.cheese_type_id === type.value?.id));
const STATUS_COLORS = { fresh: 'primary', ready: 'primary', aging: 'neutral', finished: 'neutral' };
const modalOpen = ref(false);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(type, {});
    __VLS_withDotValue(modalOpen, {});
    __VLS_withDotValue(makes, {});
    __VLS_withDotValue(STATUS_COLORS, {});
    __VLS_withDotValue(STATUS_LABELS, {});
    __VLS_withDotValue(isOwner, {});
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            let __VLS_1;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
                // @ts-ignore
                key: (i), ...{ class: "h-14 w-full" },
            }));
            const __VLS_3 = __VLS_2({
                key: (i),
                ...{ class: "h-14 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_2));
            /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [query,];
        }
    }
    else if (!type.value) {
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            // @ts-ignore
            color: "error", variant: "subtle", title: "Cheese not found", actions: ([{ label: 'Back to cheese', to: '/cheese' }]),
        }));
        const __VLS_8 = __VLS_7({
            color: "error",
            variant: "subtle",
            title: "Cheese not found",
            actions: ([{ label: 'Back to cheese', to: '/cheese' }]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
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
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            // @ts-ignore
            to: "/cheese", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': "Back to cheese",
        }));
        const __VLS_13 = __VLS_12({
            to: "/cheese",
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-arrow-left",
            'aria-label': "Back to cheese",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-2xl font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (type.value.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(agingLabel, {})(type.value.aging_days));
        (type.value.hidden ? ' · hidden' : '');
        let __VLS_16;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            // @ts-ignore
            ...{ 'onClick': {} }, icon: "i-lucide-plus",
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_21;
        const __VLS_22 = {
            /** @type {typeof __VLS_21.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(query.value.isPending.value))
                    throw 0;
                if (!!(!type.value))
                    throw 0;
                return (modalOpen.value = true);
                // @ts-ignore
                [type, type, type, type, agingLabel, modalOpen,];
            },
        };
        void __VLS_22;
        var __VLS_19;
        var __VLS_20;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_19.slots);
        // @ts-ignore
        [];
        if (!makes.value.length) {
            let __VLS_24;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                // @ts-ignore
                ...{ class: "text-center" },
            }));
            const __VLS_26 = __VLS_25({
                ...{ class: "text-center" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            var __VLS_27;
            const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (type.value.name);
            // @ts-ignore
            [type, makes,];
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
            const __VLS_30 = __VLS_tryAsConstant((makes.value));
            for (const [make] of __VLS_vFor(__VLS_nonNull(__VLS_30))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (make.id),
                });
                let __VLS_31;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                    // @ts-ignore
                    to: (`/cheese/makes/${make.id}`), ...{ class: "px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1" },
                }));
                const __VLS_33 = __VLS_32({
                    to: (`/cheese/makes/${make.id}`),
                    ...{ class: "px-4 py-3 hover:bg-elevated/50 flex flex-wrap items-center gap-x-3 gap-y-1" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_32));
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-y-1']} */ ;
                var __VLS_34;
                const { default: __VLS_36 } = __VLS_nonNull(__VLS_34.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 min-w-40" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
                (__VLS_unwrap(formatDate, {})(make.made_on));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(milkLabel, {})(make) || 'milk not recorded');
                let __VLS_37;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
                    // @ts-ignore
                    color: (STATUS_COLORS.value[__VLS_unwrap(makeStatus, {})(make, __VLS_unwrap(today, {}))]), variant: "subtle",
                }));
                const __VLS_39 = __VLS_38({
                    color: (STATUS_COLORS.value[__VLS_unwrap(makeStatus, {})(make, __VLS_unwrap(today, {}))]),
                    variant: "subtle",
                }, ...__VLS_functionalComponentArgsRest(__VLS_38));
                var __VLS_40;
                const { default: __VLS_42 } = __VLS_nonNull(__VLS_40.slots);
                (STATUS_LABELS.value[__VLS_unwrap(makeStatus, {})(make, __VLS_unwrap(today, {}))]);
                // @ts-ignore
                [makes, formatDate, milkLabel, STATUS_COLORS, makeStatus, makeStatus, today, today, STATUS_LABELS,];
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
        }
        if (isOwner.value) {
            let __VLS_43;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            // @ts-ignore
            }));
            const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
            var __VLS_46;
            const { default: __VLS_48 } = __VLS_nonNull(__VLS_46.slots);
            {
                const { header: __VLS_49 } = __VLS_nonNull(__VLS_46.slots);
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
                [isOwner,];
            }
            const __VLS_50 = TypeSettings;
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
                // @ts-ignore
                type: (type.value),
            }));
            const __VLS_52 = __VLS_51({
                type: (type.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            // @ts-ignore
            [type,];
        }
        const __VLS_55 = MakeModal;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            // @ts-ignore
            open: (modalOpen.value), typeId: (type.value.id),
        }));
        const __VLS_57 = __VLS_56({
            open: (modalOpen.value),
            typeId: (type.value.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    }
    // @ts-ignore
    [type, modalOpen,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
