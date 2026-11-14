/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@nuxt/ui/composables';
import { useGoatMutations, useHerdGoats } from '@/composables/useGoats';
import { useHerd } from '@/composables/useHerd';
import { BREED_CATEGORY_LABELS, HORN_LABELS, SEX_LABELS, STATUS_LABELS, goatFullName, } from '@/lib/goats';
import GoatPicker from '@/components/goats/GoatPicker.vue';
const DAIRY_BREEDS = [
    'Alpine',
    'Guernsey',
    'LaMancha',
    'Nigerian Dwarf',
    'Nubian',
    'Oberhasli',
    'Saanen',
    'Sable',
    'Toggenburg',
    'Mini Alpine',
    'Mini LaMancha',
    'Mini Nubian',
    'Mini Oberhasli',
    'Mini Saanen',
    'Mini Toggenburg',
];
const REGISTRIES = ['ADGA', 'AGS', 'AMGRA', 'MDGA', 'NDGA', 'TMGR'];
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { isOwner } = useHerd();
const { goats, find } = useHerdGoats();
const { saveGoat, deleteGoat } = useGoatMutations();
const goatRef = computed(() => route.params.goat);
const existing = computed(() => find(goatRef.value));
const goatId = computed(() => existing.value?.id);
watch(existing, (g) => {
    if (g && goatRef.value !== g.slug)
        void router.replace(`/goats/${g.slug}/edit`);
}, { immediate: true });
function fromGoat(g) {
    return {
        registered_name: g?.registered_name ?? '',
        barn_name: g?.barn_name ?? '',
        title_prefix: g?.title_prefix ?? '',
        title_suffix: g?.title_suffix ?? '',
        sex: g?.sex ?? (route.query.sex || 'doe'),
        breed: g?.breed ?? '',
        breed_category: g?.breed_category ?? 'none',
        birth_date: g?.birth_date ?? '',
        color_markings: g?.color_markings ?? '',
        horn_status: g?.horn_status ?? 'disbudded',
        registry: g?.registry ?? 'ADGA',
        registration_number: g?.registration_number ?? '',
        pedigree_url: g?.pedigree_url ?? '',
        tattoo_left: g?.tattoo_left ?? '',
        tattoo_right: g?.tattoo_right ?? '',
        scrapie_tag: g?.scrapie_tag ?? '',
        microchip: g?.microchip ?? '',
        sire_id: g?.sire_id ?? null,
        dam_id: g?.dam_id ?? null,
        status: g?.status ?? 'active',
        left_herd_on: g?.left_herd_on ?? '',
        left_herd_reason: g?.left_herd_reason ?? '',
        notes: g?.notes ?? '',
    };
}
const form = reactive(fromGoat());
const loadedFor = ref();
watch(existing, (g) => {
    if (g && loadedFor.value !== g.id) {
        Object.assign(form, fromGoat(g));
        loadedFor.value = g.id;
    }
}, { immediate: true });
const sexOptions = Object.entries(SEX_LABELS).map(([value, label]) => ({ label, value }));
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }));
const hornOptions = Object.entries(HORN_LABELS).map(([value, label]) => ({ label, value }));
const categoryOptions = [
    { label: 'Not set', value: 'none' },
    ...Object.entries(BREED_CATEGORY_LABELS).map(([value, label]) => ({ label, value })),
];
const breedItems = computed(() => [...new Set([...DAIRY_BREEDS, ...(goats.data.value ?? []).map((g) => g.breed).filter((b) => !!b)])].sort());
const registryItems = computed(() => [...new Set([...REGISTRIES, form.registry].filter(Boolean))]);
const leftHerd = computed(() => form.status === 'sold' || form.status === 'deceased');
const hasName = computed(() => !!form.registered_name.trim() || !!form.barn_name.trim());
const blank = (s) => s.trim() || null;
function toValues() {
    return {
        registered_name: blank(form.registered_name),
        barn_name: blank(form.barn_name),
        title_prefix: blank(form.title_prefix),
        title_suffix: blank(form.title_suffix),
        sex: form.sex,
        breed: blank(form.breed),
        breed_category: form.breed_category === 'none' ? null : form.breed_category,
        birth_date: form.birth_date || null,
        color_markings: blank(form.color_markings),
        horn_status: form.horn_status,
        registry: blank(form.registry),
        registration_number: blank(form.registration_number),
        pedigree_url: blank(form.pedigree_url),
        tattoo_left: blank(form.tattoo_left),
        tattoo_right: blank(form.tattoo_right),
        scrapie_tag: blank(form.scrapie_tag),
        microchip: blank(form.microchip),
        sire_id: form.sire_id,
        dam_id: form.dam_id,
        status: form.status,
        left_herd_on: leftHerd.value ? form.left_herd_on || null : null,
        left_herd_reason: leftHerd.value ? blank(form.left_herd_reason) : null,
        notes: blank(form.notes),
    };
}
async function submit() {
    if (!hasName.value) {
        toast.add({ color: 'error', title: 'Give the goat a registered name or a barn name' });
        return;
    }
    try {
        const wasSold = existing.value?.status === 'sold';
        const saved = await saveGoat.mutateAsync({ id: goatId.value, values: toValues() });
        // Just marked sold: the goat page offers to record the sale (owners only).
        const recordSale = saved.status === 'sold' && !wasSold && isOwner.value;
        await router.replace({ path: `/goats/${saved.slug}`, query: recordSale ? { recordSale: '1' } : {} });
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not save goat', description: e.message });
    }
}
const confirmDelete = ref(false);
async function remove() {
    if (!existing.value)
        return;
    try {
        await deleteGoat.mutateAsync(existing.value);
        confirmDelete.value = false;
        await router.replace('/goats');
    }
    catch (e) {
        toast.add({ color: 'error', title: 'Could not delete goat', description: e.message });
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(existing, {});
    __VLS_withDotValue(goatRef, {});
    __VLS_withDotValue(goats, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(leftHerd, {});
    __VLS_withDotValue(saveGoat, {});
    __VLS_withDotValue(isOwner, {});
    __VLS_withDotValue(confirmDelete, {});
    __VLS_withDotValue(deleteGoat, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 max-w-3xl" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
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
        color: "neutral", variant: "ghost", icon: "i-lucide-arrow-left", to: (existing.value ? `/goats/${existing.value.slug}` : '/goats'), 'aria-label': "Back",
    }));
    const __VLS_2 = __VLS_1({
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-arrow-left",
        to: (existing.value ? `/goats/${existing.value.slug}` : '/goats'),
        'aria-label': "Back",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl font-semibold truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (existing.value ? `Edit ${__VLS_unwrap(goatFullName, {})(existing.value)}` : 'Add goat');
    if (goatRef.value && !existing.value && !goats.value.isPending.value) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            color: "error", variant: "subtle", title: "Goat not found",
        }));
        const __VLS_7 = __VLS_6({
            color: "error",
            variant: "subtle",
            title: "Goat not found",
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
    else if (goatRef.value && !existing.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
            'aria-label': "Loading goat",
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        const __VLS_10 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_10))) {
            let __VLS_11;
            /** @ts-ignore @type { | typeof __VLS_components.USkeleton} */
            USkeleton;
            // @ts-ignore
            const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
                // @ts-ignore
                key: (i), ...{ class: "h-40 w-full" },
            }));
            const __VLS_13 = __VLS_12({
                key: (i),
                ...{ class: "h-40 w-full" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_12));
            /** @type {__VLS_StyleScopedClasses['h-40']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            // @ts-ignore
            [existing, existing, existing, existing, existing, existing, goatFullName, goatRef, goatRef, goats,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submit) },
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        let __VLS_16;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        // @ts-ignore
        }));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        var __VLS_19;
        const { default: __VLS_21 } = __VLS_nonNull(__VLS_19.slots);
        {
            const { header: __VLS_22 } = __VLS_nonNull(__VLS_19.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            label: "Registered name", hint: "Including herd name, e.g. Bird's Eye Farm Ina May",
        }));
        const __VLS_25 = __VLS_24({
            label: "Registered name",
            hint: "Including herd name, e.g. Bird's Eye Farm Ina May",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        let __VLS_29;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            // @ts-ignore
            modelValue: (form.value.registered_name), ...{ class: "w-full" }, maxlength: "200",
        }));
        const __VLS_31 = __VLS_30({
            modelValue: (form.value.registered_name),
            ...{ class: "w-full" },
            maxlength: "200",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid sm:grid-cols-3 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_34;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            // @ts-ignore
            label: "Barn name",
        }));
        const __VLS_36 = __VLS_35({
            label: "Barn name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_37;
        const { default: __VLS_39 } = __VLS_nonNull(__VLS_37.slots);
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            modelValue: (form.value.barn_name), ...{ class: "w-full" }, maxlength: "100",
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (form.value.barn_name),
            ...{ class: "w-full" },
            maxlength: "100",
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
            label: "Title before name", hint: "GCH, SGCH",
        }));
        const __VLS_47 = __VLS_46({
            label: "Title before name",
            hint: "GCH, SGCH",
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        var __VLS_48;
        const { default: __VLS_50 } = __VLS_nonNull(__VLS_48.slots);
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            // @ts-ignore
            modelValue: (form.value.title_prefix), ...{ class: "w-full" }, maxlength: "50",
        }));
        const __VLS_53 = __VLS_52({
            modelValue: (form.value.title_prefix),
            ...{ class: "w-full" },
            maxlength: "50",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            // @ts-ignore
            label: "Title after name", hint: "5*M *D, +*B",
        }));
        const __VLS_58 = __VLS_57({
            label: "Title after name",
            hint: "5*M *D, +*B",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        var __VLS_59;
        const { default: __VLS_61 } = __VLS_nonNull(__VLS_59.slots);
        let __VLS_62;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            // @ts-ignore
            modelValue: (form.value.title_suffix), ...{ class: "w-full" }, maxlength: "50",
        }));
        const __VLS_64 = __VLS_63({
            modelValue: (form.value.title_suffix),
            ...{ class: "w-full" },
            maxlength: "50",
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        // @ts-ignore
        [];
        let __VLS_67;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        // @ts-ignore
        }));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        var __VLS_70;
        const { default: __VLS_72 } = __VLS_nonNull(__VLS_70.slots);
        {
            const { header: __VLS_73 } = __VLS_nonNull(__VLS_70.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid sm:grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_74;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            // @ts-ignore
            label: "Sex", required: true,
        }));
        const __VLS_76 = __VLS_75({
            label: "Sex",
            required: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        var __VLS_77;
        const { default: __VLS_79 } = __VLS_nonNull(__VLS_77.slots);
        let __VLS_80;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            // @ts-ignore
            modelValue: (form.value.sex), items: (__VLS_unwrap(sexOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_82 = __VLS_81({
            modelValue: (form.value.sex),
            items: (__VLS_unwrap(sexOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, sexOptions,];
        let __VLS_85;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            // @ts-ignore
            label: "Born",
        }));
        const __VLS_87 = __VLS_86({
            label: "Born",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        var __VLS_88;
        const { default: __VLS_90 } = __VLS_nonNull(__VLS_88.slots);
        let __VLS_91;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
            // @ts-ignore
            modelValue: (form.value.birth_date), type: "date", ...{ class: "w-full" },
        }));
        const __VLS_93 = __VLS_92({
            modelValue: (form.value.birth_date),
            type: "date",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            // @ts-ignore
            label: "Breed",
        }));
        const __VLS_98 = __VLS_97({
            label: "Breed",
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        var __VLS_99;
        const { default: __VLS_101 } = __VLS_nonNull(__VLS_99.slots);
        let __VLS_102;
        /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
        UInputMenu;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            // @ts-ignore
            ...{ 'onCreate': {} }, modelValue: (form.value.breed), items: (__VLS_unwrap(breedItems, {})), createItem: true, ...{ class: "w-full" },
        }));
        const __VLS_104 = __VLS_103({
            ...{ 'onCreate': {} },
            modelValue: (form.value.breed),
            items: (__VLS_unwrap(breedItems, {})),
            createItem: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_107;
        const __VLS_108 = {
            /** @type {typeof __VLS_107.create} */
            onCreate: ((b) => (form.value.breed = b)),
        };
        void __VLS_108;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_105;
        var __VLS_106;
        // @ts-ignore
        [form, form, breedItems,];
        let __VLS_109;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
            // @ts-ignore
            label: "Breed category",
        }));
        const __VLS_111 = __VLS_110({
            label: "Breed category",
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        var __VLS_112;
        const { default: __VLS_114 } = __VLS_nonNull(__VLS_112.slots);
        let __VLS_115;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
            // @ts-ignore
            modelValue: (form.value.breed_category), items: (__VLS_unwrap(categoryOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_117 = __VLS_116({
            modelValue: (form.value.breed_category),
            items: (__VLS_unwrap(categoryOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, categoryOptions,];
        let __VLS_120;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
            // @ts-ignore
            label: "Color and markings",
        }));
        const __VLS_122 = __VLS_121({
            label: "Color and markings",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        var __VLS_123;
        const { default: __VLS_125 } = __VLS_nonNull(__VLS_123.slots);
        let __VLS_126;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
            // @ts-ignore
            modelValue: (form.value.color_markings), ...{ class: "w-full" }, maxlength: "200",
        }));
        const __VLS_128 = __VLS_127({
            modelValue: (form.value.color_markings),
            ...{ class: "w-full" },
            maxlength: "200",
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_131;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
            // @ts-ignore
            label: "Horns",
        }));
        const __VLS_133 = __VLS_132({
            label: "Horns",
        }, ...__VLS_functionalComponentArgsRest(__VLS_132));
        var __VLS_134;
        const { default: __VLS_136 } = __VLS_nonNull(__VLS_134.slots);
        let __VLS_137;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
            // @ts-ignore
            modelValue: (form.value.horn_status), items: (__VLS_unwrap(hornOptions, {})), ...{ class: "w-full" },
        }));
        const __VLS_139 = __VLS_138({
            modelValue: (form.value.horn_status),
            items: (__VLS_unwrap(hornOptions, {})),
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, hornOptions,];
        // @ts-ignore
        [];
        let __VLS_142;
        /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
        UCard;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
        // @ts-ignore
        }));
        const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
        var __VLS_145;
        const { default: __VLS_147 } = __VLS_nonNull(__VLS_145.slots);
        {
            const { header: __VLS_148 } = __VLS_nonNull(__VLS_145.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "font-semibold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid sm:grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_149;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
            // @ts-ignore
            label: "Registry",
        }));
        const __VLS_151 = __VLS_150({
            label: "Registry",
        }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        var __VLS_152;
        const { default: __VLS_154 } = __VLS_nonNull(__VLS_152.slots);
        let __VLS_155;
        /** @ts-ignore @type { | typeof __VLS_components.UInputMenu} */
        UInputMenu;
        // @ts-ignore
        const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
            // @ts-ignore
            ...{ 'onCreate': {} }, modelValue: (form.value.registry), items: (__VLS_unwrap(registryItems, {})), createItem: true, ...{ class: "w-full" },
        }));
        const __VLS_157 = __VLS_156({
            ...{ 'onCreate': {} },
            modelValue: (form.value.registry),
            items: (__VLS_unwrap(registryItems, {})),
            createItem: true,
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_156));
        let __VLS_160;
        const __VLS_161 = {
            /** @type {typeof __VLS_160.create} */
            onCreate: ((r) => (form.value.registry = r)),
        };
        void __VLS_161;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        var __VLS_158;
        var __VLS_159;
        // @ts-ignore
        [form, form, registryItems,];
        let __VLS_162;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
            // @ts-ignore
            label: "Registration #",
        }));
        const __VLS_164 = __VLS_163({
            label: "Registration #",
        }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        var __VLS_165;
        const { default: __VLS_167 } = __VLS_nonNull(__VLS_165.slots);
        let __VLS_168;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
            // @ts-ignore
            modelValue: (form.value.registration_number), ...{ class: "w-full" }, maxlength: "50",
        }));
        const __VLS_170 = __VLS_169({
            modelValue: (form.value.registration_number),
            ...{ class: "w-full" },
            maxlength: "50",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form,];
        let __VLS_173;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
            // @ts-ignore
            label: "Online pedigree link", ...{ class: "sm:col-span-2" },
        }));
        const __VLS_175 = __VLS_174({
            label: "Online pedigree link",
            ...{ class: "sm:col-span-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        /** @type {__VLS_StyleScopedClasses['sm:col-span-2']} */ ;
        var __VLS_176;
        const { default: __VLS_178 } = __VLS_nonNull(__VLS_176.slots);
        let __VLS_179;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
            // @ts-ignore
            modelValue: (form.value.pedigree_url), type: "url", placeholder: "https:/*", *() { }
        } / , ...{ class: "w-full" }));
    }
    ;
    const __VLS_181 = __VLS_180({
        modelValue: (form.value.pedigree_url),
        type: "url",
        placeholder: "https://",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    let __VLS_184;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
        // @ts-ignore
        label: "Tattoo, right ear", hint: "Herd letters",
    }));
    const __VLS_186 = __VLS_185({
        label: "Tattoo, right ear",
        hint: "Herd letters",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    var __VLS_187;
    const { default: __VLS_189 } = __VLS_nonNull(__VLS_187.slots);
    let __VLS_190;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
        // @ts-ignore
        modelValue: (form.value.tattoo_right), ...{ class: "w-full" }, maxlength: "20",
    }));
    const __VLS_192 = __VLS_191({
        modelValue: (form.value.tattoo_right),
        ...{ class: "w-full" },
        maxlength: "20",
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    let __VLS_195;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({
        // @ts-ignore
        label: "Tattoo, left ear", hint: "Year letter + number",
    }));
    const __VLS_197 = __VLS_196({
        label: "Tattoo, left ear",
        hint: "Year letter + number",
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    var __VLS_198;
    const { default: __VLS_200 } = __VLS_nonNull(__VLS_198.slots);
    let __VLS_201;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({
        // @ts-ignore
        modelValue: (form.value.tattoo_left), ...{ class: "w-full" }, maxlength: "20",
    }));
    const __VLS_203 = __VLS_202({
        modelValue: (form.value.tattoo_left),
        ...{ class: "w-full" },
        maxlength: "20",
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    let __VLS_206;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
        // @ts-ignore
        label: "Scrapie tag",
    }));
    const __VLS_208 = __VLS_207({
        label: "Scrapie tag",
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    var __VLS_209;
    const { default: __VLS_211 } = __VLS_nonNull(__VLS_209.slots);
    let __VLS_212;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent1(__VLS_212, new __VLS_212({
        // @ts-ignore
        modelValue: (form.value.scrapie_tag), ...{ class: "w-full" }, maxlength: "50",
    }));
    const __VLS_214 = __VLS_213({
        modelValue: (form.value.scrapie_tag),
        ...{ class: "w-full" },
        maxlength: "50",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    let __VLS_217;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
        // @ts-ignore
        label: "Microchip",
    }));
    const __VLS_219 = __VLS_218({
        label: "Microchip",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    var __VLS_220;
    const { default: __VLS_222 } = __VLS_nonNull(__VLS_220.slots);
    let __VLS_223;
    /** @ts-ignore @type { | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
        // @ts-ignore
        modelValue: (form.value.microchip), ...{ class: "w-full" }, maxlength: "50",
    }));
    const __VLS_225 = __VLS_224({
        modelValue: (form.value.microchip),
        ...{ class: "w-full" },
        maxlength: "50",
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    // @ts-ignore
    [];
    let __VLS_228;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
    // @ts-ignore
    }));
    const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
    var __VLS_231;
    const { default: __VLS_233 } = __VLS_nonNull(__VLS_231.slots);
    {
        const { header: __VLS_234 } = __VLS_nonNull(__VLS_231.slots);
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid sm:grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    let __VLS_235;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
        // @ts-ignore
        label: "Sire",
    }));
    const __VLS_237 = __VLS_236({
        label: "Sire",
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    var __VLS_238;
    const { default: __VLS_240 } = __VLS_nonNull(__VLS_238.slots);
    const __VLS_241 = GoatPicker;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
        // @ts-ignore
        modelValue: (form.value.sire_id), sex: "buck", excludeId: (__VLS_unwrap(goatId, {})),
    }));
    const __VLS_243 = __VLS_242({
        modelValue: (form.value.sire_id),
        sex: "buck",
        excludeId: (__VLS_unwrap(goatId, {})),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    // @ts-ignore
    [form, goatId,];
    let __VLS_246;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({
        // @ts-ignore
        label: "Dam",
    }));
    const __VLS_248 = __VLS_247({
        label: "Dam",
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    var __VLS_249;
    const { default: __VLS_251 } = __VLS_nonNull(__VLS_249.slots);
    const __VLS_252 = GoatPicker;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({
        // @ts-ignore
        modelValue: (form.value.dam_id), sex: "doe", excludeId: (__VLS_unwrap(goatId, {})),
    }));
    const __VLS_254 = __VLS_253({
        modelValue: (form.value.dam_id),
        sex: "doe",
        excludeId: (__VLS_unwrap(goatId, {})),
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    // @ts-ignore
    [form, goatId,];
    // @ts-ignore
    [];
    let __VLS_257;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
    // @ts-ignore
    }));
    const __VLS_259 = __VLS_258({}, ...__VLS_functionalComponentArgsRest(__VLS_258));
    var __VLS_260;
    const { default: __VLS_262 } = __VLS_nonNull(__VLS_260.slots);
    {
        const { header: __VLS_263 } = __VLS_nonNull(__VLS_260.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    let __VLS_264;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent1(__VLS_264, new __VLS_264({
        // @ts-ignore
        label: "Status", hint: "Reference = an outside goat kept for pedigrees",
    }));
    const __VLS_266 = __VLS_265({
        label: "Status",
        hint: "Reference = an outside goat kept for pedigrees",
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    var __VLS_267;
    const { default: __VLS_269 } = __VLS_nonNull(__VLS_267.slots);
    let __VLS_270;
    /** @ts-ignore @type { | typeof __VLS_components.USelect} */
    USelect;
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent1(__VLS_270, new __VLS_270({
        // @ts-ignore
        modelValue: (form.value.status), items: (__VLS_unwrap(statusOptions, {})), ...{ class: "w-full sm:w-60" },
    }));
    const __VLS_272 = __VLS_271({
        modelValue: (form.value.status),
        items: (__VLS_unwrap(statusOptions, {})),
        ...{ class: "w-full sm:w-60" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:w-60']} */ ;
    // @ts-ignore
    [form, statusOptions,];
    if (leftHerd.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid sm:grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        let __VLS_275;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_276 = __VLS_asFunctionalComponent1(__VLS_275, new __VLS_275({
            // @ts-ignore
            label: (form.value.status === 'sold' ? 'Date adopted' : 'Date died'),
        }));
        const __VLS_277 = __VLS_276({
            label: (form.value.status === 'sold' ? 'Date adopted' : 'Date died'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_276));
        var __VLS_278;
        const { default: __VLS_280 } = __VLS_nonNull(__VLS_278.slots);
        let __VLS_281;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
            // @ts-ignore
            modelValue: (form.value.left_herd_on), type: "date", ...{ class: "w-full" },
        }));
        const __VLS_283 = __VLS_282({
            modelValue: (form.value.left_herd_on),
            type: "date",
            ...{ class: "w-full" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form, leftHerd,];
        let __VLS_286;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
            // @ts-ignore
            label: (form.value.status === 'sold' ? 'Adopted by / notes' : 'Cause'),
        }));
        const __VLS_288 = __VLS_287({
            label: (form.value.status === 'sold' ? 'Adopted by / notes' : 'Cause'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_287));
        var __VLS_289;
        const { default: __VLS_291 } = __VLS_nonNull(__VLS_289.slots);
        let __VLS_292;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
            // @ts-ignore
            modelValue: (form.value.left_herd_reason), ...{ class: "w-full" }, maxlength: "500",
        }));
        const __VLS_294 = __VLS_293({
            modelValue: (form.value.left_herd_reason),
            ...{ class: "w-full" },
            maxlength: "500",
        }, ...__VLS_functionalComponentArgsRest(__VLS_293));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [form, form,];
    }
    let __VLS_297;
    /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
    UFormField;
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297({
        // @ts-ignore
        label: "Notes",
    }));
    const __VLS_299 = __VLS_298({
        label: "Notes",
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    var __VLS_300;
    const { default: __VLS_302 } = __VLS_nonNull(__VLS_300.slots);
    let __VLS_303;
    /** @ts-ignore @type { | typeof __VLS_components.UTextarea} */
    UTextarea;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({
        // @ts-ignore
        modelValue: (form.value.notes), rows: (4), autoresize: true, maxlength: "10000", ...{ class: "w-full" },
    }));
    const __VLS_305 = __VLS_304({
        modelValue: (form.value.notes),
        rows: (4),
        autoresize: true,
        maxlength: "10000",
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    // @ts-ignore
    [form,];
    // @ts-ignore
    [];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    let __VLS_308;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308({
        // @ts-ignore
        type: "submit", size: "lg", loading: (saveGoat.value.isPending.value),
    }));
    const __VLS_310 = __VLS_309({
        type: "submit",
        size: "lg",
        loading: (saveGoat.value.isPending.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_309));
    var __VLS_311;
    const { default: __VLS_313 } = __VLS_nonNull(__VLS_311.slots);
    (existing.value ? 'Save changes' : 'Add goat');
    // @ts-ignore
    [existing, saveGoat,];
    let __VLS_314;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314({
        // @ts-ignore
        color: "neutral", variant: "ghost", size: "lg", to: (existing.value ? `/goats/${existing.value.slug}` : '/goats'),
    }));
    const __VLS_316 = __VLS_315({
        color: "neutral",
        variant: "ghost",
        size: "lg",
        to: (existing.value ? `/goats/${existing.value.slug}` : '/goats'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_315));
    var __VLS_317;
    const { default: __VLS_319 } = __VLS_nonNull(__VLS_317.slots);
    // @ts-ignore
    [existing, existing,];
    if (existing.value && isOwner.value) {
        let __VLS_320;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_321 = __VLS_asFunctionalComponent1(__VLS_320, new __VLS_320({
            // @ts-ignore
            ...{ 'onClick': {} }, ...{ class: "ms-auto" }, color: "error", variant: "ghost", size: "lg", icon: "i-lucide-trash-2",
        }));
        const __VLS_322 = __VLS_321({
            ...{ 'onClick': {} },
            ...{ class: "ms-auto" },
            color: "error",
            variant: "ghost",
            size: "lg",
            icon: "i-lucide-trash-2",
        }, ...__VLS_functionalComponentArgsRest(__VLS_321));
        let __VLS_325;
        const __VLS_326 = {
            /** @type {typeof __VLS_325.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(goatRef.value && !existing.value && !goats.value.isPending.value))
                    throw 0;
                if (!!(goatRef.value && !existing.value))
                    throw 0;
                if (!(existing.value && isOwner.value))
                    throw 0;
                return (confirmDelete.value = true);
                // @ts-ignore
                [existing, isOwner, confirmDelete,];
            },
        };
        void __VLS_326;
        /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
        var __VLS_323;
        var __VLS_324;
        const { default: __VLS_327 } = __VLS_nonNull(__VLS_323.slots);
        // @ts-ignore
        [];
    }
};
let __VLS_328;
/** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
UModal;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent1(__VLS_328, new __VLS_328({
    // @ts-ignore
    open: (confirmDelete.value), title: (`Delete ${existing.value ? __VLS_unwrap(goatFullName, {})(existing.value) : 'goat'}?`), description: "This removes the goat, its appraisals and photos. Offspring keep their records but lose the link to this parent. To keep the history, set the status to Adopted or Deceased instead.",
}));
const __VLS_330 = __VLS_329({
    open: (confirmDelete.value),
    title: (`Delete ${existing.value ? __VLS_unwrap(goatFullName, {})(existing.value) : 'goat'}?`),
    description: "This removes the goat, its appraisals and photos. Offspring keep their records but lose the link to this parent. To keep the history, set the status to Adopted or Deceased instead.",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
var __VLS_331;
const { default: __VLS_333 } = __VLS_nonNull(__VLS_331.slots);
{
    const { footer: __VLS_334 } = __VLS_nonNull(__VLS_331.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-2 w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    let __VLS_335;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "neutral", variant: "ghost",
    }));
    const __VLS_337 = __VLS_336({
        ...{ 'onClick': {} },
        color: "neutral",
        variant: "ghost",
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    let __VLS_340;
    const __VLS_341 = {
        /** @type {typeof __VLS_340.click} */
        onClick: (...[$event]) => {
            void $event;
            return (confirmDelete.value = false);
            // @ts-ignore
            [existing, existing, goatFullName, confirmDelete, confirmDelete,];
        },
    };
    void __VLS_341;
    var __VLS_338;
    var __VLS_339;
    const { default: __VLS_342 } = __VLS_nonNull(__VLS_338.slots);
    // @ts-ignore
    [];
    let __VLS_343;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343({
        // @ts-ignore
        ...{ 'onClick': {} }, color: "error", loading: (deleteGoat.value.isPending.value),
    }));
    const __VLS_345 = __VLS_344({
        ...{ 'onClick': {} },
        color: "error",
        loading: (deleteGoat.value.isPending.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_344));
    let __VLS_348;
    const __VLS_349 = {
        /** @type {typeof __VLS_348.click} */
        onClick: (remove),
    };
    void __VLS_349;
    var __VLS_346;
    var __VLS_347;
    const { default: __VLS_350 } = __VLS_nonNull(__VLS_346.slots);
    // @ts-ignore
    [deleteGoat,];
    // @ts-ignore
    [];
}
// @ts-ignore
[];
// @ts-ignore
[];
return {};
;
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
