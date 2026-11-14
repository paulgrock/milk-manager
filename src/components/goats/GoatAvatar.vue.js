/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { goatName } from '@/lib/goats';
const { defineProps, } = {};
const props = defineProps();
const initials = computed(() => goatName(props.goat)
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase());
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
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UAvatar} */
    UAvatar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        src: (__VLS_ctx.url), alt: (__VLS_unwrap(goatName, {})(__VLS_ctx.goat)), text: (__VLS_unwrap(initials, {})), size: (__VLS_ctx.size ?? 'lg'), ...{ class: "shrink-0" }, ui: ({ root: 'rounded-[22%]' }),
    }));
    const __VLS_2 = __VLS_1({
        src: (__VLS_ctx.url),
        alt: (__VLS_unwrap(goatName, {})(__VLS_ctx.goat)),
        text: (__VLS_unwrap(initials, {})),
        size: (__VLS_ctx.size ?? 'lg'),
        ...{ class: "shrink-0" },
        ui: ({ root: 'rounded-[22%]' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    // @ts-ignore
    [url, goatName, goat, initials, size,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
