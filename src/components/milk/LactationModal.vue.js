/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useHerdGoats } from '@/composables/useGoats';
import { useLactationMutations, useLactations } from '@/composables/useMilk';
import { todayISO } from '@/lib/dates';
import { CURRENT_STATUSES, goatFullName } from '@/lib/goats';
import { lactationOn, nextLactationNumber } from '@/lib/milk';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { goats, byId } = useHerdGoats();
const lactations = useLactations();
const { save, remove } = useLactationMutations();
const mode = computed(() => props.mode ?? (props.lactation ? 'edit' : 'start'));
const form = reactive({
    goat_id: '',
    lactation_number: 1,
    freshened_on: todayISO(),
    dried_off_on: '',
    notes: '',
});
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const l = props.lactation;
    const goatId = l?.goat_id ?? props.goatId ?? '';
    Object.assign(form, {
        goat_id: goatId,
        lactation_number: l?.lactation_number ?? nextLactationNumber(lactations.data.value ?? [], goatId),
        freshened_on: l?.freshened_on ?? props.date ?? todayISO(),
        dried_off_on: mode.value === 'dryOff' ? (props.date ?? todayISO()) : (l?.dried_off_on ?? ''),
        notes: l?.notes ?? '',
    });
});
// Does that could freshen on the chosen date.
const doeItems = computed(() => (goats.data.value ?? [])
    .filter((g) => g.sex === 'doe' && CURRENT_STATUSES.includes(g.status))
    .filter((g) => !lactationOn(lactations.data.value ?? [], g.id, form.freshened_on))
    .map((g) => ({ label: goatFullName(g), value: g.id }))
    .sort((a, b) => a.label.localeCompare(b.label)));
