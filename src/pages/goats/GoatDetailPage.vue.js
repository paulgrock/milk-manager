/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats';
import { formatDate } from '@/lib/dates';
import { BREED_CATEGORY_LABELS, HORN_LABELS, SEX_LABELS, STATUS_LABELS, formatAge, goatFullName, latestAppraisals, offspringOf, } from '@/lib/goats';
import GoatAvatar from '@/components/goats/GoatAvatar.vue';
import PedigreeChart from '@/components/goats/PedigreeChart.vue';
import AppraisalSection from '@/components/goats/AppraisalSection.vue';
import PhotoSection from '@/components/goats/PhotoSection.vue';
import LactationSection from '@/components/milk/LactationSection.vue';
import LactationCurveCard from '@/components/milk/LactationCurveCard.vue';
import BreedingCard from '@/components/breeding/BreedingCard.vue';
import HealthCard from '@/components/health/HealthCard.vue';
import MilkTestsCard from '@/components/milk/MilkTestsCard.vue';
import GoatFinanceCard from '@/components/finances/GoatFinanceCard.vue';
import EntryModal from '@/components/finances/EntryModal.vue';
import { useHerd } from '@/composables/useHerd';
import { useRouter } from 'vue-router';
import { ageInYears, iconPath } from '@/lib/goats';
import { useHealthData } from '@/composables/useHealth';
import { todayISO } from '@/lib/dates';
import { withdrawalOn } from '@/lib/health';
const route = useRoute();
const { goats, appraisals, photos, byId, find } = useHerdGoats();
const goat = computed(() => find(route.params.goat));
const router = useRouter();
// Links made with her id (older bookmarks, the add-goat form) end up at her name.
watch(goat, (g) => {
    if (g && route.params.goat !== g.slug)
        void router.replace({ path: `/goats/${g.slug}`, query: route.query });
}, { immediate: true });
const latest = computed(() => latestAppraisals(appraisals.data.value ?? []));
const goatAppraisals = computed(() => (appraisals.data.value ?? []).filter((a) => a.goat_id === goat.value?.id));
const goatPhotos = computed(() => (photos.data.value ?? []).filter((p) => p.goat_id === goat.value?.id));
const primary = computed(() => goatPhotos.value.find((p) => p.is_primary));
const primaryUrl = usePhotoUrls(() => (primary.value ? [iconPath(primary.value)] : []));
const { isOwner } = useHerd();
// Arriving with ?recordSale=1 (just marked sold): offer to put the sale in the books.
const saleOpen = computed({
    get: () => route.query.recordSale === '1' && isOwner.value && !!goat.value,
    set: (open) => {
        if (!open)
            void router.replace({ query: {} });
    },
});
const saleDraft = computed(() => {
    const g = goat.value;
    if (!g)
        return undefined;
    const young = (ageInYears(g.birth_date, g.left_herd_on ?? todayISO()) ?? 99) < 1;
    return {
        kind: 'income',
        category: young ? 'kid_sale' : 'goat_sale',
        occurred_on: g.left_herd_on ?? todayISO(),
        description: `Adopted ${g.barn_name || g.registered_name || ''}`.trim(),
        goat_id: g.id,
    };
});
const health = useHealthData();
const withdrawal = computed(() => (goat.value ? withdrawalOn(goat.value.id, health.data.value.treatments, todayISO()) : null));
const kids = computed(() => (goat.value ? offspringOf(goat.value.id, goats.data.value ?? []) : []));
const details = computed(() => {
    const g = goat.value;
    if (!g)
        return [];
    const tattoo = [g.tattoo_right && `R: ${g.tattoo_right}`, g.tattoo_left && `L: ${g.tattoo_left}`].filter(Boolean).join(' · ');
    return [
        { label: 'Born', value: g.birth_date ? `${formatDate(g.birth_date)} (${formatAge(g.birth_date)})` : '' },
        { label: 'Breed', value: [g.breed, g.breed_category && BREED_CATEGORY_LABELS[g.breed_category]].filter(Boolean).join(' · ') },
        { label: 'Color', value: g.color_markings },
        { label: 'Horns', value: g.horn_status === 'unknown' ? '' : HORN_LABELS[g.horn_status] },
        { label: 'Registration', value: [g.registry, g.registration_number].filter(Boolean).join(' ') },
        { label: 'Tattoo', value: tattoo },
        { label: 'Scrapie tag', value: g.scrapie_tag },
        { label: 'Microchip', value: g.microchip },
    ].filter((d) => d.value);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(goat, {});
    __VLS_withDotValue(primary, {});
    __VLS_withDotValue(primaryUrl, {});
    __VLS_withDotValue(SEX_LABELS, {});
    __VLS_withDotValue(STATUS_LABELS, {});
    __VLS_withDotValue(latest, {});
    __VLS_withDotValue(withdrawal, {});
    __VLS_withDotValue(details, {});
    __VLS_withDotValue(kids, {});
    if (goats.value.isPending.value) {
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
            ...{ class: "h-24 w-full" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-24 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
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
    else if (!goat.value) {
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            // @ts-ignore
            color: "error", variant: "subtle", title: "Goat not found", actions: ([{ label: 'Back to goats', to: '/goats' }]),
        }));
        const __VLS_12 = __VLS_11({
            color: "error",
            variant: "subtle",
            title: "Goat not found",
            actions: ([{ label: 'Back to goats', to: '/goats' }]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-start gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        const __VLS_15 = GoatAvatar;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            // @ts-ignore
            goat: (goat.value), url: (primary.value ? primaryUrl.value[__VLS_unwrap(iconPath, {})(primary.value)] : undefined), size: "3xl",
        }));
        const __VLS_17 = __VLS_16({
            goat: (goat.value),
            url: (primary.value ? primaryUrl.value[__VLS_unwrap(iconPath, {})(primary.value)] : undefined),
            size: "3xl",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 min-w-0" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-xl sm:text-2xl font-semibold break-words" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
        (__VLS_unwrap(goatFullName, {})(goat.value));
        if (goat.value.barn_name && goat.value.registered_name) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (goat.value.barn_name);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-1 mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        let __VLS_20;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            // @ts-ignore
            color: "neutral", variant: "subtle",
        }));
        const __VLS_22 = __VLS_21({
            color: "neutral",
            variant: "subtle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        var __VLS_23;
        const { default: __VLS_25 } = __VLS_nonNull(__VLS_23.slots);
        (SEX_LABELS.value[goat.value.sex]);
        // @ts-ignore
        [goats, goat, goat, goat, goat, goat, goat, goat, primary, primary, primaryUrl, iconPath, goatFullName, SEX_LABELS,];
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            // @ts-ignore
            color: (goat.value.status === 'active' ? 'primary' : 'neutral'), variant: "subtle",
        }));
        const __VLS_28 = __VLS_27({
            color: (goat.value.status === 'active' ? 'primary' : 'neutral'),
            variant: "subtle",
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        var __VLS_29;
        const { default: __VLS_31 } = __VLS_nonNull(__VLS_29.slots);
        (STATUS_LABELS.value[goat.value.status]);
        // @ts-ignore
        [goat, goat, STATUS_LABELS,];
        if (latest.value.get(goat.value.id)) {
            let __VLS_32;
            /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
            UBadge;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
                // @ts-ignore
                color: "neutral", variant: "outline",
            }));
            const __VLS_34 = __VLS_33({
                color: "neutral",
                variant: "outline",
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            var __VLS_35;
            const { default: __VLS_37 } = __VLS_nonNull(__VLS_35.slots);
            (latest.value.get(goat.value.id).final_score);
            // @ts-ignore
            [goat, goat, latest, latest,];
        }
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            // @ts-ignore
            to: (`/goats/${goat.value.slug}/edit`), color: "neutral", variant: "outline", icon: "i-lucide-pencil",
        }));
        const __VLS_40 = __VLS_39({
            to: (`/goats/${goat.value.slug}/edit`),
            color: "neutral",
            variant: "outline",
            icon: "i-lucide-pencil",
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        var __VLS_41;
        const { default: __VLS_43 } = __VLS_nonNull(__VLS_41.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "hidden sm:inline" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
        // @ts-ignore
        [goat,];
        if (goat.value.status === 'deceased' || goat.value.status === 'sold') {
            let __VLS_44;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                // @ts-ignore
                color: "neutral", variant: "subtle", icon: (goat.value.status === 'deceased' ? 'i-lucide-flower-2' : 'i-lucide-hand-coins'), title: (`${goat.value.status === 'deceased' ? 'Died' : 'Adopted'}${goat.value.left_herd_on ? ` ${__VLS_unwrap(formatDate, {})(goat.value.left_herd_on)}` : ''}`), description: (goat.value.left_herd_reason ?? undefined),
            }));
            const __VLS_46 = __VLS_45({
                color: "neutral",
                variant: "subtle",
                icon: (goat.value.status === 'deceased' ? 'i-lucide-flower-2' : 'i-lucide-hand-coins'),
                title: (`${goat.value.status === 'deceased' ? 'Died' : 'Adopted'}${goat.value.left_herd_on ? ` ${__VLS_unwrap(formatDate, {})(goat.value.left_herd_on)}` : ''}`),
                description: (goat.value.left_herd_reason ?? undefined),
            }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        }
        if (withdrawal.value) {
            let __VLS_49;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
                // @ts-ignore
                color: "warning", variant: "subtle", icon: "i-lucide-milk-off", title: (`Milk withheld through ${__VLS_unwrap(formatDate, {})(withdrawal.value.through)}`), description: (withdrawal.value.treatments.map((t) => t.medication).join(', ')),
            }));
            const __VLS_51 = __VLS_50({
                color: "warning",
                variant: "subtle",
                icon: "i-lucide-milk-off",
                title: (`Milk withheld through ${__VLS_unwrap(formatDate, {})(withdrawal.value.through)}`),
                description: (withdrawal.value.treatments.map((t) => t.medication).join(', ')),
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        }
        if (goat.value.sex === 'doe') {
            const __VLS_54 = LactationCurveCard;
            // @ts-ignore
            const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                // @ts-ignore
                goat: (goat.value),
            }));
            const __VLS_56 = __VLS_55({
                goat: (goat.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid lg:grid-cols-2 gap-4 items-start" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        let __VLS_59;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
        // @ts-ignore
        }));
        const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
        var __VLS_62;
        const { default: __VLS_64 } = __VLS_nonNull(__VLS_62.slots);
        {
            const { header: __VLS_65 } = __VLS_nonNull(__VLS_62.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [goat, goat, goat, goat, goat, goat, goat, goat, goat, formatDate, formatDate, withdrawal, withdrawal, withdrawal,];
        }
        if (details.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
                ...{ class: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-[auto_1fr]']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-x-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-y-2']} */ ;
            const __VLS_66 = __VLS_tryAsConstant((details.value));
            for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_66))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
                    key: (d.label),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (d.label);
                __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({
                    ...{ class: "break-words" },
                });
                /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
                (d.value);
                // @ts-ignore
                [details, details,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        if (goat.value.pedigree_url) {
            let __VLS_67;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                // @ts-ignore
                to: (goat.value.pedigree_url), target: "_blank", variant: "link", icon: "i-lucide-external-link", ...{ class: "px-0 mt-2" },
            }));
            const __VLS_69 = __VLS_68({
                to: (goat.value.pedigree_url),
                target: "_blank",
                variant: "link",
                icon: "i-lucide-external-link",
                ...{ class: "px-0 mt-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_68));
            /** @type {__VLS_StyleScopedClasses['px-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            var __VLS_70;
            const { default: __VLS_72 } = __VLS_nonNull(__VLS_70.slots);
            // @ts-ignore
            [goat, goat,];
        }
        // @ts-ignore
        [];
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        // @ts-ignore
        }));
        const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
        var __VLS_76;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_76.slots);
        {
            const { header: __VLS_79 } = __VLS_nonNull(__VLS_76.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        const __VLS_80 = PedigreeChart;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            // @ts-ignore
            goat: (goat.value), byId: (__VLS_unwrap(byId, {})), latest: (latest.value),
        }));
        const __VLS_82 = __VLS_81({
            goat: (goat.value),
            byId: (__VLS_unwrap(byId, {})),
            latest: (latest.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        // @ts-ignore
        [goat, latest, byId,];
        if (goat.value.notes) {
            let __VLS_85;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            // @ts-ignore
            }));
            const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
            var __VLS_88;
            const { default: __VLS_90 } = __VLS_nonNull(__VLS_88.slots);
            {
                const { header: __VLS_91 } = __VLS_nonNull(__VLS_88.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                    ...{ class: "font-semibold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                // @ts-ignore
                [goat,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "whitespace-pre-wrap" },
            });
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
            (goat.value.notes);
            // @ts-ignore
            [goat,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        if (goat.value.sex === 'doe') {
            const __VLS_92 = MilkTestsCard;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                // @ts-ignore
                goat: (goat.value),
            }));
            const __VLS_94 = __VLS_93({
                goat: (goat.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        }
        const __VLS_97 = HealthCard;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
            // @ts-ignore
            goat: (goat.value),
        }));
        const __VLS_99 = __VLS_98({
            goat: (goat.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        const __VLS_102 = GoatFinanceCard;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            // @ts-ignore
            goat: (goat.value),
        }));
        const __VLS_104 = __VLS_103({
            goat: (goat.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        if (goat.value.sex === 'doe') {
            const __VLS_107 = BreedingCard;
            // @ts-ignore
            const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
                // @ts-ignore
                goat: (goat.value),
            }));
            const __VLS_109 = __VLS_108({
                goat: (goat.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        }
        if (goat.value.sex === 'doe') {
            const __VLS_112 = LactationSection;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
                // @ts-ignore
                goat: (goat.value),
            }));
            const __VLS_114 = __VLS_113({
                goat: (goat.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        }
        const __VLS_117 = AppraisalSection;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
            // @ts-ignore
            goat: (goat.value), appraisals: (__VLS_unwrap(goatAppraisals, {})),
        }));
        const __VLS_119 = __VLS_118({
            goat: (goat.value),
            appraisals: (__VLS_unwrap(goatAppraisals, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        const __VLS_122 = PhotoSection;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
            // @ts-ignore
            goat: (goat.value), photos: (__VLS_unwrap(goatPhotos, {})),
        }));
        const __VLS_124 = __VLS_123({
            goat: (goat.value),
            photos: (__VLS_unwrap(goatPhotos, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        let __VLS_127;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
        // @ts-ignore
        }));
        const __VLS_129 = __VLS_128({}, ...__VLS_functionalComponentArgsRest(__VLS_128));
        var __VLS_130;
        const { default: __VLS_132 } = __VLS_nonNull(__VLS_130.slots);
        {
            const { header: __VLS_133 } = __VLS_nonNull(__VLS_130.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [goat, goat, goat, goat, goat, goat, goat, goat, goat, goat, goatAppraisals, goatPhotos,];
        }
        if (!kids.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default -my-2" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
            const __VLS_134 = __VLS_tryAsConstant((kids.value));
            for (const [k] of __VLS_vFor(__VLS_nonNull(__VLS_134))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (k.id),
                });
                let __VLS_135;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
                    // @ts-ignore
                    to: (`/goats/${k.slug}`), ...{ class: "py-2 flex items-center gap-2 hover:underline" },
                }));
                const __VLS_137 = __VLS_136({
                    to: (`/goats/${k.slug}`),
                    ...{ class: "py-2 flex items-center gap-2 hover:underline" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_136));
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
                var __VLS_138;
                const { default: __VLS_140 } = __VLS_nonNull(__VLS_138.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (__VLS_unwrap(goatFullName, {})(k));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (SEX_LABELS.value[k.sex]);
                if (k.birth_date) {
                    (__VLS_unwrap(formatDate, {})(k.birth_date));
                }
                // @ts-ignore
                [goatFullName, SEX_LABELS, formatDate, kids, kids,];
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        const __VLS_141 = EntryModal;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
            // @ts-ignore
            open: (__VLS_unwrap(saleOpen, {})), draft: (__VLS_unwrap(saleDraft, {})),
        }));
        const __VLS_143 = __VLS_142({
            open: (__VLS_unwrap(saleOpen, {})),
            draft: (__VLS_unwrap(saleDraft, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    }
    // @ts-ignore
    [saleOpen, saleDraft,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
