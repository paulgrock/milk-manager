/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useGoatMutations, usePhotoUrls } from '@/composables/useGoats';
import { goatName, iconPath } from '@/lib/goats';
const { defineProps, } = {};
const props = defineProps();
const KIND_LABELS = { conformation: 'Conformation', head: 'Head', udder: 'Udder', other: 'Other' };
const kindOptions = Object.entries(KIND_LABELS).map(([value, label]) => ({ label, value }));
const toast = useToast();
const { uploadPhoto, deletePhoto, setPrimaryPhoto } = useGoatMutations();
const kind = ref('conformation');
const fileInput = ref();
const viewing = ref();
// Tiles use the small copies; the full photo loads only when one is opened.
const urls = usePhotoUrls(() => [...props.photos.map(iconPath), ...(viewing.value ? [viewing.value.storage_path] : [])]);
const viewerOpen = computed({
    get: () => !!viewing.value,
    set: (open) => {
        if (!open)
            viewing.value = undefined;
    },
});
async function onFiles(event) {
    const input = event.target;
    const files = [...(input.files ?? [])];
    input.value = '';
    for (const [i, file] of files.entries()) {
        try {
            await uploadPhoto.mutateAsync({
                goat: props.goat,
                file,
                kind: kind.value,
                makePrimary: props.photos.length === 0 && i === 0,
            });
        }
        catch (e) {
            toast.add({ color: 'error', title: `Could not upload ${file.name}`, description: e.message });
        }
    }
}
async function remove(photo) {
    await deletePhoto.mutateAsync(photo);
    viewing.value = undefined;
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(uploadPhoto, {});
    __VLS_withDotValue(fileInput, {});
    __VLS_withDotValue(viewing, {});
    __VLS_withDotValue(urls, {});
    __VLS_withDotValue(KIND_LABELS, {});
    __VLS_withDotValue(deletePhoto, {});
    __VLS_withDotValue(setPrimaryPhoto, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { header: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-semibold flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.USelect} */
        USelect;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            modelValue: (__VLS_unwrap(kind, {})), items: (__VLS_unwrap(kindOptions, {})), size: "sm", ...{ class: "w-36" }, 'aria-label': "Photo type",
        }));
        const __VLS_9 = __VLS_8({
            modelValue: (__VLS_unwrap(kind, {})),
            items: (__VLS_unwrap(kindOptions, {})),
            size: "sm",
            ...{ class: "w-36" },
            'aria-label': "Photo type",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        /** @type {__VLS_StyleScopedClasses['w-36']} */ ;
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            // @ts-ignore
            ...{ 'onClick': {} }, size: "sm", variant: "soft", icon: "i-lucide-camera", loading: (uploadPhoto.value.isPending.value),
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            size: "sm",
            variant: "soft",
            icon: "i-lucide-camera",
            loading: (uploadPhoto.value.isPending.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_17;
        const __VLS_18 = {
            /** @type {typeof __VLS_17.click} */
            onClick: (...[$event]) => {
                void $event;
                return (fileInput.value?.click());
                // @ts-ignore
                [kind, kindOptions, uploadPhoto, fileInput,];
            },
        };
        void __VLS_18;
        var __VLS_15;
        var __VLS_16;
        const { default: __VLS_19 } = __VLS_nonNull(__VLS_15.slots);
        // @ts-ignore
        [];
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (onFiles) },
            ref: "fileInput",
            type: "file",
            accept: "image/*",
            multiple: true,
            ...{ class: "hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.photos.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-3 sm:grid-cols-4 gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        const __VLS_20 = __VLS_tryAsConstant((__VLS_ctx.photos));
        for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_20))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(!__VLS_ctx.photos.length))
                            throw 0;
                        return (viewing.value = p);
                        // @ts-ignore
                        [photos, photos, viewing,];
                    } },
                key: (p.id),
                type: "button",
                ...{ class: "relative aspect-square rounded-md overflow-hidden bg-elevated" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-elevated']} */ ;
            if (urls.value[__VLS_unwrap(iconPath, {})(p)]) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (urls.value[__VLS_unwrap(iconPath, {})(p)]),
                    alt: (`${__VLS_unwrap(goatName, {})(__VLS_ctx.goat)}, ${KIND_LABELS.value[p.kind]}`),
                    ...{ class: "size-full object-cover" },
                });
                /** @type {__VLS_StyleScopedClasses['size-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "absolute bottom-1 left-1 text-xs bg-black/60 text-white rounded px-1" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['bottom-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
            (KIND_LABELS.value[p.kind]);
            if (p.is_primary) {
                let __VLS_21;
                /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
                UIcon;
                // @ts-ignore
                const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
                    // @ts-ignore
                    name: "i-lucide-star", ...{ class: "absolute top-1 right-1 text-yellow-400 size-5" },
                }));
                const __VLS_23 = __VLS_22({
                    name: "i-lucide-star",
                    ...{ class: "absolute top-1 right-1 text-yellow-400 size-5" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_22));
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['size-5']} */ ;
            }
            // @ts-ignore
            [urls, urls, iconPath, iconPath, goatName, goat, KIND_LABELS, KIND_LABELS,];
        }
    }
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.UModal | typeof __VLS_components.UModal} */
    UModal;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        // @ts-ignore
        open: (__VLS_unwrap(viewerOpen, {})), title: (viewing.value ? KIND_LABELS.value[viewing.value.kind] : ''), ui: ({ content: 'max-w-3xl' }),
    }));
    const __VLS_28 = __VLS_27({
        open: (__VLS_unwrap(viewerOpen, {})),
        title: (viewing.value ? KIND_LABELS.value[viewing.value.kind] : ''),
        ui: ({ content: 'max-w-3xl' }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    var __VLS_29;
    const { default: __VLS_31 } = __VLS_nonNull(__VLS_29.slots);
    {
        const { body: __VLS_32 } = __VLS_nonNull(__VLS_29.slots);
        if (viewing.value && urls.value[viewing.value.storage_path]) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (urls.value[viewing.value.storage_path]),
                alt: "",
                ...{ class: "w-full rounded-md" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        }
        // @ts-ignore
        [viewing, viewing, viewing, viewing, viewing, urls, urls, KIND_LABELS, viewerOpen,];
    }
    {
        const { footer: __VLS_33 } = __VLS_nonNull(__VLS_29.slots);
        if (viewing.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2 w-full" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            let __VLS_34;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                // @ts-ignore
                ...{ 'onClick': {} }, color: "error", variant: "ghost", icon: "i-lucide-trash-2", loading: (deletePhoto.value.isPending.value),
            }));
            const __VLS_36 = __VLS_35({
                ...{ 'onClick': {} },
                color: "error",
                variant: "ghost",
                icon: "i-lucide-trash-2",
                loading: (deletePhoto.value.isPending.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            let __VLS_39;
            const __VLS_40 = {
                /** @type {typeof __VLS_39.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!(viewing.value))
                        throw 0;
                    return (remove(viewing.value));
                    // @ts-ignore
                    [viewing, viewing, deletePhoto,];
                },
            };
            void __VLS_40;
            var __VLS_37;
            var __VLS_38;
            const { default: __VLS_41 } = __VLS_nonNull(__VLS_37.slots);
            // @ts-ignore
            [];
            if (!viewing.value.is_primary) {
                let __VLS_42;
                /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
                UButton;
                // @ts-ignore
                const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                    // @ts-ignore
                    ...{ 'onClick': {} }, ...{ class: "ms-auto" }, variant: "soft", icon: "i-lucide-star", loading: (setPrimaryPhoto.value.isPending.value),
                }));
                const __VLS_44 = __VLS_43({
                    ...{ 'onClick': {} },
                    ...{ class: "ms-auto" },
                    variant: "soft",
                    icon: "i-lucide-star",
                    loading: (setPrimaryPhoto.value.isPending.value),
                }, ...__VLS_functionalComponentArgsRest(__VLS_43));
                let __VLS_47;
                const __VLS_48 = {
                    /** @type {typeof __VLS_47.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!(viewing.value))
                            throw 0;
                        if (!(!viewing.value.is_primary))
                            throw 0;
                        return (setPrimaryPhoto.value.mutateAsync(viewing.value.id).then(() => (viewing.value = undefined)));
                        // @ts-ignore
                        [viewing, viewing, viewing, setPrimaryPhoto, setPrimaryPhoto,];
                    },
                };
                void __VLS_48;
                /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
                var __VLS_45;
                var __VLS_46;
                const { default: __VLS_49 } = __VLS_nonNull(__VLS_45.slots);
                // @ts-ignore
                [];
            }
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
