/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useGoatMutations } from '@/composables/useGoats';
import { SEX_LABELS } from '@/lib/goats';
const { defineProps, defineEmits, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const emit = defineEmits();
const toast = useToast();
const { saveGoat } = useGoatMutations();
const form = reactive({ title_prefix: '', registered_name: '', title_suffix: '', registration_number: '', breed: '' });
watch(open, (isOpen) => {
    if (isOpen) {
        Object.assign(form, { title_prefix: '', registered_name: props.initialName, title_suffix: '', registration_number: '', breed: '' });
    }
});
async function submit() {
    try {
        const goat = await saveGoat.mutateAsync({
            values: {
                sex: props.sex,
                status: 'reference',
                title_prefix: form.title_prefix.trim() || null,
                registered_name: form.registered_name.trim(),
                title_suffix: form.title_suffix.trim() || null,
                registration_number: form.registration_number.trim() || null,
                breed: form.breed.trim() || null,
            },
        });
        emit('created', goat);
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not add goat', description: e.message });
    }
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
    __VLS_withDotValue(SEX_LABELS, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveGoat, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (`Add an outside ${SEX_LABELS.value[__VLS_ctx.sex].toLowerCase()}`), description: "Saved as a reference goat so the pedigree can link to it. You can fill in its own parents later.",
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (`Add an outside ${SEX_LABELS.value[__VLS_ctx.sex].toLowerCase()}`),
        description: "Saved as a reference goat so the pedigree can link to it. You can fill in its own parents later.",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "quick-add-goat",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Registered name", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Registered name",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (form.value.registered_name), required: true, autofocus: true, ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.registered_name),
            required: true,
            autofocus: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, SEX_LABELS, sex, form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Title before", hint: "e.g. GCH",
        }));
        const __VLS_20 = __VLS_19({
            label: "Title before",
            hint: "e.g. GCH",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.title_prefix), ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.title_prefix),
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
            label: "Title after", hint: "e.g. +*B",
        }));
        const __VLS_31 = __VLS_30({
            label: "Title after",
            hint: "e.g. +*B",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.title_suffix), ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.title_suffix),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            label: "Registration #",
        }));
        const __VLS_42 = __VLS_41({
            label: "Registration #",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            modelValue: (form.value.registration_number), ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.registration_number),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            // @ts-ignore
            label: "Breed",
        }));
        const __VLS_53 = __VLS_52({
            label: "Breed",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            modelValue: (form.value.breed), ...{ class: "w-full" },
        }));
        const __VLS_59 = __VLS_58({
            modelValue: (form.value.breed),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_62 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-end gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "ghost",
        }));
        const __VLS_65 = __VLS_64({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_68;
        const __VLS_69 = {
            /** @type {typeof __VLS_68.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_69;
        var __VLS_66;
        var __VLS_67;
        const { default: __VLS_70 } = __VLS_nonNull(__VLS_66.slots);
        // @ts-ignore
        [];
        let __VLS_71;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            // @ts-ignore
            type: "submit", form: "quick-add-goat", loading: (saveGoat.value.isPending.value),
        }));
        const __VLS_73 = __VLS_72({
            type: "submit",
            form: "quick-add-goat",
            loading: (saveGoat.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        var __VLS_74;
        const { default: __VLS_76 } = __VLS_nonNull(__VLS_74.slots);
        // @ts-ignore
        [saveGoat,];
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
