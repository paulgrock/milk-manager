/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useCheeseData, useCheeseMutations } from '@/composables/useCheese';
import { formatDate, todayISO } from '@/lib/dates';
import { MILK_TREATMENT_LABELS, agingLabel, parseGallons, readyDate } from '@/lib/cheese';
const { defineProps, defineEmits, defineModel, } = {};
const props = defineProps();
const emit = defineEmits();
const open = defineModel('open', { required: true });
const toast = useToast();
const { data } = useCheeseData();
const { saveMake, removeMake, saveType } = useCheeseMutations();
const form = reactive({
    typeId: undefined,
    madeOn: todayISO(),
    readyOn: todayISO(),
    gallons: '',
    treatment: undefined,
    notes: '',
    finished: false,
});
// The ready date follows the type and made date until it's changed by hand.
const readyEdited = ref(false);
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const m = props.make;
    Object.assign(form, {
        typeId: m?.cheese_type_id ?? props.typeId,
        madeOn: m?.made_on ?? todayISO(),
        readyOn: m?.ready_on ?? todayISO(),
        gallons: m?.milk_gallons != null ? String(Number(m.milk_gallons)) : '',
        // A new make starts with the milk the last one used; most farms always do the same.
        treatment: ((m ? m.milk_treatment : data.value.makes[0]?.milk_treatment) ?? undefined),
        notes: m?.notes ?? '',
        finished: !!m?.finished_on,
    });
    readyEdited.value = !!m;
    newType.value = undefined;
    // A cheese picked for us may be the same as last time, so the watch below wouldn't fire.
    const picked = !m && data.value.types.find((t) => t.id === form.typeId);
    if (picked)
        form.readyOn = readyDate(form.madeOn, picked.aging_days);
});
const types = computed(() => data.value.types.filter((t) => !t.hidden || t.id === form.typeId));
const typeItems = computed(() => types.value.map((t) => ({ label: t.name, value: t.id, suffix: agingLabel(t.aging_days) })));
const type = computed(() => data.value.types.find((t) => t.id === form.typeId));
const treatmentItems = Object.entries(MILK_TREATMENT_LABELS).map(([value, label]) => ({ value, label }));
watch([() => form.typeId, () => form.madeOn], () => {
    if (!readyEdited.value && type.value && form.madeOn)
        form.readyOn = readyDate(form.madeOn, type.value.aging_days);
});
// A cheese that isn't in the list yet: typed into the dropdown, added here.
const newType = ref();
function onCreate(name) {
    newType.value = { name: name.trim(), days: 0 };
}
async function addType() {
    if (!newType.value?.name)
        return;
    try {
        const created = await saveType.mutateAsync({
            values: { name: newType.value.name, aging_days: newType.value.days, sort_order: data.value.types.length + 1 },
        });
        form.typeId = created.id;
        readyEdited.value = false;
        form.readyOn = readyDate(form.madeOn, created.aging_days);
        newType.value = undefined;
    }
    catch (e) {
        const message = e.message;
        toast.add({ color: 'error', title: 'Could not add cheese', description: message.includes('duplicate') ? 'That cheese is already in the list.' : message });
    }
}
async function submit() {
    if (!form.typeId)
        return toast.add({ color: 'error', title: 'Pick the cheese' });
    if (form.readyOn < form.madeOn)
        return toast.add({ color: 'error', title: 'Ready date can’t be before the day it was made' });
    const gallons = parseGallons(form.gallons);
    if (!gallons.ok)
        return toast.add({ color: 'error', title: gallons.message });
    try {
        await saveMake.mutateAsync({
            id: props.make?.id,
            values: {
                cheese_type_id: form.typeId,
                made_on: form.madeOn,
                ready_on: form.readyOn,
                milk_gallons: gallons.value,
                milk_treatment: form.treatment ?? null,
                notes: form.notes.trim() || null,
                finished_on: form.finished ? (props.make?.finished_on ?? todayISO()) : null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save', description: e.message });
    }
}
async function onDelete() {
    await removeMake.mutateAsync(props.make.id);
    open.value = false;
    emit('deleted');
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
    __VLS_withDotValue(newType, {});
    __VLS_withDotValue(saveType, {});
    __VLS_withDotValue(type, {});
    __VLS_withDotValue(readyEdited, {});
    __VLS_withDotValue(removeMake, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveMake, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.make ? 'Edit make' : 'New make'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.make ? 'Edit make' : 'New make'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "make-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Cheese", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Cheese",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
        UInputMenu;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            ...{ 'onCreate': {} }, modelValue: (form.value.typeId), items: (__VLS_unwrap(typeItems, {})), valueKey: "value", placeholder: "Pick or type a new one…", createItem: true, openOnClick: true, ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            ...{ 'onCreate': {} },
            modelValue: (form.value.typeId),
            items: (__VLS_unwrap(typeItems, {})),
            valueKey: "value",
            placeholder: "Pick or type a new one…",
            createItem: true,
            openOnClick: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        let __VLS_18;
        const __VLS_19 = {
            /** @type {typeof __VLS_18.create} */
            onCreate: (onCreate),
        };
        void __VLS_19;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_16;
        var __VLS_17;
        // @ts-ignore
        [open, make, form, typeItems,];
        if (newType.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "rounded-md border border-default p-3 space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (newType.value.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-end gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                // @ts-ignore
                label: "Usually ages (days)", ...{ class: "flex-1" },
            }));
            const __VLS_22 = __VLS_21({
                label: "Usually ages (days)",
                ...{ class: "flex-1" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            var __VLS_23;
            const { default: __VLS_25 } = __VLS_nonNull(__VLS_23.slots);
            let __VLS_26;
            /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
            UInputNumber;
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                // @ts-ignore
                modelValue: (newType.value.days), min: (0), max: (1095), ...{ class: "w-full" },
            }));
            const __VLS_28 = __VLS_27({
                modelValue: (newType.value.days),
                min: (0),
                max: (1095),
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_27));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [newType, newType, newType,];
            let __VLS_31;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                // @ts-ignore
                ...{ 'onClick': {} }, loading: (saveType.value.isPending.value),
            }));
            const __VLS_33 = __VLS_32({
                ...{ 'onClick': {} },
                loading: (saveType.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_32));
            let __VLS_36;
            const __VLS_37 = {
                /** @type {typeof __VLS_36.click} */
                onClick: (addType),
            };
            void __VLS_37;
            var __VLS_34;
            var __VLS_35;
            const { default: __VLS_38 } = __VLS_nonNull(__VLS_34.slots);
            // @ts-ignore
            [saveType,];
            let __VLS_39;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "neutral", variant: "ghost",
            }));
            const __VLS_41 = __VLS_40({
                ...{ 'onClick': {} },
                color: "neutral",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_40));
            let __VLS_44;
            const __VLS_45 = {
                /** @type {typeof __VLS_44.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(newType.value))
                        throw 0;
                    return (newType.value = undefined);
                    // @ts-ignore
                    [newType,];
                },
            };
            void __VLS_45;
            var __VLS_42;
            var __VLS_43;
            const { default: __VLS_46 } = __VLS_nonNull(__VLS_42.slots);
            // @ts-ignore
            [];
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            // @ts-ignore
            label: "Made", required: true,
        }));
        const __VLS_49 = __VLS_48({
            label: "Made",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        var __VLS_50;
        const { default: __VLS_52 } = __VLS_nonNull(__VLS_50.slots);
        let __VLS_53;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
            // @ts-ignore
            modelValue: (form.value.madeOn), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_55 = __VLS_54({
            modelValue: (form.value.madeOn),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_58;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            // @ts-ignore
            label: "Ready", required: true, hint: (type.value && !readyEdited.value ? __VLS_unwrap(agingLabel, {})(type.value.aging_days) : undefined),
        }));
        const __VLS_60 = __VLS_59({
            label: "Ready",
            required: true,
            hint: (type.value && !readyEdited.value ? __VLS_unwrap(agingLabel, {})(type.value.aging_days) : undefined),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        var __VLS_61;
        const { default: __VLS_63 } = __VLS_nonNull(__VLS_61.slots);
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            // @ts-ignore
            ...{ 'onUpdate:modelValue': {} }, modelValue: (form.value.readyOn), type: "date", min: (form.value.madeOn), required: true, ...{ class: "w-full" },
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onUpdate:modelValue': {} },
            modelValue: (form.value.readyOn),
            type: "date",
            min: (form.value.madeOn),
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_69;
        const __VLS_70 = {
            /** @type {typeof __VLS_69.'update:modelValue'} */
            'onUpdate:modelValue': (...[$event]) => {
                void $event;
                return (readyEdited.value = true);
                // @ts-ignore
                [form, form, type, type, readyEdited, readyEdited, agingLabel,];
            },
        };
        void __VLS_70;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_67;
        var __VLS_68;
        // @ts-ignore
        [];
        let __VLS_71;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            // @ts-ignore
            label: "Milk used", hint: "Optional",
        }));
        const __VLS_73 = __VLS_72({
            label: "Milk used",
            hint: "Optional",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        var __VLS_74;
        const { default: __VLS_76 } = __VLS_nonNull(__VLS_74.slots);
        let __VLS_77;
        /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            // @ts-ignore
            modelValue: (form.value.gallons), inputmode: "decimal", ...{ class: "w-full" },
        }));
        const __VLS_79 = __VLS_78({
            modelValue: (form.value.gallons),
            inputmode: "decimal",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_80;
        const { default: __VLS_82 } = __VLS_nonNull(__VLS_80.slots);
        {
            const { trailing: __VLS_83 } = __VLS_nonNull(__VLS_80.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            // @ts-ignore
            [form,];
        }
        // @ts-ignore
        [];
        // @ts-ignore
        [];
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            // @ts-ignore
            label: "Milk", hint: "Optional",
        }));
        const __VLS_86 = __VLS_85({
            label: "Milk",
            hint: "Optional",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        var __VLS_87;
        const { default: __VLS_89 } = __VLS_nonNull(__VLS_87.slots);
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.URadioGroup} */
        URadioGroup;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            // @ts-ignore
            modelValue: (form.value.treatment), items: (__VLS_unwrap(treatmentItems, {})), orientation: "horizontal", ...{ class: "pt-1.5" },
        }));
        const __VLS_92 = __VLS_91({
            modelValue: (form.value.treatment),
            items: (__VLS_unwrap(treatmentItems, {})),
            orientation: "horizontal",
            ...{ class: "pt-1.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        /** @type {__VLS_StyleScopedClasses['pt-1.5']} */ ;
        // @ts-ignore
        [form, treatmentItems,];
        let __VLS_95;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_97 = __VLS_96({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        var __VLS_98;
        const { default: __VLS_100 } = __VLS_nonNull(__VLS_98.slots);
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_103 = __VLS_102({
            modelValue: (form.value.notes),
            rows: (2),
            autoresize: true,
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        if (__VLS_ctx.make) {
            let __VLS_106;
            /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
            UCheckbox;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
                // @ts-ignore
                modelValue: (form.value.finished), label: (__VLS_ctx.make.finished_on ? `Finished ${__VLS_unwrap(formatDate, {})(__VLS_ctx.make.finished_on)}` : 'Finished: all eaten, sold or given away'),
            }));
            const __VLS_108 = __VLS_107({
                modelValue: (form.value.finished),
                label: (__VLS_ctx.make.finished_on ? `Finished ${__VLS_unwrap(formatDate, {})(__VLS_ctx.make.finished_on)}` : 'Finished: all eaten, sold or given away'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_107));
        }
        // @ts-ignore
        [make, make, make, form, formatDate,];
    }
    {
        const { footer: __VLS_111 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.make) {
            let __VLS_112;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost", loading: (removeMake.value.isPending.value),
            }));
            const __VLS_114 = __VLS_113({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
                loading: (removeMake.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            let __VLS_117;
            const __VLS_118 = {
                /** @type {typeof __VLS_117.click} */
                onClick: (onDelete),
            };
            void __VLS_118;
            var __VLS_115;
            var __VLS_116;
            const { default: __VLS_119 } = __VLS_nonNull(__VLS_115.slots);
            // @ts-ignore
            [make, removeMake,];
        }
        let __VLS_120;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_122 = __VLS_121({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        let __VLS_125;
        const __VLS_126 = {
            /** @type {typeof __VLS_125.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_126;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_123;
        var __VLS_124;
        const { default: __VLS_127 } = __VLS_nonNull(__VLS_123.slots);
        // @ts-ignore
        [];
        let __VLS_128;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
            // @ts-ignore
            type: "submit", form: "make-form", loading: (saveMake.value.isPending.value),
        }));
        const __VLS_130 = __VLS_129({
            type: "submit",
            form: "make-form",
            loading: (saveMake.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        var __VLS_131;
        const { default: __VLS_133 } = __VLS_nonNull(__VLS_131.slots);
        // @ts-ignore
        [saveMake,];
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
