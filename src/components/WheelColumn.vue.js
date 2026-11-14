/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
// One column of an iOS-style picker wheel: a list that scrolls and snaps
// so the chosen item sits in the band in the middle. Scrolling, tapping an
// item or the arrow keys choose.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const { defineProps, defineModel, } = {};
const __VLS_export = ((__VLS_props, __VLS_ctx, __VLS_exposed, __VLS_setup = (async () => {
    const ROW = 36;
    const VISIBLE = 5;
    const PAD = ((VISIBLE - 1) / 2) * ROW;
    const props = defineProps();
    const model = defineModel({ required: true });
    const list = ref();
    const id = `wheel-${Math.random().toString(36).slice(2, 8)}`;
    const index = computed(() => Math.max(0, props.items.findIndex((i) => i.value === model.value)));
    function scrollTo(i, smooth) {
        list.value?.scrollTo({ top: i * ROW, behavior: smooth ? 'smooth' : 'instant' });
    }
    onMounted(() => nextTick(() => scrollTo(index.value, false)));
    watch(index, (i) => {
        if (list.value && Math.round(list.value.scrollTop / ROW) !== i)
            scrollTo(i, true);
    });
    // Chosen once scrolling settles, so flicking past items doesn't pick each one.
    let settle;
    function onScroll() {
        clearTimeout(settle);
        settle = setTimeout(() => {
            if (!list.value)
                return;
            const i = Math.min(props.items.length - 1, Math.max(0, Math.round(list.value.scrollTop / ROW)));
            if (props.items[i].value !== model.value)
                model.value = props.items[i].value;
        }, 120);
    }
    onBeforeUnmount(() => clearTimeout(settle));
    function choose(i) {
        const item = props.items[Math.min(props.items.length - 1, Math.max(0, i))];
        if (item)
            model.value = item.value;
    }
    function onKey(e) {
        const moves = { ArrowUp: index.value - 1, ArrowDown: index.value + 1, Home: 0, End: props.items.length - 1 };
        if (!(e.key in moves))
            return;
        e.preventDefault();
        choose(moves[e.key]);
    }
    let __VLS_modelEmit;
    const __VLS_ctx = {
        ...{},
        ...{},
        ...{},
        ...{},
    };
    let __VLS_components;
    let __VLS_intrinsics;
    let __VLS_directives;
    void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
    const __VLS_template = () => {
        __VLS_withDotValue(index, {});
        void {};
        /** @type {__VLS_StyleScopedClasses['wheel']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative" },
            ...{ style: ({ height: `${__VLS_unwrap(ROW, {}) * __VLS_unwrap(VISIBLE, {})}px` }) },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "pointer-events-none absolute inset-x-1 rounded-md bg-elevated" },
            ...{ style: ({ top: `${__VLS_unwrap(PAD, {})}px`, height: `${__VLS_unwrap(ROW, {})}px` }) },
        });
        /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-x-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onScroll: (onScroll) },
            ...{ onKeydown: (onKey) },
            ref: "list",
            role: "listbox",
            tabindex: "0",
            'aria-label': (__VLS_ctx.label),
            'aria-activedescendant': (`${__VLS_unwrap(id, {})}-${index.value}`),
            ...{ class: "wheel relative h-full overflow-y-auto snap-y snap-mandatory rounded-md focus-visible:outline-2 focus-visible:outline-primary" },
            ...{ style: ({ paddingBlock: `${__VLS_unwrap(PAD, {})}px` }) },
        });
        /** @type {__VLS_StyleScopedClasses['wheel']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['snap-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['snap-mandatory']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:outline-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus-visible:outline-primary']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((__VLS_ctx.items));
        for (const [item, i] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        return (choose(i));
                        // @ts-ignore
                        [ROW, ROW, VISIBLE, PAD, PAD, label, id, index, items,];
                    } },
                id: (`${__VLS_unwrap(id, {})}-${i}`),
                key: (item.value),
                role: "option",
                'aria-selected': (i === index.value),
                ...{ class: "snap-center flex items-center justify-center px-3 cursor-pointer select-none tabular-nums text-lg" },
                ...{ class: (i === index.value ? 'font-semibold text-highlighted' : 'text-muted') },
                ...{ style: ({ height: `${__VLS_unwrap(ROW, {})}px` }) },
            });
            /** @type {__VLS_StyleScopedClasses['snap-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            (item.label);
            // @ts-ignore
            [ROW, id, index, index,];
        }
        // @ts-ignore
        [];
        return {};
    };
    void [__VLS_template];
    return {};
})()) => ({}));
export default {};
