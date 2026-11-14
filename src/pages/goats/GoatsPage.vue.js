/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats';
import { iconPath, CURRENT_STATUSES, SEX_LABELS, STATUS_LABELS, appraisalSummary, filterGoats, formatAge, goatFullName, latestAppraisals, } from '@/lib/goats';
import GoatAvatar from '@/components/goats/GoatAvatar.vue';
import { useLactations } from '@/composables/useMilk';
import { todayISO } from '@/lib/dates';
import { lactationOn } from '@/lib/milk';
const { goats, appraisals, photos } = useHerdGoats();
// Remembered per device so the list opens the way you left it.
const search = useLocalStorage('goats.search', '');
const view = useLocalStorage('goats.view', 'current');
const sex = useLocalStorage('goats.sex', 'any');
const breed = useLocalStorage('goats.breed', 'any');
const viewOptions = [
    { label: 'Current herd', value: 'current' },
    { label: 'In milk', value: 'in_milk' },
    { label: 'Everyone', value: 'all' },
    ...['for_sale', 'sold', 'deceased', 'reference'].map((s) => ({ label: STATUS_LABELS[s], value: s })),
];
const sexOptions = [{ label: 'Any sex', value: 'any' }, ...Object.entries(SEX_LABELS).map(([value, label]) => ({ label, value }))];
const breedOptions = computed(() => [
    { label: 'Any breed', value: 'any' },
    ...[...new Set((goats.data.value ?? []).map((g) => g.breed).filter((b) => !!b))]
        .sort()
        .map((b) => ({ label: b, value: b })),
]);
const lactations = useLactations();
const today = todayISO();
const filtered = computed(() => {
    const list = filterGoats(goats.data.value ?? [], {
        search: search.value,
        statuses: view.value === 'current' || view.value === 'in_milk' ? CURRENT_STATUSES : view.value === 'all' ? [] : [view.value],
        sex: sex.value === 'any' ? null : sex.value,
        breed: breed.value === 'any' ? null : breed.value,
    });
    return view.value === 'in_milk' ? list.filter((g) => lactationOn(lactations.data.value ?? [], g.id, today)) : list;
});
const latest = computed(() => latestAppraisals(appraisals.data.value ?? []));
const primaryPhotos = computed(() => new Map((photos.data.value ?? []).filter((p) => p.is_primary).map((p) => [p.goat_id, iconPath(p)])));
const photoUrls = usePhotoUrls(() => filtered.value.map((g) => primaryPhotos.value.get(g.id)).filter((p) => !!p));
const hasFilters = computed(() => !!search.value || view.value !== 'current' || sex.value !== 'any' || breed.value !== 'any');
function clearFilters() {
    search.value = '';
    view.value = 'current';
    sex.value = 'any';
    breed.value = 'any';
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(search, {});
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(filtered, {});
    __VLS_withDotValue(hasFilters, {});
    __VLS_withDotValue(photoUrls, {});
    __VLS_withDotValue(primaryPhotos, {});
    __VLS_withDotValue(SEX_LABELS, {});
    __VLS_withDotValue(latest, {});
    __VLS_withDotValue(CURRENT_STATUSES, {});
    __VLS_withDotValue(STATUS_LABELS, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
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
        to: "/goats/new", icon: "i-lucide-plus",
    }));
    const __VLS_2 = __VLS_1({
        to: "/goats/new",
        icon: "i-lucide-plus",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        modelValue: (search.value), icon: "i-lucide-search", placeholder: "Name, tattoo or registration #", ...{ class: "w-full sm:flex-1 sm:min-w-64" }, ui: ({ trailing: 'pe-1' }),
    }));
    const __VLS_8 = __VLS_7({
        modelValue: (search.value),
        icon: "i-lucide-search",
        placeholder: "Name, tattoo or registration #",
        ...{ class: "w-full sm:flex-1 sm:min-w-64" },
        ui: ({ trailing: 'pe-1' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:min-w-64']} */ ;
    var __VLS_9;
    const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
    if (search.value) {
        {
            const { trailing: __VLS_12 } = __VLS_nonNull(__VLS_9.slots);
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "neutral", variant: "link", icon: "i-lucide-x", 'aria-label': "Clear search",
            }));
            const __VLS_15 = __VLS_14({
                ...{ 'onClick': {} },
                color: "neutral",
                variant: "link",
                icon: "i-lucide-x",
                'aria-label': "Clear search",
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            let __VLS_18;
            const __VLS_19 = {
                /** @type {typeof __VLS_18.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(search.value))
                        throw 0;
                    return (search.value = '');
                    // @ts-ignore
                    [search, search, search,];
                },
            };
            void __VLS_19;
            var __VLS_16;
            var __VLS_17;
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        modelValue: (__VLS_unwrap(view, {})), items: (__VLS_unwrap(viewOptions, {})), ...{ class: "flex-1 sm:flex-none sm:w-40" },
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_unwrap(view, {})),
        items: (__VLS_unwrap(viewOptions, {})),
        ...{ class: "flex-1 sm:flex-none sm:w-40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-40']} */ ;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        modelValue: (__VLS_unwrap(sex, {})), items: (__VLS_unwrap(sexOptions, {})), ...{ class: "flex-1 sm:flex-none sm:w-32" },
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_unwrap(sex, {})),
        items: (__VLS_unwrap(sexOptions, {})),
        ...{ class: "flex-1 sm:flex-none sm:w-32" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-32']} */ ;
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        // @ts-ignore
        modelValue: (__VLS_unwrap(breed, {})), items: (__VLS_unwrap(breedOptions, {})), ...{ class: "flex-1 sm:flex-none sm:w-44" },
    }));
    const __VLS_32 = __VLS_31({
        modelValue: (__VLS_unwrap(breed, {})),
        items: (__VLS_unwrap(breedOptions, {})),
        ...{ class: "flex-1 sm:flex-none sm:w-44" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-44']} */ ;
    if (goats.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_35 = __VLS_tryAsConstant((4));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_35))) {
            let __VLS_36;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
                // @ts-ignore
                key: (i), ...{ class: "h-16 w-full" },
            }));
            const __VLS_38 = __VLS_37({
                key: (i),
                ...{ class: "h-16 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [view, viewOptions, sex, sexOptions, breed, breedOptions, goats,];
        }
    }
    else if (!goats.value.data.value?.length) {
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            // @ts-ignore
            ...{ class: "text-center" },
        }));
        const __VLS_43 = __VLS_42({
            ...{ class: "text-center" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        var __VLS_44;
        const { default: __VLS_46 } = __VLS_nonNull(__VLS_44.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            // @ts-ignore
            to: "/goats/new", icon: "i-lucide-plus",
        }));
        const __VLS_49 = __VLS_48({
            to: "/goats/new",
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        var __VLS_50;
        const { default: __VLS_52 } = __VLS_nonNull(__VLS_50.slots);
        // @ts-ignore
        [goats,];
        // @ts-ignore
        [];
    }
    else if (!filtered.value.length) {
        let __VLS_53;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            // @ts-ignore
            ...{ class: "text-center" },
        }));
        const __VLS_55 = __VLS_54({
            ...{ class: "text-center" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        var __VLS_56;
        const { default: __VLS_58 } = __VLS_nonNull(__VLS_56.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        let __VLS_59;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "outline",
        }));
        const __VLS_61 = __VLS_60({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        let __VLS_64;
        const __VLS_65 = {
            /** @type {typeof __VLS_64.click} */
            onClick: (clearFilters),
        };
        void __VLS_65;
        var __VLS_62;
        var __VLS_63;
        const { default: __VLS_66 } = __VLS_nonNull(__VLS_62.slots);
        // @ts-ignore
        [filtered,];
        // @ts-ignore
        [];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (filtered.value.length);
        (filtered.value.length === 1 ? 'goat' : 'goats');
        if (hasFilters.value) {
            let __VLS_67;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                // @ts-ignore
                ...{ 'onClick': {} }, variant: "link", size: "sm", ...{ class: "p-0 ms-2" },
            }));
            const __VLS_69 = __VLS_68({
                ...{ 'onClick': {} },
                variant: "link",
                size: "sm",
                ...{ class: "p-0 ms-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_68));
            let __VLS_72;
            const __VLS_73 = {
                /** @type {typeof __VLS_72.click} */
                onClick: (clearFilters),
            };
            void __VLS_73;
            /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['ms-2']} */ ;
            var __VLS_70;
            var __VLS_71;
            const { default: __VLS_74 } = __VLS_nonNull(__VLS_70.slots);
            // @ts-ignore
            [filtered, filtered, hasFilters,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default rounded-lg border border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        const __VLS_75 = __VLS_tryAsConstant((filtered.value));
        for (const [g] of __VLS_vFor(__VLS_nonNull(__VLS_75))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (g.id),
            });
            let __VLS_76;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                // @ts-ignore
                to: (`/goats/${g.slug}`), ...{ class: "flex items-center gap-3 p-3 hover:bg-elevated/50" },
            }));
            const __VLS_78 = __VLS_77({
                to: (`/goats/${g.slug}`),
                ...{ class: "flex items-center gap-3 p-3 hover:bg-elevated/50" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            var __VLS_79;
            const { default: __VLS_81 } = __VLS_nonNull(__VLS_79.slots);
            const __VLS_82 = GoatAvatar;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                // @ts-ignore
                goat: (g), url: (photoUrls.value[primaryPhotos.value.get(g.id) ?? '']),
            }));
            const __VLS_84 = __VLS_83({
                goat: (g),
                url: (photoUrls.value[primaryPhotos.value.get(g.id) ?? '']),
            }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "font-medium truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (__VLS_unwrap(goatFullName, {})(g));
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            if (g.barn_name && g.registered_name) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (g.barn_name);
            }
            (SEX_LABELS.value[g.sex]);
            if (g.breed) {
                (g.breed);
            }
            if (g.birth_date) {
                (__VLS_unwrap(formatAge, {})(g.birth_date));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col items-end gap-1 shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            if (latest.value.get(g.id)) {
                let __VLS_87;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
                    // @ts-ignore
                    color: "neutral", variant: "subtle",
                }));
                const __VLS_89 = __VLS_88({
                    color: "neutral",
                    variant: "subtle",
                }, ...__VLS_functionalComponentArgsRest(__VLS_88));
                var __VLS_90;
                const { default: __VLS_92 } = __VLS_nonNull(__VLS_90.slots);
                (__VLS_unwrap(appraisalSummary, {})(latest.value.get(g.id)));
                // @ts-ignore
                [filtered, photoUrls, primaryPhotos, goatFullName, SEX_LABELS, formatAge, latest, latest, appraisalSummary,];
            }
            if (!CURRENT_STATUSES.value.includes(g.status) || g.status === 'for_sale') {
                let __VLS_93;
                /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                UBadge;
                // @ts-ignore
                const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
                    // @ts-ignore
                    color: "neutral", variant: "outline", size: "sm",
                }));
                const __VLS_95 = __VLS_94({
                    color: "neutral",
                    variant: "outline",
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_94));
                var __VLS_96;
                const { default: __VLS_98 } = __VLS_nonNull(__VLS_96.slots);
                (STATUS_LABELS.value[g.status]);
                // @ts-ignore
                [CURRENT_STATUSES, STATUS_LABELS,];
            }
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
