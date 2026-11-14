/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOnline } from '@vueuse/core';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats, usePhotoUrls } from '@/composables/useGoats';
import { shiftDate, useLactations, useMilkDay, useMilkSaves, useMilkUnits } from '@/composables/useMilk';
import { formatDate, todayISO } from '@/lib/dates';
import { byMilkingOrder, goatName, iconPath, inHerdOn } from '@/lib/goats';
import { AM, DAY_TOTAL, PM, applyRecord, daysInMilk, defaultMilking, formatWeight, lactationOn, milkingLabel, parseWeightInput, } from '@/lib/milk';
import MilkEntryRow from '@/components/milk/MilkEntryRow.vue';
import MilkDayEditor from '@/components/milk/MilkDayEditor.vue';
import LactationModal from '@/components/milk/LactationModal.vue';
import MilkOrderModal from '@/components/milk/MilkOrderModal.vue';
import { useHealthData } from '@/composables/useHealth';
import { withdrawalOn } from '@/lib/health';
const route = useRoute();
const router = useRouter();
const toast = useToast();
const online = useOnline();
const { herdId } = useHerd();
const { goats, photos } = useHerdGoats();
const lactations = useLactations();
const { record, clear, pending, pendingFor } = useMilkSaves();
const today = todayISO();
const date = computed(() => {
    const q = route.query.date;
    return typeof q === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q) && q <= today ? q : today;
});
function goTo(d) {
    void router.replace({ query: d === today ? {} : { date: d } });
}
const milking = ref(defaultMilking());
const milkingOptions = [
    { label: 'AM', value: AM },
    { label: 'PM', value: PM },
    { label: 'Day total', value: DAY_TOTAL },
];
// Weights are typed in entryUnit (ounces by default); totals are in the herd's unit.
const { unit, entryUnit } = useMilkUnits();
const entryUnitOptions = [
    { label: 'oz', value: 'oz' },
    { label: 'lb', value: 'lb' },
];
const day = useMilkDay(date);
// The milk line: does in milk on this date, in the order they're milked.
const line = computed(() => (goats.data.value ?? [])
    .filter((goat) => inHerdOn(goat, date.value))
    .map((goat) => ({ goat, lactation: lactationOn(lactations.data.value ?? [], goat.id, date.value) }))
    .filter((x) => !!x.lactation)
    .sort((a, b) => byMilkingOrder(a.goat, b.goat)));
