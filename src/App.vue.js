/// <reference types="../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { useAuth } from '@/composables/useAuth';
useRegisterSW({ immediate: true });
// The app opens from the saved session; if checking it later finds the
// person signed out (or their access removed), back to sign-in.
const { user } = useAuth();
const route = useRoute();
const router = useRouter();
watch(user, (u) => {
    if (!u && !route.meta.public)
        void router.replace({ path: '/login', query: route.fullPath === '/' ? {} : { redirect: route.fullPath } });
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UApp | typeof __VLS_components.UApp} */
    UApp;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.RouterView} */
    RouterView;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    // @ts-ignore
    }));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
