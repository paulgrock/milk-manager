import { addDays, daysBetween } from './breeding';
import { formatDate, relativeDays } from './dates';
export const MILK_TREATMENT_LABELS = { raw: 'Raw', pasteurized: 'Pasteurized' };
/** "4 gal (raw)", "4 gal", "raw milk", or '' when neither was noted. */
export function milkLabel(make) {
    const treatment = make.milk_treatment ? MILK_TREATMENT_LABELS[make.milk_treatment].toLowerCase() : '';
    if (make.milk_gallons == null)
        return treatment ? `${treatment} milk` : '';
    return `${Number(make.milk_gallons)} gal${treatment ? ` (${treatment})` : ''}`;
}
/** Goat milk weighs about this much per US gallon. */
export const LB_PER_GALLON = 8.6;
/** The made date plus the type's aging time; fresh cheese (0 days) is ready the same day. */
export function readyDate(madeOn, agingDays) {
    return addDays(madeOn, agingDays);
}
/** "fresh", "1 day", "45 days". */
export function agingLabel(days) {
    if (!days)
        return 'fresh';
    return days === 1 ? '1 day' : `${days} days`;
}
/** Fresh cheese is ready the day it's made, so it never waits to come ready. */
export function isFresh(make) {
    return make.ready_on <= make.made_on;
}
export function makeStatus(make, today) {
    if (make.finished_on)
        return 'finished';
    if (isFresh(make))
        return 'fresh';
    return make.ready_on <= today ? 'ready' : 'aging';
}
/** How many days ahead counts as ready soon, for the main cheese page. */
export const READY_SOON_DAYS = 7;
/**
 * On the main cheese page: not finished, and coming ready today or within the next week.
 * Fresh cheese is ready the day it's made, so it never waits to come ready and isn't listed.
 * Everything else is only on its cheese type's page.
 */
export function isReadySoon(make, today) {
    if (make.finished_on || isFresh(make))
        return false;
    return make.ready_on >= today && make.ready_on <= addDays(today, READY_SOON_DAYS);
}
/** "Ready in 3 days", "Ready today", "Ready since Oct 2", "Fresh", "Finished Nov 1". */
export function readyLabel(make, today) {
    if (make.finished_on)
        return `Finished ${formatDate(make.finished_on)}`;
    if (isFresh(make))
        return 'Fresh';
    const days = daysBetween(today, make.ready_on);
    if (days > 0)
        return `Ready ${relativeDays(days)}`;
    return days === 0 ? 'Ready today' : `Ready since ${formatDate(make.ready_on)}`;
}
export const STATUS_ICONS = {
    fresh: 'i-lucide-leaf',
    aging: 'i-lucide-hourglass',
    ready: 'i-lucide-check',
    finished: 'i-lucide-archive',
};
export const STATUS_LABELS = { fresh: 'Fresh', aging: 'Aging', ready: 'Ready', finished: 'Finished' };
/** Makes per month (by made date), newest month first. */
export function monthlyTotals(makes) {
    const months = new Map();
    for (const m of makes) {
        const month = m.made_on.slice(0, 7);
        const t = months.get(month) ?? { month, makes: 0, gallons: 0, milkLb: 0 };
        t.makes += 1;
        t.gallons += Number(m.milk_gallons ?? 0);
        months.set(month, t);
    }
    for (const t of months.values())
        t.milkLb = t.gallons * LB_PER_GALLON;
    return [...months.values()].sort((a, b) => b.month.localeCompare(a.month));
}
/** Reads a gallons box: blank is none; "2.5" or "2,5". */
export function parseGallons(text) {
    const t = text.trim().replace(',', '.');
    if (!t)
        return { ok: true, value: null };
    const value = Number(t);
    if (!/^\d*\.?\d+$/.test(t) || !(value > 0) || value > 1000)
        return { ok: false, message: 'Gallons must be a number above 0' };
    return { ok: true, value: Math.round(value * 100) / 100 };
}
