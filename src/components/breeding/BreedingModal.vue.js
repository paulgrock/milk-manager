/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useBreedingMutations } from '@/composables/useBreeding';
import { formatDate, todayISO } from '@/lib/dates';
import { METHOD_LABELS, dueWindow } from '@/lib/breeding';
import DoePicker from '@/components/HerdGoatPicker.vue';
import GoatPicker from '@/components/goats/GoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { saveBreeding, removeBreeding } = useBreedingMutations();
const form = reactive({
    doe_id: null,
    buck_id: null,
    method: 'hand',
    bred_on: todayISO(),
    exposure_end: '',
    fee: '',
    notes: '',
});
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const b = props.breeding;
    Object.assign(form, {
        doe_id: b?.doe_id ?? props.goatId ?? null,
        buck_id: b?.buck_id ?? null,
        method: b?.method ?? 'hand',
        bred_on: b?.bred_on ?? props.date ?? todayISO(),
        exposure_end: b?.exposure_end ?? '',
        fee: b?.service_fee_cents != null ? (b.service_fee_cents / 100).toFixed(2) : '',
        notes: b?.notes ?? '',
    });
});
const methodOptions = Object.entries(METHOD_LABELS).map(([value, label]) => ({ label, value }));
const due = computed(() => form.bred_on ? dueWindow({ bred_on: form.bred_on, exposure_end: form.method === 'pen' ? form.exposure_end || null : null }) : null);
async function submit() {
    if (!form.doe_id)
        return toast.add({ color: 'error', title: 'Pick a doe' });
    const fee = form.fee.trim() ? Math.round(Number(form.fee) * 100) : null;
    if (fee !== null && (!Number.isFinite(fee) || fee < 0))
        return toast.add({ color: 'error', title: 'Fee must be an amount like 50 or 75.00' });
    try {
        await saveBreeding.mutateAsync({
            id: props.breeding?.id,
            values: {
                doe_id: form.doe_id,
                buck_id: form.buck_id,
                method: form.method,
                bred_on: form.bred_on,
                exposure_end: form.method === 'pen' && form.exposure_end ? form.exposure_end : null,
                service_fee_cents: fee,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save breeding', description: e.message });
    }
}
async function remove() {
    await removeBreeding.mutateAsync(props.breeding.id);
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
    __VLS_withDotValue(due, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveBreeding, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.breeding ? 'Edit breeding' : 'Record a breeding'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.breeding ? 'Edit breeding' : 'Record a breeding'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "breeding-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        if (!__VLS_ctx.goatId && !__VLS_ctx.breeding) {
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
                modelValue: (form.value.doe_id),
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (form.value.doe_id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            // @ts-ignore
            [open, breeding, breeding, goatId, form,];
        }
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Buck", hint: "Type a name to add an outside buck",
        }));
        const __VLS_20 = __VLS_19({
            label: "Buck",
            hint: "Type a name to add an outside buck",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        const __VLS_24 = GoatPicker;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.buck_id), sex: "buck",
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.buck_id),
            sex: "buck",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            label: "Method",
        }));
        const __VLS_31 = __VLS_30({
            label: "Method",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.method), items: (__VLS_unwrap(methodOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.method),
            items: (__VLS_unwrap(methodOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, methodOptions,];
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            label: (form.value.method === 'pen' ? 'Buck put in' : 'Bred on'), required: true,
        }));
        const __VLS_42 = __VLS_41({
            label: (form.value.method === 'pen' ? 'Buck put in' : 'Bred on'),
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            modelValue: (form.value.bred_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.bred_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form,];
        if (form.value.method === 'pen') {
            let __VLS_51;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                // @ts-ignore
                label: "Buck taken out",
            }));
            const __VLS_53 = __VLS_52({
                label: "Buck taken out",
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            var __VLS_54;
            const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
            let __VLS_57;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
                // @ts-ignore
                modelValue: (form.value.exposure_end), type: "date", min: (form.value.bred_on), ...{ class: "w-full" },
            }));
            const __VLS_59 = __VLS_58({
                modelValue: (form.value.exposure_end),
                type: "date",
                min: (form.value.bred_on),
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [form, form, form,];
        }
        let __VLS_62;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            // @ts-ignore
            label: "Stud fee", hint: "$",
        }));
        const __VLS_64 = __VLS_63({
            label: "Stud fee",
            hint: "$",
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        var __VLS_65;
        const { default: __VLS_67 } = __VLS_nonNull(__VLS_65.slots);
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            // @ts-ignore
            modelValue: (form.value.fee), inputmode: "decimal", placeholder: "0.00", ...{ class: "w-full" },
        }));
        const __VLS_70 = __VLS_69({
            modelValue: (form.value.fee),
            inputmode: "decimal",
            placeholder: "0.00",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_75 = __VLS_74({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        var __VLS_76;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_76.slots);
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_81 = __VLS_80({
            modelValue: (form.value.notes),
            rows: (2),
            autoresize: true,
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        if (due.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "text-default" },
            });
            /** @type {__VLS_StyleScopedClasses['text-default']} */ ;
            (__VLS_unwrap(formatDate, {})(due.value.expected));
            (__VLS_unwrap(formatDate, {})(due.value.earliest));
            (__VLS_unwrap(formatDate, {})(due.value.latest));
        }
        // @ts-ignore
        [due, due, due, due, formatDate, formatDate, formatDate,];
    }
    {
        const { footer: __VLS_84 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.breeding) {
            let __VLS_85;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_87 = __VLS_86({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            let __VLS_90;
            const __VLS_91 = {
                /** @type {typeof __VLS_90.click} */
                onClick: (remove),
            };
            void __VLS_91;
            var __VLS_88;
            var __VLS_89;
            const { default: __VLS_92 } = __VLS_nonNull(__VLS_88.slots);
            // @ts-ignore
            [breeding,];
        }
        let __VLS_93;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_95 = __VLS_94({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        let __VLS_98;
        const __VLS_99 = {
            /** @type {typeof __VLS_98.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_99;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_96;
        var __VLS_97;
        const { default: __VLS_100 } = __VLS_nonNull(__VLS_96.slots);
        // @ts-ignore
        [];
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            // @ts-ignore
            type: "submit", form: "breeding-form", loading: (saveBreeding.value.isPending.value),
        }));
        const __VLS_103 = __VLS_102({
            type: "submit",
            form: "breeding-form",
            loading: (saveBreeding.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        var __VLS_104;
        const { default: __VLS_106 } = __VLS_nonNull(__VLS_104.slots);
        // @ts-ignore
        [saveBreeding,];
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
