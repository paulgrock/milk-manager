/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { localMailInbox, passkeysSupported } from '@/lib/supabase';
import { passkeyErrorMessage } from '@/lib/passkeys';
const { sendCode, verifyCode, signInWithPasskey } = useAuth();
const router = useRouter();
const route = useRoute();
const step = ref('email');
const email = ref('');
const code = ref([]);
const busy = ref(false);
const error = ref('');
async function submitEmail() {
    error.value = '';
    busy.value = true;
    try {
        email.value = email.value.trim().toLowerCase();
        await sendCode(email.value);
        step.value = 'code';
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        busy.value = false;
    }
}
async function usePasskey() {
    error.value = '';
    busy.value = true;
    try {
        await signInWithPasskey();
        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
        await router.replace(redirect);
    }
    catch (e) {
        error.value = passkeyErrorMessage(e);
    }
    finally {
        busy.value = false;
    }
}
async function submitCode() {
    error.value = '';
    busy.value = true;
    try {
        await verifyCode(email.value, code.value.join(''));
        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
        await router.replace(redirect);
    }
    catch (e) {
        error.value = e.message;
        code.value = [];
    }
    finally {
        busy.value = false;
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(step, {});
    __VLS_withDotValue(passkeysSupported, {});
    __VLS_withDotValue(localMailInbox, {});
    __VLS_withDotValue(code, {});
    __VLS_withDotValue(error, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "min-h-dvh flex items-center justify-center p-4 bg-default" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-dvh']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-default']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.UCard | typeof __VLS_components.UCard} */
    UCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ class: "w-full max-w-sm" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "w-full max-w-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    {
        const { header: __VLS_6 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "/favicon.svg",
            alt: "",
            ...{ class: "size-10" },
        });
        /** @type {__VLS_StyleScopedClasses['size-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-lg font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    if (step.value === 'email') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submitEmail) },
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.UFormField | typeof __VLS_components.UFormField} */
        UFormField;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            label: "Email", name: "email",
        }));
        const __VLS_9 = __VLS_8({
            label: "Email",
            name: "email",
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        var __VLS_10;
        const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.UInput} */
        UInput;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            modelValue: (__VLS_unwrap(email, {})), type: "email", autocomplete: "email", required: true, autofocus: true, ...{ class: "w-full" }, size: "xl",
        }));
        const __VLS_15 = __VLS_14({
            modelValue: (__VLS_unwrap(email, {})),
            type: "email",
            autocomplete: "email",
            required: true,
            autofocus: true,
            ...{ class: "w-full" },
            size: "xl",
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        // @ts-ignore
        [step, email,];
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            type: "submit", block: true, size: "xl", loading: (__VLS_unwrap(busy, {})),
        }));
        const __VLS_20 = __VLS_19({
            type: "submit",
            block: true,
            size: "xl",
            loading: (__VLS_unwrap(busy, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        // @ts-ignore
        [busy,];
        if (passkeysSupported.value) {
            let __VLS_24;
            /** @ts-ignore @type { | typeof __VLS_components.USeparator} */
            USeparator;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
                // @ts-ignore
                label: "or",
            }));
            const __VLS_26 = __VLS_25({
                label: "or",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            let __VLS_29;
            /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
            UButton;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                // @ts-ignore
                ...{ 'onClick': {} }, block: true, size: "xl", color: "neutral", variant: "outline", icon: "i-lucide-fingerprint", loading: (__VLS_unwrap(busy, {})),
            }));
            const __VLS_31 = __VLS_30({
                ...{ 'onClick': {} },
                block: true,
                size: "xl",
                color: "neutral",
                variant: "outline",
                icon: "i-lucide-fingerprint",
                loading: (__VLS_unwrap(busy, {})),
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            let __VLS_34;
            const __VLS_35 = {
                /** @type {typeof __VLS_34.click} */
                onClick: (usePasskey),
            };
            void __VLS_35;
            var __VLS_32;
            var __VLS_33;
            const { default: __VLS_36 } = __VLS_nonNull(__VLS_32.slots);
            // @ts-ignore
            [busy, passkeysSupported,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (submitCode) },
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(email, {}));
        if (localMailInbox.value) {
            let __VLS_37;
            /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
            UAlert;
            // @ts-ignore
            const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
                // @ts-ignore
                color: "info", variant: "subtle", icon: "i-lucide-mail-search", title: "This is the local test setup", description: "Sign-in emails aren't really sent here. They're caught by the local mail inbox.", actions: ([{ label: 'Open local inbox', to: localMailInbox.value, target: '_blank', trailingIcon: 'i-lucide-external-link' }]),
            }));
            const __VLS_39 = __VLS_38({
                color: "info",
                variant: "subtle",
                icon: "i-lucide-mail-search",
                title: "This is the local test setup",
                description: "Sign-in emails aren't really sent here. They're caught by the local mail inbox.",
                actions: ([{ label: 'Open local inbox', to: localMailInbox.value, target: '_blank', trailingIcon: 'i-lucide-external-link' }]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        }
        let __VLS_42;
        /** @ts-ignore @type { | typeof __VLS_components.UPinInput} */
        UPinInput;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            // @ts-ignore
            ...{ 'onComplete': {} }, modelValue: (code.value), length: (6), otp: true, type: "number", size: "xl", autofocus: true,
        }));
        const __VLS_44 = __VLS_43({
            ...{ 'onComplete': {} },
            modelValue: (code.value),
            length: (6),
            otp: true,
            type: "number",
            size: "xl",
            autofocus: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_47;
        const __VLS_48 = {
            /** @type {typeof __VLS_47.complete} */
            onComplete: (submitCode),
        };
        void __VLS_48;
        var __VLS_45;
        var __VLS_46;
        let __VLS_49;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            // @ts-ignore
            type: "submit", block: true, size: "xl", loading: (__VLS_unwrap(busy, {})), disabled: (code.value.join('').length < 6),
        }));
        const __VLS_51 = __VLS_50({
            type: "submit",
            block: true,
            size: "xl",
            loading: (__VLS_unwrap(busy, {})),
            disabled: (code.value.join('').length < 6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        var __VLS_52;
        const { default: __VLS_54 } = __VLS_nonNull(__VLS_52.slots);
        // @ts-ignore
        [email, busy, localMailInbox, localMailInbox, code, code,];
        let __VLS_55;
        /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
        UButton;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            // @ts-ignore
            ...{ 'onClick': {} }, variant: "link", color: "neutral",
        }));
        const __VLS_57 = __VLS_56({
            ...{ 'onClick': {} },
            variant: "link",
            color: "neutral",
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        let __VLS_60;
        const __VLS_61 = {
            /** @type {typeof __VLS_60.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(step.value === 'email'))
                    throw 0;
                step.value = 'email';
                code.value = [];
                // @ts-ignore
                [step, code,];
            },
        };
        void __VLS_61;
        var __VLS_58;
        var __VLS_59;
        const { default: __VLS_62 } = __VLS_nonNull(__VLS_58.slots);
        // @ts-ignore
        [];
    }
    if (error.value) {
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.UAlert} */
        UAlert;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
            // @ts-ignore
            ...{ class: "mt-4" }, color: "error", variant: "subtle", description: (error.value),
        }));
        const __VLS_65 = __VLS_64({
            ...{ class: "mt-4" },
            color: "error",
            variant: "subtle",
            description: (error.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    }
    // @ts-ignore
    [error, error,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
