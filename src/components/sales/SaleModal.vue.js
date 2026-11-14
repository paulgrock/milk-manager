/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useSalesData, useSalesMutations } from '@/composables/useSales';
import { todayISO } from '@/lib/dates';
import { formatMoney, parseMoney } from '@/lib/finances';
import BuyerPicker from './BuyerPicker.vue';
import HerdGoatPicker from '@/components/HerdGoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const today = todayISO();
const { data } = useSalesData();
const { saveSale, removeSale } = useSalesMutations();
const form = reactive({
    buyer_id: null,
    what: 'kid',
    kid_id: null,
    goat_id: null,
    price: '',
    sold_on: today,
    pickup_on: '',
    notes: '',
});
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const s = props.sale;
    Object.assign(form, {
        buyer_id: s?.buyer_id ?? null,
        what: s && !s.kid_id ? 'goat' : 'kid',
        kid_id: s?.kid_id ?? props.kid?.kid.id ?? null,
        goat_id: s?.goat_id ?? null,
        price: s?.price_cents ? (s.price_cents / 100).toFixed(2) : '',
        sold_on: s?.sold_on ?? today,
        pickup_on: s?.pickup_on ?? '',
        notes: s?.notes ?? '',
    });
});
// What's being sold is fixed once matched or chosen from a kid.
const fixed = computed(() => !!props.sale || !!props.kid);
const kidItems = computed(() => (props.kids ?? []).map((k) => ({ label: k.label, value: k.kid.id })));
const whatOptions = [
    { label: 'A kid', value: 'kid' },
    { label: 'A goat', value: 'goat' },
];
const reservation = computed(() => data.value.reservations.find((r) => r.id === props.sale?.reservation_id));
const buyerFixed = computed(() => !!reservation.value);
// The deposit comes off the adoption fee: either already (this sale used it) or when it's saved.
const deposit = computed(() => {
    if (props.sale?.deposit_applied_cents)
        return props.sale.deposit_applied_cents;
    return reservation.value?.deposit_status === 'held' ? (reservation.value.deposit_cents ?? 0) : 0;
});
const price = computed(() => parseMoney(form.price));
const balance = computed(() => (typeof price.value === 'number' ? Math.max(0, price.value - Math.min(deposit.value, price.value)) : null));
async function submit() {
    if (!form.buyer_id)
        return toast.add({ color: 'error', title: 'Pick an adopter' });
    if (typeof price.value !== 'number')
        return toast.add({ color: 'error', title: 'Enter the adoption fee, like 450 or 450.00' });
    const kid = (props.kids ?? []).find((k) => k.kid.id === form.kid_id) ?? props.kid;
    const values = form.what === 'kid' || props.sale?.kid_id
        ? { kid_id: form.kid_id, goat_id: kid?.kid.goat_id ?? props.sale?.goat_id ?? null }
        : { kid_id: null, goat_id: form.goat_id };
    if (!values.kid_id && !values.goat_id)
        return toast.add({ color: 'error', title: form.what === 'kid' ? 'Pick the kid' : 'Pick the goat' });
    try {
        await saveSale.mutateAsync({
            id: props.sale?.id,
            values: {
                ...values,
                buyer_id: form.buyer_id,
                reservation_id: props.sale?.reservation_id ?? null,
                price_cents: price.value,
                sold_on: form.sold_on,
                pickup_on: form.pickup_on || null,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save adoption', description: e.message });
    }
}
// An adoption from a reservation goes back to matched; any other is removed.
async function undo() {
    const s = props.sale;
    try {
        if (s.reservation_id)
            await saveSale.mutateAsync({ id: s.id, values: { ...s, sold_on: null, pickup_on: null } });
        else
            await removeSale.mutateAsync(s.id);
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not undo', description: e.message });
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
    __VLS_withDotValue(buyerFixed, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(fixed, {});
    __VLS_withDotValue(deposit, {});
    __VLS_withDotValue(balance, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveSale, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.sale?.sold_on ? 'Edit adoption' : 'Record an adoption'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.sale?.sold_on ? 'Edit adoption' : 'Record an adoption'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "sale-form",
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Adopter", required: true,
        }));
        const __VLS_9 = __VLS_8({
            label: "Adopter",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        if (!buyerFixed.value) {
            const __VLS_13 = BuyerPicker;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                // @ts-ignore
                modelValue: (form.value.buyer_id),
            }));
            const __VLS_15 = __VLS_14({
                modelValue: (form.value.buyer_id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (data.value.buyers.find((b) => b.id === form.value.buyer_id)?.name);
        }
        // @ts-ignore
        [open, sale, buyerFixed, form, form, data,];
        if (!fixed.value) {
            let __VLS_18;
            /** @ts-ignore @type { | typeof __VLS_components.UTabs} */
            UTabs;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
                // @ts-ignore
                modelValue: (form.value.what), items: (__VLS_unwrap(whatOptions, {})), content: (false), size: "sm", ui: ({ list: 'w-auto' }),
            }));
            const __VLS_20 = __VLS_19({
                modelValue: (form.value.what),
                items: (__VLS_unwrap(whatOptions, {})),
                content: (false),
                size: "sm",
                ui: ({ list: 'w-auto' }),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            if (form.value.what === 'kid') {
                let __VLS_23;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
                    // @ts-ignore
                    label: "Kid", required: true,
                }));
                const __VLS_25 = __VLS_24({
                    label: "Kid",
                    required: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_24));
                var __VLS_26;
                const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
                let __VLS_29;
                /** @ts-ignore @type { | typeof __VLS_components.USelect} */
                USelect;
                // @ts-ignore
                const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                    // @ts-ignore
                    modelValue: (form.value.kid_id), items: (__VLS_unwrap(kidItems, {})), placeholder: "Pick a kid born this season", ...{ class: "w-full" },
                }));
                const __VLS_31 = __VLS_30({
                    modelValue: (form.value.kid_id),
                    items: (__VLS_unwrap(kidItems, {})),
                    placeholder: "Pick a kid born this season",
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_30));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [form, form, form, fixed, whatOptions, kidItems,];
            }
            else {
                let __VLS_34;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    // @ts-ignore
                    label: "Goat", required: true,
                }));
                const __VLS_36 = __VLS_35({
                    label: "Goat",
                    required: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                var __VLS_37;
                const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
                const __VLS_40 = HerdGoatPicker;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                    // @ts-ignore
                    modelValue: (form.value.goat_id), sex: "any",
                }));
                const __VLS_42 = __VLS_41({
                    modelValue: (form.value.goat_id),
                    sex: "any",
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                // @ts-ignore
                [form,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-3 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_45;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            // @ts-ignore
            label: "Adoption fee", required: true,
        }));
        const __VLS_47 = __VLS_46({
            label: "Adoption fee",
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
            modelValue: (form.value.price), inputmode: "decimal", ...{ class: "w-full" },
        }));
        const __VLS_53 = __VLS_52({
            modelValue: (form.value.price),
            inputmode: "decimal",
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
            label: "Adopted on", required: true,
        }));
        const __VLS_60 = __VLS_59({
            label: "Adopted on",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        var __VLS_61;
        const { default: __VLS_63 } = __VLS_nonNull(__VLS_61.slots);
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            // @ts-ignore
            modelValue: (form.value.sold_on), type: "date", required: true, ...{ class: "w-full" },
        }));
        const __VLS_66 = __VLS_65({
            modelValue: (form.value.sold_on),
            type: "date",
            required: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_69;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            // @ts-ignore
            label: "Pickup",
        }));
        const __VLS_71 = __VLS_70({
            label: "Pickup",
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        var __VLS_72;
        const { default: __VLS_74 } = __VLS_nonNull(__VLS_72.slots);
        let __VLS_75;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            // @ts-ignore
            modelValue: (form.value.pickup_on), type: "date", min: (form.value.sold_on), ...{ class: "w-full" },
        }));
        const __VLS_77 = __VLS_76({
            modelValue: (form.value.pickup_on),
            type: "date",
            min: (form.value.sold_on),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form,];
        if (deposit.value && balance.value !== null) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(formatMoney, {})(Math.min(deposit.value, __VLS_unwrap(price, {}))));
            (__VLS_unwrap(formatMoney, {})(balance.value));
        }
        else if (balance.value !== null) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (__VLS_unwrap(formatMoney, {})(balance.value));
        }
        let __VLS_80;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_82 = __VLS_81({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        var __VLS_83;
        const { default: __VLS_85 } = __VLS_nonNull(__VLS_83.slots);
        let __VLS_86;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_88 = __VLS_87({
            modelValue: (form.value.notes),
            rows: (2),
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, deposit, deposit, balance, balance, balance, balance, formatMoney, formatMoney, formatMoney, price,];
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_91 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.sale?.sold_on) {
            let __VLS_92;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_94 = __VLS_93({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            let __VLS_97;
            const __VLS_98 = {
                /** @type {typeof __VLS_97.click} */
                onClick: (undo),
            };
            void __VLS_98;
            var __VLS_95;
            var __VLS_96;
            const { default: __VLS_99 } = __VLS_nonNull(__VLS_95.slots);
            (__VLS_ctx.sale.reservation_id ? 'Not adopted' : 'Delete adoption');
            // @ts-ignore
            [sale, sale,];
        }
        let __VLS_100;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_105;
        const __VLS_106 = {
            /** @type {typeof __VLS_105.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_106;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_103;
        var __VLS_104;
        const { default: __VLS_107 } = __VLS_nonNull(__VLS_103.slots);
        // @ts-ignore
        [];
        let __VLS_108;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            // @ts-ignore
            type: "submit", form: "sale-form", loading: (saveSale.value.isPending.value),
        }));
        const __VLS_110 = __VLS_109({
            type: "submit",
            form: "sale-form",
            loading: (saveSale.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        var __VLS_111;
        const { default: __VLS_113 } = __VLS_nonNull(__VLS_111.slots);
        // @ts-ignore
        [saveSale,];
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
