/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useBreedingData } from '@/composables/useBreeding';
import { useSalesData, useSalesMutations } from '@/composables/useSales';
import { doeBreedingState } from '@/lib/breeding';
import { formatDate, todayISO } from '@/lib/dates';
import { formatMoney } from '@/lib/finances';
import { goatName } from '@/lib/goats';
import { DEPOSIT_LABELS, defaultSeason, inLine, kidFits, reservationProgress, seasonKids, } from '@/lib/sales';
import ReservationModal from '@/components/sales/ReservationModal.vue';
import SaleModal from '@/components/sales/SaleModal.vue';
import BuyerModal from '@/components/sales/BuyerModal.vue';
const today = todayISO();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isOwner } = useHerd();
const { goats, byId } = useHerdGoats();
const { data: breeding, query: breedingQuery } = useBreedingData();
const { query, data } = useSalesData();
const { saveSale, removeSale, setLineOrder } = useSalesMutations();
const season = computed(() => {
    const q = Number(route.query.season);
    return Number.isInteger(q) && q >= 2000 && q <= 2100 ? q : defaultSeason(null, breeding.value, today);
});
const goToSeason = (s) => void router.replace({ query: { season: String(s) } });
const doeName = (id) => {
    const g = byId.value.get(id);
    return g ? g.barn_name || goatName(g) : 'Unknown doe';
};
const buyerName = (id) => data.value.buyers.find((b) => b.id === id)?.name ?? 'Unknown adopter';
const kids = computed(() => seasonKids(breeding.value.kiddings, breeding.value.kids, byId.value, season.value));
const kidById = computed(() => new Map(kids.value.map((k) => [k.kid.id, k])));
const takenKids = computed(() => new Set(data.value.sales.map((s) => s.kid_id).filter(Boolean)));
const freeKids = computed(() => kids.value.filter((k) => !takenKids.value.has(k.kid.id)));
const seasonReservations = computed(() => data.value.reservations.filter((r) => r.season === season.value));
const active = computed(() => seasonReservations.value.filter((r) => !r.cancelled_on));
const cancelled = computed(() => seasonReservations.value.filter((r) => r.cancelled_on));
// One line per doe with reservations or kids this season, then "any doe".
const groups = computed(() => {
    const does = new Set([...active.value.map((r) => r.doe_id).filter((d) => !!d), ...kids.value.map((k) => k.kidding.doe_id)]);
    const list = [...does]
        .map((doeId) => ({ doeId: doeId, title: doeName(doeId), status: doeStatus(doeId) }))
        .sort((a, b) => a.title.localeCompare(b.title));
    if (active.value.some((r) => !r.doe_id))
        list.push({ doeId: null, title: 'Any doe', status: '' });
    return list.map((g) => ({
        ...g,
        line: inLine(active.value.filter((r) => r.doe_id === g.doeId)),
        unreserved: freeKids.value.filter((k) => g.doeId && k.kidding.doe_id === g.doeId),
    }));
});
function doeStatus(doeId) {
    const born = kids.value.filter((k) => k.kidding.doe_id === doeId);
    if (born.length) {
        const doelings = born.filter((k) => k.kid.sex === 'doe').length;
        const bucklings = born.length - doelings;
        const parts = [doelings && `${doelings} ${doelings === 1 ? 'doeling' : 'doelings'}`, bucklings && `${bucklings} ${bucklings === 1 ? 'buckling' : 'bucklings'}`];
        return `Kidded ${formatDate(born[0].kidding.kidded_on)} · ${parts.filter(Boolean).join(', ')}`;
    }
    const due = doeBreedingState(doeId, breeding.value, today).current?.due.expected;
    return due && due.startsWith(`${season.value}-`) ? `Due ${formatDate(due)}` : '';
}
function wantsText(r) {
    const word = r.wants === 'any' ? 'kid' : r.wants;
    return `${r.kid_count} ${r.kid_count === 1 ? word : `${word}s`}`;
}
function depositText(r) {
    if (!r.deposit_cents)
        return 'No deposit';
    return `${formatMoney(r.deposit_cents)} deposit ${DEPOSIT_LABELS[r.deposit_status]}`;
}
const salesFor = (r) => data.value.sales.filter((s) => s.reservation_id === r.id);
// A kid born this season by its label; otherwise the goat's name.
function saleLabel(s) {
    const kid = s.kid_id ? kidById.value.get(s.kid_id) : undefined;
    if (kid)
        return kid.label;
    const goat = s.goat_id ? byId.value.get(s.goat_id) : undefined;
    return goat ? goat.barn_name || goatName(goat) : 'Kid';
}
// Kids that fit a reservation: from its doe (or any doe), the sex it wants, not already taken.
const fitting = (r) => freeKids.value.filter((k) => (!r.doe_id || k.kidding.doe_id === r.doe_id) && kidFits(k.kid, r.wants));
function matchItems(r) {
    return fitting(r).map((k) => ({ label: k.label, onSelect: () => match(r, k) }));
}
function match(r, k) {
    saveSale.mutate({ values: { buyer_id: r.buyer_id, reservation_id: r.id, kid_id: k.kid.id, goat_id: k.kid.goat_id } }, { onError: (e) => toast.add({ color: 'error', title: 'Could not match', description: e.message }) });
}
function unmatch(s) {
    removeSale.mutate(s.id, { onError: (e) => toast.add({ color: 'error', title: 'Could not unmatch', description: e.message }) });
}
function move(line, index, by) {
    const ids = line.map((r) => r.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + by, 0, id);
    setLineOrder.mutate(ids, { onError: (e) => toast.add({ color: 'error', title: 'Could not reorder', description: e.message }) });
}
// Kids count toward the season they were born in, whenever they're adopted; other goats by the year adopted.
const seasonSales = computed(() => data.value.sales
    .filter((s) => s.sold_on && (s.kid_id ? kidById.value.has(s.kid_id) : s.sold_on.startsWith(`${season.value}-`)))
    .sort((a, b) => b.sold_on.localeCompare(a.sold_on)));
