/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdMembers } from '@/composables/useHerdMembers';
import { useChoreLog, useChoreMutations, useChoresData } from '@/composables/useChores';
import { formatDate, relativeDays, todayISO } from '@/lib/dates';
import { choreStatus, repeatLabel, sortByDue } from '@/lib/chores';
import ChoreDoneModal from '@/components/chores/ChoreDoneModal.vue';
const today = todayISO();
const toast = useToast();
const { isOwner } = useHerd();
const { nameOf } = useHerdMembers();
const { query, data } = useChoresData();
const { markDone, removeDone, waitingCount } = useChoreLog();
const { saveChore } = useChoreMutations();
const statuses = computed(() => sortByDue(data.value.chores.filter((c) => !c.hidden).map((c) => choreStatus(c, data.value.done, today))));
function dueLabel(s) {
    const days = s.daysUntilDue;
    if (days < 0)
        return `${-days} ${days === -1 ? 'day' : 'days'} overdue`;
    return days === 0 ? 'Due today' : `Due ${relativeDays(days)}`;
}
function lastLabel(s) {
    if (!s.last)
        return 'Not recorded yet';
    const who = nameOf.value(s.last.created_by);
    return `Last done ${s.last.done_on === today ? 'today' : formatDate(s.last.done_on)}${who ? ` by ${who}` : ''}`;
}
function doneToday(chore) {
    const { id, saved } = markDone({ choreId: chore.id, doneOn: today });
    saved.catch((e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }));
    toast.add({
        color: 'success',
        title: `${chore.name} done`,
        actions: [{ label: 'Undo', color: 'neutral', variant: 'outline', onClick: () => removeDone(id) }],
    });
}
const modal = ref({ open: false });
// The chore list: anyone can add; owners rename, change how often and hide.
const draft = reactive({ name: '', interval: undefined });
async function addChore() {
    if (!draft.name.trim() || !draft.interval)
        return;
    try {
        await saveChore.mutateAsync({ values: { name: draft.name.trim(), interval_days: draft.interval, sort_order: data.value.chores.length + 1 } });
        Object.assign(draft, { name: '', interval: undefined });
    }
    catch (e) {
        const message = e.message;
        toast.add({ color: 'error', title: 'Could not add', description: message.includes('duplicate') ? 'That chore is already in the list.' : message });
    }
}
function updateChore(c, values) {
    if (values.name !== undefined && !values.name.trim())
        return;
    if (values.interval_days !== undefined && !values.interval_days)
        return;
    saveChore.mutate({ id: c.id, values: { name: c.name, interval_days: c.interval_days, ...values } }, { onError: (e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }) });
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(waitingCount, {});
    __VLS_withDotValue(query, {});
    __VLS_withDotValue(statuses, {});
    __VLS_withDotValue(modal, {});
    __VLS_withDotValue(today, {});
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(draft, {});
    __VLS_withDotValue(saveChore, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    if (waitingCount.value) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            color: "warning", variant: "subtle", icon: "i-lucide-cloud-off", title: (`${waitingCount.value} ${waitingCount.value === 1 ? 'chore is' : 'chores are'} saved on this phone`), description: "They will upload automatically when you have signal.",
        }));
        const __VLS_2 = __VLS_1({
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-cloud-off",
            title: (`${waitingCount.value} ${waitingCount.value === 1 ? 'chore is' : 'chores are'} saved on this phone`),
            description: "They will upload automatically when you have signal.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (query.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_5 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_5))) {
            let __VLS_6;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
                // @ts-ignore
                key: (i), ...{ class: "h-16 w-full" },
            }));
            const __VLS_8 = __VLS_7({
                key: (i),
                ...{ class: "h-16 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [waitingCount, waitingCount, waitingCount, query,];
        }
    }
    else {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_13 = __VLS_12({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        var __VLS_14;
        const { default: __VLS_16 } = __VLS_nonNull(__VLS_14.slots);
        if (!statuses.value.length) {
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
            const __VLS_17 = __VLS_tryAsConstant((statuses.value));
            for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_17))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (s.chore.id),
                    ...{ class: "flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-x-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-y-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            void $event;
                            if (!!(query.value.isPending.value))
                                throw 0;
                            if (!!(!statuses.value.length))
                                throw 0;
                            return (modal.value = { open: true, chore: s.chore });
                            // @ts-ignore
                            [statuses, statuses, modal,];
                        } },
                    type: "button",
                    ...{ class: "flex-1 min-w-48 text-start" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-48']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (s.chore.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "block text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (lastLabel(s));
                (__VLS_unwrap(repeatLabel, {})(s.chore.interval_days));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-2 ms-auto" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
                if (s.state === 'overdue') {
                    let __VLS_18;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                        // @ts-ignore
                        color: "warning", variant: "subtle", icon: "i-lucide-alarm-clock",
                    }));
                    const __VLS_20 = __VLS_19({
                        color: "warning",
                        variant: "subtle",
                        icon: "i-lucide-alarm-clock",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
                    var __VLS_21;
                    const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
                    (dueLabel(s));
                    // @ts-ignore
                    [repeatLabel,];
                }
                else if (s.state === 'due') {
                    let __VLS_24;
                    /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
                    UBadge;
                    // @ts-ignore
                    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                        // @ts-ignore
                        color: "neutral", variant: "subtle",
                    }));
                    const __VLS_26 = __VLS_25({
                        color: "neutral",
                        variant: "subtle",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
                    var __VLS_27;
                    const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
                    (dueLabel(s));
                    // @ts-ignore
                    [];
                }
                else if (s.state === 'ok') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-sm text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (dueLabel(s));
                }
                else {
                    let __VLS_30;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost",
                    }));
                    const __VLS_32 = __VLS_31({
                        ...{ 'onClick': {} },
                        size: "sm",
                        color: "neutral",
                        variant: "ghost",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
                    let __VLS_35;
                    const __VLS_36 = {
                        /** @type {typeof __VLS_35.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(query.value.isPending.value))
                                throw 0;
                            if (!!(!statuses.value.length))
                                throw 0;
                            if (!!(s.state === 'overdue'))
                                throw 0;
                            if (!!(s.state === 'due'))
                                throw 0;
                            if (!!(s.state === 'ok'))
                                throw 0;
                            return (modal.value = { open: true, chore: s.chore });
                            // @ts-ignore
                            [modal,];
                        },
                    };
                    void __VLS_36;
                    var __VLS_33;
                    var __VLS_34;
                    const { default: __VLS_37 } = __VLS_nonNull(__VLS_33.slots);
                    // @ts-ignore
                    [];
                }
                if (s.last?.done_on === today.value) {
                    let __VLS_38;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                        // @ts-ignore
                        size: "sm", color: "neutral", variant: "ghost", icon: "i-lucide-check", disabled: true,
                    }));
                    const __VLS_40 = __VLS_39({
                        size: "sm",
                        color: "neutral",
                        variant: "ghost",
                        icon: "i-lucide-check",
                        disabled: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                    var __VLS_41;
                    const { default: __VLS_43 } = __VLS_nonNull(__VLS_41.slots);
                    // @ts-ignore
                    [today,];
                }
                else {
                    let __VLS_44;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "sm", icon: "i-lucide-check", variant: (s.state === 'overdue' || s.state === 'due' ? 'solid' : 'soft'),
                    }));
                    const __VLS_46 = __VLS_45({
                        ...{ 'onClick': {} },
                        size: "sm",
                        icon: "i-lucide-check",
                        variant: (s.state === 'overdue' || s.state === 'due' ? 'solid' : 'soft'),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
                    let __VLS_49;
                    const __VLS_50 = {
                        /** @type {typeof __VLS_49.click} */
                        onClick: (...[$event]) => {
                            void $event;
                            if (!!(query.value.isPending.value))
                                throw 0;
                            if (!!(!statuses.value.length))
                                throw 0;
                            if (!!(s.last?.done_on === today.value))
                                throw 0;
                            return (doneToday(s.chore));
                            // @ts-ignore
                            [];
                        },
                    };
                    void __VLS_50;
                    var __VLS_47;
                    var __VLS_48;
                    const { default: __VLS_51 } = __VLS_nonNull(__VLS_47.slots);
                    // @ts-ignore
                    [];
                }
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        // @ts-ignore
        }));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        var __VLS_55;
        const { default: __VLS_57 } = __VLS_nonNull(__VLS_55.slots);
        {
            const { header: __VLS_58 } = __VLS_nonNull(__VLS_55.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (isOwner.value ? '' : 'Only owners can rename, change or hide these.');
            // @ts-ignore
            [isOwner,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default -my-2" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
        const __VLS_59 = __VLS_tryAsConstant((data.value.chores));
        for (const [c] of __VLS_vFor(__VLS_nonNull(__VLS_59))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (c.id),
                ...{ class: "py-2 flex flex-wrap items-center gap-3" },
                ...{ class: (c.hidden ? 'opacity-60' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            if (isOwner.value) {
                let __VLS_60;
                /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                    // @ts-ignore
                    ...{ 'onChange': {} }, modelValue: (c.name), maxlength: "60", ...{ class: "flex-1 min-w-40" }, 'aria-label': (`${c.name} name`),
                }));
                const __VLS_62 = __VLS_61({
                    ...{ 'onChange': {} },
                    modelValue: (c.name),
                    maxlength: "60",
                    ...{ class: "flex-1 min-w-40" },
                    'aria-label': (`${c.name} name`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                let __VLS_65;
                const __VLS_66 = {
                    /** @type {typeof __VLS_65.change} */
                    onChange: ((e) => updateChore(c, { name: e.target.value })),
                };
                void __VLS_66;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
                var __VLS_63;
                var __VLS_64;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-2 ms-auto" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                let __VLS_67;
                /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
                UInputNumber;
                // @ts-ignore
                const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
                    // @ts-ignore
                    ...{ 'onUpdate:modelValue': {} }, modelValue: (c.interval_days), min: (1), max: (1095), ...{ class: "w-28" }, 'aria-label': (`${c.name} every how many days`),
                }));
                const __VLS_69 = __VLS_68({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (c.interval_days),
                    min: (1),
                    max: (1095),
                    ...{ class: "w-28" },
                    'aria-label': (`${c.name} every how many days`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_68));
                let __VLS_72;
                const __VLS_73 = {
                    /** @type {typeof __VLS_72.'update:modelValue'} */
                    'onUpdate:modelValue': ((v) => updateChore(c, { interval_days: Number(v) })),
                };
                void __VLS_73;
                /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
                var __VLS_70;
                var __VLS_71;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                let __VLS_74;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", ...{ class: "w-16 justify-center" },
                }));
                const __VLS_76 = __VLS_75({
                    ...{ 'onClick': {} },
                    size: "xs",
                    color: "neutral",
                    variant: "ghost",
                    ...{ class: "w-16 justify-center" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_75));
                let __VLS_79;
                const __VLS_80 = {
                    /** @type {typeof __VLS_79.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(query.value.isPending.value))
                            throw 0;
                        if (!(isOwner.value))
                            throw 0;
                        return (updateChore(c, { hidden: !c.hidden }));
                        // @ts-ignore
                        [isOwner, data,];
                    },
                };
                void __VLS_80;
                /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                var __VLS_77;
                var __VLS_78;
                const { default: __VLS_81 } = __VLS_nonNull(__VLS_77.slots);
                (c.hidden ? 'Restore' : 'Hide');
                // @ts-ignore
                [];
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (c.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-sm text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(repeatLabel, {})(c.interval_days));
                (c.hidden ? ' · hidden' : '');
            }
            // @ts-ignore
            [repeatLabel,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (addChore) },
            ...{ class: "flex flex-wrap items-end gap-2 mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        let __VLS_82;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            // @ts-ignore
            label: "Add a chore", ...{ class: "flex-1 min-w-40" },
        }));
        const __VLS_84 = __VLS_83({
            label: "Add a chore",
            ...{ class: "flex-1 min-w-40" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
        var __VLS_85;
        const { default: __VLS_87 } = __VLS_nonNull(__VLS_85.slots);
        let __VLS_88;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            // @ts-ignore
            modelValue: (draft.value.name), placeholder: "Check fences, spread manure…", maxlength: "60", ...{ class: "w-full" },
        }));
        const __VLS_90 = __VLS_89({
            modelValue: (draft.value.name),
            placeholder: "Check fences, spread manure…",
            maxlength: "60",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [draft,];
        let __VLS_93;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
            // @ts-ignore
            label: "Every (days)",
        }));
        const __VLS_95 = __VLS_94({
            label: "Every (days)",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        var __VLS_96;
        const { default: __VLS_98 } = __VLS_nonNull(__VLS_96.slots);
        let __VLS_99;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
            // @ts-ignore
            modelValue: (draft.value.interval), min: (1), max: (1095), ...{ class: "w-28" },
        }));
        const __VLS_101 = __VLS_100({
            modelValue: (draft.value.interval),
            min: (1),
            max: (1095),
            ...{ class: "w-28" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_100));
        /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
        // @ts-ignore
        [draft,];
        let __VLS_104;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
            // @ts-ignore
            type: "submit", variant: "soft", loading: (saveChore.value.isPending.value),
        }));
        const __VLS_106 = __VLS_105({
            type: "submit",
            variant: "soft",
            loading: (saveChore.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        var __VLS_107;
        const { default: __VLS_109 } = __VLS_nonNull(__VLS_107.slots);
        // @ts-ignore
        [saveChore,];
        // @ts-ignore
        [];
    }
    const __VLS_110 = ChoreDoneModal;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        // @ts-ignore
        open: (modal.value.open), chore: (modal.value.chore),
    }));
    const __VLS_112 = __VLS_111({
        open: (modal.value.open),
        chore: (modal.value.chore),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    // @ts-ignore
    [modal, modal,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
