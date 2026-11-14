/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHealthMutations } from '@/composables/useHealth';
import { formatDate, todayISO } from '@/lib/dates';
import { ROUTE_LABELS, withholdThrough } from '@/lib/health';
import HerdGoatPicker from '@/components/HerdGoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { saveTreatment, removeTreatment } = useHealthMutations();
const form = reactive({
    goat_id: null,
    started_on: todayISO(),
    ended_on: '',
    reason: '',
    medication: '',
    dose: '',
    route: 'none',
    lot_number: '',
    milk_withdrawal_days: 0,
    notes: '',
});
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const t = props.treatment;
    Object.assign(form, {
        goat_id: t?.goat_id ?? props.goatId ?? null,
        started_on: t?.started_on ?? todayISO(),
        ended_on: t?.ended_on ?? '',
        reason: t?.reason ?? '',
        medication: t?.medication ?? '',
        dose: t?.dose ?? '',
        route: t?.route ?? 'none',
        lot_number: t?.lot_number ?? '',
        milk_withdrawal_days: t?.milk_withdrawal_days ?? 0,
        notes: t?.notes ?? '',
    });
});
const routeOptions = [{ label: 'Not recorded', value: 'none' }, ...Object.entries(ROUTE_LABELS).map(([value, label]) => ({ label, value }))];
const through = computed(() => withholdThrough({ started_on: form.started_on, ended_on: form.ended_on || null, milk_withdrawal_days: Number(form.milk_withdrawal_days) || 0 }));
async function submit() {
    if (!form.goat_id)
        return toast.add({ color: 'error', title: 'Pick a goat' });
    try {
        await saveTreatment.mutateAsync({
            id: props.treatment?.id,
            values: {
                goat_id: form.goat_id,
                started_on: form.started_on,
                ended_on: form.ended_on || null,
                reason: form.reason.trim() || null,
                medication: form.medication.trim(),
                dose: form.dose.trim() || null,
                route: form.route === 'none' ? null : form.route,
                lot_number: form.lot_number.trim() || null,
                milk_withdrawal_days: Number(form.milk_withdrawal_days) || 0,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save treatment', description: e.message });
    }
}
async function remove() {
    await removeTreatment.mutateAsync(props.treatment.id);
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
    __VLS_withDotValue(through, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveTreatment, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.treatment ? 'Edit treatment' : 'Add treatment'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.treatment ? 'Edit treatment' : 'Add treatment'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "treatment-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        if (!__VLS_ctx.goatId && !__VLS_ctx.treatment) {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                label: "Goat", required: true,
            }));
            const __VLS_9 = __VLS_8({
                label: "Goat",
                required: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            var __VLS_10;
            const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
            const __VLS_13 = HerdGoatPicker;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                // @ts-ignore
                modelValue: (form.value.goat_id), sex: "any",
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (form.value.goat_id),
                sex: "any",
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            // @ts-ignore
            [open, treatment, treatment, goatId, form,];
        }
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
            label: "Medication", required: true, ...{ class: "col-span-2" },
        }));
        const __VLS_20 = __VLS_19({
            label: "Medication",
            required: true,
            ...{ class: "col-span-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.medication), required: true, maxlength: "120", ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.medication),
            required: true,
            maxlength: "120",
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
            label: "For", ...{ class: "col-span-2" },
        }));
        const __VLS_31 = __VLS_30({
            label: "For",
            ...{ class: "col-span-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.reason), maxlength: "200", placeholder: "Mastitis, cocci, injury…", ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.reason),
            maxlength: "200",
            placeholder: "Mastitis, cocci, injury…",
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
            label: "First dose", required: true,
        }));
        const __VLS_42 = __VLS_41({
            label: "First dose",
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
            modelValue: (form.value.started_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.started_on),
            type: "date",
            required: true,
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
            label: "Last dose", hint: "If more than one",
        }));
        const __VLS_53 = __VLS_52({
            label: "Last dose",
            hint: "If more than one",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            modelValue: (form.value.ended_on), type: "date", min: (form.value.started_on), ...{ class: "w-full" },
        }));
        const __VLS_59 = __VLS_58({
            modelValue: (form.value.ended_on),
            type: "date",
            min: (form.value.started_on),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form,];
        let __VLS_62;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            // @ts-ignore
            label: "Dose",
        }));
        const __VLS_64 = __VLS_63({
            label: "Dose",
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        var __VLS_65;
        const { default: __VLS_67 } = __VLS_nonNull(__VLS_65.slots);
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            // @ts-ignore
            modelValue: (form.value.dose), maxlength: "60", placeholder: "5 ml", ...{ class: "w-full" },
        }));
        const __VLS_70 = __VLS_69({
            modelValue: (form.value.dose),
            maxlength: "60",
            placeholder: "5 ml",
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
            label: "Given",
        }));
        const __VLS_75 = __VLS_74({
            label: "Given",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        var __VLS_76;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_76.slots);
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            // @ts-ignore
            modelValue: (form.value.route), items: (__VLS_unwrap(routeOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_81 = __VLS_80({
            modelValue: (form.value.route),
            items: (__VLS_unwrap(routeOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, routeOptions,];
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            // @ts-ignore
            label: "Lot #",
        }));
        const __VLS_86 = __VLS_85({
            label: "Lot #",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        var __VLS_87;
        const { default: __VLS_89 } = __VLS_nonNull(__VLS_87.slots);
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            // @ts-ignore
            modelValue: (form.value.lot_number), maxlength: "60", ...{ class: "w-full" },
        }));
        const __VLS_92 = __VLS_91({
            modelValue: (form.value.lot_number),
            maxlength: "60",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_95;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            // @ts-ignore
            label: "Milk withdrawal (days)",
        }));
        const __VLS_97 = __VLS_96({
            label: "Milk withdrawal (days)",
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        var __VLS_98;
        const { default: __VLS_100 } = __VLS_nonNull(__VLS_98.slots);
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            // @ts-ignore
            modelValue: (form.value.milk_withdrawal_days), min: (0), max: (365), ...{ class: "w-full" },
        }));
        const __VLS_103 = __VLS_102({
            modelValue: (form.value.milk_withdrawal_days),
            min: (0),
            max: (365),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        if (through.value) {
            let __VLS_106;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
                // @ts-ignore
                color: "warning", variant: "subtle", icon: "i-lucide-milk-off", title: (`Withhold milk through ${__VLS_unwrap(formatDate, {})(through.value)}`),
            }));
            const __VLS_108 = __VLS_107({
                color: "warning",
                variant: "subtle",
                icon: "i-lucide-milk-off",
                title: (`Withhold milk through ${__VLS_unwrap(formatDate, {})(through.value)}`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        }
        let __VLS_111;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_113 = __VLS_112({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        var __VLS_114;
        const { default: __VLS_116 } = __VLS_nonNull(__VLS_114.slots);
        let __VLS_117;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_119 = __VLS_118({
            modelValue: (form.value.notes),
            rows: (2),
            autoresize: true,
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, through, through, formatDate,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_122 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.treatment) {
            let __VLS_123;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_125 = __VLS_124({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_124));
            let __VLS_128;
            const __VLS_129 = {
                /** @type {typeof __VLS_128.click} */
                onClick: (remove),
            };
            void __VLS_129;
            var __VLS_126;
            var __VLS_127;
            const { default: __VLS_130 } = __VLS_nonNull(__VLS_126.slots);
            // @ts-ignore
            [treatment,];
        }
        let __VLS_131;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_133 = __VLS_132({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_132));
        let __VLS_136;
        const __VLS_137 = {
            /** @type {typeof __VLS_136.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_137;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_134;
        var __VLS_135;
        const { default: __VLS_138 } = __VLS_nonNull(__VLS_134.slots);
        // @ts-ignore
        [];
        let __VLS_139;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
            // @ts-ignore
            type: "submit", form: "treatment-form", loading: (saveTreatment.value.isPending.value),
        }));
        const __VLS_141 = __VLS_140({
            type: "submit",
            form: "treatment-form",
            loading: (saveTreatment.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
        var __VLS_142;
        const { default: __VLS_144 } = __VLS_nonNull(__VLS_142.slots);
        // @ts-ignore
        [saveTreatment,];
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