const rowsByGoat = computed(() => {
    const map = new Map();
    for (const r of day.data.value ?? [])
        map.set(r.goat_id, [...(map.get(r.goat_id) ?? []), r]);
    return map;
});
// Weights recorded for does no longer on the line (e.g. dried off later
// that day) still count toward the totals.
const totals = computed(() => {
    const rows = day.data.value ?? [];
    const thisMilking = rows.filter((r) => r.milking === milking.value);
    return {
        milkingG: thisMilking.reduce((s, r) => s + r.weight_g, 0),
        milkingCount: new Set(thisMilking.map((r) => r.goat_id)).size,
        dayG: rows.reduce((s, r) => s + r.weight_g, 0),
    };
});
// Does whose milk can't be sold today (treatment withdrawal).
const health = useHealthData();
const withheld = computed(() => {
    const map = new Map();
    for (const { goat } of line.value) {
        const w = withdrawalOn(goat.id, health.data.value.treatments, date.value);
        if (w)
            map.set(goat.id, w.through);
    }
    return map;
});
const withheldG = computed(() => (day.data.value ?? []).filter((r) => withheld.value.has(r.goat_id)).reduce((s, r) => s + r.weight_g, 0));
const primaryPhotos = computed(() => new Map((photos.data.value ?? []).filter((p) => p.is_primary).map((p) => [p.goat_id, iconPath(p)])));
const photoUrls = usePhotoUrls(() => line.value.map((x) => primaryPhotos.value.get(x.goat.id)).filter((p) => !!p));
// --- Saving -------------------------------------------------------------------
const errors = ref({});
function save(goat, text) {
    const key = goat.id;
    delete errors.value[key];
    const rows = rowsByGoat.value.get(goat.id) ?? [];
    const parsed = parseWeightInput(text, entryUnit.value);
    if (parsed.kind === 'invalid') {
        errors.value[key] = parsed.message;
        return;
    }
    if (parsed.kind === 'empty') {
        if (rows.some((r) => r.milking === milking.value)) {
            clear.mutate({ herdId: herdId.value, goatId: goat.id, milkedOn: date.value, milking: milking.value });
        }
        return;
    }
    const vars = {
        herdId: herdId.value,
        goatId: goat.id,
        milkedOn: date.value,
        milking: milking.value,
        grams: parsed.grams,
        portions: parsed.portions,
        note: rows.find((r) => r.milking === milking.value)?.note ?? null,
    };
    try {
        applyRecord(rows, vars);
    }
    catch (e) {
        errors.value[key] = e.message;
        return;
    }
    record.mutate(vars, {
        onError: (e) => {
            errors.value[key] = e.message;
            toast.add({ color: 'error', title: `Could not save ${goat.barn_name || goatName(goat)}`, description: e.message });
        },
    });
}
// By goat, not an array of refs: Vue doesn't keep that in list order once the line is reordered.
const rowRefs = new Map();
function setRowRef(goatId, row) {
    if (row)
        rowRefs.set(goatId, row);
    else
        rowRefs.delete(goatId);
}
async function focusNext(index) {
    await nextTick();
    const next = line.value[index + 1];
    if (next)
        rowRefs.get(next.goat.id)?.focus();
}
const waiting = computed(() => pending.value.filter((p) => p.paused).length);
// --- Dialogs --------------------------------------------------------------------
const editing = ref();
const editorOpen = computed({ get: () => !!editing.value, set: (v) => !v && (editing.value = undefined) });
const lactationModal = ref({ open: false, mode: 'start' });
const orderOpen = ref(false);
const startLactation = () => (lactationModal.value = { open: true, mode: 'start' });
const dryOff = (lactation) => (lactationModal.value = { open: true, mode: 'dryOff', lactation });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(date, {});
    __VLS_withDotValue(today, {});
    __VLS_withDotValue(unit, {});
    __VLS_withDotValue(waiting, {});
    __VLS_withDotValue(online, {});
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(lactations, {});
    __VLS_withDotValue(line, {});
    __VLS_withDotValue(milking, {});
    __VLS_withDotValue(DAY_TOTAL, {});
    __VLS_withDotValue(orderOpen, {});
    __VLS_withDotValue(rowsByGoat, {});
    __VLS_withDotValue(photoUrls, {});
    __VLS_withDotValue(primaryPhotos, {});
    __VLS_withDotValue(withheld, {});
    __VLS_withDotValue(errors, {});
    __VLS_withDotValue(editing, {});
    __VLS_withDotValue(totals, {});
    __VLS_withDotValue(withheldG, {});
    __VLS_withDotValue(lactationModal, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 pb-28" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-28']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/milk/production", color: "neutral", variant: "ghost", icon: "i-lucide-chart-line",
    }));
    const __VLS_2 = __VLS_1({
        to: "/milk/production",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chart-line",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        to: "/milk/tests", color: "neutral", variant: "ghost", icon: "i-lucide-flask-conical",
    }));
    const __VLS_8 = __VLS_7({
        to: "/milk/tests",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-flask-conical",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    var __VLS_9;
    const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        // @ts-ignore
        to: "/milk/history", color: "neutral", variant: "ghost", icon: "i-lucide-history",
    }));
    const __VLS_14 = __VLS_13({
        to: "/milk/history",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-history",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_15;
    const { default: __VLS_17 } = __VLS_nonNull(__VLS_15.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-left", 'aria-label': "Previous day",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-chevron-left",
        'aria-label': "Previous day",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = {
        /** @type {typeof __VLS_23.click} */
        onClick: (...[$event]) => {
            void $event;
            return (goTo(__VLS_unwrap(shiftDate, {})(date.value, -1)));
            // @ts-ignore
            [shiftDate, date,];
        },
    };
    void __VLS_24;
    var __VLS_21;
    var __VLS_22;
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        ...{ 'onUpdate:modelValue': {} }, modelValue: (date.value), type: "date", max: (today.value), ...{ class: "w-40" }, 'aria-label': "Date",
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (date.value),
        type: "date",
        max: (today.value),
        ...{ class: "w-40" },
        'aria-label': "Date",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_30;
    const __VLS_31 = {
        /** @type {typeof __VLS_30.'update:modelValue'} */
        'onUpdate:modelValue': ((v) => v && goTo(String(v))),
    };
    void __VLS_31;
    /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
    var __VLS_28;
    var __VLS_29;
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "outline", icon: "i-lucide-chevron-right", 'aria-label': "Next day", disabled: (date.value >= today.value),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-chevron-right",
        'aria-label': "Next day",
        disabled: (date.value >= today.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = {
        /** @type {typeof __VLS_37.click} */
        onClick: (...[$event]) => {
            void $event;
            return (goTo(__VLS_unwrap(shiftDate, {})(date.value, 1)));
            // @ts-ignore
            [shiftDate, date, date, date, today, today,];
        },
    };
    void __VLS_38;
    var __VLS_35;
    var __VLS_36;
    if (date.value !== today.value) {
        let __VLS_39;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "link",
        }));
        const __VLS_41 = __VLS_40({
            ...{ 'onClick': {} },
            variant: "link",
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_44;
        const __VLS_45 = {
            /** @type {typeof __VLS_44.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(date.value !== today.value))
                    throw 0;
                return (goTo(today.value));
                // @ts-ignore
                [date, today, today,];
            },
        };
        void __VLS_45;
        var __VLS_42;
        var __VLS_43;
        const { default: __VLS_46 } = __VLS_nonNull(__VLS_42.slots);
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ms-auto flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    if (unit.value === 'lb') {
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.UTabs} */
        UTabs;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            // @ts-ignore
            modelValue: (__VLS_unwrap(entryUnit, {})), items: (__VLS_unwrap(entryUnitOptions, {})), content: (false), size: "md", color: "neutral", variant: "link", 'aria-label': "Enter weights in", ui: ({ list: 'w-auto' }),
        }));
        const __VLS_49 = __VLS_48({
            modelValue: (__VLS_unwrap(entryUnit, {})),
            items: (__VLS_unwrap(entryUnitOptions, {})),
            content: (false),
            size: "md",
            color: "neutral",
            variant: "link",
            'aria-label': "Enter weights in",
            ui: ({ list: 'w-auto' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    }
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.UTabs} */
    UTabs;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        // @ts-ignore
        modelValue: (milking.value), items: (__VLS_unwrap(milkingOptions, {})), content: (false), size: "md", ui: ({ list: 'w-auto' }),
    }));
    const __VLS_54 = __VLS_53({
        modelValue: (milking.value),
        items: (__VLS_unwrap(milkingOptions, {})),
        content: (false),
        size: "md",
        ui: ({ list: 'w-auto' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    if (waiting.value) {
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            color: "warning", variant: "subtle", icon: "i-lucide-cloud-off", title: (`${waiting.value} ${waiting.value === 1 ? 'weight is' : 'weights are'} saved on this phone`), description: (online.value ? 'Uploading…' : 'They will upload automatically when you have signal. It is safe to close the app.'),
        }));
        const __VLS_59 = __VLS_58({
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-cloud-off",
            title: (`${waiting.value} ${waiting.value === 1 ? 'weight is' : 'weights are'} saved on this phone`),
            description: (online.value ? 'Uploading…' : 'They will upload automatically when you have signal. It is safe to close the app.'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    }
    if (goats.value.isPending.value || lactations.value.isPending.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        const __VLS_62 = __VLS_tryAsConstant((5));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_62))) {
            let __VLS_63;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
                // @ts-ignore
                key: (i), ...{ class: "h-14 w-full" },
            }));
            const __VLS_65 = __VLS_64({
                key: (i),
                ...{ class: "h-14 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_64));
            /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [unit, entryUnit, entryUnitOptions, milking, milkingOptions, waiting, waiting, waiting, online, goats, lactations,];
        }
    }
    else if (!line.value.length) {
        let __VLS_68;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            // @ts-ignore
            ...{ class: "text-center" },
        }));
        const __VLS_70 = __VLS_69({
            ...{ class: "text-center" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        var __VLS_71;
        const { default: __VLS_73 } = __VLS_nonNull(__VLS_71.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        (__VLS_unwrap(formatDate, {})(date.value));
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            // @ts-ignore
            ...{ 'onClick': {} }, icon: "i-lucide-plus",
        }));
        const __VLS_76 = __VLS_75({
            ...{ 'onClick': {} },
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_79;
        const __VLS_80 = {
            /** @type {typeof __VLS_79.click} */
            onClick: (__VLS_unwrap(startLactation, {})),
        };
        void __VLS_80;
        var __VLS_77;
        var __VLS_78;
        const { default: __VLS_81 } = __VLS_nonNull(__VLS_77.slots);
        // @ts-ignore
        [date, line, formatDate, startLactation,];
        // @ts-ignore
        [];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        (__VLS_unwrap(formatDate, {})(date.value));
        (__VLS_unwrap(milkingLabel, {})(milking.value));
        (line.value.length);
        (line.value.length === 1 ? 'doe' : 'does');
        if (milking.value === DAY_TOTAL.value) {
        }
        if (line.value.length > 1) {
            let __VLS_82;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "sm", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-down-up", disabled: (!online.value),
            }));
            const __VLS_84 = __VLS_83({
                ...{ 'onClick': {} },
                size: "sm",
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-arrow-down-up",
                disabled: (!online.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_83));
            let __VLS_87;
            const __VLS_88 = {
                /** @type {typeof __VLS_87.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!!(goats.value.isPending.value || lactations.value.isPending.value))
                        throw 0;
                    if (!!(!line.value.length))
                        throw 0;
                    if (!(line.value.length > 1))
                        throw 0;
                    return (orderOpen.value = true);
                    // @ts-ignore
                    [date, milking, milking, online, line, line, line, formatDate, milkingLabel, DAY_TOTAL, orderOpen,];
                },
            };
            void __VLS_88;
            var __VLS_85;
            var __VLS_86;
            const { default: __VLS_89 } = __VLS_nonNull(__VLS_85.slots);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "divide-y divide-default" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-default']} */ ;
        const __VLS_90 = __VLS_tryAsConstant((line.value));
        for (const [{ goat, lactation }, i] of __VLS_vFor(__VLS_nonNull(__VLS_90))) {
            const __VLS_91 = MilkEntryRow;
            // @ts-ignore
            const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
                // @ts-ignore
                ...{ 'onSave': {} }, ...{ 'onNext': {} }, ...{ 'onEditDay': {} }, ...{ 'onDryOff': {} }, key: (goat.id), ref: ((row) => setRowRef(goat.id, row)), goat: (goat), rows: (rowsByGoat.value.get(goat.id) ?? []), milking: (milking.value), unit: (unit.value), entryUnit: (__VLS_unwrap(entryUnit, {})), dim: (__VLS_unwrap(daysInMilk, {})(lactation.freshened_on, date.value)), photoUrl: (photoUrls.value[primaryPhotos.value.get(goat.id) ?? '']), isToday: (date.value === today.value), withheldThrough: (withheld.value.get(goat.id)), saving: (__VLS_unwrap(pendingFor, {})(goat.id, date.value).length > 0), waitingForSignal: (__VLS_unwrap(pendingFor, {})(goat.id, date.value).some((p) => p.paused)), error: (errors.value[goat.id]),
            }));
            const __VLS_93 = __VLS_92({
                ...{ 'onSave': {} },
                ...{ 'onNext': {} },
                ...{ 'onEditDay': {} },
                ...{ 'onDryOff': {} },
                key: (goat.id),
                ref: ((row) => setRowRef(goat.id, row)),
                goat: (goat),
                rows: (rowsByGoat.value.get(goat.id) ?? []),
                milking: (milking.value),
                unit: (unit.value),
                entryUnit: (__VLS_unwrap(entryUnit, {})),
                dim: (__VLS_unwrap(daysInMilk, {})(lactation.freshened_on, date.value)),
                photoUrl: (photoUrls.value[primaryPhotos.value.get(goat.id) ?? '']),
                isToday: (date.value === today.value),
                withheldThrough: (withheld.value.get(goat.id)),
                saving: (__VLS_unwrap(pendingFor, {})(goat.id, date.value).length > 0),
                waitingForSignal: (__VLS_unwrap(pendingFor, {})(goat.id, date.value).some((p) => p.paused)),
                error: (errors.value[goat.id]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_92));
            let __VLS_96;
            const __VLS_97 = {
                /** @type {typeof __VLS_96.save} */
                onSave: ((text) => save(goat, text)),
            };
            void __VLS_97;
            const __VLS_98 = {
                /** @type {typeof __VLS_96.next} */
                onNext: (...[$event]) => {
                    void $event;
                    if (!!(goats.value.isPending.value || lactations.value.isPending.value))
                        throw 0;
                    if (!!(!line.value.length))
                        throw 0;
                    return (focusNext(i));
                    // @ts-ignore
                    [date, date, date, date, today, unit, entryUnit, milking, line, rowsByGoat, daysInMilk, photoUrls, primaryPhotos, withheld, pendingFor, pendingFor, errors,];
                },
            };
            void __VLS_98;
            const __VLS_99 = {
                /** @type {typeof __VLS_96.editDay} */
                onEditDay: (...[$event]) => {
                    void $event;
                    if (!!(goats.value.isPending.value || lactations.value.isPending.value))
                        throw 0;
                    if (!!(!line.value.length))
                        throw 0;
                    return (editing.value = goat);
                    // @ts-ignore
                    [editing,];
                },
            };
            void __VLS_99;
            const __VLS_100 = {
                /** @type {typeof __VLS_96.dryOff} */
                onDryOff: (...[$event]) => {
                    void $event;
                    if (!!(goats.value.isPending.value || lactations.value.isPending.value))
                        throw 0;
                    if (!!(!line.value.length))
                        throw 0;
                    return (__VLS_unwrap(dryOff, {})(lactation));
                    // @ts-ignore
                    [dryOff,];
                },
            };
            void __VLS_100;
            var __VLS_94;
            var __VLS_95;
            // @ts-ignore
            [];
        }
        let __VLS_101;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "ghost", icon: "i-lucide-plus",
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-plus",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_106;
        const __VLS_107 = {
            /** @type {typeof __VLS_106.click} */
            onClick: (__VLS_unwrap(startLactation, {})),
        };
        void __VLS_107;
        var __VLS_104;
        var __VLS_105;
        const { default: __VLS_108 } = __VLS_nonNull(__VLS_104.slots);
        // @ts-ignore
        [startLactation,];
    }
    if (line.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "fixed bottom-0 inset-x-0 border-t border-default bg-default/95 backdrop-blur pb-[env(safe-area-inset-bottom)]" },
        });
        /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-default/95']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-[env(safe-area-inset-bottom)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mx-auto max-w-5xl px-4 py-3 flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        (__VLS_unwrap(milkingLabel, {})(milking.value));
        (totals.value.milkingCount);
        (line.value.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-lg font-semibold tabular-nums" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
        (__VLS_unwrap(formatWeight, {})(totals.value.milkingG, unit.value, true));
        if (withheldG.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-end" },
            });
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-warning" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-lg font-semibold tabular-nums" },
            });
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
            (__VLS_unwrap(formatWeight, {})(withheldG.value, unit.value, true));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ms-auto text-end" },
        });
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-lg font-semibold tabular-nums" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
        (__VLS_unwrap(formatWeight, {})(totals.value.dayG, unit.value, true));
    }
    if (editing.value) {
        const __VLS_109 = MilkDayEditor;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
            // @ts-ignore
            open: (__VLS_unwrap(editorOpen, {})), goat: (editing.value), date: (date.value), rows: (rowsByGoat.value.get(editing.value.id) ?? []), unit: (unit.value), entryUnit: (__VLS_unwrap(entryUnit, {})), herdId: (__VLS_unwrap(herdId, {})),
        }));
        const __VLS_111 = __VLS_110({
            open: (__VLS_unwrap(editorOpen, {})),
            goat: (editing.value),
            date: (date.value),
            rows: (rowsByGoat.value.get(editing.value.id) ?? []),
            unit: (unit.value),
            entryUnit: (__VLS_unwrap(entryUnit, {})),
            herdId: (__VLS_unwrap(herdId, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    }
    const __VLS_114 = LactationModal;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        // @ts-ignore
        open: (lactationModal.value.open), mode: (lactationModal.value.mode), lactation: (lactationModal.value.lactation), date: (date.value),
    }));
    const __VLS_116 = __VLS_115({
        open: (lactationModal.value.open),
        mode: (lactationModal.value.mode),
        lactation: (lactationModal.value.lactation),
        date: (date.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const __VLS_119 = MilkOrderModal;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
        // @ts-ignore
        open: (orderOpen.value), goats: (line.value.map((x) => x.goat)),
    }));
    const __VLS_121 = __VLS_120({
        open: (orderOpen.value),
        goats: (line.value.map((x) => x.goat)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    // @ts-ignore
    [date, date, unit, unit, unit, unit, entryUnit, milking, line, line, line, milkingLabel, orderOpen, rowsByGoat, editing, editing, editing, totals, totals, totals, formatWeight, formatWeight, formatWeight, withheldG, withheldG, editorOpen, herdId, lactationModal, lactationModal, lactationModal,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
