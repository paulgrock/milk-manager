/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useHerdGoats } from '@/composables/useGoats';
import { STATUS_LABELS, goatFullName } from '@/lib/goats';
import QuickAddGoatModal from './QuickAddGoatModal.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const model = defineModel({ required: true });
const { goats } = useHerdGoats();
const items = computed(() => (goats.data.value ?? [])
    .filter((g) => g.sex === props.sex && g.id !== props.excludeId)
    .map((g) => ({
    label: goatFullName(g),
    value: g.id,
    suffix: g.status === 'active' ? undefined : STATUS_LABELS[g.status],
}))
    .sort((a, b) => a.label.localeCompare(b.label)));
const addOpen = ref(false);
const addName = ref('');
function onCreate(name) {
    addName.value = name;
    addOpen.value = true;
}
function onCreated(goat) {
    model.value = goat.id;
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
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(model, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    if (goats.value.isPending.value) {
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
        USkeleton;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            ...{ class: "h-8 flex-1" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "h-8 flex-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    }
    else {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
        UInputMenu;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ 'onUpdate:modelValue': {} }, ...{ 'onCreate': {} }, modelValue: (model.value ?? undefined), items: (__VLS_unwrap(items, {})), valueKey: "value", placeholder: (__VLS_ctx.placeholder ?? 'Search or add…'), createItem: true, ...{ class: "flex-1" },
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onUpdate:modelValue': {} },
            ...{ 'onCreate': {} },
            modelValue: (model.value ?? undefined),
            items: (__VLS_unwrap(items, {})),
            valueKey: "value",
            placeholder: (__VLS_ctx.placeholder ?? 'Search or add…'),
            createItem: true,
            ...{ class: "flex-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = {
            /** @type {typeof __VLS_10.'update:modelValue'} */
            'onUpdate:modelValue': ((v) => (model.value = v ?? null)),
        };
        void __VLS_11;
        const __VLS_12 = {
            /** @type {typeof __VLS_10.create} */
            onCreate: (onCreate),
        };
        void __VLS_12;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        var __VLS_8;
        var __VLS_9;
    }
    if (model.value) {
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "ghost", icon: "i-lucide-x", 'aria-label': "Clear",
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-x",
            'aria-label': "Clear",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = {
            /** @type {typeof __VLS_18.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(model.value))
                    throw 0;
                return (model.value = null);
                // @ts-ignore
                [goats, model, model, model, model, items, placeholder,];
            },
        };
        void __VLS_19;
        var __VLS_16;
        var __VLS_17;
    }
    const __VLS_20 = QuickAddGoatModal;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        ...{ 'onCreated': {} }, open: (__VLS_unwrap(addOpen, {})), sex: (__VLS_ctx.sex), initialName: (__VLS_unwrap(addName, {})),
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onCreated': {} },
        open: (__VLS_unwrap(addOpen, {})),
        sex: (__VLS_ctx.sex),
        initialName: (__VLS_unwrap(addName, {})),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_25;
    const __VLS_26 = {
        /** @type {typeof __VLS_25.created} */
        onCreated: (onCreated),
    };
    void __VLS_26;
    var __VLS_23;
    var __VLS_24;
    // @ts-ignore
    [addOpen, sex, addName,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
