// The app's sections, and which of them sit in the phone's tab bar.

export interface Section {
  label: string
  icon: string
  to: string
  /** Owners only: helpers never see it. */
  ownersOnly?: boolean
}

/** Every section, in the order the sidebar and the More sheet list them. Settings is kept apart. */
export const SECTIONS: Section[] = [
  { label: 'Today', icon: 'i-lucide-sun', to: '/' },
  { label: 'Milk', icon: 'i-lucide-milk', to: '/milk' },
  { label: 'Goats', icon: 'i-lucide-list', to: '/goats' },
  { label: 'Chores', icon: 'i-lucide-list-checks', to: '/chores' },
  { label: 'Cheese', icon: 'i-lucide-cylinder', to: '/cheese' },
  { label: 'Breeding', icon: 'i-lucide-heart', to: '/breeding' },
  { label: 'Health', icon: 'i-lucide-stethoscope', to: '/health' },
  { label: 'Calendar', icon: 'i-lucide-calendar', to: '/calendar' },
  { label: 'Finances', icon: 'i-lucide-wallet', to: '/finances', ownersOnly: true },
]

export const SETTINGS: Section = { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }

/** The tab bar holds this many sections, with More beside them. */
export const TAB_COUNT = 4

/** The sections used every day, for anyone who hasn't picked their own. */
export const DEFAULT_TABS = ['/', '/milk', '/goats', '/chores']

/** The sections this person can open. */
export const sectionsFor = (isOwner: boolean) => SECTIONS.filter((s) => isOwner || !s.ownersOnly)

/**
 * The paths in the tab bar: the person's own picks, skipping any section that
 * no longer exists, that they can't open in this herd (Finances for a helper),
 * or that they picked twice. Empty slots are filled from the defaults, then
 * from the rest of the list, so there are always TAB_COUNT tabs.
 */
export function tabPaths(saved: readonly string[] | null | undefined, available: readonly Section[]): string[] {
  const allowed = new Set(available.map((s) => s.to))
  const picked: string[] = []
  for (const to of [...(saved ?? []), ...DEFAULT_TABS, ...available.map((s) => s.to)]) {
    if (picked.length === TAB_COUNT) break
    if (allowed.has(to) && !picked.includes(to)) picked.push(to)
  }
  return picked
}

/**
 * The tabs after putting `to` in slot `index`. If it was already in another
 * slot, the two swap, so a section is never in the bar twice.
 */
export function placeTab(tabs: readonly string[], index: number, to: string): string[] {
  const next = [...tabs]
  const from = next.indexOf(to)
  if (from !== -1) next[from] = next[index]!
  next[index] = to
  return next
}
