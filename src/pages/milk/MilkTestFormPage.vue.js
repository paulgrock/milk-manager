/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useHerd } from '@/composables/useHerd';
import { useHerdGoats } from '@/composables/useGoats';
import { useLactations, useMilkDay } from '@/composables/useMilk';
import { useMilkTestMutations, useMilkTests } from '@/composables/useMilkTests';
import { todayISO } from '@/lib/dates';
import { SCC_LIMIT, TEST_KIND_LABELS, formatScc, parseScc } from '@/lib/dhia';
import { goatName } from '@/lib/goats';
import { formatWeight, lactationOn, parseWeightInput } from '@/lib/milk';
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { herd } = useHerd();
const unit = computed(() => herd.value?.weight_unit ?? 'lb');
const { goats, byId } = useHerdGoats();
const lactations = useLactations();
const { data } = useMilkTests();
const { save, remove } = useMilkTestMutations();
const testId = computed(() => route.params.id ?? undefined);
const existing = computed(() => data.value.tests.find((t) => t.id === testId.value));
const form = reactive({ tested_on: todayISO(), kind: 'dhir', lab: '', tester: '', notes: '' });
const rows = reactive({});
const blankRow = () => ({ milk: '', fat: '', protein: '', scc: '', error: '' });
const loaded = ref();
watch(existing, (t) => {
    if (!t || loaded.value === t.id)
        return;
    Object.assign(form, { tested_on: t.tested_on, kind: t.kind, lab: t.lab ?? '', tester: t.tester ?? '', notes: t.notes ?? '' });
    for (const r of data.value.results.filter((x) => x.test_id === t.id)) {
        rows[r.goat_id] = {
            milk: r.milk_g === null ? '' : String(Math.round((r.milk_g / (unit.value === 'lb' ? 453.59237 : 1000)) * 100) / 100),
            fat: r.butterfat_pct === null ? '' : String(Number(r.butterfat_pct)),
            protein: r.protein_pct === null ? '' : String(Number(r.protein_pct)),
            scc: r.scc === null ? '' : formatScc(r.scc),
            error: '',
        };
    }
    loaded.value = t.id;
}, { immediate: true });
// Does on test: everyone in milk that day, plus anyone already with a result.
const does = computed(() => {
    const ids = new Set((goats.data.value ?? []).filter((g) => lactationOn(lactations.data.value ?? [], g.id, form.tested_on)).map((g) => g.id));
    for (const id of Object.keys(rows))
        if (rows[id] && Object.values(rows[id]).some((v) => v))
            ids.add(id);
    return [...ids]
        .map((id) => byId.value.get(id))
        .filter((g) => !!g)
        .sort((a, b) => (a.barn_name || goatName(a)).localeCompare(b.barn_name || goatName(b)));
});
watch(does, (list) => {
    for (const g of list)
        rows[g.id] ??= blankRow();
}, { immediate: true });
// A new test starts with each doe's milk weights from that day, if there are any.
const day = useMilkDay(() => form.tested_on);
// Runs when the day's weights or the does list loads, whichever is last.
watch([() => day.data.value, does], ([dayRows]) => {
    if (testId.value || !dayRows)
        return;
    for (const g of does.value) {
        const total = dayRows.filter((r) => r.goat_id === g.id).reduce((s, r) => s + r.weight_g, 0);
        const row = rows[g.id];
        if (row && !row.milk && total)
            row.milk = formatWeight(total, unit.value).replace(/,/g, '');
    }
}, { immediate: true });
const kindOptions = Object.entries(TEST_KIND_LABELS).map(([value, label]) => ({ label, value }));
function parsePct(text) {
    if (!text.trim())
        return null;
    const n = Number(text.replace(',', '.').replace('%', ''));
    return Number.isFinite(n) && n >= 0.5 && n <= 15 ? n : 'invalid';
}
async function submit() {
    let ok = true;
    const results = [];
    for (const g of does.value) {
        const row = rows[g.id];
        row.error = '';
        const milk = parseWeightInput(row.milk, unit.value);
        const fat = parsePct(row.fat);
        const protein = parsePct(row.protein);
        const scc = parseScc(row.scc);
        if (milk.kind === 'invalid' || (milk.kind === 'ok' && milk.portions))
            row.error = 'Milk should be one weight for the whole test day';
        else if (fat === 'invalid' || protein === 'invalid')
            row.error = 'Percentages should be between 0.5 and 15';
        else if (scc === 'invalid')
            row.error = 'SCC like 450, 450k or 1.2M';
        if (row.error) {
            ok = false;
            continue;
        }
        const milkG = milk.kind === 'ok' ? milk.grams : null;
        if (milkG === null && fat === null && protein === null && scc === null)
            continue;
        results.push({ goat_id: g.id, milk_g: milkG, butterfat_pct: fat, protein_pct: protein, scc: scc });
    }
    if (!ok)
        return toast.add({ color: 'error', title: 'Fix the highlighted does' });
    try {
        const test = await save.mutateAsync({
            id: testId.value,
            test: { tested_on: form.tested_on, kind: form.kind, lab: form.lab.trim() || null, tester: form.tester.trim() || null, notes: form.notes.trim() || null },
            results,
        });
        toast.add({ color: 'success', title: `Saved ${results.length} ${results.length === 1 ? 'result' : 'results'}` });
        if (!testId.value)
            await router.replace(`/milk/tests/${test.id}`);
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save test', description: e.message });
    }
}
const confirmDelete = ref(false);
async function onDelete() {
    await remove.mutateAsync(testId.value);
    await router.replace('/milk/tests');
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(testId, {});
    __VLS_withDotValue(confirmDelete, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(does, {});
    __VLS_withDotValue(rows, {});
    __VLS_withDotValue(save, {});
    __VLS_withDotValue(remove, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
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
        to: "/milk/tests", color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", 'aria-label': "Back to milk tests",
    }));
    const __VLS_2 = __VLS_1({
        to: "/milk/tests",
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-arrow-left",
        'aria-label': "Back to milk tests",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    (testId.value ? 'Milk test' : 'Add test day');
    if (testId.value) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "error", variant: "ghost", icon: "i-lucide-trash-2",
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onClick': {} },
            color: "error",
            variant: "ghost",
            icon: "i-lucide-trash-2",
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_10;
        const __VLS_11 = {
            /** @type {typeof __VLS_10.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!(testId.value))
                    throw 0;
                return (confirmDelete.value = true);
                // @ts-ignore
                [testId, testId, confirmDelete,];
            },
        };
        void __VLS_11;
        var __VLS_8;
        var __VLS_9;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_8.slots);
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (submit) },
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    let __VLS_13;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    // @ts-ignore
    }));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    var __VLS_16;
    const { default: __VLS_18 } = __VLS_nonNull(__VLS_16.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid sm:grid-cols-4 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_19;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        // @ts-ignore
        label: "Test date", required: true,
    }));
    const __VLS_21 = __VLS_20({
        label: "Test date",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    var __VLS_22;
    const { default: __VLS_24 } = __VLS_nonNull(__VLS_22.slots);
    let __VLS_25;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        modelValue: (form.value.tested_on), type: "date", max: (__VLS_unwrap(todayISO, {})()), required: true, ...{ class: "w-full" },
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (form.value.tested_on),
        type: "date",
        max: (__VLS_unwrap(todayISO, {})()),
        required: true,
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form, todayISO,];
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        // @ts-ignore
        label: "Kind",
    }));
    const __VLS_32 = __VLS_31({
        label: "Kind",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    var __VLS_33;
    const { default: __VLS_35 } = __VLS_nonNull(__VLS_33.slots);
    let __VLS_36;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        // @ts-ignore
        modelValue: (form.value.kind), items: (__VLS_unwrap(kindOptions, {})), ...{ class: "w-full" },
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (form.value.kind),
        items: (__VLS_unwrap(kindOptions, {})),
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form, kindOptions,];
    let __VLS_41;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        // @ts-ignore
        label: "Lab",
    }));
    const __VLS_43 = __VLS_42({
        label: "Lab",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    var __VLS_44;
    const { default: __VLS_46 } = __VLS_nonNull(__VLS_44.slots);
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        // @ts-ignore
        modelValue: (form.value.lab), maxlength: "100", ...{ class: "w-full" },
    }));
    const __VLS_49 = __VLS_48({
        modelValue: (form.value.lab),
        maxlength: "100",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        // @ts-ignore
        label: "Tester",
    }));
    const __VLS_54 = __VLS_53({
        label: "Tester",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_55;
    const { default: __VLS_57 } = __VLS_nonNull(__VLS_55.slots);
    let __VLS_58;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        // @ts-ignore
        modelValue: (form.value.tester), maxlength: "100", ...{ class: "w-full" },
    }));
    const __VLS_60 = __VLS_59({
        modelValue: (form.value.tester),
        maxlength: "100",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    // @ts-ignore
    [];
    let __VLS_63;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        // @ts-ignore
        ui: ({ body: 'p-0 sm:p-0' }),
    }));
    const __VLS_65 = __VLS_64({
        ui: ({ body: 'p-0 sm:p-0' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    var __VLS_66;
    const { default: __VLS_68 } = __VLS_nonNull(__VLS_66.slots);
    {
        const { header: __VLS_69 } = __VLS_nonNull(__VLS_66.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        // @ts-ignore
        [];
    }
    if (!does.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "p-4 text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "overflow-x-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
            ...{ class: "w-full text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            ...{ class: "text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-3 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-2 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        (__VLS_unwrap(unit, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-2 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-2 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-2 py-2 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        const __VLS_70 = __VLS_tryAsConstant((does.value));
        for (const [g] of __VLS_vFor(__VLS_nonNull(__VLS_70))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
                key: (g.id),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                ...{ class: "border-t border-default" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-3 py-2 font-medium whitespace-nowrap" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
            (g.barn_name || __VLS_unwrap(goatName, {})(g));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            let __VLS_71;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
                // @ts-ignore
                modelValue: (rows.value[g.id].milk), inputmode: "decimal", ...{ class: "w-24" }, 'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} milk`),
            }));
            const __VLS_73 = __VLS_72({
                modelValue: (rows.value[g.id].milk),
                inputmode: "decimal",
                ...{ class: "w-24" },
                'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} milk`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_72));
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            let __VLS_76;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                // @ts-ignore
                modelValue: (rows.value[g.id].fat), inputmode: "decimal", ...{ class: "w-20" }, 'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} butterfat`),
            }));
            const __VLS_78 = __VLS_77({
                modelValue: (rows.value[g.id].fat),
                inputmode: "decimal",
                ...{ class: "w-20" },
                'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} butterfat`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            let __VLS_81;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                // @ts-ignore
                modelValue: (rows.value[g.id].protein), inputmode: "decimal", ...{ class: "w-20" }, 'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} protein`),
            }));
            const __VLS_83 = __VLS_82({
                modelValue: (rows.value[g.id].protein),
                inputmode: "decimal",
                ...{ class: "w-20" },
                'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} protein`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            let __VLS_86;
            /** @ts-ignore @type { | typeof __VLS_components.UInput} */
            UInput;
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
                // @ts-ignore
                modelValue: (rows.value[g.id].scc), ...{ class: "w-24" }, color: (typeof __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) === 'number' && __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) >= __VLS_unwrap(SCC_LIMIT, {}) ? 'warning' : undefined), highlight: (typeof __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) === 'number' && __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) >= __VLS_unwrap(SCC_LIMIT, {})), 'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} SCC`),
            }));
            const __VLS_88 = __VLS_87({
                modelValue: (rows.value[g.id].scc),
                ...{ class: "w-24" },
                color: (typeof __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) === 'number' && __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) >= __VLS_unwrap(SCC_LIMIT, {}) ? 'warning' : undefined),
                highlight: (typeof __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) === 'number' && __VLS_unwrap(parseScc, {})(rows.value[g.id].scc) >= __VLS_unwrap(SCC_LIMIT, {})),
                'aria-label': (`${g.barn_name || __VLS_unwrap(goatName, {})(g)} SCC`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            if (rows.value[g.id].error) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    colspan: "5",
                    ...{ class: "px-3 pb-2 text-xs text-error" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
                (rows.value[g.id].error);
            }
            // @ts-ignore
            [does, does, unit, goatName, goatName, goatName, goatName, goatName, rows, rows, rows, rows, rows, rows, rows, rows, rows, rows, parseScc, parseScc, parseScc, parseScc, SCC_LIMIT, SCC_LIMIT,];
        }
    }
    // @ts-ignore
    [];
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
    if (save.value.isPaused.value) {
        let __VLS_102;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            // @ts-ignore
            color: "warning", variant: "subtle", icon: "i-lucide-wifi-off", title: "No signal. This test will save as soon as you are back online.", description: "Keep this screen open until it does.",
        }));
        const __VLS_104 = __VLS_103({
            color: "warning",
            variant: "subtle",
            icon: "i-lucide-wifi-off",
            title: "No signal. This test will save as soon as you are back online.",
            description: "Keep this screen open until it does.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    }
    let __VLS_107;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        // @ts-ignore
        type: "submit", size: "lg", loading: (save.value.isPending.value),
    }));
    const __VLS_109 = __VLS_108({
        type: "submit",
        size: "lg",
        loading: (save.value.isPending.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    var __VLS_110;
    const { default: __VLS_112 } = __VLS_nonNull(__VLS_110.slots);
    // @ts-ignore
    [save, save,];
    let __VLS_113;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
        // @ts-ignore
        open: (confirmDelete.value), title: "Delete this test?", description: "Its results for every doe are deleted too.",
    }));
    const __VLS_115 = __VLS_114({
        open: (confirmDelete.value),
        title: "Delete this test?",
        description: "Its results for every doe are deleted too.",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    var __VLS_116;
    const { default: __VLS_118 } = __VLS_nonNull(__VLS_116.slots);
    {
        const { footer: __VLS_119 } = __VLS_nonNull(__VLS_116.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-end gap-2 w-full" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        let __VLS_120;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "neutral", variant: "ghost",
        }));
        const __VLS_122 = __VLS_121({
            ...{ 'onClick': {} },
            color: "neutral",
            variant: "ghost",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        let __VLS_125;
        const __VLS_126 = {
            /** @type {typeof __VLS_125.click} */
            onClick: (...[$event]) => {
                void $event;
                return (confirmDelete.value = false);
                // @ts-ignore
                [confirmDelete, confirmDelete,];
            },
        };
        void __VLS_126;
        var __VLS_123;
        var __VLS_124;
        const { default: __VLS_127 } = __VLS_nonNull(__VLS_123.slots);
        // @ts-ignore
        [];
        let __VLS_128;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
            // @ts-ignore
            ...{ 'onClick': {} }, color: "error", loading: (remove.value.isPending.value),
        }));
        const __VLS_130 = __VLS_129({
            ...{ 'onClick': {} },
            color: "error",
            loading: (remove.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        let __VLS_133;
        const __VLS_134 = {
            /** @type {typeof __VLS_133.click} */
            onClick: (onDelete),
        };
        void __VLS_134;
        var __VLS_131;
        var __VLS_132;
        const { default: __VLS_135 } = __VLS_nonNull(__VLS_131.slots);
        // @ts-ignore
        [remove,];
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
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
