// Test data helpers. Goats and lactations go in as the owner (so the same
// rules apply as in the app); bulk milk goes in through the admin client.
import type { Database } from '../src/lib/database.types.ts'
import { admin, type TestUser } from './fixtures.ts'

type GoatInsert = Database['public']['Tables']['goats']['Insert']

export const GRAMS_PER_LB = 453.59237
export const lbToGrams = (lb: number) => Math.round(lb * GRAMS_PER_LB)

/** Local 'YYYY-MM-DD', shifted by whole days. The browser uses the same clock. */
export function isoDate(daysFromToday = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function addGoat(owner: TestUser, herdId: string, goat: Omit<GoatInsert, 'herd_id'>) {
  const { data, error } = await owner.client.from('goats').insert({ ...goat, herd_id: herdId }).select().single()
  if (error) throw error
  return data
}

export async function addLactation(
  owner: TestUser,
  herdId: string,
  goatId: string,
  freshenedOn: string,
  lactationNumber = 1,
  driedOffOn: string | null = null,
) {
  const { data, error } = await owner.client
    .from('lactations')
    .insert({ herd_id: herdId, goat_id: goatId, freshened_on: freshenedOn, lactation_number: lactationNumber, dried_off_on: driedOffOn })
    .select()
    .single()
  if (error) throw error
  return data
}

/** A doe in milk since `daysAgo` days ago. */
export async function addDoeInMilk(owner: TestUser, herdId: string, barnName: string, daysAgo = 60) {
  const goat = await addGoat(owner, herdId, { barn_name: barnName, sex: 'doe', breed: 'Nigerian Dwarf' })
  const lactation = await addLactation(owner, herdId, goat.id, isoDate(-daysAgo))
  return { goat, lactation }
}

/**
 * AM and PM weights for every day from DIM 1 to yesterday, following a
 * Wood's curve with a little deterministic wobble.
 */
export async function addMilkCurve(
  herdId: string,
  goatId: string,
  freshenedDaysAgo: number,
  curve = { a: 1000, b: 0.28, c: 0.0055 },
) {
  const rows: Database['public']['Tables']['milk_weights']['Insert'][] = []
  for (let dim = 1; dim < freshenedDaysAgo; dim++) {
    const total = curve.a * dim ** curve.b * Math.exp(-curve.c * dim) * (1 + 0.05 * Math.sin(dim * 1.7))
    const milkedOn = isoDate(dim - freshenedDaysAgo)
    rows.push({ herd_id: herdId, goat_id: goatId, milked_on: milkedOn, milking: 1, weight_g: Math.round(total * 0.55) })
    rows.push({ herd_id: herdId, goat_id: goatId, milked_on: milkedOn, milking: 2, weight_g: Math.round(total * 0.45) })
  }
  const { error } = await admin.from('milk_weights').insert(rows)
  if (error) throw error
}

export async function milkRows(goatId: string, milkedOn: string) {
  const { data, error } = await admin
    .from('milk_weights')
    .select('milking, weight_g, portions_g')
    .eq('goat_id', goatId)
    .eq('milked_on', milkedOn)
    .order('milking')
  if (error) throw error
  return data
}
