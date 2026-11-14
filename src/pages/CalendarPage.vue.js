/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import { useCalendarEvents } from '@/composables/useCalendar';
import { addMonths, formatDate, parseDate, toISODate, todayISO } from '@/lib/dates';
import { GROUP_LABELS } from '@/lib/calendar';
import CalendarEventItem from '@/components/CalendarEventItem.vue';
import MonthYearPicker from '@/components/MonthYearPicker.vue';
const route = useRoute();
const router = useRouter();
const today = todayISO();
const month = computed(() => {
    const q = route.query.month;
    return typeof q === 'string' && /^\d{4}-\d{2}$/.test(q) ? q : today.slice(0, 7);
});
const first = computed(() => `${month.value}-01`);
const last = computed(() => {
    const d = parseDate(first.value);
    return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
});
const goMonth = (delta) => router.replace({ query: { month: addMonths(first.value, delta).slice(0, 7) } });
const pickedMonth = computed({
    get: () => month.value,
    set: (m) => router.replace({ query: m === today.slice(0, 7) ? {} : { month: m } }),
});
// The filters switched off, so a filter added later (like Cheese) starts on.
const hiddenGroups = useLocalStorage('calendar.hiddenGroups', []);
const groups = computed(() => Object.keys(GROUP_LABELS).filter((g) => !hiddenGroups.value.includes(g)));
const showDone = useLocalStorage('calendar.showDone', true);
function toggle(g) {
    hiddenGroups.value = hiddenGroups.value.includes(g) ? hiddenGroups.value.filter((x) => x !== g) : [...hiddenGroups.value, g];
}
const { events, loading } = useCalendarEvents(first, last);
const shown = computed(() => events.value.filter((e) => groups.value.includes(e.group) && (showDone.value || !e.done)));
const byDay = computed(() => {
    const map = new Map();
    for (const e of shown.value)
        map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
});
// Month grid, weeks starting Sunday.
const cells = computed(() => {
    const start = parseDate(first.value);
    const lead = start.getDay();
    const days = parseDate(last.value).getDate();
    const out = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++)
        out.push(`${month.value}-${String(d).padStart(2, '0')}`);
    while (out.length % 7)
        out.push(null);
    return out;
});
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => new Date(2026, 1, i + 1).toLocaleDateString(undefined, { weekday: 'short' })));
const agenda = computed(() => [...byDay.value].sort(([a], [b]) => a.localeCompare(b)));
const dayLabel = (iso) => parseDate(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
// Phone grid: a dot per event (up to three), overdue first so it isn't the one cut off.
const dotRank = (e) => (e.overdue ? 0 : e.done ? 2 : 1);
const dots = (date) => [...(byDay.value.get(date) ?? [])].sort((a, b) => dotRank(a) - dotRank(b)).slice(0, 3);
const dayButtonLabel = (date) => {
    const n = byDay.value.get(date)?.length ?? 0;
    return `${dayLabel(date)}, ${n} ${n === 1 ? 'event' : 'events'}`;
};
const selectedDay = ref(null);
watch(month, () => (selectedDay.value = null));
function pickDay(date) {
    selectedDay.value = date;
    document.getElementById(`day-${date}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(month, {});
    __VLS_withDotValue(today, {});
    __VLS_withDotValue(router, {});
    __VLS_withDotValue(groups, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(byDay, {});
    __VLS_withDotValue(selectedDay, {});
    __VLS_withDotValue(agenda, {});
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1 ms-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
    if (month.value !== today.value.slice(0, 7)) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "link", ...{ class: "whitespace-nowrap px-1" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            variant: "link",
            ...{ class: "whitespace-nowrap px-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = {
            /** @type {typeof __VLS_5.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(month.value !== today.value.slice(0, 7)))
                    throw 0;
                return (router.value.replace({ query: {} }));
                // @ts-ignore
                [month, today, router,];
            },
        };
        void __VLS_6;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        var __VLS_3;
        var __VLS_4;
        const { default: __VLS_7 } = __VLS_nonNull(__VLS_3.slots);
        // @ts-ignore
        [];
    }
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-left", 'aria-label': "Previous month",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-chevron-left",
        'aria-label': "Previous month",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = {
        /** @type {typeof __VLS_13.click} */
        onClick: (...[$event]) => {
            void $event;
            return (__VLS_unwrap(goMonth, {})(-1));
            // @ts-ignore
            [goMonth,];
        },
    };
    void __VLS_14;
    var __VLS_11;
    var __VLS_12;
    const __VLS_15 = MonthYearPicker;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        // @ts-ignore
        modelValue: (__VLS_unwrap(pickedMonth, {})), ...{ class: "w-40" },
    }));
    const __VLS_17 = __VLS_16({
        modelValue: (__VLS_unwrap(pickedMonth, {})),
        ...{ class: "w-40" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-right", 'aria-label': "Next month",
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-chevron-right",
        'aria-label': "Next month",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_25;
    const __VLS_26 = {
        /** @type {typeof __VLS_25.click} */
        onClick: (...[$event]) => {
            void $event;
            return (__VLS_unwrap(goMonth, {})(1));
            // @ts-ignore
            [goMonth, pickedMonth,];
        },
    };
    void __VLS_26;
    var __VLS_23;
    var __VLS_24;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-center gap-2" },
        role: "group",
        'aria-label': "Show",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    const __VLS_27 = __VLS_tryAsConstant((__VLS_unwrap(GROUP_LABELS, {})));
    for (const [label, g] of __VLS_vFor(__VLS_nonNull(__VLS_27))) {
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            // @ts-ignore
            ...{ 'onClick': {} }, key: (g), size: "sm", variant: (groups.value.includes(g) ? 'solid' : 'outline'), color: "neutral", 'aria-pressed': (groups.value.includes(g)),
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            key: (g),
            size: "sm",
            variant: (groups.value.includes(g) ? 'solid' : 'outline'),
            color: "neutral",
            'aria-pressed': (groups.value.includes(g)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_33;
        const __VLS_34 = {
            /** @type {typeof __VLS_33.click} */
            onClick: (...[$event]) => {
                void $event;
                return (toggle(g));
                // @ts-ignore
                [GROUP_LABELS, groups, groups,];
            },
        };
        void __VLS_34;
        var __VLS_31;
        var __VLS_32;
        const { default: __VLS_35 } = __VLS_nonNull(__VLS_31.slots);
        (label);
        // @ts-ignore
        [];
        // @ts-ignore
        [];
    }
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
    UCheckbox;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        // @ts-ignore
        modelValue: (__VLS_unwrap(showDone, {})), label: "Show past records", ...{ class: "ms-2" },
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_unwrap(showDone, {})),
        label: "Show past records",
        ...{ class: "ms-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    /** @type {__VLS_StyleScopedClasses['ms-2']} */ ;
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            // @ts-ignore
            ...{ class: "h-64 w-full" },
        }));
        const __VLS_43 = __VLS_42({
            ...{ class: "h-64 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "md:hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-7 gap-0.5 text-center" },
            role: "group",
            'aria-label': "Month",
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        const __VLS_46 = __VLS_tryAsConstant((__VLS_unwrap(weekdays, {})));
        for (const [w] of __VLS_vFor(__VLS_nonNull(__VLS_46))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (w),
                ...{ class: "pb-1 text-xs text-muted" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (w);
            // @ts-ignore
            [showDone, loading, weekdays,];
        }
        const __VLS_47 = __VLS_tryAsConstant((__VLS_unwrap(cells, {})));
        for (const [date, i] of __VLS_vFor(__VLS_nonNull(__VLS_47))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
                key: (i),
            });
            if (!date) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div)({});
            }
            else if (byDay.value.has(date)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            void $event;
                            if (!!(loading.value))
                                throw 0;
                            if (!!(!date))
                                throw 0;
                            if (!(byDay.value.has(date)))
                                throw 0;
                            return (pickDay(date));
                            // @ts-ignore
                            [cells, byDay,];
                        } },
                    type: "button",
                    ...{ class: "flex h-11 flex-col items-center gap-0.5 rounded-md pt-1 text-sm hover:bg-elevated/60" },
                    ...{ class: (selectedDay.value === date ? 'bg-primary/10' : '') },
                    'aria-label': (__VLS_unwrap(dayButtonLabel, {})(date)),
                    'aria-pressed': (selectedDay.value === date),
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/60']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "inline-flex size-6 items-center justify-center rounded-full" },
                    ...{ class: (date === today.value ? 'bg-primary text-inverted font-semibold' : '') },
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                (Number(date.slice(8)));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex h-1.5 gap-0.5" },
                    'aria-hidden': "true",
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
                const __VLS_48 = __VLS_tryAsConstant((__VLS_unwrap(dots, {})(date)));
                for (const [e, j] of __VLS_vFor(__VLS_nonNull(__VLS_48))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                        key: (j),
                        ...{ class: "size-1.5 rounded-full" },
                        ...{ class: (e.overdue ? 'bg-warning' : e.done ? 'border border-(--ui-text-dimmed)' : 'bg-(--ui-text-toned)') },
                    });
                    /** @type {__VLS_StyleScopedClasses['size-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    // @ts-ignore
                    [today, selectedDay, selectedDay, dayButtonLabel, dots,];
                }
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex h-11 justify-center pt-1 text-sm" },
                    'aria-hidden': "true",
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "inline-flex size-6 items-center justify-center rounded-full" },
                    ...{ class: (date === today.value ? 'bg-primary text-inverted font-semibold' : 'text-dimmed') },
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                (Number(date.slice(8)));
            }
            // @ts-ignore
            [today,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-1 flex gap-3 text-xs text-muted" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "size-1.5 rounded-full bg-(--ui-text-toned)" },
        });
        /** @type {__VLS_StyleScopedClasses['size-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-(--ui-text-toned)']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "size-1.5 rounded-full bg-warning" },
        });
        /** @type {__VLS_StyleScopedClasses['size-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-warning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "flex items-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "size-1.5 rounded-full border border-(--ui-text-dimmed)" },
        });
        /** @type {__VLS_StyleScopedClasses['size-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-(--ui-text-dimmed)']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "hidden md:grid grid-cols-7 gap-px rounded-lg border border-default bg-(--ui-border) overflow-hidden" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-(--ui-border)']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        const __VLS_49 = __VLS_tryAsConstant((__VLS_unwrap(weekdays, {})));
        for (const [w] of __VLS_vFor(__VLS_nonNull(__VLS_49))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (w),
                ...{ class: "bg-elevated/60 px-2 py-1 text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-elevated/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (w);
            // @ts-ignore
            [weekdays,];
        }
        const __VLS_50 = __VLS_tryAsConstant((__VLS_unwrap(cells, {})));
        for (const [date, i] of __VLS_vFor(__VLS_nonNull(__VLS_50))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (i),
                ...{ class: "bg-default min-h-24 p-1.5 text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            if (date) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "inline-flex size-6 items-center justify-center rounded-full" },
                    ...{ class: (date === today.value ? 'bg-primary text-inverted font-semibold' : 'text-muted') },
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                (Number(date.slice(8)));
                __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                    ...{ class: "mt-1 space-y-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-0.5']} */ ;
                const __VLS_51 = __VLS_tryAsConstant(((byDay.value.get(date) ?? []).slice(0, 3)));
                for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_51))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (`${e.kind}-${e.title}`),
                        ...{ class: "break-words leading-snug rounded px-1 py-0.5" },
                        ...{ class: (e.overdue ? 'bg-warning/15 text-warning' : e.done ? 'text-muted' : 'bg-elevated') },
                    });
                    /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
                    /** @type {__VLS_StyleScopedClasses['leading-snug']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    (e.title);
                    // @ts-ignore
                    [today, cells, byDay,];
                }
                if ((byDay.value.get(date)?.length ?? 0) > 3) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        ...{ class: "text-muted px-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
                    (byDay.value.get(date).length - 3);
                }
            }
            // @ts-ignore
            [byDay, byDay,];
        }
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            // @ts-ignore
            ui: ({ body: 'p-0 sm:p-0' }),
        }));
        const __VLS_54 = __VLS_53({
            ui: ({ body: 'p-0 sm:p-0' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        var __VLS_55;
        const { default: __VLS_57 } = __VLS_nonNull(__VLS_55.slots);
        if (!agenda.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "p-4 text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        const __VLS_58 = __VLS_tryAsConstant((agenda.value));
        for (const [[date, list]] of __VLS_vFor(__VLS_nonNull(__VLS_58))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
                id: (`day-${date}`),
                key: (date),
                ...{ class: "scroll-mt-32 border-t border-default first:border-0 transition-colors" },
                ...{ class: (selectedDay.value === date ? 'bg-primary/10' : '') },
                'data-selected': (selectedDay.value === date || undefined),
            });
            /** @type {__VLS_StyleScopedClasses['scroll-mt-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['first:border-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "px-4 pt-3 text-xs font-medium uppercase tracking-wide" },
                ...{ class: (date === today.value ? 'text-primary' : 'text-muted') },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            (date === today.value ? 'Today · ' : '');
            (__VLS_unwrap(dayLabel, {})(date));
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
            const __VLS_59 = __VLS_tryAsConstant((list));
            for (const [e] of __VLS_vFor(__VLS_nonNull(__VLS_59))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (`${e.kind}-${e.title}`),
                });
                const __VLS_60 = CalendarEventItem;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                    // @ts-ignore
                    event: (e),
                }));
                const __VLS_62 = __VLS_61({
                    event: (e),
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                // @ts-ignore
                [today, today, selectedDay, selectedDay, agenda, agenda, dayLabel,];
            }
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(formatDate, {})(__VLS_unwrap(first, {})));
        (__VLS_unwrap(formatDate, {})(__VLS_unwrap(last, {})));
    }
    // @ts-ignore
    [formatDate, formatDate, first, last,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
