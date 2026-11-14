/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../root/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import '@/lib/echarts';
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { useChartTheme } from '@/composables/useChartTheme';
import { formatDate } from '@/lib/dates';
import { formatWeight, fromGrams } from '@/lib/milk';
const { defineProps, } = {};
const props = defineProps();
const theme = useChartTheme();
const toUnit = (g) => (g === null ? null : Math.round(fromGrams(g, props.unit) * 100) / 100);
const option = computed(() => {
    const t = theme.value;
    const color = t.series[0];
    return {
        animation: false,
        grid: { left: 8, right: 16, top: 36, bottom: 8, containLabel: true },
        legend: {
            top: 0,
            left: 0,
            data: ['Day total', '7-day average'],
            icon: 'roundRect',
            itemWidth: 12,
            itemHeight: 4,
            textStyle: { color: t.textSecondary },
        },
        xAxis: {
            type: 'category',
            data: props.days.map((d) => d.date),
            axisLabel: { color: t.muted, formatter: (v) => formatDate(v).replace(/,? \d{4}$/, ''), hideOverlap: true },
            axisLine: { lineStyle: { color: t.axis } },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'value',
            min: 0,
            axisLabel: { color: t.muted, formatter: (v) => `${v} ${props.unit}` },
            splitLine: { lineStyle: { color: t.grid } },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line', lineStyle: { color: t.axis } },
            backgroundColor: t.surface,
            borderColor: t.grid,
            textStyle: { color: t.textPrimary },
            formatter: (params) => {
                const i = (Array.isArray(params) ? params[0] : params)?.dataIndex ?? 0;
                const d = props.days[i];
                return `<div style="font-size:12px"><div style="color:${t.muted}">${formatDate(d.date)}</div>
          <div><b>${d.grams === null ? '—' : formatWeight(d.grams, props.unit, true)}</b> <span style="color:${t.textSecondary}">day total</span></div>
          <div>${d.avgG === null ? '—' : formatWeight(d.avgG, props.unit, true)} <span style="color:${t.textSecondary}">7-day average</span></div></div>`;
            },
        },
        series: [
            {
                name: 'Day total',
                type: 'line',
                data: props.days.map((d) => toUnit(d.grams)),
                showSymbol: false,
                connectNulls: false,
                lineStyle: { width: 1, color, opacity: 0.45 },
                itemStyle: { color, opacity: 0.45 },
                emphasis: { disabled: true },
            },
            {
                name: '7-day average',
                type: 'line',
                data: props.days.map((d) => toUnit(d.avgG)),
                showSymbol: false,
                smooth: 0.3,
                lineStyle: { width: 2, color },
                itemStyle: { color },
                emphasis: { disabled: true },
            },
        ],
    };
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-56 sm:h-72" },
    });
    /** @type {__VLS_StyleScopedClasses['h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:h-72']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof VChart} */
    VChart;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        option: (__VLS_unwrap(option, {})), autoresize: true, ...{ class: "size-full" }, role: "img", 'aria-label': (`Herd milk per day, ${__VLS_ctx.rangeLabel ?? `last ${__VLS_ctx.days.length} days`}`),
    }));
    const __VLS_2 = __VLS_1({
        option: (__VLS_unwrap(option, {})),
        autoresize: true,
        ...{ class: "size-full" },
        role: "img",
        'aria-label': (`Herd milk per day, ${__VLS_ctx.rangeLabel ?? `last ${__VLS_ctx.days.length} days`}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['size-full']} */ ;
    // @ts-ignore
    [option, rangeLabel, days,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
