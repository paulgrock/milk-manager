// Kid reservations and sales: who's in line for which doe's kids, which
// kids fit a reservation, and the season a reservation is for.
import type { Database } from './database.types'
import { doeBreedingState, type BreedingData, type Kid, type Kidding } from './breeding'
import { formatDate } from './dates'
import { goatName, type Goat } from './goats'

type Tables = Database['public']['Tables']
export type Buyer = Tables['buyers']['Row']
export type Reservation = Tables['reservations']['Row']
export type Sale = Tables['sales']['Row']
export type Wants = 'doeling' | 'buckling' | 'wether' | 'any'
export type DepositStatus = 'held' | 'applied' | 'refunded' | 'kept'

export const WANTS_LABELS: Record<Wants, string> = { doeling: 'Doeling', buckling: 'Buckling', wether: 'Wether', any: 'Either' }
export const DEPOSIT_LABELS: Record<DepositStatus, string> = { held: 'held', applied: 'used on an adoption', refunded: 'refunded', kept: 'kept' }

/** A wether is a buckling, wethered. */
export function kidFits(kid: Pick<Kid, 'sex'>, wants: string): boolean {
  if (wants === 'doeling') return kid.sex === 'doe'
  if (wants === 'buckling' || wants === 'wether') return kid.sex === 'buck'
  return true
}

/**
 * The kidding season a new reservation is for: the year a bred doe is due,
 * otherwise this year until June and next year after that (kids come in spring).
 */
export function defaultSeason(doeId: string | null, breeding: BreedingData, today: string): number {
  const due = doeId ? doeBreedingState(doeId, breeding, today).current?.due.expected : undefined
  if (due) return Number(due.slice(0, 4))
  const year = Number(today.slice(0, 4))
  return Number(today.slice(5, 7)) >= 6 ? year + 1 : year
}

export interface SeasonKid {
  kid: Kid
  kidding: Kidding
  label: string
}

/** Live kids born in a season, named by their goat record or as "Clover's doeling 2 (Feb 20, 2027)". */
export function seasonKids(kiddings: Kidding[], kids: Kid[], goats: Map<string, Goat>, season: number): SeasonKid[] {
  const out: SeasonKid[] = []
  for (const kidding of kiddings.filter((k) => k.kidded_on.startsWith(`${season}-`)).sort((a, b) => a.kidded_on.localeCompare(b.kidded_on))) {
    const litter = kids.filter((k) => k.kidding_id === kidding.id && k.outcome === 'alive').sort((a, b) => a.id.localeCompare(b.id))
    const dam = goats.get(kidding.doe_id)
    const damName = dam ? dam.barn_name || goatName(dam) : 'Unknown doe'
    for (const kid of litter) {
      const own = kid.goat_id ? goats.get(kid.goat_id) : undefined
      const sex = kid.sex === 'doe' ? 'doeling' : 'buckling'
      const sameSex = litter.filter((k) => k.sex === kid.sex)
      const n = sameSex.length > 1 ? ` ${sameSex.indexOf(kid) + 1}` : ''
      out.push({ kid, kidding, label: own ? own.barn_name || goatName(own) : `${damName}'s ${sex}${n} (${formatDate(kidding.kidded_on)})` })
    }
  }
  return out
}

/** Places in line: by position, then the order they were made. */
export function inLine(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
}

/** A reservation is filled once it has as many kids sold as it asked for. */
export function reservationProgress(r: Reservation, sales: Sale[]) {
  const mine = sales.filter((s) => s.reservation_id === r.id)
  return { matched: mine.length, sold: mine.filter((s) => s.sold_on).length, open: Math.max(0, r.kid_count - mine.length) }
}
