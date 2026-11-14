/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useBreedingMutations } from '@/composables/useBreeding';
import { todayISO } from '@/lib/dates';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { saveCheck, removeCheck } = useBreedingMutations();
const form = reactive({ checked_on: todayISO(), method: 'blood', result: 'pregnant', notes: '' });
watch(open, (isOpen) => {
    if (isOpen) {
        Object.assign(form, {
            checked_on: props.check?.checked_on ?? todayISO(),
            method: props.check?.method ?? 'blood',
            result: props.check?.result ?? 'pregnant',
            notes: props.check?.notes ?? '',
        });
    }
});
const methodOptions = [
    { label: 'Blood test', value: 'blood' },
    { label: 'Ultrasound', value: 'ultrasound' },
    { label: 'Observation', value: 'observation' },
];
const resultOptions = [
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Open (not pregnant)', value: 'open' },
    { label: 'Unsure', value: 'unsure' },
];
async function submit() {
    try {
        await saveCheck.mutateAsync({
            id: props.check?.id,
            values: { breeding_id: props.breedingId, checked_on: form.checked_on, method: form.method, result: form.result, notes: form.notes.trim() || null },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save check', description: e.message });
    }
}
async function remove() {
    await removeCheck.mutateAsync(props.check.id);
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
    __VLS_withDotValue(saveCheck, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.check ? 'Edit pregnancy check' : 'Pregnancy check'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.check ? 'Edit pregnancy check' : 'Pregnancy check'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "check-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Checked on", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Checked on",
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
            modelValue: (form.value.checked_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.checked_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, check, form,];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Method",
        }));
        const __VLS_20 = __VLS_19({
            label: "Method",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.method), items: (__VLS_unwrap(methodOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.method),
            items: (__VLS_unwrap(methodOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, methodOptions,];
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            label: "Result",
        }));
        const __VLS_31 = __VLS_30({
            label: "Result",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.URadioGroup} */
        URadioGroup;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.result), items: (__VLS_unwrap(resultOptions, {})),
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.result),
            items: (__VLS_unwrap(resultOptions, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        // @ts-ignore
        [form, resultOptions,];
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_42 = __VLS_41({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            modelValue: (form.value.notes), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.notes),
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_51 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.check) {
            let __VLS_52;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_54 = __VLS_53({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            let __VLS_57;
            const __VLS_58 = {
                /** @type {typeof __VLS_57.click} */
                onClick: (remove),
            };
            void __VLS_58;
            var __VLS_55;
            var __VLS_56;
            const { default: __VLS_59 } = __VLS_nonNull(__VLS_55.slots);
            // @ts-ignore
            [check,];
        }
        let __VLS_60;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_62 = __VLS_61({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_65;
        const __VLS_66 = {
            /** @type {typeof __VLS_65.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_66;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_63;
        var __VLS_64;
        const { default: __VLS_67 } = __VLS_nonNull(__VLS_63.slots);
        // @ts-ignore
        [];
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            // @ts-ignore
            type: "submit", form: "check-form", loading: (saveCheck.value.isPending.value),
        }));
        const __VLS_70 = __VLS_69({
            type: "submit",
            form: "check-form",
            loading: (saveCheck.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        var __VLS_71;
        const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
        // @ts-ignore
        [saveCheck,];
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
