/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useGoatMutations } from '@/composables/useGoats';
import { formatDate, todayISO } from '@/lib/dates';
import { APPRAISAL_CODES, APPRAISAL_CODE_LABELS, ageInYears, appraisalSummary, } from '@/lib/goats';
const { defineProps, } = {};
const props = defineProps();
const toast = useToast();
const { saveAppraisal, deleteAppraisal } = useGoatMutations();
const isBuck = computed(() => props.goat.sex !== 'doe');
const codeOptions = APPRAISAL_CODES.map((c) => ({ label: `${c} · ${APPRAISAL_CODE_LABELS[c]}`, value: c }));
const traits = computed(() => [
    { key: 'general_appearance', label: 'General appearance' },
    { key: 'dairy_strength', label: 'Dairy strength' },
    { key: 'body_capacity', label: 'Body capacity' },
    ...(isBuck.value ? [] : [{ key: 'mammary_system', label: 'Mammary system' }]),
]);
const open = ref(false);
const editingId = ref();
const form = reactive({
    appraised_on: todayISO(),
    general_appearance: 'V',
    dairy_strength: 'V',
    body_capacity: 'V',
    mammary_system: 'V',
    final_score: 85,
    appraiser: '',
    notes: '',
});
function startAdd() {
    editingId.value = undefined;
    Object.assign(form, {
        appraised_on: todayISO(),
        general_appearance: 'V',
        dairy_strength: 'V',
        body_capacity: 'V',
        mammary_system: 'V',
        final_score: 85,
        appraiser: '',
        notes: '',
    });
    open.value = true;
}
function startEdit(a) {
    editingId.value = a.id;
    Object.assign(form, {
        appraised_on: a.appraised_on,
        general_appearance: a.general_appearance,
        dairy_strength: a.dairy_strength,
        body_capacity: a.body_capacity,
        mammary_system: a.mammary_system ?? 'V',
        final_score: a.final_score,
        appraiser: a.appraiser ?? '',
        notes: a.notes ?? '',
    });
    open.value = true;
}
async function submit() {
    const score = Number(form.final_score);
    if (!Number.isInteger(score) || score < 50 || score > 99) {
        toast.add({ color: 'error', title: 'Final score must be a whole number from 50 to 99' });
        return;
    }
    try {
        await saveAppraisal.mutateAsync({
            id: editingId.value,
            values: {
                goat_id: props.goat.id,
                appraised_on: form.appraised_on,
                general_appearance: form.general_appearance,
                dairy_strength: form.dairy_strength,
                body_capacity: form.body_capacity,
                mammary_system: isBuck.value ? null : form.mammary_system,
                final_score: score,
                appraiser: form.appraiser.trim() || null,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save appraisal', description: e.message });
    }
}
async function remove() {
    if (!editingId.value)
        return;
    await deleteAppraisal.mutateAsync(editingId.value);
    open.value = false;
}
function ageLabel(a) {
    const years = ageInYears(props.goat.birth_date, a.appraised_on);
    if (years === null)
        return '';
    return years < 2 ? '@ < 2 yo' : `@ ${years} yo`;
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(editingId, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(deleteAppraisal, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveAppraisal, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { header: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-plus",
        }));
        const __VLS_9 = __VLS_8({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        let __VLS_12;
        const __VLS_13 = {
            /** @type {typeof __VLS_12.click} */
            onClick: (startAdd),
        };
        void __VLS_13;
        var __VLS_10;
        var __VLS_11;
        const { default: __VLS_14 } = __VLS_nonNull(__VLS_10.slots);
    }
    if (!__VLS_ctx.appraisals.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default -my-2" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['-my-2']} */ ;
        const __VLS_15 = __VLS_tryAsConstant((__VLS_ctx.appraisals));
        for (const [a] of __VLS_vFor(__VLS_nonNull(__VLS_15))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (a.id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(!__VLS_ctx.appraisals.length))
                            throw 0;
                        return (startEdit(a));
                        // @ts-ignore
                        [appraisals, appraisals,];
                    } },
                type: "button",
                ...{ class: "w-full py-2 flex items-center gap-3 text-start hover:bg-elevated/50 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-elevated/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-mono font-semibold text-lg" },
            });
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            (__VLS_unwrap(appraisalSummary, {})(a));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (ageLabel(a));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "ms-auto text-sm text-muted text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            (__VLS_unwrap(formatDate, {})(a.appraised_on));
            if (a.appraiser) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
                (a.appraiser);
            }
            // @ts-ignore
            [appraisalSummary, formatDate,];
        }
    }
    let __VLS_16;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        // @ts-ignore
        open: (open.value), title: (editingId.value ? 'Edit appraisal' : 'Add appraisal'),
    }));
    const __VLS_18 = __VLS_17({
        open: (open.value),
        title: (editingId.value ? 'Edit appraisal' : 'Add appraisal'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    var __VLS_19;
    const { default: __VLS_21 } = __VLS_nonNull(__VLS_19.slots);
    {
        const { body: __VLS_22 } = __VLS_nonNull(__VLS_19.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "appraisal-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            label: "Date", required: true,
        }));
        const __VLS_25 = __VLS_24({
            label: "Date",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            modelValue: (form.value.appraised_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_31 = __VLS_30({
            modelValue: (form.value.appraised_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, editingId, form,];
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            label: "Final score", required: true,
        }));
        const __VLS_36 = __VLS_35({
            label: "Final score",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_37;
        const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            modelValue: (form.value.final_score), min: (50), max: (99), ...{ class: "w-full" },
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (form.value.final_score),
            min: (50),
            max: (99),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        const __VLS_45 = __VLS_tryAsConstant((__VLS_unwrap(traits, {})));
        for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_45))) {
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                // @ts-ignore
                key: (t.key), label: (t.label),
            }));
            const __VLS_48 = __VLS_47({
                key: (t.key),
                label: (t.label),
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            var __VLS_49;
            const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
            let __VLS_52;
            /** @ts-ignore @type { | typeof __VLS_components.USelect} */
            USelect;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                // @ts-ignore
                modelValue: (form.value[t.key]), items: (__VLS_unwrap(codeOptions, {})), ...{ class: "w-full" },
            }));
            const __VLS_54 = __VLS_53({
                modelValue: (form.value[t.key]),
                items: (__VLS_unwrap(codeOptions, {})),
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [form, traits, codeOptions,];
            // @ts-ignore
            [];
        }
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            label: "Appraiser",
        }));
        const __VLS_59 = __VLS_58({
            label: "Appraiser",
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        var __VLS_60;
        const { default: __VLS_62 } = __VLS_nonNull(__VLS_60.slots);
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            // @ts-ignore
            modelValue: (form.value.appraiser), ...{ class: "w-full" }, maxlength: "100",
        }));
        const __VLS_65 = __VLS_64({
            modelValue: (form.value.appraiser),
            ...{ class: "w-full" },
            maxlength: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_70 = __VLS_69({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        var __VLS_71;
        const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_76 = __VLS_75({
            modelValue: (form.value.notes),
            rows: (2),
            autoresize: true,
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_79 } = __VLS_nonNull(__VLS_19.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (editingId.value) {
            let __VLS_80;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost", loading: (deleteAppraisal.value.isPending.value),
            }));
            const __VLS_82 = __VLS_81({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
                loading: (deleteAppraisal.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            let __VLS_85;
            const __VLS_86 = {
                /** @type {typeof __VLS_85.click} */
                onClick: (remove),
            };
            void __VLS_86;
            var __VLS_83;
            var __VLS_84;
            const { default: __VLS_87 } = __VLS_nonNull(__VLS_83.slots);
            // @ts-ignore
            [editingId, deleteAppraisal,];
        }
        let __VLS_88;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_90 = __VLS_89({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        let __VLS_93;
        const __VLS_94 = {
            /** @type {typeof __VLS_93.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_94;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_91;
        var __VLS_92;
        const { default: __VLS_95 } = __VLS_nonNull(__VLS_91.slots);
        // @ts-ignore
        [];
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            // @ts-ignore
            type: "submit", form: "appraisal-form", loading: (saveAppraisal.value.isPending.value),
        }));
        const __VLS_98 = __VLS_97({
            type: "submit",
            form: "appraisal-form",
            loading: (saveAppraisal.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        var __VLS_99;
        const { default: __VLS_101 } = __VLS_nonNull(__VLS_99.slots);
        // @ts-ignore
        [saveAppraisal,];
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
