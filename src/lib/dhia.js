// Milk test math: component yields, ADGA one-day star points, and SCC.
//
// Star points follow ADGA's One-Day Milking Competition rules (ODMC
// 2021-12-29, rule 7): 1 point per pound of milk (to one decimal), 1 point
// per 0.05 lb of butterfat, and per complete 10 days in milk 0.1 point (max
// 3.6) for standard breeds or 0.04 (max 1.44) for miniature breeds. 18
// points earns *M for standard breeds, 7 for miniature. ADGA's only
// miniature breed is the Nigerian Dwarf.
import { addMonths, monthsAndDaysBetween } from './dates';
import { daysBetween } from './breeding';
import { daysInMilk } from './milk';
const GRAMS_PER_LB = 453.59237;
export const TEST_KIND_LABELS = {
    dhir: 'DHIR test day',
    one_day: 'One-day test (ADGA)',
    owner: 'Own sample',
};
/** Grams of a component (butterfat, protein) in a weight of milk. */
export function componentGrams(milkG, pct) {
    if (milkG === null || pct === null)
        return null;
    return Math.round((milkG * Number(pct)) / 100);
}
export function isMiniature(breed) {
    return !!breed && /nigerian dwarf/i.test(breed);
}
const round1 = (n) => Math.round(n * 10) / 10;
export function oneDayPoints(input) {
    const milkLb = input.milkG / GRAMS_PER_LB;
    const fatLb = (milkLb * Number(input.butterfatPct)) / 100;
    const tens = Math.floor(Math.max(0, input.dim) / 10);
    const daysInMilk = input.miniature ? Math.min(tens * 0.04, 1.44) : Math.min(tens * 0.1, 3.6);
    const milk = round1(milkLb);
    const butterfat = round1(fatLb / 0.05);
    const total = round1(milk + butterfat + daysInMilk);
    const needed = input.miniature ? 7 : 18;
    return { milk, butterfat, daysInMilk: Math.round(daysInMilk * 100) / 100, total, needed, earned: total >= needed };
}
/** US Grade A limit for goat milk: 1,500,000 cells/mL. */
export const SCC_LIMIT = 1_500_000;
export function formatScc(scc) {
    return scc >= 1_000_000 ? `${(scc / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M` : `${Math.round(scc / 1000)}k`;
}
/** Reads "450", "450k", "1.2M" or "450000" as cells/mL. Bare numbers under 10,000 are thousands, as labs report them. */
export function parseScc(text) {
    const t = text.trim().toLowerCase().replace(/,/g, '');
    if (!t)
        return null;
    const m = t.match(/^(\d*\.?\d+)\s*(k|m)?$/);
    if (!m)
        return 'invalid';
    const n = Number(m[1]);
    if (m[2] === 'm')
        return Math.round(n * 1_000_000);
    if (m[2] === 'k' || n < 10_000)
        return Math.round(n * 1000);
    return Math.round(n);
}
export function dhirRequirement(input) {
    if (!input.birthDate || input.birthDate >= input.freshenedOn)
        return null;
    const miniature = isMiniature(input.breed);
    const twoYears = addMonths(input.birthDate, 24);
    const fiveYears = addMonths(input.birthDate, 60);
    const extraDays = Math.min(Math.max(daysBetween(twoYears, input.freshenedOn), 0), daysBetween(twoYears, fiveYears));
    const base = miniature ? { milk: 600, fat: 21, protein: 18 } : { milk: 1500, fat: 52.5, protein: 45 };
    const perDay = miniature ? { milk: 0.08, fat: 0.0028, protein: 0.0024 } : { milk: 0.2, fat: 0.007, protein: 0.006 };
    const { months } = monthsAndDaysBetween(input.birthDate, input.freshenedOn);
    return {
        milkLb: Math.round((base.milk + perDay.milk * extraDays) * 10) / 10,
        butterfatLb: Math.round((base.fat + perDay.fat * extraDays) * 10) / 10,
        proteinLb: Math.round((base.protein + perDay.protein * extraDays) * 10) / 10,
        miniature,
        ageAtKidding: { years: Math.floor(months / 12), months: months % 12 },
    };
}
/** A component % on a given day: straight line between test days, flat before the first and after the last. */
export function componentPctOn(dim, tests, key) {
    const known = tests.filter((t) => t[key] !== null).sort((a, b) => a.dim - b.dim);
    if (!known.length)
        return null;
    if (dim <= known[0].dim)
        return known[0][key];
    const last = known[known.length - 1];
    if (dim >= last.dim)
        return last[key];
    const after = known.findIndex((t) => t.dim >= dim);
    const a = known[after - 1];
    const b = known[after];
    return a[key] + ((b[key] - a[key]) * (dim - a.dim)) / (b.dim - a.dim);
}
/** Milk and components over a set of days (each `grams` is that day's milk). */
export function productionOver(days, tests) {
    let milk = 0;
    let fat = 0;
    let protein = 0;
    const hasFat = tests.some((t) => t.butterfatPct !== null);
    const hasProtein = tests.some((t) => t.proteinPct !== null);
    for (const d of days) {
        const lb = d.grams / GRAMS_PER_LB;
        milk += lb;
        if (hasFat)
            fat += (lb * componentPctOn(d.dim, tests, 'butterfatPct')) / 100;
        if (hasProtein)
            protein += (lb * componentPctOn(d.dim, tests, 'proteinPct')) / 100;
    }
    const r = (n) => Math.round(n * 10) / 10;
    return { milkLb: r(milk), butterfatLb: hasFat ? r(fat) : null, proteinLb: hasProtein ? r(protein) : null };
}
/** Earned if any one measure meets its requirement. */
export function starOutlook(req, toDate, projected) {
    const meets = (p) => p.milkLb >= req.milkLb ||
        (p.butterfatLb !== null && p.butterfatLb >= req.butterfatLb) ||
        (p.proteinLb !== null && p.proteinLb >= req.proteinLb);
    if (meets(toDate))
        return 'earned';
    if (!projected)
        return 'unknown';
    return meets(projected) ? 'on-track' : 'short';
}
/**
 * Day totals with her official test-day weights folded in: a test day's
 * weight replaces that day's own weights, so the curve uses the official
 * figure, and test-only herds still get a curve.
 */
