/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHealthData, useCareLog } from '@/composables/useHealth';
import { useHerdGoats } from '@/composables/useGoats';
import { useLactations } from '@/composables/useMilk';
import { todayISO } from '@/lib/dates';
import { CURRENT_STATUSES, goatName } from '@/lib/goats';
import { lactationOn } from '@/lib/milk';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { data } = useHealthData();
const { goats } = useHerdGoats();
const lactations = useLactations();
const { logCare } = useCareLog();
const today = todayISO();
const form = reactive({ careTypeId: '', doneOn: today, dose: '', notes: '', selected: new Set() });
const types = computed(() => data.value.careTypes.filter((t) => !t.archived));
const herd = computed(() => (goats.data.value ?? [])
    .filter((g) => CURRENT_STATUSES.includes(g.status))
    .sort((a, b) => (a.barn_name || goatName(a)).localeCompare(b.barn_name || goatName(b))));
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    form.careTypeId = props.careTypeId ?? types.value[0]?.id ?? '';
    form.doneOn = today;
    form.dose = '';
    form.notes = '';
    form.selected = new Set(props.goatIds ?? []);
});
const type = computed(() => types.value.find((t) => t.id === form.careTypeId));
const typeOptions = computed(() => types.value.map((t) => ({ label: t.name, value: t.id })));
const groups = [
    { label: 'Everyone', pick: () => true },
    { label: 'Does', pick: (g) => g.sex === 'doe' },
    { label: 'Bucks', pick: (g) => g.sex !== 'doe' },
    { label: 'In milk', pick: (g) => !!lactationOn(lactations.data.value ?? [], g.id, today) },
];
function selectGroup(pick) {
    form.selected = new Set(herd.value.filter(pick).map((g) => g.id));
}
function toggle(id, on) {
    const next = new Set(form.selected);
    if (on)
        next.add(id);
    else
        next.delete(id);
    form.selected = next;
}
async function submit() {
    if (!type.value)
        return toast.add({ color: 'error', title: 'Pick what was done' });
    if (!form.selected.size)
        return toast.add({ color: 'error', title: 'Pick at least one goat' });
    const dose = form.dose.trim() ? Number(form.dose.replace(',', '.')) : null;
    if (dose !== null && !(dose > 0))
        return toast.add({ color: 'error', title: 'Dose must be a number above 0' });
    const count = form.selected.size;
    // Doesn't wait for the server: with no signal it's kept on the phone and sent later.
    void logCare({ careTypeId: type.value.id, goatIds: [...form.selected], doneOn: form.doneOn, dose, notes: form.notes }).catch((e) => toast.add({ color: 'error', title: 'Could not save care', description: e.message }));
    toast.add({ color: 'success', title: `${type.value.name} logged for ${count} ${count === 1 ? 'goat' : 'goats'}` });
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
    __VLS_withDotValue(type, {});
    __VLS_withDotValue(open, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: "Log care",
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: "Log care",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "care-form",
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
            label: "What was done", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "What was done",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (form.value.careTypeId), items: (__VLS_unwrap(typeOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.careTypeId),
            items: (__VLS_unwrap(typeOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, form, typeOptions,];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Date", required: true,
        }));
        const __VLS_20 = __VLS_19({
            label: "Date",
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
            modelValue: (form.value.doneOn), type: "date", max: (__VLS_unwrap(today, {})), required: true, ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.doneOn),
            type: "date",
            max: (__VLS_unwrap(today, {})),
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, today,];
        if (type.value?.dose_unit) {
            let __VLS_29;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                // @ts-ignore
                label: (`Dose (${type.value.dose_unit})`), hint: "Each goat",
            }));
            const __VLS_31 = __VLS_30({
                label: (`Dose (${type.value.dose_unit})`),
                hint: "Each goat",
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            var __VLS_32;
            const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
            let __VLS_35;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                // @ts-ignore
                modelValue: (form.value.dose), inputmode: "decimal", ...{ class: "w-full" },
            }));
            const __VLS_37 = __VLS_36({
                modelValue: (form.value.dose),
                inputmode: "decimal",
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_36));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [form, type, type,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.legend, __VLS_intrinsics.legend)({
            ...{ class: "text-sm font-medium mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (form.value.selected.size);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-1 mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        const __VLS_40 = __VLS_tryAsConstant((__VLS_unwrap(groups, {})));
        for (const [g] of __VLS_vFor(__VLS_nonNull(__VLS_40))) {
            let __VLS_41;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                // @ts-ignore
                ...{ 'onClick': {} }, key: (g.label), size: "xs", variant: "soft", color: "neutral",
            }));
            const __VLS_43 = __VLS_42({
                ...{ 'onClick': {} },
                key: (g.label),
                size: "xs",
                variant: "soft",
                color: "neutral",
            }, ...__VLS_functionalComponentArgsRest(__VLS_42));
            let __VLS_46;
            const __VLS_47 = {
                /** @type {typeof __VLS_46.click} */
                onClick: (...[$event]) => {
                    void $event;
                    return (selectGroup(g.pick));
                    // @ts-ignore
                    [form, groups,];
                },
            };
            void __VLS_47;
            var __VLS_44;
            var __VLS_45;
            const { default: __VLS_48 } = __VLS_nonNull(__VLS_44.slots);
            (g.label);
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "xs", variant: "ghost", color: "neutral",
        }));
        const __VLS_51 = __VLS_50({
            ...{ 'onClick': {} },
            size: "xs",
            variant: "ghost",
            color: "neutral",
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        let __VLS_54;
        const __VLS_55 = {
            /** @type {typeof __VLS_54.click} */
            onClick: (...[$event]) => {
                void $event;
                return (form.value.selected = new Set());
                // @ts-ignore
                [form,];
            },
        };
        void __VLS_55;
        var __VLS_52;
        var __VLS_53;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_52.slots);
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-h-64 overflow-y-auto rounded-md border border-default divide-y divide-default" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-64']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        const __VLS_57 = __VLS_tryAsConstant((__VLS_unwrap(herd, {})));
        for (const [g] of __VLS_vFor(__VLS_nonNull(__VLS_57))) {
            let __VLS_58;
            /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
            UCheckbox;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                // @ts-ignore
                ...{ 'onUpdate:modelValue': {} }, key: (g.id), modelValue: (form.value.selected.has(g.id)), label: (g.barn_name || __VLS_unwrap(goatName, {})(g)), ...{ class: "px-3 py-2" },
            }));
            const __VLS_60 = __VLS_59({
                ...{ 'onUpdate:modelValue': {} },
                key: (g.id),
                modelValue: (form.value.selected.has(g.id)),
                label: (g.barn_name || __VLS_unwrap(goatName, {})(g)),
                ...{ class: "px-3 py-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            let __VLS_63;
            const __VLS_64 = {
                /** @type {typeof __VLS_63.'update:modelValue'} */
                'onUpdate:modelValue': ((on) => toggle(g.id, !!on)),
            };
            void __VLS_64;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            var __VLS_61;
            var __VLS_62;
            // @ts-ignore
            [form, herd, goatName,];
        }
        let __VLS_65;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_67 = __VLS_66({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        var __VLS_68;
        const { default: __VLS_70 } = __VLS_nonNull(__VLS_68.slots);
        let __VLS_71;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
            // @ts-ignore
            modelValue: (form.value.notes), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_73 = __VLS_72({
            modelValue: (form.value.notes),
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_76 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_77;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_82;
        const __VLS_83 = {
            /** @type {typeof __VLS_82.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_83;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_80;
        var __VLS_81;
        const { default: __VLS_84 } = __VLS_nonNull(__VLS_80.slots);
        // @ts-ignore
        [];
        let __VLS_85;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            // @ts-ignore
            type: "submit", form: "care-form",
        }));
        const __VLS_87 = __VLS_86({
            type: "submit",
            form: "care-form",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        var __VLS_88;
        const { default: __VLS_90 } = __VLS_nonNull(__VLS_88.slots);
        (form.value.selected.size);
        // @ts-ignore
        [form,];
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
