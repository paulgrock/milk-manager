/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useCareLog, useHealthData, useHealthMutations } from '@/composables/useHealth';
import { formatDate, relativeDays, todayISO } from '@/lib/dates';
import { CURRENT_STATUSES, goatName } from '@/lib/goats';
import { careStatus, withdrawalOn } from '@/lib/health';
import LogCareModal from '@/components/health/LogCareModal.vue';
import TreatmentModal from '@/components/health/TreatmentModal.vue';
import DeleteCareModal from '@/components/health/DeleteCareModal.vue';
const today = todayISO();
const toast = useToast();
const { isOwner } = useHerd();
const { goats, byId, pathOf } = useHerdGoats();
const { query, data } = useHealthData();
const { waitingCount } = useCareLog();
const { saveCareType } = useHealthMutations();
const name = (g) => (g ? g.barn_name || goatName(g) : '?');
const herd = computed(() => (goats.data.value ?? []).filter((g) => CURRENT_STATUSES.includes(g.status)).sort((a, b) => name(a).localeCompare(name(b))));
const activeTypes = computed(() => data.value.careTypes.filter((t) => !t.archived));
const withheld = computed(() => herd.value
    .map((goat) => ({ goat, withdrawal: withdrawalOn(goat.id, data.value.treatments, today) }))
    .filter((x) => !!x.withdrawal)
    .sort((a, b) => a.withdrawal.through.localeCompare(b.withdrawal.through)));
// Per care type: goats overdue or due soon, and how many have never had it.
const careDue = computed(() => activeTypes.value
    .filter((t) => t.interval_days)
    .map((type) => {
    const statuses = herd.value.map((goat) => ({ goat, status: careStatus(goat.id, type, data.value.careEvents, today) }));
    const due = statuses
        .filter((s) => s.status.state === 'overdue' || s.status.state === 'due')
        .sort((a, b) => a.status.daysUntilDue - b.status.daysUntilDue);
    const never = statuses.filter((s) => s.status.state === 'never');
    return { type, due, never };
})
    .filter((x) => x.due.length || x.never.length));
