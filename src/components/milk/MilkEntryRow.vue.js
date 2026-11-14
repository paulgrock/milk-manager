/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref, watch } from 'vue';
import { goatName } from '@/lib/goats';
import { DAY_TOTAL, dayStatus, formatWeight, formatWeightInput, milkingLabel, } from '@/lib/milk';
import GoatAvatar from '@/components/goats/GoatAvatar.vue';
import { formatDate } from '@/lib/dates';
const { defineProps, defineEmits, defineExpose, } = {};
const props = defineProps();
const emit = defineEmits();
const input = ref();
const __VLS_exposed = { focus: () => input.value?.inputRef?.focus() };
defineExpose(__VLS_exposed);
const current = computed(() => props.rows.find((r) => r.milking === props.milking));
const status = computed(() => dayStatus(props.rows));
const hasSeparate = computed(() => props.rows.some((r) => r.milking > 0));
const dayTotalRow = computed(() => props.rows.find((r) => r.milking === DAY_TOTAL));
const locked = computed(() => props.milking === DAY_TOTAL && hasSeparate.value);
const text = ref('');
const focused = ref(false);
watch([current, () => props.entryUnit], () => {
    if (!focused.value)
        text.value = current.value ? formatWeightInput(current.value, props.entryUnit) : '';
}, { immediate: true });
const summary = computed(() => props.rows
    .filter((r) => r.milking !== props.milking)
    .map((r) => `${milkingLabel(r.milking)} ${formatWeight(r.weight_g, props.entryUnit, true)}`)
    .join(' · '));
