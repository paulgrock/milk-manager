/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useHerd } from '@/composables/useHerd';
import { useAuth } from '@/composables/useAuth';
import { useLactations, useMilkDay } from '@/composables/useMilk';
import { useCalendarEvents } from '@/composables/useCalendar';
import { useHerdGoats } from '@/composables/useGoats';
import { inHerdOn } from '@/lib/goats';
import { formatDate, todayISO } from '@/lib/dates';
import { addDays } from '@/lib/breeding';
import { needsAttention } from '@/lib/calendar';
import { AM, PM, formatWeight, lactationOn } from '@/lib/milk';
import PendingInvites from '@/components/PendingInvites.vue';
import CalendarEventItem from '@/components/CalendarEventItem.vue';
import LogCareModal from '@/components/health/LogCareModal.vue';
const WEEK = 7;
const { herd, role } = useHerd();
const { user } = useAuth();
const today = todayISO();
const day = useMilkDay(today);
const lactations = useLactations();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { goats } = useHerdGoats();
const inMilk = computed(() => (goats.data.value ?? []).filter((g) => inHerdOn(g, today) && lactationOn(lactations.data.value ?? [], g.id, today)).length);
const milk = computed(() => {
    const rows = day.data.value ?? [];
    const sum = (m) => rows.filter((r) => r.milking === m).reduce((s, r) => s + r.weight_g, 0);
    return { am: sum(AM), pm: sum(PM), total: rows.reduce((s, r) => s + r.weight_g, 0) };
});
const { events, loading } = useCalendarEvents(today, addDays(today, WEEK));
const attention = computed(() => needsAttention(events.value, today));
// The rest of the week, by day: upcoming things, not records.
const week = computed(() => {
    const upcoming = events.value.filter((e) => !e.done && !attention.value.includes(e));
    const days = new Map();
    for (const e of upcoming)
        days.set(e.date, [...(days.get(e.date) ?? []), e]);
    return [...days].map(([date, list]) => ({ date, list }));
});
const careOpen = ref(false);
const weekday = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long' });
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(role, {});
    __VLS_withDotValue(herd, {});
    __VLS_withDotValue(careOpen, {});
    __VLS_withDotValue(inMilk, {});
    __VLS_withDotValue(milk, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(attention, {});
    __VLS_withDotValue(week, {});
    __VLS_withDotValue(user, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_0 = PendingInvites;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-end gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    (__VLS_unwrap(formatDate, {})(__VLS_unwrap(today, {})));
    (role.value === 'owner' ? 'Owner' : 'Helper');
    (herd.value?.name);
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        to: "/milk", icon: "i-lucide-milk",
    }));
    const __VLS_7 = __VLS_6({
        to: "/milk",
        icon: "i-lucide-milk",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    var __VLS_8;
    const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
    // @ts-ignore
    [formatDate, today, role, herd,];
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        // @ts-ignore
        ...{ 'onClick': {} }, variant: "soft", icon: "i-lucide-clipboard-check",
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onClick': {} },
        variant: "soft",
        icon: "i-lucide-clipboard-check",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_16;
    const __VLS_17 = {
        /** @type {typeof __VLS_16.click} */
        onClick: (...[$event]) => {
            void $event;
            return (careOpen.value = true);
            // @ts-ignore
            [careOpen,];
        },
    };
    void __VLS_17;
    var __VLS_14;
    var __VLS_15;
    const { default: __VLS_18 } = __VLS_nonNull(__VLS_14.slots);
    // @ts-ignore
    [];
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        // @ts-ignore
        variant: "soft", icon: "i-lucide-baby", to: "/breeding/kidding",
    }));
    const __VLS_21 = __VLS_20({
        variant: "soft",
        icon: "i-lucide-baby",
        to: "/breeding/kidding",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    var __VLS_22;
    const { default: __VLS_24 } = __VLS_nonNull(__VLS_22.slots);
    // @ts-ignore
    [];
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        to: "/milk", ...{ class: "block" },
    }));
    const __VLS_27 = __VLS_26({
        to: "/milk",
        ...{ class: "block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    var __VLS_28;
    const { default: __VLS_30 } = __VLS_nonNull(__VLS_28.slots);
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        // @ts-ignore
        ...{ class: "hover:bg-elevated/40" },
    }));
    const __VLS_33 = __VLS_32({
        ...{ class: "hover:bg-elevated/40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/40']} */ ;
    var __VLS_34;
    const { default: __VLS_36 } = __VLS_nonNull(__VLS_34.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-end gap-x-6 gap-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-x-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    (inMilk.value);
    (inMilk.value === 1 ? 'doe' : 'does');
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-3xl font-semibold tabular-nums" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
    (__VLS_unwrap(formatWeight, {})(milk.value.total, __VLS_unwrap(unit, {}), true));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-sm text-muted tabular-nums" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
    (__VLS_unwrap(formatWeight, {})(milk.value.am, __VLS_unwrap(unit, {})));
    (__VLS_unwrap(formatWeight, {})(milk.value.pm, __VLS_unwrap(unit, {})));
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
    UIcon;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        // @ts-ignore
        name: "i-lucide-chevron-right", ...{ class: "ms-auto size-5 text-muted" },
    }));
    const __VLS_39 = __VLS_38({
        name: "i-lucide-chevron-right",
        ...{ class: "ms-auto size-5 text-muted" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    // @ts-ignore
    [inMilk, inMilk, formatWeight, formatWeight, formatWeight, milk, milk, milk, unit, unit, unit,];
    // @ts-ignore
    [];
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_42 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_42))) {
            let __VLS_43;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
                // @ts-ignore
                key: (i), ...{ class: "h-14 w-full" },
            }));
            const __VLS_45 = __VLS_44({
                key: (i),
                ...{ class: "h-14 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_44));
            /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [loading,];
        }
    }
    else {
        let __VLS_48;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_50 = __VLS_49({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        var __VLS_51;
        const { default: __VLS_53 } = __VLS_nonNull(__VLS_51.slots);
        {
            const { header: __VLS_54 } = __VLS_nonNull(__VLS_51.slots);
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
        if (!attention.value.length) {
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
            const __VLS_55 = __VLS_tryAsConstant((attention.value));
            for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_55))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (`${e.kind}-${e.title}`),
                });
                const __VLS_56 = CalendarEventItem;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                    // @ts-ignore
                    event: (e),
                }));
                const __VLS_58 = __VLS_57({
                    event: (e),
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                // @ts-ignore
                [attention, attention,];
            }
        }
        // @ts-ignore
        [];
        let __VLS_61;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_63 = __VLS_62({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        var __VLS_64;
        const { default: __VLS_66 } = __VLS_nonNull(__VLS_64.slots);
        {
            const { header: __VLS_67 } = __VLS_nonNull(__VLS_64.slots);
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
            let __VLS_68;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                // @ts-ignore
                to: "/calendar", variant: "link", size: "sm", trailingIcon: "i-lucide-arrow-right",
            }));
            const __VLS_70 = __VLS_69({
                to: "/calendar",
                variant: "link",
                size: "sm",
                trailingIcon: "i-lucide-arrow-right",
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            var __VLS_71;
            const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
        if (!week.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        const __VLS_74 = __VLS_tryAsConstant((week.value));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_74))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
                key: (d.date),
                ...{ class: "border-t border-default first:border-0" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['first:border-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "px-4 pt-3 text-xs font-medium text-muted uppercase tracking-wide" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            (__VLS_unwrap(weekday, {})(d.date));
            (__VLS_unwrap(formatDate, {})(d.date));
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
            const __VLS_75 = __VLS_tryAsConstant((d.list));
            for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_75))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (`${e.kind}-${e.title}`),
                });
                const __VLS_76 = CalendarEventItem;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                    // @ts-ignore
                    event: (e),
                }));
                const __VLS_78 = __VLS_77({
                    event: (e),
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                // @ts-ignore
                [formatDate, week, week, weekday,];
            }
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    (user.value?.email);
    const __VLS_81 = LogCareModal;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        // @ts-ignore
        open: (careOpen.value),
    }));
    const __VLS_83 = __VLS_82({
        open: (careOpen.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    // @ts-ignore
    [careOpen, user,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