watch(() => form.goat_id, (id) => {
    if (mode.value === 'start' && id)
        form.lactation_number = nextLactationNumber(lactations.data.value ?? [], id);
});
const doe = computed(() => byId.value.get(form.goat_id));
const title = computed(() => {
    const name = doe.value ? doe.value.barn_name || goatFullName(doe.value) : '';
    if (mode.value === 'dryOff')
        return `Dry off ${name}`;
    if (mode.value === 'edit')
        return `Lactation ${form.lactation_number}${name ? ` · ${name}` : ''}`;
    return name ? `${name} freshened` : 'Add a doe to the milk line';
});
function friendly(message) {
    if (message.includes('lactations_no_overlap'))
        return 'That overlaps another lactation for this doe.';
    if (message.includes('dried_off_on'))
        return 'Dry-off must be on or after freshening.';
    return message;
}
async function submit() {
    if (!form.goat_id) {
        toast.add({ color: 'error', title: 'Pick a doe' });
        return;
    }
    try {
        await save.mutateAsync({
            id: props.lactation?.id,
            values: {
                goat_id: form.goat_id,
                lactation_number: Number(form.lactation_number),
                freshened_on: form.freshened_on,
                dried_off_on: form.dried_off_on || null,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save', description: friendly(e.message) });
    }
}
async function onDelete() {
    if (!props.lactation)
        return;
    await remove.mutateAsync(props.lactation.id);
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
    __VLS_withDotValue(mode, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(remove, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(save, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_unwrap(title, {})), description: (mode.value === 'dryOff' ? 'She will leave the milk line after this date. Her milk records stay.' : undefined),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_unwrap(title, {})),
        description: (mode.value === 'dryOff' ? 'She will leave the milk line after this date. Her milk records stay.' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "lactation-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        if (mode.value === 'dryOff') {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                label: "Last day milked", required: true,
            }));
            const __VLS_9 = __VLS_8({
                label: "Last day milked",
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
                modelValue: (form.value.dried_off_on), type: "date", required: true, ...{ class: "w-full" },
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (form.value.dried_off_on),
                type: "date",
                required: true,
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [open, title, mode, mode, form,];
        }
        else {
            if (!__VLS_ctx.goatId && !__VLS_ctx.lactation) {
                let __VLS_18;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                    // @ts-ignore
                    label: "Doe", required: true,
                }));
                const __VLS_20 = __VLS_19({
                    label: "Doe",
                    required: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_19));
                var __VLS_21;
                const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
                let __VLS_24;
                /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
                UInputMenu;
                // @ts-ignore
                const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                    // @ts-ignore
                    modelValue: (form.value.goat_id), items: (__VLS_unwrap(doeItems, {})), valueKey: "value", placeholder: "Search does…", ...{ class: "w-full" },
                }));
                const __VLS_26 = __VLS_25({
                    modelValue: (form.value.goat_id),
                    items: (__VLS_unwrap(doeItems, {})),
                    valueKey: "value",
                    placeholder: "Search does…",
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_25));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [form, goatId, lactation, doeItems,];
            }
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
                label: "Freshened", required: true,
            }));
            const __VLS_31 = __VLS_30({
                label: "Freshened",
                required: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            var __VLS_32;
            const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
            let __VLS_35;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                // @ts-ignore
                modelValue: (form.value.freshened_on), type: "date", required: true, ...{ class: "w-full" },
            }));
            const __VLS_37 = __VLS_36({
                modelValue: (form.value.freshened_on),
                type: "date",
                required: true,
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
                label: "Lactation #", required: true,
            }));
            const __VLS_42 = __VLS_41({
                label: "Lactation #",
                required: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            var __VLS_43;
            const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
            let __VLS_46;
            /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
            UInputNumber;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                // @ts-ignore
                modelValue: (form.value.lactation_number), min: (1), max: (30), ...{ class: "w-full" },
            }));
            const __VLS_48 = __VLS_47({
                modelValue: (form.value.lactation_number),
                min: (1),
                max: (30),
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [form,];
            if (mode.value === 'edit') {
                let __VLS_51;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                    // @ts-ignore
                    label: "Dried off", hint: "Leave blank while in milk",
                }));
                const __VLS_53 = __VLS_52({
                    label: "Dried off",
                    hint: "Leave blank while in milk",
                }, ...__VLS_functionalComponentArgsRest(__VLS_52));
                var __VLS_54;
                const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
                let __VLS_57;
                /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
                    // @ts-ignore
                    modelValue: (form.value.dried_off_on), type: "date", ...{ class: "w-full" },
                }));
                const __VLS_59 = __VLS_58({
                    modelValue: (form.value.dried_off_on),
                    type: "date",
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_58));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [mode, form,];
            }
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                // @ts-ignore
                label: "Notes",
            }));
            const __VLS_64 = __VLS_63({
                label: "Notes",
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            var __VLS_65;
            const { default: __VLS_67 } = __VLS_nonNull(__VLS_65.slots);
            let __VLS_68;
            /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
            UTextarea;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                // @ts-ignore
                modelValue: (form.value.notes), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
            }));
            const __VLS_70 = __VLS_69({
                modelValue: (form.value.notes),
                rows: (2),
                autoresize: true,
                maxlength: "10000",
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [form,];
        }
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_73 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (mode.value === 'edit') {
            let __VLS_74;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost", loading: (remove.value.isPending.value),
            }));
            const __VLS_76 = __VLS_75({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
                loading: (remove.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_75));
            let __VLS_79;
            const __VLS_80 = {
                /** @type {typeof __VLS_79.click} */
                onClick: (onDelete),
            };
            void __VLS_80;
            var __VLS_77;
            var __VLS_78;
            const { default: __VLS_81 } = __VLS_nonNull(__VLS_77.slots);
            // @ts-ignore
            [mode, remove,];
        }
        let __VLS_82;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_84 = __VLS_83({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        let __VLS_87;
        const __VLS_88 = {
            /** @type {typeof __VLS_87.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_88;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_85;
        var __VLS_86;
        const { default: __VLS_89 } = __VLS_nonNull(__VLS_85.slots);
        // @ts-ignore
        [];
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            // @ts-ignore
            type: "submit", form: "lactation-form", loading: (save.value.isPending.value),
        }));
        const __VLS_92 = __VLS_91({
            type: "submit",
            form: "lactation-form",
            loading: (save.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        var __VLS_93;
        const { default: __VLS_95 } = __VLS_nonNull(__VLS_93.slots);
        (mode.value === 'dryOff' ? 'Dry off' : 'Save');
        // @ts-ignore
        [mode, save,];
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
