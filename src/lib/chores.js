import { addDays, daysBetween } from './breeding';
import { dueState } from './health';
export function choreStatus(chore, done, today) {
    const last = done
        .filter((d) => d.chore_id === chore.id)
        .reduce((best, d) => (!best || d.done_on > best.done_on ? d : best), undefined);
    if (!last)
        return { chore, state: 'never' };
    const nextDue = addDays(last.done_on, chore.interval_days);
    const daysUntilDue = daysBetween(today, nextDue);
    return { chore, last, nextDue, daysUntilDue, state: dueState(daysUntilDue, chore.interval_days) };
}
const ORDER = { overdue: 0, due: 1, ok: 2, never: 3 };
/** Most pressing first: overdue, due soon, the rest by due date, then the ones not recorded yet. */
export function sortByDue(statuses) {
    return [...statuses].sort((a, b) => ORDER[a.state] - ORDER[b.state] || (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0) || a.chore.sort_order - b.chore.sort_order);
}
export function repeatLabel(days) {
    if (days === 1)
        return 'every day';
    if (days === 7)
        return 'every week';
    if (days === 14)
        return 'every other week';
    if (days % 7 === 0)
        return `every ${days / 7} weeks`;
    return `every ${days} days`;
}
