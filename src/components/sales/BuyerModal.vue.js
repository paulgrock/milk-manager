/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useSalesMutations } from '@/composables/useSales';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { saveBuyer, removeBuyer } = useSalesMutations();
const form = reactive({ name: '', phone: '', email: '', town: '', notes: '' });
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const b = props.buyer;
    Object.assign(form, { name: b?.name ?? '', phone: b?.phone ?? '', email: b?.email ?? '', town: b?.town ?? '', notes: b?.notes ?? '' });
});
const blankToNull = (s) => s.trim() || null;
async function submit() {
    if (!form.name.trim())
        return toast.add({ color: 'error', title: 'Enter a name' });
    try {
        await saveBuyer.mutateAsync({
            id: props.buyer?.id,
            values: { name: form.name.trim(), phone: blankToNull(form.phone), email: blankToNull(form.email), town: blankToNull(form.town), notes: blankToNull(form.notes) },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save adopter', description: e.message });
    }
}
async function remove() {
    try {
        await removeBuyer.mutateAsync(props.buyer.id);
        open.value = false;
    }
    catch (e) {
        const message = e.message;
        toast.add({ color: 'error', title: 'Could not delete', description: message.includes('foreign key') ? 'They have reservations or adoptions.' : message });
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
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveBuyer, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.buyer ? 'Edit adopter' : 'New adopter'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.buyer ? 'Edit adopter' : 'New adopter'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "buyer-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Name", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Name",
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
            modelValue: (form.value.name), maxlength: "100", ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.name),
            maxlength: "100",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, buyer, form,];
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
            label: "Phone",
        }));
        const __VLS_20 = __VLS_19({
            label: "Phone",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.phone), type: "tel", maxlength: "40", ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.phone),
            type: "tel",
            maxlength: "40",
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
            label: "Email",
        }));
        const __VLS_31 = __VLS_30({
            label: "Email",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.email), type: "email", maxlength: "200", ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.email),
            type: "email",
            maxlength: "200",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            label: "Town",
        }));
        const __VLS_42 = __VLS_41({
            label: "Town",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            modelValue: (form.value.town), maxlength: "100", ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.town),
            maxlength: "100",
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
            label: "Notes",
        }));
        const __VLS_53 = __VLS_52({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_59 = __VLS_58({
            modelValue: (form.value.notes),
            rows: (2),
            maxlength: "10000",
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
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.buyer) {
            let __VLS_63;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_65 = __VLS_64({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_64));
            let __VLS_68;
            const __VLS_69 = {
                /** @type {typeof __VLS_68.click} */
                onClick: (remove),
            };
            void __VLS_69;
            var __VLS_66;
            var __VLS_67;
            const { default: __VLS_70 } = __VLS_nonNull(__VLS_66.slots);
            // @ts-ignore
            [buyer,];
        }
        let __VLS_71;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_73 = __VLS_72({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        let __VLS_76;
        const __VLS_77 = {
            /** @type {typeof __VLS_76.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_77;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_74;
        var __VLS_75;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_74.slots);
        // @ts-ignore
        [];
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            // @ts-ignore
            type: "submit", form: "buyer-form", loading: (saveBuyer.value.isPending.value),
        }));
        const __VLS_81 = __VLS_80({
            type: "submit",
            form: "buyer-form",
            loading: (saveBuyer.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        var __VLS_82;
        const { default: __VLS_84 } = __VLS_nonNull(__VLS_82.slots);
        // @ts-ignore
        [saveBuyer,];
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
