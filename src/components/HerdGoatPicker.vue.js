/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useHerdGoats } from '@/composables/useGoats';
import { CURRENT_STATUSES, goatFullName } from '@/lib/goats';
const { defineProps, withDefaults, defineModel, } = {};
const props = withDefaults(defineProps(), { sex: 'doe', placeholder: undefined, includeFormer: false });
const model = defineModel({ required: true });
const { goats } = useHerdGoats();
const items = computed(() => (goats.data.value ?? [])
    .filter((g) => props.sex === 'any' || g.sex === props.sex)
    .filter((g) => (props.includeFormer ? g.status !== 'reference' : CURRENT_STATUSES.includes(g.status)))
    .map((g) => ({ label: g.barn_name ? `${g.barn_name} (${goatFullName(g)})` : goatFullName(g), value: g.id }))
    .sort((a, b) => a.label.localeCompare(b.label)));
let __VLS_modelEmit;
const __VLS_defaults = { sex: 'doe', placeholder: undefined, includeFormer: false };
void __VLS_defaults;
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
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(model, {});
    if (goats.value.isPending.value) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ...{ class: "h-8 w-full" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-8 w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    else {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
        UInputMenu;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ 'onUpdate:modelValue': {} }, modelValue: (model.value ?? undefined), items: (__VLS_unwrap(items, {})), valueKey: "value", placeholder: (__VLS_ctx.placeholder ?? (__VLS_ctx.sex === 'doe' ? 'Search does…' : 'Search goats…')), ...{ class: "w-full" },
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onUpdate:modelValue': {} },
            modelValue: (model.value ?? undefined),
            items: (__VLS_unwrap(items, {})),
            valueKey: "value",
            placeholder: (__VLS_ctx.placeholder ?? (__VLS_ctx.sex === 'doe' ? 'Search does…' : 'Search goats…')),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = {
            /** @type {typeof __VLS_10.'update:modelValue'} */
            'onUpdate:modelValue': ((v) => (model.value = v ?? null)),
        };
        void __VLS_11;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_8;
        var __VLS_9;
    }
    // @ts-ignore
    [goats, model, model, items, placeholder, sex,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
