/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useOnline } from '@vueuse/core';
import { useHerd } from '@/composables/useHerd';
const { herd, herdId, memberships, selectHerd, isOwner } = useHerd();
const online = useOnline();
const allNav = [
    { label: 'Today', icon: 'i-lucide-sun', to: '/', exact: true },
    { label: 'Goats', icon: 'i-lucide-list', to: '/goats' },
    { label: 'Milk', icon: 'i-lucide-milk', to: '/milk' },
    { label: 'Cheese', icon: 'i-lucide-cylinder', to: '/cheese' },
    { label: 'Breeding', icon: 'i-lucide-heart', to: '/breeding' },
    { label: 'Health', icon: 'i-lucide-stethoscope', to: '/health' },
    { label: 'Chores', icon: 'i-lucide-list-checks', to: '/chores' },
    { label: 'Calendar', icon: 'i-lucide-calendar', to: '/calendar' },
    { label: 'Finances', icon: 'i-lucide-wallet', to: '/finances' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
];
// Finances are owners-only, so helpers don't get the menu item.
const nav = computed(() => allNav.filter((item) => item.to !== '/finances' || isOwner.value));
const herdOptions = computed(() => (memberships.data.value ?? []).map((m) => ({ label: m.herd.name, value: m.herd.id })));
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(herd, {});
    __VLS_withDotValue(herdOptions, {});
    __VLS_withDotValue(online, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-h-dvh flex flex-col" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-dvh']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-default/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mx-auto max-w-5xl px-4 h-14 flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (herd.value?.logo ?? '/favicon.svg'),
        alt: (herd.value?.logo ? `${herd.value.name} logo` : ''),
        ...{ class: "size-8 rounded-[22%] object-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['size-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[22%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    if (herdOptions.value.length > 1) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ...{ 'onUpdate:modelValue': {} }, modelValue: (__VLS_unwrap(herdId, {})), items: (herdOptions.value), variant: "ghost", ...{ class: "font-semibold" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onUpdate:modelValue': {} },
            modelValue: (__VLS_unwrap(herdId, {})),
            items: (herdOptions.value),
            variant: "ghost",
            ...{ class: "font-semibold" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = {
            /** @type {typeof __VLS_5.'update:modelValue'} */
            'onUpdate:modelValue': ((id) => __VLS_unwrap(selectHerd, {})(String(id))),
        };
        void __VLS_6;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        var __VLS_3;
        var __VLS_4;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-semibold truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (herd.value?.name);
    }
    if (!online.value) {
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            ...{ class: "ml-auto" }, color: "warning", variant: "subtle", icon: "i-lucide-wifi-off",
        }));
        const __VLS_9 = __VLS_8({
            ...{ class: "ml-auto" },
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-wifi-off",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        // @ts-ignore
        [herd, herd, herd, herd, herdOptions, herdOptions, herdId, selectHerd, online,];
    }
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.UNavigationMenu} */
    UNavigationMenu;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        // @ts-ignore
        items: (__VLS_unwrap(nav, {})), ...{ class: "mx-auto max-w-5xl px-2 overflow-x-auto" }, ui: ({ list: 'w-max', item: 'shrink-0', linkLabel: 'overflow-visible' }),
    }));
    const __VLS_15 = __VLS_14({
        items: (__VLS_unwrap(nav, {})),
        ...{ class: "mx-auto max-w-5xl px-2 overflow-x-auto" },
        ui: ({ list: 'w-max', item: 'shrink-0', linkLabel: 'overflow-visible' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "flex-1 mx-auto w-full max-w-5xl p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.RouterView} */
    RouterView;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    // @ts-ignore
    }));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    // @ts-ignore
    [nav,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