const recentTreatments = computed(() => [...data.value.treatments].sort((a, b) => b.started_on.localeCompare(a.started_on)).slice(0, 8));
const sortedCare = computed(() => [...data.value.careEvents].sort((a, b) => b.done_on.localeCompare(a.done_on) || b.created_at.localeCompare(a.created_at)));
const showAllCare = ref(false);
const recentCare = computed(() => (showAllCare.value ? sortedCare.value : sortedCare.value.slice(0, 10)));
const typeOf = (id) => data.value.careTypes.find((t) => t.id === id);
const deleteModal = ref({ open: false });
function dueLabel(s) {
    return s.state === 'overdue' ? `${-s.daysUntilDue} days overdue` : relativeDays(s.daysUntilDue);
}
const careModal = ref({ open: false });
const treatmentOpen = ref(false);
// Care routine editor (owners).
const draft = reactive({ name: '', interval: undefined, unit: '' });
async function addType() {
    if (!draft.name.trim())
        return;
    try {
        await saveCareType.mutateAsync({
            values: { name: draft.name.trim(), interval_days: draft.interval || null, dose_unit: draft.unit.trim() || null, sort_order: data.value.careTypes.length + 1 },
        });
        Object.assign(draft, { name: '', interval: undefined, unit: '' });
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not add', description: e.message.includes('duplicate') ? 'That name is already in the list.' : e.message });
    }
}
function updateType(t, values) {
    saveCareType.mutate({ id: t.id, values: { name: t.name, ...values } }, { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) });
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(careModal, {});
    __VLS_withDotValue(treatmentOpen, {});
    __VLS_withDotValue(waitingCount, {});
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(withheld, {});
    __VLS_withDotValue(careDue, {});
    __VLS_withDotValue(sortedCare, {});
    __VLS_withDotValue(byId, {});
    __VLS_withDotValue(deleteModal, {});
    __VLS_withDotValue(showAllCare, {});
    __VLS_withDotValue(recentTreatments, {});
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(draft, {});
    __VLS_withDotValue(saveCareType, {});
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
        ...{ 'onClick': {} }, icon: "i-lucide-clipboard-check",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        icon: "i-lucide-clipboard-check",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.click} */
        onClick: (...[$event]) => {
            void $event;
            return (careModal.value = { open: true });
            // @ts-ignore
            [careModal,];
        },
    };
    void __VLS_6;
    var __VLS_3;
    var __VLS_4;
    const { default: __VLS_7 } = __VLS_nonNull(__VLS_3.slots);
    // @ts-ignore
    [];
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        // @ts-ignore
        ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-pill",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        variant: "soft",
        icon: "i-lucide-pill",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = {
        /** @type {typeof __VLS_13.click} */
        onClick: (...[$event]) => {
            void $event;
            return (treatmentOpen.value = true);
            // @ts-ignore
            [treatmentOpen,];
        },
    };
    void __VLS_14;
    var __VLS_11;
    var __VLS_12;
    const { default: __VLS_15 } = __VLS_nonNull(__VLS_11.slots);
    // @ts-ignore
    [];
    if (waitingCount.value) {
        let __VLS_16;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            // @ts-ignore
            color: "warning", variant: "subtle", icon: "i-lucide-cloud-off", title: (`${waitingCount.value} care ${waitingCount.value === 1 ? 'log is' : 'logs are'} saved on this phone`), description: "They will upload automatically when you have signal.",
        }));
        const __VLS_18 = __VLS_17({
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-cloud-off",
            title: (`${waitingCount.value} care ${waitingCount.value === 1 ? 'log is' : 'logs are'} saved on this phone`),
            description: "They will upload automatically when you have signal.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    }
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_21 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_21))) {
            let __VLS_22;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                // @ts-ignore
                key: (i), ...{ class: "h-24 w-full" },
            }));
            const __VLS_24 = __VLS_23({
                key: (i),
                ...{ class: "h-24 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_23));
            /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [waitingCount, waitingCount, waitingCount, query,];
        }
    }
    else {
        if (withheld.value.length) {
            let __VLS_27;
            /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
            UCard;
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                // @ts-ignore
                ui: ({ body: 'p-0 sm:p-0' }),
            }));
            const __VLS_29 = __VLS_28({
                ui: ({ body: 'p-0 sm:p-0' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_28));
            var __VLS_30;
            const { default: __VLS_32 } = __VLS_nonNull(__VLS_30.slots);
            {
                const { header: __VLS_33 } = __VLS_nonNull(__VLS_30.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                    ...{ class: "font-semibold flex items-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                let __VLS_34;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    // @ts-ignore
                    name: "i-lucide-milk-off", ...{ class: "text-warning" },
                }));
                const __VLS_36 = __VLS_35({
                    name: "i-lucide-milk-off",
                    ...{ class: "text-warning" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
                // @ts-ignore
                [withheld,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_39 = __VLS_tryAsConstant((withheld.value));
            for (const [{ goat, withdrawal }] of __VLS_vFor(__VLS_nonNull(__VLS_39))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (goat.id),
                });
                let __VLS_40;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                    // @ts-ignore
                    to: (`/goats/${goat.slug}`), ...{ class: "flex items-center gap-3 px-4 py-3 hover:bg-elevated/50" },
                }));
                const __VLS_42 = __VLS_41({
                    to: (`/goats/${goat.slug}`),
                    ...{ class: "flex items-center gap-3 px-4 py-3 hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_43;
                const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
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
                (withdrawal.treatments.map((t) => t.medication).join(', '));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (__VLS_unwrap(formatDate, {})(withdrawal.through));
                // @ts-ignore
                [withheld, name, formatDate,];
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
        }
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_48 = __VLS_47({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        var __VLS_49;
        const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
        {
            const { header: __VLS_52 } = __VLS_nonNull(__VLS_49.slots);
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
            [];
        }
        if (!careDue.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        const __VLS_53 = __VLS_tryAsConstant((careDue.value));
        for (const [{ type, due, never }] of __VLS_vFor(__VLS_nonNull(__VLS_53))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (type.id),
                ...{ class: "border-t border-default first:border-0 px-4 py-3 space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['first:border-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-medium flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (type.name);
            if (due.length) {
                let __VLS_54;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", variant: "soft",
                }));
                const __VLS_56 = __VLS_55({
                    ...{ 'onClick': {} },
                    size: "xs",
                    variant: "soft",
                }, ...__VLS_functionalComponentArgsRest(__VLS_55));
                let __VLS_59;
                const __VLS_60 = {
                    /** @type {typeof __VLS_59.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(query.value.isPending.value))
                            throw 0;
                        if (!(due.length))
                            throw 0;
                        return (careModal.value = { open: true, careTypeId: type.id, goatIds: due.map((d) => d.goat.id) });
                        // @ts-ignore
                        [careModal, careDue, careDue,];
                    },
                };
                void __VLS_60;
                var __VLS_57;
                var __VLS_58;
                const { default: __VLS_61 } = __VLS_nonNull(__VLS_57.slots);
                (due.length);
                // @ts-ignore
                [];
            }
            if (due.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                    ...{ class: "flex flex-wrap gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                const __VLS_62 = __VLS_tryAsConstant((due));
                for (const [{ goat, status }] of __VLS_vFor(__VLS_nonNull(__VLS_62))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (goat.id),
                    });
                    let __VLS_63;
                    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                    RouterLink;
                    // @ts-ignore
                    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                        // @ts-ignore
                        to: (`/goats/${goat.slug}`),
                    }));
                    const __VLS_65 = __VLS_64({
                        to: (`/goats/${goat.slug}`),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
                    var __VLS_66;
                    const { default: __VLS_68 } = __VLS_nonNull(__VLS_66.slots);
                    let __VLS_69;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
                        // @ts-ignore
                        color: (status.state === 'overdue' ? 'warning' : 'neutral'), variant: "subtle", icon: (status.state === 'overdue' ? 'i-lucide-alarm-clock' : undefined),
                    }));
                    const __VLS_71 = __VLS_70({
                        color: (status.state === 'overdue' ? 'warning' : 'neutral'),
                        variant: "subtle",
                        icon: (status.state === 'overdue' ? 'i-lucide-alarm-clock' : undefined),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
                    var __VLS_72;
                    const { default: __VLS_74 } = __VLS_nonNull(__VLS_72.slots);
                    (__VLS_unwrap(name, {})(goat));
                    (dueLabel(status));
                    // @ts-ignore
                    [name,];
                    // @ts-ignore
                    [];
                    // @ts-ignore
                    [];
                }
            }
            if (never.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (never.length);
                (never.map((n) => __VLS_unwrap(name, {})(n.goat)).join(', '));
            }
            // @ts-ignore
            [name,];
        }
        // @ts-ignore
        [];
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_77 = __VLS_76({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        var __VLS_78;
        const { default: __VLS_80 } = __VLS_nonNull(__VLS_78.slots);
        {
            const { header: __VLS_81 } = __VLS_nonNull(__VLS_78.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!sortedCare.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                'aria-label': "Recent care",
                ...{ class: "divide-y divide-default" },
            });
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            const __VLS_82 = __VLS_tryAsConstant((__VLS_unwrap(recentCare, {})));
            for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_82))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (e.id),
                    ...{ class: "flex items-center gap-2 pe-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['pe-2']} */ ;
                let __VLS_83;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
                    // @ts-ignore
                    to: (__VLS_unwrap(pathOf, {})(e.goat_id)), ...{ class: "flex-1 flex items-center gap-3 px-4 py-2 text-sm hover:bg-elevated/50" },
                }));
                const __VLS_85 = __VLS_84({
                    to: (__VLS_unwrap(pathOf, {})(e.goat_id)),
                    ...{ class: "flex-1 flex items-center gap-3 px-4 py-2 text-sm hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_84));
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_86;
                const { default: __VLS_88 } = __VLS_nonNull(__VLS_86.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "w-24 shrink-0 text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(formatDate, {})(e.done_on));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (__VLS_unwrap(name, {})(byId.value.get(e.goat_id)));
                (__VLS_unwrap(typeOf, {})(e.care_type_id)?.name ?? 'Care');
                if (e.dose) {
                    (Number(e.dose));
                    (__VLS_unwrap(typeOf, {})(e.care_type_id)?.dose_unit ?? '');
                }
                if (e.notes) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (e.notes);
                }
                // @ts-ignore
                [name, formatDate, sortedCare, recentCare, pathOf, byId, typeOf, typeOf,];
                let __VLS_89;
                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", icon: "i-lucide-trash-2", 'aria-label': (`Delete ${__VLS_unwrap(typeOf, {})(e.care_type_id)?.name ?? 'care'} for ${__VLS_unwrap(name, {})(byId.value.get(e.goat_id))} on ${__VLS_unwrap(formatDate, {})(e.done_on)}`),
                }));
                const __VLS_91 = __VLS_90({
                    ...{ 'onClick': {} },
                    size: "xs",
                    color: "neutral",
                    variant: "ghost",
                    icon: "i-lucide-trash-2",
                    'aria-label': (`Delete ${__VLS_unwrap(typeOf, {})(e.care_type_id)?.name ?? 'care'} for ${__VLS_unwrap(name, {})(byId.value.get(e.goat_id))} on ${__VLS_unwrap(formatDate, {})(e.done_on)}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_90));
                let __VLS_94;
                const __VLS_95 = {
                    /** @type {typeof __VLS_94.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(query.value.isPending.value))
                            throw 0;
                        if (!!(!sortedCare.value.length))
                            throw 0;
                        return (deleteModal.value = { open: true, event: e });
                        // @ts-ignore
                        [name, formatDate, byId, typeOf, deleteModal,];
                    },
                };
                void __VLS_95;
                var __VLS_92;
                var __VLS_93;
                // @ts-ignore
                [];
            }
        }
        if (sortedCare.value.length > 10) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "px-4 py-2 border-t border-default" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            let __VLS_96;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "xs", variant: "link", color: "neutral",
            }));
            const __VLS_98 = __VLS_97({
                ...{ 'onClick': {} },
                size: "xs",
                variant: "link",
                color: "neutral",
            }, ...__VLS_functionalComponentArgsRest(__VLS_97));
            let __VLS_101;
            const __VLS_102 = {
                /** @type {typeof __VLS_101.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!!(query.value.isPending.value))
                        throw 0;
                    if (!(sortedCare.value.length > 10))
                        throw 0;
                    return (showAllCare.value = !showAllCare.value);
                    // @ts-ignore
                    [sortedCare, showAllCare, showAllCare,];
                },
            };
            void __VLS_102;
            var __VLS_99;
            var __VLS_100;
            const { default: __VLS_103 } = __VLS_nonNull(__VLS_99.slots);
            (showAllCare.value ? 'Show less' : `Show all ${sortedCare.value.length}`);
            // @ts-ignore
            [sortedCare, showAllCare,];
        }
        // @ts-ignore
        [];
        let __VLS_104;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_106 = __VLS_105({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        var __VLS_107;
        const { default: __VLS_109 } = __VLS_nonNull(__VLS_107.slots);
        {
            const { header: __VLS_110 } = __VLS_nonNull(__VLS_107.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        if (!recentTreatments.value.length) {
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
            const __VLS_111 = __VLS_tryAsConstant((recentTreatments.value));
            for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_111))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (t.id),
                });
                let __VLS_112;
                /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
                RouterLink;
                // @ts-ignore
                const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
                    // @ts-ignore
                    to: (__VLS_unwrap(pathOf, {})(t.goat_id)), ...{ class: "flex items-center gap-3 px-4 py-2 text-sm hover:bg-elevated/50" },
                }));
                const __VLS_114 = __VLS_113({
                    to: (__VLS_unwrap(pathOf, {})(t.goat_id)),
                    ...{ class: "flex items-center gap-3 px-4 py-2 text-sm hover:bg-elevated/50" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_113));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
                var __VLS_115;
                const { default: __VLS_117 } = __VLS_nonNull(__VLS_115.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "w-24 text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(formatDate, {})(t.started_on));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                (__VLS_unwrap(name, {})(byId.value.get(t.goat_id)));
                (t.medication);
                // @ts-ignore
                [name, formatDate, pathOf, byId, recentTreatments, recentTreatments,];
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        let __VLS_118;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        // @ts-ignore
        }));
        const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
        var __VLS_121;
        const { default: __VLS_123 } = __VLS_nonNull(__VLS_121.slots);
        {
            const { header: __VLS_124 } = __VLS_nonNull(__VLS_121.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (isOwner.value ? '' : 'Only owners can change this.');
            // @ts-ignore
            [isOwner,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default -my-2" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
        const __VLS_125 = __VLS_tryAsConstant((data.value.careTypes));
        for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_125))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (t.id),
                ...{ class: "py-2 flex flex-wrap items-center gap-3" },
                ...{ class: (t.archived ? 'opacity-60' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flex-1 min-w-32 font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (t.name);
            if (t.dose_unit) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted font-normal" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
                (t.dose_unit);
            }
            if (isOwner.value) {
                let __VLS_126;
                /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
                UInputNumber;
                // @ts-ignore
                const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
                    // @ts-ignore
                    ...{ 'onUpdate:modelValue': {} }, modelValue: (t.interval_days ?? undefined), min: (1), max: (1095), placeholder: "As needed", ...{ class: "w-32" }, 'aria-label': (`${t.name} every how many days`),
                }));
                const __VLS_128 = __VLS_127({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (t.interval_days ?? undefined),
                    min: (1),
                    max: (1095),
                    placeholder: "As needed",
                    ...{ class: "w-32" },
                    'aria-label': (`${t.name} every how many days`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_127));
                let __VLS_131;
                const __VLS_132 = {
                    /** @type {typeof __VLS_131.'update:modelValue'} */
                    'onUpdate:modelValue': ((v) => updateType(t, { interval_days: v || null })),
                };
                void __VLS_132;
                /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
                var __VLS_129;
                var __VLS_130;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted w-8" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
                let __VLS_133;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost",
                }));
                const __VLS_135 = __VLS_134({
                    ...{ 'onClick': {} },
                    size: "xs",
                    color: "neutral",
                    variant: "ghost",
                }, ...__VLS_functionalComponentArgsRest(__VLS_134));
                let __VLS_138;
                const __VLS_139 = {
                    /** @type {typeof __VLS_138.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(query.value.isPending.value))
                            throw 0;
                        if (!(isOwner.value))
                            throw 0;
                        return (updateType(t, { archived: !t.archived }));
                        // @ts-ignore
                        [isOwner, data,];
                    },
                };
                void __VLS_139;
                var __VLS_136;
                var __VLS_137;
                const { default: __VLS_140 } = __VLS_nonNull(__VLS_136.slots);
                (t.archived ? 'Restore' : 'Hide');
                // @ts-ignore
                [];
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (t.interval_days ? `every ${t.interval_days} days` : 'as needed');
            }
            // @ts-ignore
            [];
        }
        if (isOwner.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
                ...{ onSubmit: (addType) },
                ...{ class: "flex flex-wrap items-end gap-2 mt-4" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            let __VLS_141;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
                // @ts-ignore
                label: "Add care", ...{ class: "flex-1 min-w-40" },
            }));
            const __VLS_143 = __VLS_142({
                label: "Add care",
                ...{ class: "flex-1 min-w-40" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_142));
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
            var __VLS_144;
            const { default: __VLS_146 } = __VLS_nonNull(__VLS_144.slots);
            let __VLS_147;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
                // @ts-ignore
                modelValue: (draft.value.name), placeholder: "Deworming, BoSe…", maxlength: "60", ...{ class: "w-full" },
            }));
            const __VLS_149 = __VLS_148({
                modelValue: (draft.value.name),
                placeholder: "Deworming, BoSe…",
                maxlength: "60",
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_148));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [isOwner, draft,];
            let __VLS_152;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
                // @ts-ignore
                label: "Every (days)",
            }));
            const __VLS_154 = __VLS_153({
                label: "Every (days)",
            }, ...__VLS_functionalComponentArgsRest(__VLS_153));
            var __VLS_155;
            const { default: __VLS_157 } = __VLS_nonNull(__VLS_155.slots);
            let __VLS_158;
            /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
            UInputNumber;
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
                // @ts-ignore
                modelValue: (draft.value.interval), min: (1), max: (1095), placeholder: "As needed", ...{ class: "w-32" },
            }));
            const __VLS_160 = __VLS_159({
                modelValue: (draft.value.interval),
                min: (1),
                max: (1095),
                placeholder: "As needed",
                ...{ class: "w-32" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_159));
            /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
            // @ts-ignore
            [draft,];
            let __VLS_163;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
                // @ts-ignore
                label: "Dose unit",
            }));
            const __VLS_165 = __VLS_164({
                label: "Dose unit",
            }, ...__VLS_functionalComponentArgsRest(__VLS_164));
            var __VLS_166;
            const { default: __VLS_168 } = __VLS_nonNull(__VLS_166.slots);
            let __VLS_169;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
                // @ts-ignore
                modelValue: (draft.value.unit), maxlength: "10", placeholder: "ml, g", ...{ class: "w-24" },
            }));
            const __VLS_171 = __VLS_170({
                modelValue: (draft.value.unit),
                maxlength: "10",
                placeholder: "ml, g",
                ...{ class: "w-24" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_170));
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            // @ts-ignore
            [draft,];
            let __VLS_174;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
                // @ts-ignore
                type: "submit", variant: "soft", loading: (saveCareType.value.isPending.value),
            }));
            const __VLS_176 = __VLS_175({
                type: "submit",
                variant: "soft",
                loading: (saveCareType.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_175));
            var __VLS_177;
            const { default: __VLS_179 } = __VLS_nonNull(__VLS_177.slots);
            // @ts-ignore
            [saveCareType,];
        }
        // @ts-ignore
        [];
    }
    const __VLS_180 = LogCareModal;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
        // @ts-ignore
        open: (careModal.value.open), careTypeId: (careModal.value.careTypeId), goatIds: (careModal.value.goatIds),
    }));
    const __VLS_182 = __VLS_181({
        open: (careModal.value.open),
        careTypeId: (careModal.value.careTypeId),
        goatIds: (careModal.value.goatIds),
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    const __VLS_185 = TreatmentModal;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
        // @ts-ignore
        open: (treatmentOpen.value),
    }));
    const __VLS_187 = __VLS_186({
        open: (treatmentOpen.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    const __VLS_190 = DeleteCareModal;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
        // @ts-ignore
        open: (deleteModal.value.open), event: (deleteModal.value.event), goatName: (deleteModal.value.event ? __VLS_unwrap(name, {})(byId.value.get(deleteModal.value.event.goat_id)) : undefined),
    }));
    const __VLS_192 = __VLS_191({
        open: (deleteModal.value.open),
        event: (deleteModal.value.event),
        goatName: (deleteModal.value.event ? __VLS_unwrap(name, {})(byId.value.get(deleteModal.value.event.goat_id)) : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    // @ts-ignore
    [careModal, careModal, careModal, treatmentOpen, name, byId, deleteModal, deleteModal, deleteModal, deleteModal,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