export function withTestDays(dayTotals, goatId, tests, results) {
    const testDates = new Map(tests.map((t) => [t.id, t.tested_on]));
    const official = new Map();
    for (const r of results) {
        const date = testDates.get(r.test_id);
        if (r.goat_id === goatId && date && r.milk_g !== null)
            official.set(date, r.milk_g);
    }
    if (!official.size)
        return dayTotals;
    const kept = dayTotals.filter((d) => !(d.goat_id === goatId && official.has(d.milked_on)));
    const added = [...official].map(([date, grams]) => ({ goat_id: goatId, milked_on: date, total_g: grams, is_day_total: true, has_am: false, has_pm: false }));
    return [...kept, ...added];
}
/**
 * A lactation's figures as printed on DHI reports: its latest test with
 * lactation-to-date numbers, and the record once it's finished.
 */
export function officialFigures(lactation, tests, results) {
    const out = {};
    if (lactation.official_milk_g !== null) {
        out.complete = {
            days: lactation.official_days,
            milkG: lactation.official_milk_g,
            fatG: lactation.official_fat_g,
            proteinG: lactation.official_protein_g,
            r305MilkG: lactation.official_305_milk_g,
            r305FatG: lactation.official_305_fat_g,
            r305ProteinG: lactation.official_305_protein_g,
        };
    }
    const dates = new Map(tests.map((t) => [t.id, t.tested_on]));
    const end = lactation.dried_off_on ?? '9999-12-31';
    const latest = results
        .filter((r) => r.goat_id === lactation.goat_id && r.ltd_milk_g !== null)
        .map((r) => ({ r, date: dates.get(r.test_id) }))
        .filter((x) => !!x.date && x.date >= lactation.freshened_on && x.date <= end)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (latest) {
        const r = latest.r;
        out.test = {
            // From the dates, not the printed day: DHI counts kidding day as day 1, the app as day 0.
            dim: daysInMilk(lactation.freshened_on, latest.date),
            ltdMilkG: r.ltd_milk_g,
            ltdFatG: r.ltd_fat_g,
            ltdProteinG: r.ltd_protein_g,
            proj305MilkG: r.proj305_milk_g,
            proj305FatG: r.proj305_fat_g,
            proj305ProteinG: r.proj305_protein_g,
        };
    }
    return out;
}
const lbOrNull = (g) => (g === null ? null : Math.round((g / GRAMS_PER_LB) * 10) / 10);
/**
 * The report's own production figures for the DHIR star: what she's given in
 * her first 305 days, and DHI's projection while she's still in milk.
 */
export function officialProduction(official, dried) {
    if (dried && official.complete) {
        const c = official.complete;
        const within = (c.days ?? Infinity) <= 305;
        const milk = c.r305MilkG ?? (within ? c.milkG : null);
        if (milk === null)
            return null;
        return {
            toDate: { milkLb: lbOrNull(milk), butterfatLb: lbOrNull(c.r305FatG ?? (within ? c.fatG : null)), proteinLb: lbOrNull(c.r305ProteinG ?? (within ? c.proteinG : null)) },
            projected: null,
        };
    }
    if (official.test) {
        const t = official.test;
        return {
            toDate: { milkLb: lbOrNull(t.ltdMilkG), butterfatLb: lbOrNull(t.ltdFatG), proteinLb: lbOrNull(t.ltdProteinG) },
            projected: t.proj305MilkG === null ? null : { milkLb: lbOrNull(t.proj305MilkG), butterfatLb: lbOrNull(t.proj305FatG), proteinLb: lbOrNull(t.proj305ProteinG) },
        };
    }
    return null;
}
