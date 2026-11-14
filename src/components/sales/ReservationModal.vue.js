/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useBreedingData } from '@/composables/useBreeding';
import { useSalesData, useSalesMutations } from '@/composables/useSales';
import { todayISO } from '@/lib/dates';
import { parseMoney } from '@/lib/finances';
import { DEPOSIT_LABELS, WANTS_LABELS, defaultSeason, reservationProgress } from '@/lib/sales';
import BuyerPicker from './BuyerPicker.vue';
import HerdGoatPicker from '@/components/HerdGoatPicker.vue';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const today = todayISO();
const { data: breeding } = useBreedingData();
const { data } = useSalesData();
const { saveReservation, removeReservation } = useSalesMutations();
const form = reactive({
    buyer_id: null,
    doe_id: null,
    season: 0,
    wants: 'any',
    kid_count: 1,
    deposit: '',
    deposit_on: today,
    deposit_status: 'held',
    cancelled: false,
    notes: '',
});
watch(open, (isOpen) => {
    if (!isOpen)
        return;
    const r = props.reservation;
    const doe = r ? r.doe_id : (props.doeId ?? null);
    Object.assign(form, {
        buyer_id: r?.buyer_id ?? null,
        doe_id: doe,
        season: r?.season ?? props.season ?? defaultSeason(doe, breeding.value, today),
        wants: r?.wants ?? 'any',
        kid_count: r?.kid_count ?? 1,
        deposit: r?.deposit_cents ? (r.deposit_cents / 100).toFixed(2) : '',
        deposit_on: r?.deposit_on ?? today,
        deposit_status: (r?.deposit_status ?? 'held'),
        cancelled: !!r?.cancelled_on,
        notes: r?.notes ?? '',
    });
});
// A new reservation for a bred doe defaults to the season she's due.
watch(() => form.doe_id, (doe) => {
    if (open.value && !props.reservation)
        form.season = props.season ?? defaultSeason(doe, breeding.value, today);
});
const wantsOptions = Object.entries(WANTS_LABELS).map(([value, label]) => ({ label, value }));
// Once an adoption has used the deposit, it's settled there.
const depositLocked = computed(() => props.reservation?.deposit_status === 'applied');
const statusOptions = ['held', 'refunded', 'kept'].map((value) => ({ label: DEPOSIT_LABELS[value], value }));
const progress = computed(() => (props.reservation ? reservationProgress(props.reservation, data.value.sales) : undefined));
async function submit() {
    if (!form.buyer_id)
        return toast.add({ color: 'error', title: 'Pick an adopter' });
    const deposit = parseMoney(form.deposit);
    if (deposit === 'invalid')
        return toast.add({ color: 'error', title: 'Deposit must be an amount like 100 or 100.00' });
    // A new reservation goes to the end of its doe's line.
    const line = data.value.reservations.filter((r) => r.season === form.season && r.doe_id === form.doe_id && r.id !== props.reservation?.id);
    const position = props.reservation && props.reservation.season === form.season && props.reservation.doe_id === form.doe_id
        ? props.reservation.position
        : Math.max(0, ...line.map((r) => r.position)) + 1;
    try {
        await saveReservation.mutateAsync({
            id: props.reservation?.id,
            values: {
                buyer_id: form.buyer_id,
                doe_id: form.doe_id,
                season: form.season,
                wants: form.wants,
                kid_count: form.kid_count,
                position,
                ...(depositLocked.value
                    ? {}
                    : { deposit_cents: deposit, deposit_on: deposit ? form.deposit_on : null, deposit_status: deposit ? form.deposit_status : 'held' }),
                cancelled_on: form.cancelled ? (props.reservation?.cancelled_on ?? today) : null,
                notes: form.notes.trim() || null,
            },
        });
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save reservation', description: e.message });
    }
}
async function remove() {
    try {
        await removeReservation.mutateAsync(props.reservation.id);
        open.value = false;
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not delete', description: e.message });
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
    __VLS_withDotValue(depositLocked, {});
    __VLS_withDotValue(progress, {});
    __VLS_withDotValue(open, {});
    __VLS_withDotValue(saveReservation, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (__VLS_ctx.reservation ? 'Edit reservation' : 'New reservation'),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (__VLS_ctx.reservation ? 'Edit reservation' : 'New reservation'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            id: "reservation-form",
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
        const __VLS_13 = BuyerPicker;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (form.value.buyer_id),
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (form.value.buyer_id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        // @ts-ignore
        [open, reservation, form,];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            label: "Kids from", hint: "Leave empty for any doe",
        }));
        const __VLS_20 = __VLS_19({
            label: "Kids from",
            hint: "Leave empty for any doe",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        const __VLS_24 = HerdGoatPicker;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            modelValue: (form.value.doe_id), placeholder: "Any doe",
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (form.value.doe_id),
            placeholder: "Any doe",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-3 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            label: "Season",
        }));
        const __VLS_31 = __VLS_30({
            label: "Season",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        var __VLS_32;
        const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
        let __VLS_35;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            // @ts-ignore
            modelValue: (form.value.season), min: (2000), max: (2100), formatOptions: ({ useGrouping: false }), ...{ class: "w-full" },
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (form.value.season),
            min: (2000),
            max: (2100),
            formatOptions: ({ useGrouping: false }),
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
            label: "Wants",
        }));
        const __VLS_42 = __VLS_41({
            label: "Wants",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            modelValue: (form.value.wants), items: (__VLS_unwrap(wantsOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_48 = __VLS_47({
            modelValue: (form.value.wants),
            items: (__VLS_unwrap(wantsOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, wantsOptions,];
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            // @ts-ignore
            label: "How many",
        }));
        const __VLS_53 = __VLS_52({
            label: "How many",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        var __VLS_54;
        const { default: __VLS_56 } = __VLS_nonNull(__VLS_54.slots);
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UInputNumber} */
        UInputNumber;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            modelValue: (form.value.kid_count), min: (1), max: (10), ...{ class: "w-full" },
        }));
        const __VLS_59 = __VLS_58({
            modelValue: (form.value.kid_count),
            min: (1),
            max: (10),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        if (depositLocked.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-3 gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                // @ts-ignore
                label: "Deposit",
            }));
            const __VLS_64 = __VLS_63({
                label: "Deposit",
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            var __VLS_65;
            const { default: __VLS_67 } = __VLS_nonNull(__VLS_65.slots);
            let __VLS_68;
            /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                // @ts-ignore
                modelValue: (form.value.deposit), inputmode: "decimal", ...{ class: "w-full" },
            }));
            const __VLS_70 = __VLS_69({
                modelValue: (form.value.deposit),
                inputmode: "decimal",
                ...{ class: "w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            var __VLS_71;
            const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
            {
                const { leading: __VLS_74 } = __VLS_nonNull(__VLS_71.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                // @ts-ignore
                [form, depositLocked,];
            }
            // @ts-ignore
            [];
            // @ts-ignore
            [];
            if (form.value.deposit.trim()) {
                let __VLS_75;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                    // @ts-ignore
                    label: "Received",
                }));
                const __VLS_77 = __VLS_76({
                    label: "Received",
                }, ...__VLS_functionalComponentArgsRest(__VLS_76));
                var __VLS_78;
                const { default: __VLS_80 } = __VLS_nonNull(__VLS_78.slots);
                let __VLS_81;
                /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                    // @ts-ignore
                    modelValue: (form.value.deposit_on), type: "date", max: (__VLS_unwrap(today, {})), ...{ class: "w-full" },
                }));
                const __VLS_83 = __VLS_82({
                    modelValue: (form.value.deposit_on),
                    type: "date",
                    max: (__VLS_unwrap(today, {})),
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_82));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [form, form, today,];
            }
            if (form.value.deposit.trim() && __VLS_ctx.reservation?.deposit_cents) {
                let __VLS_86;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
                    // @ts-ignore
                    label: "Deposit is",
                }));
                const __VLS_88 = __VLS_87({
                    label: "Deposit is",
                }, ...__VLS_functionalComponentArgsRest(__VLS_87));
                var __VLS_89;
                const { default: __VLS_91 } = __VLS_nonNull(__VLS_89.slots);
                let __VLS_92;
                /** @ts-ignore @type { | typeof __VLS_components.USelect} */
                USelect;
                // @ts-ignore
                const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                    // @ts-ignore
                    modelValue: (form.value.deposit_status), items: (__VLS_unwrap(statusOptions, {})), ...{ class: "w-full" },
                }));
                const __VLS_94 = __VLS_93({
                    modelValue: (form.value.deposit_status),
                    items: (__VLS_unwrap(statusOptions, {})),
                    ...{ class: "w-full" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_93));
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                // @ts-ignore
                [reservation, form, form, statusOptions,];
            }
        }
        let __VLS_97;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
            // @ts-ignore
            label: "Notes",
        }));
        const __VLS_99 = __VLS_98({
            label: "Notes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        var __VLS_100;
        const { default: __VLS_102 } = __VLS_nonNull(__VLS_100.slots);
        let __VLS_103;
        /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
        UTextarea;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            // @ts-ignore
            modelValue: (form.value.notes), rows: (2), maxlength: "10000", ...{ class: "w-full" },
        }));
        const __VLS_105 = __VLS_104({
            modelValue: (form.value.notes),
            rows: (2),
            maxlength: "10000",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        if (__VLS_ctx.reservation) {
            let __VLS_108;
            /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
            UCheckbox;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
                // @ts-ignore
                modelValue: (form.value.cancelled), label: "Cancelled",
            }));
            const __VLS_110 = __VLS_109({
                modelValue: (form.value.cancelled),
                label: "Cancelled",
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        }
        if (progress.value?.matched) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
            (progress.value.matched);
            (progress.value.matched === 1 ? 'kid' : 'kids');
            (progress.value.sold);
        }
        // @ts-ignore
        [reservation, form, progress, progress, progress, progress,];
    }
    {
        const { footer: __VLS_113 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        if (__VLS_ctx.reservation && !progress.value?.matched) {
            let __VLS_114;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost",
            }));
            const __VLS_116 = __VLS_115({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
            }, ...__VLS_functionalComponentArgsRest(__VLS_115));
            let __VLS_119;
            const __VLS_120 = {
                /** @type {typeof __VLS_119.click} */
                onClick: (remove),
            };
            void __VLS_120;
            var __VLS_117;
            var __VLS_118;
            const { default: __VLS_121 } = __VLS_nonNull(__VLS_117.slots);
            // @ts-ignore
            [reservation, progress,];
        }
        let __VLS_122;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "neutral", variant: "ghost",
        }));
        const __VLS_124 = __VLS_123({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        let __VLS_127;
        const __VLS_128 = {
            /** @type {typeof __VLS_127.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_128;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_125;
        var __VLS_126;
        const { default: __VLS_129 } = __VLS_nonNull(__VLS_125.slots);
        // @ts-ignore
        [];
        let __VLS_130;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
            // @ts-ignore
            type: "submit", form: "reservation-form", loading: (saveReservation.value.isPending.value),
        }));
        const __VLS_132 = __VLS_131({
            type: "submit",
            form: "reservation-form",
            loading: (saveReservation.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        var __VLS_133;
        const { default: __VLS_135 } = __VLS_nonNull(__VLS_133.slots);
        // @ts-ignore
        [saveReservation,];
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
