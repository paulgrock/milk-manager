/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import '@/lib/echarts';
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { useChartTheme } from '@/composables/useChartTheme';
import { STANDARD_DAYS, woodAt } from '@/lib/lactation';
import { formatWeight, fromGrams } from '@/lib/milk';
const { defineProps, } = {};
const props = defineProps();
const theme = useChartTheme();
const toUnit = (g) => Math.round(fromGrams(g, props.unit) * 100) / 100;
const maxDim = computed(() => Math.max(STANDARD_DAYS, ...props.series.flatMap((s) => s.summary.points.map((p) => p.dim))));
function projectionPoints(s) {
    const fit = s.summary.fit;
    if (!s.showProjection || !fit || s.summary.currentDim >= STANDARD_DAYS)
        return [];
    const out = [];
    for (let dim = Math.max(1, s.summary.currentDim); dim <= STANDARD_DAYS; dim += 2)
        out.push([dim, toUnit(woodAt(fit, dim))]);
    return out;
}
// What the tooltip shows at a day in milk, for each lactation.
function valuesAt(dim) {
    return props.series.map((s, i) => {
        const raw = s.summary.points.find((p) => p.dim === dim);
        const smooth = s.summary.smoothed.find((p) => p.dim === dim);
        const projected = s.showProjection && s.summary.fit && dim > s.summary.currentDim ? woodAt(s.summary.fit, dim) : undefined;
        return { label: s.label, color: theme.value.series[i], raw: raw?.grams, smooth: smooth?.grams, projected };
    });
}
const option = computed(() => {
    const t = theme.value;
    const series = props.series.flatMap((s, i) => {
        const color = t.series[i];
        return [
            {
                name: s.label,
                type: 'scatter',
                data: s.summary.points.map((p) => [p.dim, toUnit(p.grams)]),
                symbolSize: 5,
                itemStyle: { color, opacity: i === 0 ? 0.35 : 0.2 },
                emphasis: { disabled: true },
                silent: true,
                z: 1,
            },
            {
                name: s.label,
                type: 'line',
                data: s.summary.smoothed.map((p) => [p.dim, toUnit(p.grams)]),
                showSymbol: false,
                smooth: 0.3,
                lineStyle: { width: 2, color },
                itemStyle: { color },
                emphasis: { disabled: true },
                z: 3,
            },
            {
                name: s.label,
                type: 'scatter',
                data: (s.testPoints ?? []).map((p) => [p.dim, toUnit(p.grams)]),
                symbol: 'diamond',
                symbolSize: 10,
                itemStyle: { color, borderColor: t.surface, borderWidth: 2 },
                emphasis: { disabled: true },
                silent: true,
                z: 4,
            },
            {
                name: s.label,
                type: 'line',
                data: projectionPoints(s),
                showSymbol: false,
                lineStyle: { width: 2, color, type: [6, 4] },
                itemStyle: { color },
                emphasis: { disabled: true },
                z: 2,
            },
        ];
    });
    return {
        animation: false,
        grid: { left: 8, right: 16, top: props.series.length > 1 ? 36 : 16, bottom: 28, containLabel: true },
        legend: props.series.length > 1
            ? {
                top: 0,
                left: 0,
                data: props.series.map((s, i) => ({ name: s.label, itemStyle: { color: t.series[i] } })),
                icon: 'roundRect',
                itemWidth: 12,
                itemHeight: 4,
                textStyle: { color: t.textSecondary },
            }
            : undefined,
        xAxis: {
            type: 'value',
            min: 0,
            max: maxDim.value,
            interval: 50,
            name: 'Days in milk',
            nameLocation: 'middle',
            nameGap: 26,
            nameTextStyle: { color: t.muted },
            axisLabel: { color: t.muted },
            axisLine: { lineStyle: { color: t.axis } },
            axisTick: { show: false },
            splitLine: { show: false },
        },
        yAxis: {
            type: 'value',
            min: 0,
            axisLabel: { color: t.muted, formatter: (v) => `${v} ${props.unit}` },
            axisLine: { show: false },
            splitLine: { lineStyle: { color: t.grid } },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line', lineStyle: { color: t.axis } },
            backgroundColor: t.surface,
            borderColor: t.grid,
            textStyle: { color: t.textPrimary },
            formatter: (params) => {
                const first = Array.isArray(params) ? params[0] : params;
                const dim = Math.round(Number(first.axisValue ?? 0));
                const rows = valuesAt(dim)
                    .map((v) => {
                    const parts = [
                        v.raw !== undefined ? `<b>${formatWeight(v.raw, props.unit, true)}</b> weighed` : '',
                        v.smooth !== undefined ? `${formatWeight(v.smooth, props.unit)} 7-day avg` : '',
                        v.projected !== undefined ? `${formatWeight(v.projected, props.unit, true)} projected` : '',
                    ].filter(Boolean);
                    if (!parts.length)
                        return '';
                    return `<div style="display:flex;gap:6px;align-items:baseline"><span style="display:inline-block;width:10px;height:4px;border-radius:2px;background:${v.color}"></span><span style="color:${t.textSecondary}">${v.label}</span></div><div style="margin:0 0 4px 16px">${parts.join(' · ')}</div>`;
                })
                    .join('');
                return `<div style="font-size:12px"><div style="color:${t.muted};margin-bottom:4px">Day ${dim} in milk</div>${rows || `<span style="color:${t.muted}">No weigh-in</span>`}</div>`;
            },
        },
        series,
    };
});
// Table view: weekly averages, so the numbers are readable without the chart.
const showTable = ref(false);
const tableRows = computed(() => {
    const weeks = Math.ceil(maxDim.value / 7);
    return Array.from({ length: weeks }, (_, w) => {
        const from = w * 7;
        const to = from + 6;
        const cells = props.series.map((s) => {
            const inWeek = s.summary.points.filter((p) => p.dim >= from && p.dim <= to);
            if (inWeek.length)
                return formatWeight(inWeek.reduce((a, p) => a + p.grams, 0) / inWeek.length, props.unit);
            const fit = s.summary.fit;
            if (s.showProjection && fit && from > s.summary.currentDim && from <= STANDARD_DAYS) {
                return `${formatWeight(woodAt(fit, from + 3), props.unit)}*`;
            }
            return '';
        });
        return { label: `${from}–${to}`, cells };
    }).filter((r) => r.cells.some(Boolean));
});
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
    __VLS_withDotValue(showTable, {});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-64 sm:h-80" },
    });
    /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:h-80']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof VChart} */
    VChart;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        option: (__VLS_unwrap(option, {})), autoresize: true, ...{ class: "size-full" }, role: "img", 'aria-label': (`Lactation curve: ${__VLS_ctx.series.map((s) => s.label).join(', ')}`),
    }));
    const __VLS_2 = __VLS_1({
        option: (__VLS_unwrap(option, {})),
        autoresize: true,
        ...{ class: "size-full" },
        role: "img",
        'aria-label': (`Lactation curve: ${__VLS_ctx.series.map((s) => s.label).join(', ')}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3 mt-1 text-xs text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "inline-block size-1.5 rounded-full bg-current opacity-50" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['size-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-current']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "inline-block w-4 h-0.5 bg-current" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-current']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ class: "inline-block w-4 border-t-2 border-dashed border-current" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-current']} */ ;
    if (__VLS_ctx.series.some((s) => s.testPoints?.length)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-flex items-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "inline-block size-2 rotate-45 bg-current" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
        /** @type {__VLS_StyleScopedClasses['size-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rotate-45']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-current']} */ ;
    }
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.UButton | typeof __VLS_components.UButton} */
    UButton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        ...{ 'onClick': {} }, size: "xs", variant: "link", color: "neutral", ...{ class: "ms-auto" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        size: "xs",
        variant: "link",
        color: "neutral",
        ...{ class: "ms-auto" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = {
        /** @type {typeof __VLS_10.click} */
        onClick: (...[$event]) => {
            void $event;
            return (showTable.value = !showTable.value);
            // @ts-ignore
            [option, series, series, showTable, showTable,];
        },
    };
    void __VLS_11;
    /** @type {__VLS_StyleScopedClasses['ms-auto']} */ ;
    var __VLS_8;
    var __VLS_9;
    const { default: __VLS_12 } = __VLS_nonNull(__VLS_8.slots);
    (showTable.value ? 'Hide table' : 'Show as table');
    // @ts-ignore
    [showTable,];
    if (showTable.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2 max-h-72 overflow-auto rounded-md border border-default" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-72']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
            ...{ class: "w-full text-sm tabular-nums" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['tabular-nums']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({
            ...{ class: "sticky top-0 bg-default" },
        });
        /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-default']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            ...{ class: "text-muted text-start" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "px-2 py-1 text-start font-normal" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
        const __VLS_13 = __VLS_tryAsConstant((__VLS_ctx.series));
        for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_13))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                key: (s.id),
                ...{ class: "px-2 py-1 text-end font-normal" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
            (s.label);
            (__VLS_ctx.unit);
            // @ts-ignore
            [series, showTable, unit,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        const __VLS_14 = __VLS_tryAsConstant((__VLS_unwrap(tableRows, {})));
        for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_14))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (r.label),
                ...{ class: "border-t border-default" },
            });
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-default']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "px-2 py-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            (r.label);
            const __VLS_15 = __VLS_tryAsConstant((r.cells));
            for (const [c, i] of __VLS_vFor(__VLS_nonNull(__VLS_15))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    key: (i),
                    ...{ class: "px-2 py-1 text-end" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-end']} */ ;
                (c);
                // @ts-ignore
                [tableRows,];
            }
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "px-2 py-1 text-xs text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
