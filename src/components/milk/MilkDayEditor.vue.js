/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useMilkSaves } from '@/composables/useMilk';
import { useHerdMembers } from '@/composables/useHerdMembers';
import { formatDate } from '@/lib/dates';
import { goatName } from '@/lib/goats';
import { AM, DAY_TOTAL, PM, applyRecord, dayStatus, formatWeight, formatWeightInput, milkingLabel, parseWeightInput, partsExample, } from '@/lib/milk';
const { defineProps, defineModel, } = {};
const props = defineProps();
const open = defineModel('open', { required: true });
const toast = useToast();
const { record, clear } = useMilkSaves();
const { nameOf } = useHerdMembers();
const isDayTotal = computed(() => props.rows.some((r) => r.milking === DAY_TOTAL));
const extraSlots = ref([]);
// Milkings to show: AM and PM always (unless the day is a single total),
// plus any extras that are saved or being added.
const slots = computed(() => {
    if (isDayTotal.value)
        return [DAY_TOTAL];
    const saved = props.rows.map((r) => r.milking);
    return [...new Set([AM, PM, ...saved, ...extraSlots.value])].sort((a, b) => a - b);
});
const fields = reactive({});
// What each field last showed from saved data, to tell user edits apart.
const shown = {};
/**
 * Fills the fields from saved rows. When `keepEdits` is set, a field the user
 * has typed in is left alone: saving AM updates the rows, and that must not
 * wipe a PM weight typed but not yet saved.
 */
