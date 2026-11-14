import { monthsAndDaysBetween, todayISO } from './dates';
/** Longest side of a photo's small copy, used for icons and gallery tiles. */
export const THUMB_SIZE = 384;
/** The file to show a photo small: its small copy, or the photo itself if it has none yet. */
export const iconPath = (photo) => photo.thumb_path ?? photo.storage_path;
export const SEX_LABELS = { doe: 'Doe', buck: 'Buck', wether: 'Wether' };
export const STATUS_LABELS = {
    active: 'In herd',
    for_sale: 'Available',
    sold: 'Adopted',
    deceased: 'Deceased',
    reference: 'Reference',
};
export const HORN_LABELS = {
    disbudded: 'Disbudded',
    polled: 'Polled',
    horned: 'Horned',
    unknown: 'Unknown',
};
export const BREED_CATEGORY_LABELS = {
    purebred: 'Purebred',
    american: 'American',
    experimental: 'Experimental',
    recorded_grade: 'Recorded Grade',
};
export const APPRAISAL_CODES = ['E', 'V', 'G', 'A', 'F', 'P'];
export const APPRAISAL_CODE_LABELS = {
    E: 'Excellent',
    V: 'Very Good',
    G: 'Good Plus',
    A: 'Acceptable',
    F: 'Fair',
    P: 'Poor',
};
/** Statuses that count as "the herd" in the default list view. */
export const CURRENT_STATUSES = ['active', 'for_sale'];
/** Short name for lists and pickers: registered name, else barn name. */
export function goatName(goat) {
    return goat.registered_name?.trim() || goat.barn_name?.trim() || 'Unnamed';
}
/** The milk line's order: as set on the milk page, then by barn name for does not placed yet. */
export function byMilkingOrder(a, b) {
    const pos = (g) => g.milking_position ?? Number.MAX_SAFE_INTEGER;
    return pos(a) - pos(b) || (a.barn_name || goatName(a)).localeCompare(b.barn_name || goatName(b));
}
/** Name with titles, the way it's written on a pedigree: "GCH Some Farm Ocean Flower 6*M *D". */
export function goatFullName(goat) {
    return [goat.title_prefix, goatName(goat), goat.title_suffix]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ');
}
/** "VVEV 88". Bucks have no mammary score, so theirs is three letters. */
export function appraisalSummary(a) {
    const codes = [a.general_appearance, a.dairy_strength, a.body_capacity, a.mammary_system].filter(Boolean).join('');
    return `${codes} ${a.final_score}`;
}
/** Most recent appraisal per goat. */
export function latestAppraisals(appraisals) {
    const latest = new Map();
    for (const a of appraisals) {
        const current = latest.get(a.goat_id);
        if (!current || a.appraised_on > current.appraised_on)
            latest.set(a.goat_id, a);
    }
    return latest;
}
/** "3 yr 2 mo", "5 mo", "12 days". */
export function formatAge(birthDate, asOf = todayISO()) {
    if (!birthDate || birthDate > asOf)
        return '';
    const { months, days } = monthsAndDaysBetween(birthDate, asOf);
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (years > 0)
        return rest ? `${years} yr ${rest} mo` : `${years} yr`;
    if (months > 0)
        return `${months} mo`;
    return days === 1 ? '1 day' : `${days} days`;
}
/** Whole years old on a date, e.g. the age at an appraisal ("@ 2 yo"). */
export function ageInYears(birthDate, on) {
    if (!birthDate || birthDate > on)
        return null;
    return Math.floor(monthsAndDaysBetween(birthDate, on).months / 12);
}
/**
 * Ancestors of a goat, `generations` deep (1 = parents only). Missing parents
 * are null nodes so the chart keeps its shape.
 */
export function buildPedigree(goat, byId, generations = 2) {
    const node = (g, depth) => ({
        goat: g,
        sire: depth < generations ? node(g?.sire_id ? (byId.get(g.sire_id) ?? null) : null, depth + 1) : null,
        dam: depth < generations ? node(g?.dam_id ? (byId.get(g.dam_id) ?? null) : null, depth + 1) : null,
    });
    return node(goat, 0);
}
const normalize = (s) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
export function filterGoats(goats, filters) {
    const q = normalize(filters.search);
    return goats
        .filter((g) => filters.statuses.length === 0 || filters.statuses.includes(g.status))
        .filter((g) => !filters.sex || g.sex === filters.sex)
        .filter((g) => !filters.breed || g.breed === filters.breed)
        .filter((g) => {
        if (!q)
            return true;
        return [g.registered_name, g.barn_name, g.registration_number, g.tattoo_left, g.tattoo_right, g.scrapie_tag]
            .some((field) => normalize(field).includes(q));
    })
        .sort((a, b) => goatName(a).localeCompare(goatName(b)));
}
/** Goats that list this one as sire or dam, youngest first. */
export function offspringOf(goatId, goats) {
    return goats
        .filter((g) => g.sire_id === goatId || g.dam_id === goatId)
        .sort((a, b) => (b.birth_date ?? '').localeCompare(a.birth_date ?? ''));
}
/**
 * Whether a goat was part of the herd on a date: in the herd or available, or
 * sold/died on or after that date (so past milk days still show her).
 */
export function inHerdOn(goat, date) {
    if (CURRENT_STATUSES.includes(goat.status))
        return true;
    if (goat.status === 'sold' || goat.status === 'deceased')
        return !!goat.left_herd_on && date <= goat.left_herd_on;
    return false;
}
