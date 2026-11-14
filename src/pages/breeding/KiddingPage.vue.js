/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useBreedingData, useBreedingMutations } from '@/composables/useBreeding';
import { formatDate, todayISO } from '@/lib/dates';
import { breedingStatus, dueWindow } from '@/lib/breeding';
import { goatFullName, goatName } from '@/lib/goats';
import { parseWeightInput } from '@/lib/milk';
import DoePicker from '@/components/HerdGoatPicker.vue';
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { byId, pathOf } = useHerdGoats();
const { data } = useBreedingData();
const { recordKidding } = useBreedingMutations();
const doeId = ref(route.query.doe ?? null);
const kiddedOn = ref(todayISO());
const difficulty = ref('unassisted');
const notes = ref('');
const startLactation = ref(true);
// Her breedings that could be this kidding, newest first.
const breedings = computed(() => data.value.breedings
    .filter((b) => b.doe_id === doeId.value && b.bred_on < kiddedOn.value)
    .filter((b) => breedingStatus(b, data.value, kiddedOn.value) !== 'kidded')
    .sort((a, b) => b.bred_on.localeCompare(a.bred_on)));
const breedingLabel = (b) => {
    const buck = b.buck_id ? byId.value.get(b.buck_id) : undefined;
    return `${formatDate(b.bred_on)}${buck ? ` to ${goatFullName(buck)}` : ''} · due ${formatDate(dueWindow(b).expected)}`;
};
const breedingOptions = computed(() => [
    ...breedings.value.map((b) => ({ label: breedingLabel(b), value: b.id })),
    { label: 'No breeding on record', value: 'none' },
]);
const breedingId = ref(route.query.breeding ?? 'none');
// Default to her latest breeding. Immediate: the breeding list may already be
// loaded when the form opens (e.g. the link was tapped before it carried one).
watch(breedings, (list) => {
    if (!list.some((b) => b.id === breedingId.value))
        breedingId.value = list[0]?.id ?? 'none';
}, { immediate: true });
const sire = computed(() => {
    const b = data.value.breedings.find((x) => x.id === breedingId.value);
    return b?.buck_id ? byId.value.get(b.buck_id) : undefined;
});
const doe = computed(() => (doeId.value ? byId.value.get(doeId.value) : undefined));
const newKid = (sex = 'doe') => ({ sex, outcome: 'alive', weight: '', name: '', add_to_herd: true, error: '' });
const kids = reactive([newKid()]);
const sexOptions = [
    { label: 'Doeling', value: 'doe' },
    { label: 'Buckling', value: 'buck' },
];
const outcomeOptions = [
    { label: 'Alive', value: 'alive' },
    { label: 'Stillborn', value: 'stillborn' },
    { label: 'Died', value: 'died' },
];
const difficultyOptions = [
    { label: 'Unassisted', value: 'unassisted' },
    { label: 'Assisted', value: 'assisted' },
    { label: 'Vet needed', value: 'vet' },
];
async function submit() {
    if (!doeId.value)
        return toast.add({ color: 'error', title: 'Pick the doe that kidded' });
    let ok = true;
    const kidInputs = kids.map((k) => {
        k.error = '';
        const parsed = parseWeightInput(k.weight, unit.value, { grams: 10_000, message: 'That is heavier than a newborn kid' });
        if (parsed.kind === 'invalid' || (parsed.kind === 'ok' && parsed.portions)) {
            k.error = parsed.kind === 'invalid' ? parsed.message : 'Birth weight should be one number, like 2.4';
            ok = false;
        }
        return {
            sex: k.sex,
            outcome: k.outcome,
            birth_weight_g: parsed.kind === 'ok' ? parsed.grams : null,
            add_to_herd: k.outcome === 'alive' && k.add_to_herd,
            name: k.name.trim() || undefined,
        };
    });
    if (!ok)
        return;
    try {
        await recordKidding.mutateAsync({
            doeId: doeId.value,
            kiddedOn: kiddedOn.value,
            breedingId: breedingId.value === 'none' ? null : breedingId.value,
            difficulty: difficulty.value,
            notes: notes.value,
            kids: kidInputs,
            startLactation: startLactation.value,
        });
        toast.add({ color: 'success', title: 'Kidding recorded' });
        await router.replace(pathOf(doeId.value));
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not record kidding', description: e.message });
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(router, {});
    __VLS_withDotValue(doeId, {});
    __VLS_withDotValue(sire, {});
    __VLS_withDotValue(kids, {});
    __VLS_withDotValue(doe, {});
    __VLS_withDotValue(recordKidding, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 max-w-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': "Back",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-arrow-left",
        'aria-label': "Back",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.click} */
        onClick: (...[$event]) => {
            void $event;
            return (router.value.back());
            // @ts-ignore
            [router,];
        },
    };
    void __VLS_6;
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (submit) },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    // @ts-ignore
    }));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    var __VLS_10;
    const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        // @ts-ignore
        label: "Doe", required: true,
    }));
    const __VLS_15 = __VLS_14({
        label: "Doe",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    var __VLS_16;
    const { default: __VLS_18 } = __VLS_nonNull(__VLS_16.slots);
    const __VLS_19 = DoePicker;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        // @ts-ignore
        modelValue: (doeId.value),
    }));
    const __VLS_21 = __VLS_20({
        modelValue: (doeId.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    // @ts-ignore
    [doeId,];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid sm:grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        // @ts-ignore
        label: "Kidded on", required: true,
    }));
    const __VLS_26 = __VLS_25({
        label: "Kidded on",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_27;
    const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        // @ts-ignore
        modelValue: (__VLS_unwrap(kiddedOn, {})), type: "date", max: (__VLS_unwrap(todayISO, {})()), required: true, ...{ class: "w-full" },
    }));
    const __VLS_32 = __VLS_31({
        modelValue: (__VLS_unwrap(kiddedOn, {})),
        type: "date",
        max: (__VLS_unwrap(todayISO, {})()),
        required: true,
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [kiddedOn, todayISO,];
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        // @ts-ignore
        label: "Kidding",
    }));
    const __VLS_37 = __VLS_36({
        label: "Kidding",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    var __VLS_38;
    const { default: __VLS_40 } = __VLS_nonNull(__VLS_38.slots);
    let __VLS_41;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        // @ts-ignore
        modelValue: (__VLS_unwrap(difficulty, {})), items: (__VLS_unwrap(difficultyOptions, {})), ...{ class: "w-full" },
    }));
    const __VLS_43 = __VLS_42({
        modelValue: (__VLS_unwrap(difficulty, {})),
        items: (__VLS_unwrap(difficultyOptions, {})),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [difficulty, difficultyOptions,];
    if (doeId.value) {
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            label: "From breeding", hint: (sire.value ? `Sire: ${__VLS_unwrap(goatFullName, {})(sire.value)}` : undefined),
        }));
        const __VLS_48 = __VLS_47({
            label: "From breeding",
            hint: (sire.value ? `Sire: ${__VLS_unwrap(goatFullName, {})(sire.value)}` : undefined),
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        var __VLS_49;
        const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            // @ts-ignore
            modelValue: (__VLS_unwrap(breedingId, {})), items: (__VLS_unwrap(breedingOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_54 = __VLS_53({
            modelValue: (__VLS_unwrap(breedingId, {})),
            items: (__VLS_unwrap(breedingOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [doeId, sire, sire, goatFullName, breedingId, breedingOptions,];
    }
    // @ts-ignore
    [];
    let __VLS_57;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    // @ts-ignore
    }));
    const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
    var __VLS_60;
    const { default: __VLS_62 } = __VLS_nonNull(__VLS_60.slots);
    {
        const { header: __VLS_63 } = __VLS_nonNull(__VLS_60.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        if (kids.value.length < 8) {
            let __VLS_64;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-plus",
            }));
            const __VLS_66 = __VLS_65({
                ...{ 'onClick': {} },
                size: "sm",
                variant: "soft",
                icon: "i-lucide-plus",
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            let __VLS_69;
            const __VLS_70 = {
                /** @type {typeof __VLS_69.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(kids.value.length < 8))
                        throw 0;
                    return (kids.value.push(__VLS_unwrap(newKid, {})('buck')));
                    // @ts-ignore
                    [kids, kids, newKid,];
                },
            };
            void __VLS_70;
            var __VLS_67;
            var __VLS_68;
            const { default: __VLS_71 } = __VLS_nonNull(__VLS_67.slots);
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    const __VLS_72 = __VLS_tryAsConstant((kids.value));
    for (const [kid, i] of __VLS_vFor(__VLS_nonNull(__VLS_72))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)({
            key: (i),
            ...{ class: "space-y-2 border-b border-default pb-4 last:border-0 last:pb-0" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:border-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:pb-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.legend, __VLS_intrinsics.legend)({
            ...{ class: "sr-only" },
        });
        /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
        (i + 1);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-end gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-medium w-12" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
        (i + 1);
        let __VLS_73;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            // @ts-ignore
            label: "Sex", ...{ class: "w-32" },
        }));
        const __VLS_75 = __VLS_74({
            label: "Sex",
            ...{ class: "w-32" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        var __VLS_76;
        const { default: __VLS_78 } = __VLS_nonNull(__VLS_76.slots);
        let __VLS_79;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            // @ts-ignore
            modelValue: (kid.sex), items: (__VLS_unwrap(sexOptions, {})), ...{ class: "w-full" }, 'aria-label': (`Kid ${i + 1} sex`),
        }));
        const __VLS_81 = __VLS_80({
            modelValue: (kid.sex),
            items: (__VLS_unwrap(sexOptions, {})),
            ...{ class: "w-full" },
            'aria-label': (`Kid ${i + 1} sex`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [kids, sexOptions,];
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            // @ts-ignore
            label: "Born", ...{ class: "w-32" },
        }));
        const __VLS_86 = __VLS_85({
            label: "Born",
            ...{ class: "w-32" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        var __VLS_87;
        const { default: __VLS_89 } = __VLS_nonNull(__VLS_87.slots);
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            // @ts-ignore
            modelValue: (kid.outcome), items: (__VLS_unwrap(outcomeOptions, {})), ...{ class: "w-full" }, 'aria-label': (`Kid ${i + 1} outcome`),
        }));
        const __VLS_92 = __VLS_91({
            modelValue: (kid.outcome),
            items: (__VLS_unwrap(outcomeOptions, {})),
            ...{ class: "w-full" },
            'aria-label': (`Kid ${i + 1} outcome`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [outcomeOptions,];
        let __VLS_95;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            // @ts-ignore
            label: (`Weight (${__VLS_unwrap(unit, {})})`), ...{ class: "w-28" }, error: (kid.error || undefined),
        }));
        const __VLS_97 = __VLS_96({
            label: (`Weight (${__VLS_unwrap(unit, {})})`),
            ...{ class: "w-28" },
            error: (kid.error || undefined),
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
        var __VLS_98;
        const { default: __VLS_100 } = __VLS_nonNull(__VLS_98.slots);
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            // @ts-ignore
            modelValue: (kid.weight), inputmode: "decimal", ...{ class: "w-full" }, 'aria-label': (`Kid ${i + 1} weight`),
        }));
        const __VLS_103 = __VLS_102({
            modelValue: (kid.weight),
            inputmode: "decimal",
            ...{ class: "w-full" },
            'aria-label': (`Kid ${i + 1} weight`),
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [unit,];
        if (kids.value.length > 1) {
            let __VLS_106;
            /** @ts-ignore @type { | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "neutral", variant: "ghost", icon: "i-lucide-x", 'aria-label': (`Remove kid ${i + 1}`),
            }));
            const __VLS_108 = __VLS_107({
                ...{ 'onClick': {} },
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-x",
                'aria-label': (`Remove kid ${i + 1}`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_107));
            let __VLS_111;
            const __VLS_112 = {
                /** @type {typeof __VLS_111.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(kids.value.length > 1))
                        throw 0;
                    return (kids.value.splice(i, 1));
                    // @ts-ignore
                    [kids, kids,];
                },
            };
            void __VLS_112;
            var __VLS_109;
            var __VLS_110;
        }
        if (kid.outcome === 'alive') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap items-center gap-3 ps-14" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['ps-14']} */ ;
            let __VLS_113;
            /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
            UCheckbox;
            // @ts-ignore
            const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
                // @ts-ignore
                modelValue: (kid.add_to_herd), label: (`Add to herd`),
            }));
            const __VLS_115 = __VLS_114({
                modelValue: (kid.add_to_herd),
                label: (`Add to herd`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_114));
            if (kid.add_to_herd) {
                let __VLS_118;
                /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
                    // @ts-ignore
                    modelValue: (kid.name), placeholder: (doe.value ? `${doe.value.barn_name || __VLS_unwrap(goatName, {})(doe.value)} kid ${i + 1}` : 'Barn name'), maxlength: "100", ...{ class: "flex-1 min-w-40" }, 'aria-label': (`Kid ${i + 1} name`),
                }));
                const __VLS_120 = __VLS_119({
                    modelValue: (kid.name),
                    placeholder: (doe.value ? `${doe.value.barn_name || __VLS_unwrap(goatName, {})(doe.value)} kid ${i + 1}` : 'Barn name'),
                    maxlength: "100",
                    ...{ class: "flex-1 min-w-40" },
                    'aria-label': (`Kid ${i + 1} name`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_119));
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-40']} */ ;
            }
        }
        // @ts-ignore
        [doe, doe, doe, goatName,];
    }
    // @ts-ignore
    [];
    let __VLS_123;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    // @ts-ignore
    }));
    const __VLS_125 = __VLS_124({}, ...__VLS_functionalComponentArgsRest(__VLS_124));
    var __VLS_126;
    const { default: __VLS_128 } = __VLS_nonNull(__VLS_126.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    let __VLS_129;
    /** @ts-ignore @type { | typeof __VLS_components.UCheckbox} */
    UCheckbox;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
        // @ts-ignore
        modelValue: (__VLS_unwrap(startLactation, {})), label: "Start her new lactation (adds her to the milk line)",
    }));
    const __VLS_131 = __VLS_130({
        modelValue: (__VLS_unwrap(startLactation, {})),
        label: "Start her new lactation (adds her to the milk line)",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_134;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        // @ts-ignore
        label: "Notes",
    }));
    const __VLS_136 = __VLS_135({
        label: "Notes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    var __VLS_137;
    const { default: __VLS_139 } = __VLS_nonNull(__VLS_137.slots);
    let __VLS_140;
    /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
    UTextarea;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
        // @ts-ignore
        modelValue: (__VLS_unwrap(notes, {})), rows: (2), autoresize: true, maxlength: "10000", ...{ class: "w-full" }, placeholder: "Presentation, help needed, anything to remember",
    }));
    const __VLS_142 = __VLS_141({
        modelValue: (__VLS_unwrap(notes, {})),
        rows: (2),
        autoresize: true,
        maxlength: "10000",
        ...{ class: "w-full" },
        placeholder: "Presentation, help needed, anything to remember",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [startLactation, notes,];
    // @ts-ignore
    [];
    if (recordKidding.value.isPaused.value) {
        let __VLS_145;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
            // @ts-ignore
            color: "warning", variant: "subtle", icon: "i-lucide-wifi-off", title: "No signal. This kidding will save as soon as you are back online.", description: "Keep this screen open until it does.",
        }));
        const __VLS_147 = __VLS_146({
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-wifi-off",
            title: "No signal. This kidding will save as soon as you are back online.",
            description: "Keep this screen open until it does.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    }
    let __VLS_150;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        // @ts-ignore
        type: "submit", size: "lg", loading: (recordKidding.value.isPending.value),
    }));
    const __VLS_152 = __VLS_151({
        type: "submit",
        size: "lg",
        loading: (recordKidding.value.isPending.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    var __VLS_153;
    const { default: __VLS_155 } = __VLS_nonNull(__VLS_153.slots);
    // @ts-ignore
    [recordKidding, recordKidding,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