function load(keepEdits = false) {
    for (const slot of [DAY_TOTAL, AM, PM, 3, 4, 5, 6]) {
        const row = props.rows.find((r) => r.milking === slot);
        const next = { text: row ? formatWeightInput(row, props.entryUnit) : '', note: row?.note ?? '' };
        const field = fields[slot];
        const edited = keepEdits && field && shown[slot] && (field.text !== shown[slot].text || field.note !== shown[slot].note);
        if (!edited)
            fields[slot] = { ...next, error: field?.error ?? '' };
        shown[slot] = next;
    }
}
watch(open, (isOpen) => {
    if (isOpen) {
        extraSlots.value = [];
        load();
    }
}, { immediate: true });
watch(() => props.rows, () => load(true), { deep: true });
const rowFor = (slot) => props.rows.find((r) => r.milking === slot);
function save(slot) {
    const field = fields[slot];
    field.error = '';
    const existing = rowFor(slot);
    const parsed = parseWeightInput(field.text, props.entryUnit);
    if (parsed.kind === 'invalid') {
        field.error = parsed.message;
        return;
    }
    if (parsed.kind === 'empty') {
        if (existing)
            clear.mutate({ herdId: props.herdId, goatId: props.goat.id, milkedOn: props.date, milking: slot });
        return;
    }
    const note = field.note.trim() || null;
    const unchanged = existing &&
        existing.weight_g === parsed.grams &&
        JSON.stringify(existing.portions_g) === JSON.stringify(parsed.portions) &&
        (existing.note ?? null) === note;
    if (unchanged)
        return;
    const vars = {
        herdId: props.herdId,
        goatId: props.goat.id,
        milkedOn: props.date,
        milking: slot,
        grams: parsed.grams,
        portions: parsed.portions,
        note,
    };
    try {
        applyRecord(props.rows, vars);
    }
    catch (e) {
        field.error = e.message;
        return;
    }
    record.mutate(vars, {
        onError: (e) => toast.add({ color: 'error', title: `Could not save ${milkingLabel(slot)}`, description: e.message }),
    });
}
function addExtra() {
    const next = Math.max(PM, ...slots.value) + 1;
    if (next <= 6)
        extraSlots.value.push(next);
}
const status = computed(() => dayStatus(props.rows));
const splitHint = computed(() => {
    const total = rowFor(DAY_TOTAL);
    return total ? `Day total ${formatWeight(total.weight_g, props.unit, true)}` : '';
});
function splitDayTotal() {
    // Start entering AM; saving it splits the total (PM gets the rest).
    const total = rowFor(DAY_TOTAL);
    if (!total)
        return;
    splitting.value = true;
}
const splitting = ref(false);
const splitText = ref('');
const splitError = ref('');
function saveSplit() {
    splitError.value = '';
    const parsed = parseWeightInput(splitText.value, props.entryUnit);
    if (parsed.kind !== 'ok') {
        splitError.value = parsed.kind === 'invalid' ? parsed.message : 'Enter the AM weight';
        return;
    }
    const vars = { herdId: props.herdId, goatId: props.goat.id, milkedOn: props.date, milking: AM, grams: parsed.grams, portions: parsed.portions };
    try {
        applyRecord(props.rows, vars);
    }
    catch (e) {
        splitError.value = e.message;
        return;
    }
    record.mutate(vars, {
        onError: (e) => toast.add({ color: 'error', title: 'Could not split the day', description: e.message }),
    });
    splitting.value = false;
    splitText.value = '';
}
const useDayTotal = () => {
    extraSlots.value = [];
    enteringDayTotal.value = true;
};
const enteringDayTotal = ref(false);
watch(open, () => (enteringDayTotal.value = false));
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
    __VLS_withDotValue(status, {});
    __VLS_withDotValue(isDayTotal, {});
    __VLS_withDotValue(enteringDayTotal, {});
    __VLS_withDotValue(fields, {});
    __VLS_withDotValue(DAY_TOTAL, {});
    __VLS_withDotValue(splitting, {});
    __VLS_withDotValue(splitError, {});
    __VLS_withDotValue(open, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        open: (open.value), title: (`${__VLS_ctx.goat.barn_name || __VLS_unwrap(goatName, {})(__VLS_ctx.goat)} · ${__VLS_unwrap(formatDate, {})(__VLS_ctx.date)}`), description: (`Day total ${__VLS_unwrap(formatWeight, {})(status.value.totalG, __VLS_ctx.unit, true)}. Type parts like ${__VLS_unwrap(partsExample, {})(__VLS_ctx.entryUnit)} if you weighed a milking in more than one container.`),
    }));
    const __VLS_2 = __VLS_1({
        open: (open.value),
        title: (`${__VLS_ctx.goat.barn_name || __VLS_unwrap(goatName, {})(__VLS_ctx.goat)} · ${__VLS_unwrap(formatDate, {})(__VLS_ctx.date)}`),
        description: (`Day total ${__VLS_unwrap(formatWeight, {})(status.value.totalG, __VLS_ctx.unit, true)}. Type parts like ${__VLS_unwrap(partsExample, {})(__VLS_ctx.entryUnit)} if you weighed a milking in more than one container.`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { body: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        if (isDayTotal.value || enteringDayTotal.value) {
            let __VLS_7;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
                // @ts-ignore
                label: "Day total", error: (fields.value[DAY_TOTAL.value]?.error || undefined), hint: (__VLS_unwrap(rowFor, {})(DAY_TOTAL.value) && __VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(DAY_TOTAL.value).recorded_by) ? `by ${__VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(DAY_TOTAL.value).recorded_by)}` : undefined),
            }));
            const __VLS_9 = __VLS_8({
                label: "Day total",
                error: (fields.value[DAY_TOTAL.value]?.error || undefined),
                hint: (__VLS_unwrap(rowFor, {})(DAY_TOTAL.value) && __VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(DAY_TOTAL.value).recorded_by) ? `by ${__VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(DAY_TOTAL.value).recorded_by)}` : undefined),
            }, ...__VLS_functionalComponentArgsRest(__VLS_8));
            var __VLS_10;
            const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
            let __VLS_13;
            /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                // @ts-ignore
                ...{ 'onBlur': {} }, modelValue: (fields.value[DAY_TOTAL.value].text), inputmode: "text", autocomplete: "off", ...{ class: "w-full" }, size: "xl",
            }));
            const __VLS_15 = __VLS_14({
                ...{ 'onBlur': {} },
                modelValue: (fields.value[DAY_TOTAL.value].text),
                inputmode: "text",
                autocomplete: "off",
                ...{ class: "w-full" },
                size: "xl",
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            let __VLS_18;
            const __VLS_19 = {
                /** @type {typeof __VLS_18.blur} */
                onBlur: (...[$event]) => {
                    void $event;
                    __VLS_withDotValue(DAY_TOTAL, {});
                    if (!(isDayTotal.value || enteringDayTotal.value))
                        throw 0;
                    return (save(DAY_TOTAL.value));
                    // @ts-ignore
                    [open, goat, goat, goatName, formatDate, date, formatWeight, status, unit, partsExample, entryUnit, isDayTotal, enteringDayTotal, fields, fields, DAY_TOTAL, DAY_TOTAL, DAY_TOTAL, DAY_TOTAL, DAY_TOTAL, DAY_TOTAL, rowFor, rowFor, rowFor, nameOf, nameOf,];
                },
            };
            void __VLS_19;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            var __VLS_16;
            var __VLS_17;
            const { default: __VLS_20 } = __VLS_nonNull(__VLS_16.slots);
            {
                const { trailing: __VLS_21 } = __VLS_nonNull(__VLS_16.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_ctx.entryUnit);
                // @ts-ignore
                [entryUnit,];
            }
            // @ts-ignore
            [];
            // @ts-ignore
            [];
            let __VLS_22;
            /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
            UFormField;
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                // @ts-ignore
                label: "Note",
            }));
            const __VLS_24 = __VLS_23({
                label: "Note",
            }, ...__VLS_functionalComponentArgsRest(__VLS_23));
            var __VLS_25;
            const { default: __VLS_27 } = __VLS_nonNull(__VLS_25.slots);
            let __VLS_28;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
                // @ts-ignore
                ...{ 'onBlur': {} }, modelValue: (fields.value[DAY_TOTAL.value].note), ...{ class: "w-full" }, maxlength: "10000",
            }));
            const __VLS_30 = __VLS_29({
                ...{ 'onBlur': {} },
                modelValue: (fields.value[DAY_TOTAL.value].note),
                ...{ class: "w-full" },
                maxlength: "10000",
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            let __VLS_33;
            const __VLS_34 = {
                /** @type {typeof __VLS_33.blur} */
                onBlur: (...[$event]) => {
                    void $event;
                    __VLS_withDotValue(DAY_TOTAL, {});
                    if (!(isDayTotal.value || enteringDayTotal.value))
                        throw 0;
                    return (save(DAY_TOTAL.value));
                    // @ts-ignore
                    [fields, DAY_TOTAL, DAY_TOTAL,];
                },
            };
            void __VLS_34;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            var __VLS_31;
            var __VLS_32;
            // @ts-ignore
            [];
            if (isDayTotal.value) {
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
                if (splitting.value) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex gap-2 items-start" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                    let __VLS_35;
                    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                    UFormField;
                    // @ts-ignore
                    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
                        // @ts-ignore
                        error: (splitError.value || undefined), ...{ class: "flex-1" },
                    }));
                    const __VLS_37 = __VLS_36({
                        error: (splitError.value || undefined),
                        ...{ class: "flex-1" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
                    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                    var __VLS_38;
                    const { default: __VLS_40 } = __VLS_nonNull(__VLS_38.slots);
                    let __VLS_41;
                    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                    UInput;
                    // @ts-ignore
                    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                        // @ts-ignore
                        ...{ 'onKeydown': {} }, modelValue: (__VLS_unwrap(splitText, {})), inputmode: "text", placeholder: "AM weight", autofocus: true, ...{ class: "w-full" },
                    }));
                    const __VLS_43 = __VLS_42({
                        ...{ 'onKeydown': {} },
                        modelValue: (__VLS_unwrap(splitText, {})),
                        inputmode: "text",
                        placeholder: "AM weight",
                        autofocus: true,
                        ...{ class: "w-full" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
                    let __VLS_46;
                    const __VLS_47 = {
                        /** @type {typeof __VLS_46.keydown} */
                        onKeydown: (saveSplit),
                    };
                    void __VLS_47;
                    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                    var __VLS_44;
                    var __VLS_45;
                    // @ts-ignore
                    [isDayTotal, splitting, splitError, splitText,];
                    let __VLS_48;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
                        // @ts-ignore
                        ...{ 'onClick': {} },
                    }));
                    const __VLS_50 = __VLS_49({
                        ...{ 'onClick': {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
                    let __VLS_53;
                    const __VLS_54 = {
                        /** @type {typeof __VLS_53.click} */
                        onClick: (saveSplit),
                    };
                    void __VLS_54;
                    var __VLS_51;
                    var __VLS_52;
                    const { default: __VLS_55 } = __VLS_nonNull(__VLS_51.slots);
                    // @ts-ignore
                    [];
                }
                else {
                    let __VLS_56;
                    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                    UButton;
                    // @ts-ignore
                    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
                        // @ts-ignore
                        ...{ 'onClick': {} }, size: "sm", variant: "soft",
                    }));
                    const __VLS_58 = __VLS_57({
                        ...{ 'onClick': {} },
                        size: "sm",
                        variant: "soft",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                    let __VLS_61;
                    const __VLS_62 = {
                        /** @type {typeof __VLS_61.click} */
                        onClick: (splitDayTotal),
                    };
                    void __VLS_62;
                    var __VLS_59;
                    var __VLS_60;
                    const { default: __VLS_63 } = __VLS_nonNull(__VLS_59.slots);
                    // @ts-ignore
                    [];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-muted" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                (__VLS_unwrap(splitHint, {}));
            }
        }
        else {
            const __VLS_64 = __VLS_tryAsConstant((__VLS_unwrap(slots, {})));
            for (const [slot] of __VLS_vFor(__VLS_nonNull(__VLS_64))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (slot),
                    ...{ class: "grid grid-cols-[5rem_1fr] gap-2 items-start" },
                });
                /** @type {__VLS_StyleScopedClasses['grid']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid-cols-[5rem_1fr]']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "pt-2" },
                });
                /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                (__VLS_unwrap(milkingLabel, {})(slot));
                if (__VLS_unwrap(rowFor, {})(slot) && __VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(slot).recorded_by)) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_unwrap(nameOf, {})(__VLS_unwrap(rowFor, {})(slot).recorded_by));
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "space-y-1" },
                });
                /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
                let __VLS_65;
                /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
                UFormField;
                // @ts-ignore
                const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
                    // @ts-ignore
                    error: (fields.value[slot]?.error || undefined),
                }));
                const __VLS_67 = __VLS_66({
                    error: (fields.value[slot]?.error || undefined),
                }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                var __VLS_68;
                const { default: __VLS_70 } = __VLS_nonNull(__VLS_68.slots);
                let __VLS_71;
                /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                    // @ts-ignore
                    ...{ 'onBlur': {} }, modelValue: (fields.value[slot].text), inputmode: "text", autocomplete: "off", placeholder: "—", ...{ class: "w-full" }, size: "lg", 'aria-label': (`${__VLS_unwrap(milkingLabel, {})(slot)} weight`),
                }));
                const __VLS_73 = __VLS_72({
                    ...{ 'onBlur': {} },
                    modelValue: (fields.value[slot].text),
                    inputmode: "text",
                    autocomplete: "off",
                    placeholder: "—",
                    ...{ class: "w-full" },
                    size: "lg",
                    'aria-label': (`${__VLS_unwrap(milkingLabel, {})(slot)} weight`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_72));
                let __VLS_76;
                const __VLS_77 = {
                    /** @type {typeof __VLS_76.blur} */
                    onBlur: (...[$event]) => {
                        void $event;
                        if (!!(isDayTotal.value || enteringDayTotal.value))
                            throw 0;
                        return (save(slot));
                        // @ts-ignore
                        [fields, fields, rowFor, rowFor, rowFor, nameOf, nameOf, splitHint, slots, milkingLabel, milkingLabel,];
                    },
                };
                void __VLS_77;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                var __VLS_74;
                var __VLS_75;
                const { default: __VLS_78 } = __VLS_nonNull(__VLS_74.slots);
                {
                    const { trailing: __VLS_79 } = __VLS_nonNull(__VLS_74.slots);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-xs text-muted" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
                    (__VLS_ctx.entryUnit);
                    // @ts-ignore
                    [entryUnit,];
                }
                // @ts-ignore
                [];
                // @ts-ignore
                [];
                let __VLS_80;
                /** @ts-ignore @type { | typeof __VLS_components.UInput} */
                UInput;
                // @ts-ignore
                const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                    // @ts-ignore
                    ...{ 'onBlur': {} }, modelValue: (fields.value[slot].note), placeholder: "Note", size: "sm", ...{ class: "w-full" }, maxlength: "10000", disabled: (!__VLS_unwrap(rowFor, {})(slot) && !fields.value[slot].text), 'aria-label': (`${__VLS_unwrap(milkingLabel, {})(slot)} note`),
                }));
                const __VLS_82 = __VLS_81({
                    ...{ 'onBlur': {} },
                    modelValue: (fields.value[slot].note),
                    placeholder: "Note",
                    size: "sm",
                    ...{ class: "w-full" },
                    maxlength: "10000",
                    disabled: (!__VLS_unwrap(rowFor, {})(slot) && !fields.value[slot].text),
                    'aria-label': (`${__VLS_unwrap(milkingLabel, {})(slot)} note`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                let __VLS_85;
                const __VLS_86 = {
                    /** @type {typeof __VLS_85.blur} */
                    onBlur: (...[$event]) => {
                        void $event;
                        if (!!(isDayTotal.value || enteringDayTotal.value))
                            throw 0;
                        return (save(slot));
                        // @ts-ignore
                        [fields, fields, rowFor, milkingLabel,];
                    },
                };
                void __VLS_86;
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                var __VLS_83;
                var __VLS_84;
                // @ts-ignore
                [];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            if (Math.max(...__VLS_unwrap(slots, {})) < 6) {
                let __VLS_87;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-plus",
                }));
                const __VLS_89 = __VLS_88({
                    ...{ 'onClick': {} },
                    size: "sm",
                    variant: "soft",
                    icon: "i-lucide-plus",
                }, ...__VLS_functionalComponentArgsRest(__VLS_88));
                let __VLS_92;
                const __VLS_93 = {
                    /** @type {typeof __VLS_92.click} */
                    onClick: (addExtra),
                };
                void __VLS_93;
                var __VLS_90;
                var __VLS_91;
                const { default: __VLS_94 } = __VLS_nonNull(__VLS_90.slots);
                // @ts-ignore
                [slots,];
            }
            if (!__VLS_ctx.rows.length) {
                let __VLS_95;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
                    // @ts-ignore
                    ...{ 'onClick': {} }, size: "sm", variant: "ghost", color: "neutral",
                }));
                const __VLS_97 = __VLS_96({
                    ...{ 'onClick': {} },
                    size: "sm",
                    variant: "ghost",
                    color: "neutral",
                }, ...__VLS_functionalComponentArgsRest(__VLS_96));
                let __VLS_100;
                const __VLS_101 = {
                    /** @type {typeof __VLS_100.click} */
                    onClick: (__VLS_unwrap(useDayTotal, {})),
                };
                void __VLS_101;
                var __VLS_98;
                var __VLS_99;
                const { default: __VLS_102 } = __VLS_nonNull(__VLS_98.slots);
                // @ts-ignore
                [rows, useDayTotal,];
            }
        }
        // @ts-ignore
        [];
    }
    {
        const { footer: __VLS_103 } = __VLS_nonNull(__VLS_3.slots);
        let __VLS_104;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" },
        }));
        const __VLS_106 = __VLS_105({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        let __VLS_109;
        const __VLS_110 = {
            /** @type {typeof __VLS_109.click} */
            onClick: (...[$event]) => {
                void $event;
                return (open.value = false);
                // @ts-ignore
                [open,];
            },
        };
        void __VLS_110;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_107;
        var __VLS_108;
        const { default: __VLS_111 } = __VLS_nonNull(__VLS_107.slots);
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
