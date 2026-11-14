/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useChoreLog, useChoresData } from '@/composables/useChores';
import { useHerdMembers } from '@/composables/useHerdMembers';
import { formatDate, todayISO } from '@/lib/dates';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { data } = useChoresData();
const { markDone, removeDone } = useChoreLog();
const { nameOf } = useHerdMembers();
const today = todayISO();
const form = reactive({ doneOn: today, notes: '' });
watch(open, (isOpen) => {
    if (isOpen)
        Object.assign(form, { doneOn: today, notes: '' });
});
const history = computed(() => data.value.done
    .filter((d) => d.chore_id === props.chore?.id)
    .sort((a, b) => b.done_on.localeCompare(a.done_on) || b.created_at.localeCompare(a.created_at)));
function submit() {
    if (!props.chore || !form.doneOn)
        return;
    // Doesn't wait for the server: with no signal it's kept on the phone and sent later.
    markDone({ choreId: props.chore.id, doneOn: form.doneOn, notes: form.notes }).saved.catch((e) => toast.add({ color: 'error', title: 'Could not save', description: e.message }));
    toast.add({ color: 'success', title: `${props.chore.name} done ${form.doneOn === today ? 'today' : formatDate(form.doneOn)}` });
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
    __VLS_withDotValue(history, {});
    __VLS_withDotValue(open, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.chore?.name ?? 'Chore'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.chore?.name ?? 'Chore'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "chore-form",
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
            label: "Done on", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Done on",
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
            modelValue: (form.value.doneOn), type: "date", max: (__VLS_unwrap(today, {})), required: true, ...{ class: "w-full" },
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.doneOn),
            type: "date",
            max: (__VLS_unwrap(today, {})),
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [open, chore, form, today,];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_20 = __VLS_19({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        let __VLS_24;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.notes), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.notes),
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "mt-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-medium mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        if (!history.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "max-h-64 overflow-y-auto rounded-md border border-default divide-y divide-default text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['max-h-64']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
            /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            const __VLS_29 = __VLS_tryAsConstant((history.value));
            for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_29))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (d.id),
                    ...{ class: "flex items-start gap-2 px-3 py-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "flex-1 min-w-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_unwrap(formatDate, {})(d.done_on));
                if (__VLS_unwrap(nameOf, {})(d.created_by)) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(nameOf, {})(d.created_by));
                }
                if (d.notes) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "block text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (d.notes);
                }
                let __VLS_30;
                /** @ts-ignore @type { | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "xs", color: "neutral", variant: "ghost", icon: "i-lucide-trash-2", 'aria-label': (`Delete ${__VLS_unwrap(formatDate, {})(d.done_on)}`),
                }));
                const __VLS_32 = __VLS_31({
                    ...{ 'onClick': {} },
                    size: "xs",
                    color: "neutral",
                    variant: "ghost",
                    icon: "i-lucide-trash-2",
                    'aria-label': (`Delete ${__VLS_unwrap(formatDate, {})(d.done_on)}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_31));
                let __VLS_35;
                const __VLS_36 = {
                    /** @type {typeof __VLS_35.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(!history.value.length))
                            throw 0;
                        return (__VLS_unwrap(removeDone, {})(d.id));
                        // @ts-ignore
                        [history, history, formatDate, formatDate, nameOf, nameOf, removeDone,];
                    },
                };
                void __VLS_36;
                var __VLS_33;
                var __VLS_34;
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_37 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_38;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_40 = __VLS_39({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_43;
        const __VLS_44 = {
            /** @type {typeof __VLS_43.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_44;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_41;
        var __VLS_42;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_41.slots);
        // @ts-ignore
        [];
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            type: "submit", form: "chore-form",
        }));
        const __VLS_48 = __VLS_47({
            type: "submit",
            form: "chore-form",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        var __VLS_49;
        const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
        // @ts-ignore
        [];
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
