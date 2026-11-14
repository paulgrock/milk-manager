/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useBreedingMutations } from '@/composables/useBreeding';
import { todayISO } from '@/lib/dates';
import DoePicker from '@/components/HerdGoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { saveHeat, removeHeat } = useBreedingMutations();
const form = reactive({ goat_id: null, observed_on: todayISO(), signs: '' });
watch(open, (isOpen) => {
    if (isOpen) {
        Object.assign(form, {
            goat_id: props.heat?.goat_id ?? props.goatId ?? null,
            observed_on: props.heat?.observed_on ?? todayISO(),
            signs: props.heat?.signs ?? '',
        });
    }
});
async function submit() {
    if (!form.goat_id)
        return toast.add({ color: 'error', title: 'Pick a doe' });
    try {
        await saveHeat.mutateAsync({
            id: props.heat?.id,
            values: { goat_id: form.goat_id, observed_on: form.observed_on, signs: form.signs.trim() || null },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save heat', description: e.message });
    }
}
async function remove() {
    await removeHeat.mutateAsync(props.heat.id);
    open.value = false;
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
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveHeat, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.heat ? 'Edit heat' : 'Log a heat'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.heat ? 'Edit heat' : 'Log a heat'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "heat-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        if (!__VLS_ctx.goatId && !__VLS_ctx.heat) {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                label: "Doe", required: true,
            }));
            const __VLS_9 = __VLS_8({
                label: "Doe",
                required: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            var __VLS_10;
            const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
            const __VLS_13 = DoePicker;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                // @ts-ignore
                modelValue: (form.value.goat_id),
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (form.value.goat_id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            // @ts-ignore
            [open, heat, heat, goatId, form,];
        }
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Seen in heat on", required: true,
        }));
        const __VLS_20 = __VLS_19({
            label: "Seen in heat on",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.observed_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.observed_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            label: "Signs", hint: "Flagging, mucus, bleating…",
        }));
        const __VLS_31 = __VLS_30({
            label: "Signs",
            hint: "Flagging, mucus, bleating…",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.signs), maxlength: "500", ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.signs),
            maxlength: "500",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_40 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.heat) {
            let __VLS_41;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_43 = __VLS_42({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            let __VLS_46;
            const __VLS_47 = {
                /** @type {typeof __VLS_46.click} */
                onClick: (remove),
            };
            void __VLS_47;
            var __VLS_44;
            var __VLS_45;
            const { default: __VLS_48 } = __VLS_nonNull(__VLS_44.slots);
            // @ts-ignore
            [heat,];
        }
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_54;
        const __VLS_55 = {
            /** @type {typeof __VLS_54.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_55;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_52;
        var __VLS_53;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_52.slots);
        // @ts-ignore
        [];
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            type: "submit", form: "heat-form", loading: (saveHeat.value.isPending.value),
        }));
        const __VLS_59 = __VLS_58({
            type: "submit",
            form: "heat-form",
            loading: (saveHeat.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        var __VLS_60;
        const { default: __VLS_62 } = __VLS_nonNull(__VLS_60.slots);
        // @ts-ignore
        [saveHeat,];
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
