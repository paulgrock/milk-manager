/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useFinanceMutations } from '@/composables/useFinances';
import { todayISO } from '@/lib/dates';
import { CATEGORIES, parseMoney } from '@/lib/finances';
import HerdGoatPicker from '@/components/HerdGoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { save, remove } = useFinanceMutations();
const form = reactive({
    kind: 'expense',
    category: 'feed',
    occurred_on: todayISO(),
    amount: '',
    description: '',
    party: '',
    goat_id: null,
    breeding_id: null,
    notes: '',
});
// Immediate: the goat page can mount this already open (offering to record a sale).
watch(open, fill, { immediate: true });
function fill(isOpen) {
    if (!isOpen)
        return;
    const e = props.entry;
    const d = props.draft ?? {};
    Object.assign(form, {
        kind: e?.kind ?? d.kind ?? 'expense',
        category: e?.category ?? d.category ?? (d.kind === 'income' ? 'milk' : 'feed'),
        occurred_on: e?.occurred_on ?? d.occurred_on ?? todayISO(),
        amount: e ? (e.amount_cents / 100).toFixed(2) : d.amount_cents ? (d.amount_cents / 100).toFixed(2) : '',
        description: e?.description ?? d.description ?? '',
        party: e?.party ?? '',
        goat_id: e?.goat_id ?? d.goat_id ?? null,
        breeding_id: e?.breeding_id ?? d.breeding_id ?? null,
        notes: e?.notes ?? '',
    });
}
// Deposits and adoptions are kept in step with Adoptions by the database.
const fromSales = computed(() => !!props.entry?.reservation_id || !!props.entry?.sale_id);
const kindOptions = [
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
];
const categoryOptions = computed(() => Object.entries(CATEGORIES[form.kind]).map(([value, label]) => ({ label, value })));
watch(() => form.kind, (kind) => {
    if (!(form.category in CATEGORIES[kind]))
        form.category = Object.keys(CATEGORIES[kind])[0];
});
async function submit() {
    const cents = parseMoney(form.amount);
    if (cents === null || cents === 'invalid')
        return toast.add({ color: 'error', title: 'Amount should be like 75 or 1,200.50' });
    try {
        await save.mutateAsync({
            id: props.entry?.id,
            values: {
                kind: form.kind,
                category: form.category,
                occurred_on: form.occurred_on,
                amount_cents: cents,
                description: form.description.trim() || null,
                party: form.party.trim() || null,
                goat_id: form.goat_id,
                breeding_id: form.breeding_id,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save', description: e.message });
    }
}
async function onDelete() {
    await remove.mutateAsync(props.entry.id);
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
    __VLS_withDotValue(fromSales, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(save, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.entry ? 'Edit entry' : form.value.kind === 'income' ? 'Add income' : 'Add expense'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.entry ? 'Edit entry' : form.value.kind === 'income' ? 'Add income' : 'Add expense'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        if (fromSales.value) {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                ...{ class: "mb-3" }, color: "neutral", variant: "subtle", icon: "i-lucide-handshake", title: "Recorded from Adoptions", description: "This is a deposit or adoption. Change it under Breeding, Adoptions, so the two stay in step.",
            }));
            const __VLS_9 = __VLS_8({
                ...{ class: "mb-3" },
                color: "neutral",
                variant: "subtle",
                icon: "i-lucide-handshake",
                title: "Recorded from Adoptions",
                description: "This is a deposit or adoption. Change it under Breeding, Adoptions, so the two stay in step.",
            }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "entry-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)({
            disabled: (fromSales.value),
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            // @ts-ignore
            label: "Type",
        }));
        const __VLS_14 = __VLS_13({
            label: "Type",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        var __VLS_15;
        const { default: __VLS_17 } = __VLS_nonNull(__VLS_15.slots);
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            modelValue: (form.value.kind), items: (__VLS_unwrap(kindOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_20 = __VLS_19({
            modelValue: (form.value.kind),
            items: (__VLS_unwrap(kindOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, entry, form, form, fromSales, fromSales, kindOptions,];
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            label: "Category",
        }));
        const __VLS_25 = __VLS_24({
            label: "Category",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            modelValue: (form.value.category), items: (__VLS_unwrap(categoryOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_31 = __VLS_30({
            modelValue: (form.value.category),
            items: (__VLS_unwrap(categoryOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, categoryOptions,];
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            label: "Date", required: true,
        }));
        const __VLS_36 = __VLS_35({
            label: "Date",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_37;
        const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            modelValue: (form.value.occurred_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (form.value.occurred_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            // @ts-ignore
            label: "Amount", required: true,
        }));
        const __VLS_47 = __VLS_46({
            label: "Amount",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        var __VLS_48;
        const { default: __VLS_50 } = __VLS_nonNull(__VLS_48.slots);
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            // @ts-ignore
            modelValue: (form.value.amount), inputmode: "decimal", placeholder: "0.00", required: true, ...{ class: "w-full" },
        }));
        const __VLS_53 = __VLS_52({
            modelValue: (form.value.amount),
            inputmode: "decimal",
            placeholder: "0.00",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        {
            const { leading: __VLS_57 } = __VLS_nonNull(__VLS_54.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            // @ts-ignore
            [form,];
        }
        // @ts-ignore
        [];
        // @ts-ignore
        [];
        let __VLS_58;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            // @ts-ignore
            label: "What for",
        }));
        const __VLS_60 = __VLS_59({
            label: "What for",
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        var __VLS_61;
        const { default: __VLS_63 } = __VLS_nonNull(__VLS_61.slots);
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            // @ts-ignore
            modelValue: (form.value.description), maxlength: "200", placeholder: "50 lb alfalfa pellets, doeling to the Smiths…", ...{ class: "w-full" },
        }));
        const __VLS_66 = __VLS_65({
            modelValue: (form.value.description),
            maxlength: "200",
            placeholder: "50 lb alfalfa pellets, doeling to the Smiths…",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_69;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            // @ts-ignore
            label: (form.value.kind === 'income' ? 'From' : 'Paid to'),
        }));
        const __VLS_71 = __VLS_70({
            label: (form.value.kind === 'income' ? 'From' : 'Paid to'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        var __VLS_72;
        const { default: __VLS_74 } = __VLS_nonNull(__VLS_72.slots);
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            // @ts-ignore
            modelValue: (form.value.party), maxlength: "100", ...{ class: "w-full" },
        }));
        const __VLS_77 = __VLS_76({
            modelValue: (form.value.party),
            maxlength: "100",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form,];
        let __VLS_80;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            // @ts-ignore
            label: "Goat", hint: "Optional",
        }));
        const __VLS_82 = __VLS_81({
            label: "Goat",
            hint: "Optional",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        var __VLS_83;
        const { default: __VLS_85 } = __VLS_nonNull(__VLS_83.slots);
        const __VLS_86 = HerdGoatPicker;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            // @ts-ignore
            modelValue: (form.value.goat_id), sex: "any", includeFormer: true,
        }));
        const __VLS_88 = __VLS_87({
            modelValue: (form.value.goat_id),
            sex: "any",
            includeFormer: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        // @ts-ignore
        [form,];
        let __VLS_91;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_93 = __VLS_92({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        var __VLS_94;
        const { default: __VLS_96 } = __VLS_nonNull(__VLS_94.slots);
        let __VLS_97;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_99 = __VLS_98({
            modelValue: (form.value.notes),
            rows: (2),
            autoresize: true,
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_102 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.entry && !fromSales.value) {
            let __VLS_103;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_105 = __VLS_104({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            let __VLS_108;
            const __VLS_109 = {
                /** @type {typeof __VLS_108.click} */
                onClick: (onDelete),
            };
            void __VLS_109;
            var __VLS_106;
            var __VLS_107;
            const { default: __VLS_110 } = __VLS_nonNull(__VLS_106.slots);
            // @ts-ignore
            [entry, fromSales,];
        }
        let __VLS_111;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_113 = __VLS_112({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        let __VLS_116;
        const __VLS_117 = {
            /** @type {typeof __VLS_116.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_117;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_114;
        var __VLS_115;
        const { default: __VLS_118 } = __VLS_nonNull(__VLS_114.slots);
        // @ts-ignore
        [];
        if (fromSales.value) {
            let __VLS_119;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
                // @ts-ignore
                to: "/breeding/adoptions",
            }));
            const __VLS_121 = __VLS_120({
                to: "/breeding/adoptions",
            }, ...__VLS_functionalComponentArgsRest(__VLS_120));
            var __VLS_122;
            const { default: __VLS_124 } = __VLS_nonNull(__VLS_122.slots);
            // @ts-ignore
            [fromSales,];
        }
        else {
            let __VLS_125;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
                // @ts-ignore
                type: "submit", form: "entry-form", loading: (save.value.isPending.value),
            }));
            const __VLS_127 = __VLS_126({
                type: "submit",
                form: "entry-form",
                loading: (save.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            var __VLS_128;
            const { default: __VLS_130 } = __VLS_nonNull(__VLS_128.slots);
            // @ts-ignore
            [save,];
        }
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