const placeholder = computed(() => {
    if (locked.value)
        return formatWeight(status.value.totalG, props.entryUnit);
    if (dayTotalRow.value && props.milking !== DAY_TOTAL)
        return `of ${formatWeight(dayTotalRow.value.weight_g, props.entryUnit)}`;
    return '—';
});
// Enter saves and moves on, which also blurs; remember what was just sent so
// it isn't sent twice before the saved value comes back.
let lastSent;
watch(current, () => (lastSent = undefined));
function commit() {
    focused.value = false;
    const saved = lastSent ?? (current.value ? formatWeightInput(current.value, props.entryUnit) : '');
    if (text.value.trim() !== saved) {
        lastSent = text.value.trim();
        emit('save', text.value);
    }
}
function onEnter() {
    commit();
    emit('next');
}
const menu = computed(() => [
    { label: 'Edit this day', icon: 'i-lucide-list', onSelect: () => emit('editDay') },
    { label: 'Dry off', icon: 'i-lucide-moon', onSelect: () => emit('dryOff') },
]);
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
    __VLS_withDotValue(summary, {});
    __VLS_withDotValue(current, {});
    __VLS_withDotValue(status, {});
    __VLS_withDotValue(focused, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        ...{ class: "flex items-center gap-3 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    const __VLS_0 = GoatAvatar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        goat: (__VLS_ctx.goat), url: (__VLS_ctx.photoUrl), size: "md",
    }));
    const __VLS_2 = __VLS_1({
        goat: (__VLS_ctx.goat),
        url: (__VLS_ctx.photoUrl),
        size: "md",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 min-w-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "font-medium truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    (__VLS_ctx.goat.barn_name || __VLS_unwrap(goatName, {})(__VLS_ctx.goat));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-muted font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    (__VLS_ctx.dim);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-muted truncate" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    if (summary.value) {
        (summary.value);
    }
    if (__VLS_ctx.rows.length > 1 || (__VLS_ctx.rows.length && !current.value)) {
        (__VLS_unwrap(formatWeight, {})(status.value.totalG, __VLS_ctx.unit, true));
    }
    if (__VLS_ctx.withheldThrough) {
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            color: "warning", variant: "subtle", size: "sm", icon: "i-lucide-milk-off", ...{ class: "me-1" },
        }));
        const __VLS_7 = __VLS_6({
            color: "warning",
            variant: "subtle",
            size: "sm",
            icon: "i-lucide-milk-off",
            ...{ class: "me-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['me-1']} */ ;
        var __VLS_8;
        const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
        (__VLS_unwrap(formatDate, {})(__VLS_ctx.withheldThrough));
        // @ts-ignore
        [goat, goat, goat, photoUrl, goatName, dim, summary, summary, rows, rows, current, formatWeight, status, unit, withheldThrough, withheldThrough, formatDate,];
    }
    if (__VLS_ctx.error) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-error" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
        (__VLS_ctx.error);
    }
    else if (status.value.missing && !(__VLS_ctx.isToday && status.value.missing === 'PM')) {
        let __VLS_11;
        /** @ts-ignore @type { | typeof __VLS_components.UBadge | typeof __VLS_components.UBadge} */
        UBadge;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            // @ts-ignore
            color: "warning", variant: "subtle", size: "sm",
        }));
        const __VLS_13 = __VLS_12({
            color: "warning",
            variant: "subtle",
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        var __VLS_14;
        const { default: __VLS_16 } = __VLS_nonNull(__VLS_14.slots);
        (status.value.missing);
        // @ts-ignore
        [status, status, status, error, error, isToday,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1 shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    if (__VLS_ctx.waitingForSignal) {
        let __VLS_17;
        /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
        UIcon;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            // @ts-ignore
            name: "i-lucide-cloud-off", ...{ class: "text-warning size-4" }, title: "Saved on this phone. Will upload when there's signal.",
        }));
        const __VLS_19 = __VLS_18({
            name: "i-lucide-cloud-off",
            ...{ class: "text-warning size-4" },
            title: "Saved on this phone. Will upload when there's signal.",
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    }
    else if (__VLS_ctx.saving) {
        let __VLS_22;
        /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
        UIcon;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            // @ts-ignore
            name: "i-lucide-loader-circle", ...{ class: "animate-spin text-muted size-4" }, title: "Saving",
        }));
        const __VLS_24 = __VLS_23({
            name: "i-lucide-loader-circle",
            ...{ class: "animate-spin text-muted size-4" },
            title: "Saving",
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    }
    else if (current.value) {
        let __VLS_27;
        /** @ts-ignore @type { | typeof __VLS_components.UIcon} */
        UIcon;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            // @ts-ignore
            name: "i-lucide-check", ...{ class: "text-success size-4" }, title: "Saved",
        }));
        const __VLS_29 = __VLS_28({
            name: "i-lucide-check",
            ...{ class: "text-success size-4" },
            title: "Saved",
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        /** @type {__VLS_StyleScopedClasses['text-success']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-4']} */ ;
    }
    let __VLS_32;
    /** @ts-ignore @type { | typeof __VLS_components.UInput | typeof __VLS_components.UInput} */
    UInput;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        // @ts-ignore
        ...{ 'onFocus': {} }, ...{ 'onBlur': {} }, ...{ 'onKeydown': {} }, ref: "input", modelValue: (__VLS_unwrap(text, {})), inputmode: "decimal", enterkeyhint: "next", autocomplete: "off", placeholder: (__VLS_unwrap(placeholder, {})), disabled: (__VLS_unwrap(locked, {})), color: (__VLS_ctx.error ? 'error' : undefined), highlight: (!!__VLS_ctx.error), ...{ class: "w-24" }, size: "xl", ui: ({ base: 'text-end tabular-nums', trailing: 'pe-2' }), 'aria-label': (`${__VLS_ctx.goat.barn_name || __VLS_unwrap(goatName, {})(__VLS_ctx.goat)} ${__VLS_unwrap(milkingLabel, {})(__VLS_ctx.milking)}`),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onFocus': {} },
        ...{ 'onBlur': {} },
        ...{ 'onKeydown': {} },
        ref: "input",
        modelValue: (__VLS_unwrap(text, {})),
        inputmode: "decimal",
        enterkeyhint: "next",
        autocomplete: "off",
        placeholder: (__VLS_unwrap(placeholder, {})),
        disabled: (__VLS_unwrap(locked, {})),
        color: (__VLS_ctx.error ? 'error' : undefined),
        highlight: (!!__VLS_ctx.error),
        ...{ class: "w-24" },
        size: "xl",
        ui: ({ base: 'text-end tabular-nums', trailing: 'pe-2' }),
        'aria-label': (`${__VLS_ctx.goat.barn_name || __VLS_unwrap(goatName, {})(__VLS_ctx.goat)} ${__VLS_unwrap(milkingLabel, {})(__VLS_ctx.milking)}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = {
        /** @type {typeof __VLS_37.focus} */
        onFocus: (...[$event]) => {
            void $event;
            return (focused.value = true);
            // @ts-ignore
            [goat, goat, goatName, current, error, error, waitingForSignal, saving, text, placeholder, locked, milkingLabel, milking, focused,];
        },
    };
    void __VLS_38;
    const __VLS_39 = {
        /** @type {typeof __VLS_37.blur} */
        onBlur: (commit),
    };
    void __VLS_39;
    const __VLS_40 = {
        /** @type {typeof __VLS_37.keydown} */
        onKeydown: (onEnter),
    };
    void __VLS_40;
    /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
    var __VLS_35;
    var __VLS_36;
    const { default: __VLS_41 } = __VLS_nonNull(__VLS_35.slots);
    {
        const { trailing: __VLS_42 } = __VLS_nonNull(__VLS_35.slots);
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
    let __VLS_43;
    /** @ts-ignore @type { | typeof __VLS_components.UDropdownMenu | typeof __VLS_components.UDropdownMenu} */
    UDropdownMenu;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        // @ts-ignore
        items: (__VLS_unwrap(menu, {})),
    }));
    const __VLS_45 = __VLS_44({
        items: (__VLS_unwrap(menu, {})),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    var __VLS_46;
    const { default: __VLS_48 } = __VLS_nonNull(__VLS_46.slots);
    let __VLS_49;
    /** @ts-ignore @type { | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        // @ts-ignore
        color: "neutral", variant: "ghost", icon: "i-lucide-ellipsis-vertical", 'aria-label': "More",
    }));
    const __VLS_51 = __VLS_50({
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-ellipsis-vertical",
        'aria-label': "More",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    // @ts-ignore
    [menu,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => __VLS_exposed,
    __typeEmits: {},
    __typeProps: {},
});
export default {};