const seasonTotal = computed(() => seasonSales.value.reduce((sum, s) => sum + (s.price_cents ?? 0), 0));
const purchases = (b) => data.value.sales.filter((s) => s.buyer_id === b.id && s.sold_on).length;
const reservationModal = ref({ open: false });
const saleModal = ref({ open: false });
const buyerModal = ref({ open: false });
const showCancelled = ref(false);
const loading = computed(() => query.isPending.value || breedingQuery.isPending.value || goats.isPending.value);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(reservationModal, {});
    __VLS_withDotValue(saleModal, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(groups, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(cancelled, {});
    __VLS_withDotValue(showCancelled, {});
    __VLS_withDotValue(seasonSales, {});
    __VLS_withDotValue(buyerModal, {});
    if (!isOwner.value) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            color: "neutral", variant: "subtle", icon: "i-lucide-lock", title: "Only owners can see adoptions.",
        }));
        const __VLS_2 = __VLS_1({
            color: "neutral",
            variant: "subtle",
            icon: "i-lucide-lock",
            title: "Only owners can see adoptions.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            to: "/breeding", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': "Back to breeding",
        }));
        const __VLS_7 = __VLS_6({
            to: "/breeding",
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-arrow-left",
            'aria-label': "Back to breeding",
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-2xl font-semibold flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        let __VLS_10;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            // @ts-ignore
            ...{ 'onClick': {} }, icon: "i-lucide-plus",
        }));
        const __VLS_12 = __VLS_11({
            ...{ 'onClick': {} },
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        let __VLS_15;
        const __VLS_16 = {
            /** @type {typeof __VLS_15.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(!isOwner.value))
                    throw 0;
                return (reservationModal.value = { open: true });
                // @ts-ignore
                [isOwner, reservationModal,];
            },
        };
        void __VLS_16;
        var __VLS_13;
        var __VLS_14;
        const { default: __VLS_17 } = __VLS_nonNull(__VLS_13.slots);
        // @ts-ignore
        [];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-heart-handshake",
        }));
        const __VLS_20 = __VLS_19({
            ...{ 'onClick': {} },
            variant: "soft",
            icon: "i-lucide-heart-handshake",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_23;
        const __VLS_24 = {
            /** @type {typeof __VLS_23.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(!isOwner.value))
                    throw 0;
                return (saleModal.value = { open: true });
                // @ts-ignore
                [saleModal,];
            },
        };
        void __VLS_24;
        var __VLS_21;
        var __VLS_22;
        const { default: __VLS_25 } = __VLS_nonNull(__VLS_21.slots);
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        let __VLS_26;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-left", 'aria-label': "Previous season",
        }));
        const __VLS_28 = __VLS_27({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "outline",
            icon: "i-lucide-chevron-left",
            'aria-label': "Previous season",
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        let __VLS_31;
        const __VLS_32 = {
            /** @type {typeof __VLS_31.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(!isOwner.value))
                    throw 0;
                return (__VLS_unwrap(goToSeason, {})(__VLS_unwrap(season, {}) - 1));
                // @ts-ignore
                [goToSeason, season,];
            },
        };
        void __VLS_32;
        var __VLS_29;
        var __VLS_30;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "px-3 font-medium tabular-nums" },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
        (__VLS_unwrap(season, {}));
        let __VLS_33;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-right", 'aria-label': "Next season",
        }));
        const __VLS_35 = __VLS_34({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "outline",
            icon: "i-lucide-chevron-right",
            'aria-label': "Next season",
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        let __VLS_38;
        const __VLS_39 = {
            /** @type {typeof __VLS_38.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(!isOwner.value))
                    throw 0;
                return (__VLS_unwrap(goToSeason, {})(__VLS_unwrap(season, {}) + 1));
                // @ts-ignore
                [goToSeason, season, season,];
            },
        };
        void __VLS_39;
        var __VLS_36;
        var __VLS_37;
        if (loading.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            const __VLS_40 = __VLS_tryAsConstant((3));
            for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_40))) {
                let __VLS_41;
                /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
                USkeleton;
                // @ts-ignore
                const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                    // @ts-ignore
                    key: (i), ...{ class: "h-20 w-full" },
                }));
                const __VLS_43 = __VLS_42({
                    key: (i),
                    ...{ class: "h-20 w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_42));
                /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [loading,];
            }
        }
        else {
            if (!groups.value.length) {
                let __VLS_46;
                /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
                UCard;
                // @ts-ignore
                const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                    // @ts-ignore
                    ...{ class: "text-center" },
                }));
                const __VLS_48 = __VLS_47({
                    ...{ class: "text-center" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_47));
                /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
                var __VLS_49;
                const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(season, {}));
                // @ts-ignore
                [season, groups,];
            }
            const __VLS_52 = __VLS_tryAsConstant((groups.value));
            for (const [g] of __VLS_vFor(__VLS_nonNull(__VLS_52))) {
                let __VLS_53;
                /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
                UCard;
                // @ts-ignore
                const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
                    // @ts-ignore
                    key: (g.doeId ?? 'any'), ui: ({ body: 'p-0 sm:p-0' }),
                }));
                const __VLS_55 = __VLS_54({
                    key: (g.doeId ?? 'any'),
                    ui: ({ body: 'p-0 sm:p-0' }),
                }, ...__VLS_functionalComponentArgsRest(__VLS_54));
                var __VLS_56;
                const { default: __VLS_58 } = __VLS_nonNull(__VLS_56.slots);
                {
                    const { header: __VLS_59 } = __VLS_nonNull(__VLS_56.slots);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex flex-wrap items-baseline gap-x-3" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-baseline']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                        ...{ class: "font-semibold flex-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    (g.title);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-sm text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (g.status);
                    // @ts-ignore
                    [groups,];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
                    ...{ class: "divide-y divide-default" },
                });
                /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
                /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
                const __VLS_60 = __VLS_tryAsConstant((g.line));
                for (const [r, i] of __VLS_vFor(__VLS_nonNull(__VLS_60))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (r.id),
                        ...{ class: "px-4 py-3 space-y-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex flex-wrap items-center gap-x-3 gap-y-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-y-1']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "w-5 text-sm text-muted tabular-nums" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                    (i + 1);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                void $event;
                                if (!!(!isOwner.value))
                                    throw 0;
                                if (!!(loading.value))
                                    throw 0;
                                return (reservationModal.value = { open: true, reservation: r });
                                // @ts-ignore
                                [reservationModal,];
                            } },
                        type: "button",
                        ...{ class: "flex-1 min-w-40 text-start" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "font-medium" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    (__VLS_unwrap(buyerName, {})(r.buyer_id));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (wantsText(r));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (depositText(r));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center gap-1 ms-auto" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
                    if (__VLS_unwrap(reservationProgress, {})(r, data.value.sales).open && __VLS_unwrap(fitting, {})(r).length) {
                        let __VLS_61;
                        /** @ts-ignore @type { | typeof __VLS_components.UDropdownMenu | typeof __VLS_components.UDropdownMenu} */
                        UDropdownMenu;
                        // @ts-ignore
                        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                            // @ts-ignore
                            items: (matchItems(r)),
                        }));
                        const __VLS_63 = __VLS_62({
                            items: (matchItems(r)),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
                        var __VLS_64;
                        const { default: __VLS_66 } = __VLS_nonNull(__VLS_64.slots);
                        let __VLS_67;
                        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                        UButton;
                        // @ts-ignore
                        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                            // @ts-ignore
                            size: "xs", variant: "soft", icon: "i-lucide-link",
                        }));
                        const __VLS_69 = __VLS_68({
                            size: "xs",
                            variant: "soft",
                            icon: "i-lucide-link",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
                        var __VLS_70;
                        const { default: __VLS_72 } = __VLS_nonNull(__VLS_70.slots);
                        // @ts-ignore
                        [buyerName, reservationProgress, data, fitting,];
                        // @ts-ignore
                        [];
                    }
                    let __VLS_73;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-up", 'aria-label': (`Move ${__VLS_unwrap(buyerName, {})(r.buyer_id)} up`), disabled: (i === 0),
                    }));
                    const __VLS_75 = __VLS_74({
                        ...{ 'onClick': {} },
                        size: "xs",
                        color: "neutral",
                        variant: "ghost",
                        icon: "i-lucide-arrow-up",
                        'aria-label': (`Move ${__VLS_unwrap(buyerName, {})(r.buyer_id)} up`),
                        disabled: (i === 0),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
                    let __VLS_78;
                    const __VLS_79 = {
                        /** @type {typeof __VLS_78.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(loading.value))
                                throw 0;
                            return (move(g.line, i, -1));
                            // @ts-ignore
                            [buyerName,];
                        },
                    };
                    void __VLS_79;
                    var __VLS_76;
                    var __VLS_77;
                    let __VLS_80;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-down", 'aria-label': (`Move ${__VLS_unwrap(buyerName, {})(r.buyer_id)} down`), disabled: (i === g.line.length - 1),
                    }));
                    const __VLS_82 = __VLS_81({
                        ...{ 'onClick': {} },
                        size: "xs",
                        color: "neutral",
                        variant: "ghost",
                        icon: "i-lucide-arrow-down",
                        'aria-label': (`Move ${__VLS_unwrap(buyerName, {})(r.buyer_id)} down`),
                        disabled: (i === g.line.length - 1),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                    let __VLS_85;
                    const __VLS_86 = {
                        /** @type {typeof __VLS_85.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(loading.value))
                                throw 0;
                            return (move(g.line, i, 1));
                            // @ts-ignore
                            [buyerName,];
                        },
                    };
                    void __VLS_86;
                    var __VLS_83;
                    var __VLS_84;
                    if (__VLS_unwrap(salesFor, {})(r).length) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                            ...{ class: "ps-8 space-y-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['ps-8']} */ ;
                        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
                        const __VLS_87 = __VLS_tryAsConstant((__VLS_unwrap(salesFor, {})(r)));
                        for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_87))) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                                key: (s.id),
                                ...{ class: "flex flex-wrap items-center gap-2 text-sm" },
                            });
                            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                            let __VLS_88;
                            /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                            UIcon;
                            // @ts-ignore
                            const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
                                // @ts-ignore
                                name: (s.sold_on ? 'i-lucide-check' : 'i-lucide-link'), ...{ class: "text-muted" },
                            }));
                            const __VLS_90 = __VLS_89({
                                name: (s.sold_on ? 'i-lucide-check' : 'i-lucide-link'),
                                ...{ class: "text-muted" },
                            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                                ...{ class: "flex-1" },
                            });
                            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                            (saleLabel(s));
                            if (s.sold_on) {
                                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                                    ...{ onClick: (...[$event]) => {
                                            void $event;
                                            if (!!(!isOwner.value))
                                                throw 0;
                                            if (!!(loading.value))
                                                throw 0;
                                            if (!(__VLS_unwrap(salesFor, {})(r).length))
                                                throw 0;
                                            if (!(s.sold_on))
                                                throw 0;
                                            return (saleModal.value = { open: true, sale: s });
                                            // @ts-ignore
                                            [saleModal, salesFor, salesFor,];
                                        } },
                                    type: "button",
                                    ...{ class: "text-muted hover:underline" },
                                });
                                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                                /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
                                (__VLS_unwrap(formatDate, {})(s.sold_on));
                                (__VLS_unwrap(formatMoney, {})(s.price_cents ?? 0));
                            }
                            else {
                                let __VLS_93;
                                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                                UButton;
                                // @ts-ignore
                                const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
                                    // @ts-ignore
                                    ...{ 'onClick': {} }, size: "xs",
                                }));
                                const __VLS_95 = __VLS_94({
                                    ...{ 'onClick': {} },
                                    size: "xs",
                                }, ...__VLS_functionalComponentArgsRest(__VLS_94));
                                let __VLS_98;
                                const __VLS_99 = {
                                    /** @type {typeof __VLS_98.click} */
                                    onClick: (...[$event]) => {
                                        void $event;
                                        if (!!(!isOwner.value))
                                            throw 0;
                                        if (!!(loading.value))
                                            throw 0;
                                        if (!(__VLS_unwrap(salesFor, {})(r).length))
                                            throw 0;
                                        if (!!(s.sold_on))
                                            throw 0;
                                        return (saleModal.value = { open: true, sale: s });
                                        // @ts-ignore
                                        [saleModal, formatDate, formatMoney,];
                                    },
                                };
                                void __VLS_99;
                                var __VLS_96;
                                var __VLS_97;
                                const { default: __VLS_100 } = __VLS_nonNull(__VLS_96.slots);
                                // @ts-ignore
                                [];
                                let __VLS_101;
                                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                                UButton;
                                // @ts-ignore
                                const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
                                    // @ts-ignore
                                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", 'aria-label': (`Unmatch ${saleLabel(s)}`), icon: "i-lucide-x",
                                }));
                                const __VLS_103 = __VLS_102({
                                    ...{ 'onClick': {} },
                                    size: "xs",
                                    color: "neutral",
                                    variant: "ghost",
                                    'aria-label': (`Unmatch ${saleLabel(s)}`),
                                    icon: "i-lucide-x",
                                }, ...__VLS_functionalComponentArgsRest(__VLS_102));
                                let __VLS_106;
                                const __VLS_107 = {
                                    /** @type {typeof __VLS_106.click} */
                                    onClick: (...[$event]) => {
                                        void $event;
                                        if (!!(!isOwner.value))
                                            throw 0;
                                        if (!!(loading.value))
                                            throw 0;
                                        if (!(__VLS_unwrap(salesFor, {})(r).length))
                                            throw 0;
                                        if (!!(s.sold_on))
                                            throw 0;
                                        return (unmatch(s));
                                        // @ts-ignore
                                        [];
                                    },
                                };
                                void __VLS_107;
                                var __VLS_104;
                                var __VLS_105;
                            }
                            // @ts-ignore
                            [];
                        }
                    }
                    // @ts-ignore
                    [];
                }
                const __VLS_108 = __VLS_tryAsConstant((g.unreserved));
                for (const [k] of __VLS_vFor(__VLS_nonNull(__VLS_108))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (k.kid.id),
                        ...{ class: "px-4 py-2 flex items-center gap-3 text-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                        ...{ class: "w-5" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "flex-1 text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (k.label);
                    let __VLS_109;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", variant: "soft",
                    }));
                    const __VLS_111 = __VLS_110({
                        ...{ 'onClick': {} },
                        size: "xs",
                        variant: "soft",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
                    let __VLS_114;
                    const __VLS_115 = {
                        /** @type {typeof __VLS_114.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(loading.value))
                                throw 0;
                            return (saleModal.value = { open: true, kid: k });
                            // @ts-ignore
                            [saleModal,];
                        },
                    };
                    void __VLS_115;
                    var __VLS_112;
                    var __VLS_113;
                    const { default: __VLS_116 } = __VLS_nonNull(__VLS_112.slots);
                    // @ts-ignore
                    [];
                    // @ts-ignore
                    [];
                }
                if (g.doeId) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "px-4 py-2 border-t border-default" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                    let __VLS_117;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "link", icon: "i-lucide-plus",
                    }));
                    const __VLS_119 = __VLS_118({
                        ...{ 'onClick': {} },
                        size: "xs",
                        color: "neutral",
                        variant: "link",
                        icon: "i-lucide-plus",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
                    let __VLS_122;
                    const __VLS_123 = {
                        /** @type {typeof __VLS_122.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(!isOwner.value))
                                throw 0;
                            if (!!(loading.value))
                                throw 0;
                            if (!(g.doeId))
                                throw 0;
                            return (reservationModal.value = { open: true, doeId: g.doeId });
                            // @ts-ignore
                            [reservationModal,];
                        },
                    };
                    void __VLS_123;
                    var __VLS_120;
                    var __VLS_121;
                    const { default: __VLS_124 } = __VLS_nonNull(__VLS_120.slots);
                    (g.title);
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
            if (cancelled.value.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                let __VLS_125;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
                    // @ts-ignore
                    ...{ 'onClick': {} }, color: "neutral", variant: "link", icon: (showCancelled.value ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'),
                }));
                const __VLS_127 = __VLS_126({
                    ...{ 'onClick': {} },
                    color: "neutral",
                    variant: "link",
                    icon: (showCancelled.value ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'),
                }, ...__VLS_functionalComponentArgsRest(__VLS_126));
                let __VLS_130;
                const __VLS_131 = {
                    /** @type {typeof __VLS_130.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(!isOwner.value))
                            throw 0;
                        if (!!(loading.value))
                            throw 0;
                        if (!(cancelled.value.length))
                            throw 0;
                        return (showCancelled.value = !showCancelled.value);
                        // @ts-ignore
                        [cancelled, showCancelled, showCancelled, showCancelled,];
                    },
                };
                void __VLS_131;
                var __VLS_128;
                var __VLS_129;
                const { default: __VLS_132 } = __VLS_nonNull(__VLS_128.slots);
                (cancelled.value.length);
                // @ts-ignore
                [cancelled,];
                if (showCancelled.value) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                        ...{ class: "divide-y divide-default rounded-lg border border-default" },
                    });
                    /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
                    /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
                    const __VLS_133 = __VLS_tryAsConstant((cancelled.value));
                    for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_133))) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                            key: (r.id),
                        });
                        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                            ...{ onClick: (...[$event]) => {
                                    void $event;
                                    if (!!(!isOwner.value))
                                        throw 0;
                                    if (!!(loading.value))
                                        throw 0;
                                    if (!(cancelled.value.length))
                                        throw 0;
                                    if (!(showCancelled.value))
                                        throw 0;
                                    return (reservationModal.value = { open: true, reservation: r });
                                    // @ts-ignore
                                    [reservationModal, cancelled, showCancelled,];
                                } },
                            type: "button",
                            ...{ class: "w-full text-start px-4 py-2 text-sm hover:bg-elevated/50" },
                        });
                        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                        (__VLS_unwrap(buyerName, {})(r.buyer_id));
                        (r.doe_id ? __VLS_unwrap(doeName, {})(r.doe_id) : 'Any doe');
                        (depositText(r));
                        // @ts-ignore
                        [buyerName, doeName,];
                    }
                }
            }
            let __VLS_134;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
                // @ts-ignore
                ui: ({ body: 'p-0 sm:p-0' }),
            }));
            const __VLS_136 = __VLS_135({
                ui: ({ body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_135));
            var __VLS_137;
            const { default: __VLS_139 } = __VLS_nonNull(__VLS_137.slots);
            {
                const { header: __VLS_140 } = __VLS_nonNull(__VLS_137.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-baseline" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-baseline']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                    ...{ class: "font-semibold flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                if (seasonSales.value.length) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-sm text-muted tabular-nums" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                    (__VLS_unwrap(formatMoney, {})(__VLS_unwrap(seasonTotal, {})));
                }
                // @ts-ignore
                [formatMoney, seasonSales, seasonTotal,];
            }
            if (!seasonSales.value.length) {
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
                const __VLS_141 = __VLS_tryAsConstant((seasonSales.value));
                for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_141))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (s.id),
                    });
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                void $event;
                                if (!!(!isOwner.value))
                                    throw 0;
                                if (!!(loading.value))
                                    throw 0;
                                if (!!(!seasonSales.value.length))
                                    throw 0;
                                return (saleModal.value = { open: true, sale: s });
                                // @ts-ignore
                                [saleModal, seasonSales, seasonSales,];
                            } },
                        type: "button",
                        ...{ class: "w-full text-start px-4 py-2 text-sm hover:bg-elevated/50 flex flex-wrap gap-x-3" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "w-24 text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(formatDate, {})(s.sold_on));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "flex-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    (saleLabel(s));
                    (__VLS_unwrap(buyerName, {})(s.buyer_id));
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "tabular-nums" },
                    });
                    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
                    (__VLS_unwrap(formatMoney, {})(s.price_cents ?? 0));
                    if (s.pickup_on) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "basis-full ps-27 text-xs text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['basis-full']} */ ;
                        /** @type {__VLS_StyleScopedClasses['ps-27']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        (__VLS_unwrap(formatDate, {})(s.pickup_on));
                    }
                    // @ts-ignore
                    [buyerName, formatDate, formatDate, formatMoney,];
                }
            }
            // @ts-ignore
            [];
            let __VLS_142;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
                // @ts-ignore
                ui: ({ body: 'p-0 sm:p-0' }),
            }));
            const __VLS_144 = __VLS_143({
                ui: ({ body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_143));
            var __VLS_145;
            const { default: __VLS_147 } = __VLS_nonNull(__VLS_145.slots);
            {
                const { header: __VLS_148 } = __VLS_nonNull(__VLS_145.slots);
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
                let __VLS_149;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", variant: "soft", icon: "i-lucide-plus",
                }));
                const __VLS_151 = __VLS_150({
                    ...{ 'onClick': {} },
                    size: "xs",
                    variant: "soft",
                    icon: "i-lucide-plus",
                }, ...__VLS_functionalComponentArgsRest(__VLS_150));
                let __VLS_154;
                const __VLS_155 = {
                    /** @type {typeof __VLS_154.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(!isOwner.value))
                            throw 0;
                        if (!!(loading.value))
                            throw 0;
                        return (buyerModal.value = { open: true });
                        // @ts-ignore
                        [buyerModal,];
                    },
                };
                void __VLS_155;
                var __VLS_152;
                var __VLS_153;
                const { default: __VLS_156 } = __VLS_nonNull(__VLS_152.slots);
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
            if (!data.value.buyers.length) {
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
                const __VLS_157 = __VLS_tryAsConstant((data.value.buyers));
                for (const [b] of __VLS_vFor(__VLS_nonNull(__VLS_157))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (b.id),
                    });
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                void $event;
                                if (!!(!isOwner.value))
                                    throw 0;
                                if (!!(loading.value))
                                    throw 0;
                                if (!!(!data.value.buyers.length))
                                    throw 0;
                                return (buyerModal.value = { open: true, buyer: b });
                                // @ts-ignore
                                [data, data, buyerModal,];
                            } },
                        type: "button",
                        ...{ class: "w-full text-start px-4 py-2 text-sm hover:bg-elevated/50" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "font-medium" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    (b.name);
                    if (b.town) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        (b.town);
                    }
                    if (__VLS_unwrap(purchases, {})(b)) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "text-muted" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                        (__VLS_unwrap(purchases, {})(b));
                    }
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    ([b.phone, b.email].filter(Boolean).join(' · '));
                    // @ts-ignore
                    [purchases, purchases,];
                }
            }
            // @ts-ignore
            [];
        }
        const __VLS_158 = ReservationModal;
        // @ts-ignore
        const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
            // @ts-ignore
            open: (reservationModal.value.open), reservation: (reservationModal.value.reservation), doeId: (reservationModal.value.doeId), season: (reservationModal.value.reservation ? undefined : __VLS_unwrap(season, {})),
        }));
        const __VLS_160 = __VLS_159({
            open: (reservationModal.value.open),
            reservation: (reservationModal.value.reservation),
            doeId: (reservationModal.value.doeId),
            season: (reservationModal.value.reservation ? undefined : __VLS_unwrap(season, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_159));
        const __VLS_163 = SaleModal;
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
            // @ts-ignore
            open: (saleModal.value.open), sale: (saleModal.value.sale), kid: (saleModal.value.kid), kids: (__VLS_unwrap(freeKids, {})),
        }));
        const __VLS_165 = __VLS_164({
            open: (saleModal.value.open),
            sale: (saleModal.value.sale),
            kid: (saleModal.value.kid),
            kids: (__VLS_unwrap(freeKids, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_164));
        const __VLS_168 = BuyerModal;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
            // @ts-ignore
            open: (buyerModal.value.open), buyer: (buyerModal.value.buyer),
        }));
        const __VLS_170 = __VLS_169({
            open: (buyerModal.value.open),
            buyer: (buyerModal.value.buyer),
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    }
    // @ts-ignore
    [reservationModal, reservationModal, reservationModal, reservationModal, saleModal, saleModal, saleModal, season, buyerModal, buyerModal, freeKids,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
