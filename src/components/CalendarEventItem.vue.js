/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const { defineProps, } = {};
const __VLS_props = defineProps();
const ICONS = {
    'kidding-due': 'i-lucide-baby',
    'dry-off': 'i-lucide-moon',
    heat: 'i-lucide-flame',
    'preg-check': 'i-lucide-test-tube',
    'care-due': 'i-lucide-clipboard-check',
    'withdrawal-ends': 'i-lucide-milk',
    'dim-305': 'i-lucide-flag',
    kidded: 'i-lucide-baby',
    bred: 'i-lucide-heart',
    'care-done': 'i-lucide-check',
    treated: 'i-lucide-pill',
    'test-day': 'i-lucide-flask-conical',
    'cheese-ready': 'i-lucide-cylinder',
    'chore-due': 'i-lucide-list-checks',
    'chore-done': 'i-lucide-check',
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(ICONS, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: (__VLS_ctx.event.href), ...{ class: "flex items-start gap-3 px-4 py-2 hover:bg-elevated/50" }, ...{ class: (__VLS_ctx.event.done ? 'text-muted' : '') },
    }));
    const __VLS_2 = __VLS_1({
        to: (__VLS_ctx.event.href),
        ...{ class: "flex items-start gap-3 px-4 py-2 hover:bg-elevated/50" },
        ...{ class: (__VLS_ctx.event.done ? 'text-muted' : '') },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
    UIcon;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        name: (ICONS.value[__VLS_ctx.event.kind]), ...{ class: "size-4 mt-0.5 shrink-0" }, ...{ class: (__VLS_ctx.event.overdue ? 'text-warning' : '') },
    }));
    const __VLS_8 = __VLS_7({
        name: (ICONS.value[__VLS_ctx.event.kind]),
        ...{ class: "size-4 mt-0.5 shrink-0" },
        ...{ class: (__VLS_ctx.event.overdue ? 'text-warning' : '') },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex-1 min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block" },
        ...{ class: (__VLS_ctx.event.done ? '' : 'font-medium') },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    (__VLS_ctx.event.title);
    if (__VLS_ctx.event.detail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block text-xs text-muted truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (__VLS_ctx.event.detail);
    }
    if (__VLS_ctx.event.overdue) {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            // @ts-ignore
            color: "warning", variant: "subtle", size: "sm",
        }));
        const __VLS_13 = __VLS_12({
            color: "warning",
            variant: "subtle",
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        var __VLS_14;
        const { default: __VLS_16 } = __VLS_nonNull(__VLS_14.slots);
        // @ts-ignore
        [event, event, event, event, event, event, event, event, event, ICONS,];
    }
    else if (__VLS_ctx.showDate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-muted shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        (__VLS_ctx.showDate);
    }
    // @ts-ignore
    [showDate, showDate,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
