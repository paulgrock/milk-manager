// Copies the herd's goats from Milk Manager to the farm website's Sanity
// studio, only ever adding: fields that are empty in Sanity get filled, photos
// Sanity doesn't have yet are added, and goats Sanity doesn't have yet are
// created as drafts to publish (or delete) in the studio. Nothing Sanity
// already has is changed, so edits made there are safe. Differences are listed
// so they can be fixed by hand.
//
//   SANITY_API_TOKEN=... node scripts/sync-sanity-goats.ts [--hosted] [--herd <herd id>] [--no-new] [--apply]
//
// The token needs Editor rights; the website repo's .env has one:
//   SANITY_API_TOKEN=$(grep ^SANITY_API_TOKEN= ../www-birdseyefarm/.env | cut -d= -f2-)
// Local Supabase by default; --hosted reads the linked hosted project (its
// secret key is fetched through the Supabase CLI and never saved). Without
// --apply it only prints what it would do. --no-new only fills in goats Sanity
// already has. Needs macOS's `sips` to compare photos.
//
// Copied: name with titles and latest appraisal, barn name (aka), doe/buck/
// wether, birth date, ADGA pedigree link, sire and dam with their parents,
// photos, and the herd records in the studio's "Herd records" group (breed,
// registry and number, colour, horns, tattoos, scrapie tag, microchip).
// The type decides which website page a goat is listed on once the site
// splits does and bucks. "wether" and the herd records need the matching
// schema in the website repo (sanity/schemas/goat.ts) deployed with
// `npx sanity deploy`, or the studio shows them as unknown fields.
// Left out:
//  - notes (private; the website's description is written separately)
//  - status and leaving details, milking order, DHIR numbers: day-to-day
//    farm records
//  - display order, kidding date, mate and prices: website-only
//  - goats that aren't current (sold, deceased, pedigree-only)
// Photos are matched by look, not file, since the app keeps a smaller copy of
// the photos it took from Sanity.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { adminClient, hostedTarget, scriptTarget } from './lib/supabase.ts'
import { nameKey } from './lib/goatNames.ts'

const PROJECT = '2nhyst6p'
const DATASET = 'production'
const SITE = 'https://www.birdseyefarm.com'
const BUCKET = 'goat-photos'
const KIND_ALT: Record<string, string> = { conformation: 'confo', head: 'head', udder: 'udder', other: '' }
/** Differing bits (of 64) for two photos to count as the same picture. */
const SAME_PHOTO = 10

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const apply = args.includes('--apply')
const createNew = !args.includes('--no-new')
const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('SANITY_API_TOKEN is required (it reads drafts too). See the top of this file.')
  process.exit(1)
}
const target = args.includes('--hosted') ? hostedTarget() : scriptTarget()
const db = adminClient(target)

// --- Sanity -------------------------------------------------------------------------

const api = `https://${PROJECT}.api.sanity.io/v2025-02-19`
const auth = { Authorization: `Bearer ${token}` }

async function sanity<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${api}${path}`, { ...init, headers: { ...auth, ...init?.headers } })
  const body = await res.json()
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${JSON.stringify(body)}`)
  return body as T
}

type Ancestor = { name?: string; link?: string }
type Parent = Ancestor & { sire?: Ancestor; dam?: Ancestor }
type SanityImage = { _key: string; alt?: string; asset?: { _ref: string }; url?: string }
type SanityGoat = {
  _id: string
  _rev: string
  name?: string
  aka?: string
  goatType?: string
  slug?: string
  date?: string
  adgaPedigree?: string
  sire?: Parent
  dam?: Parent
  images?: SanityImage[]
}

const { result: rawDocs } = await sanity<{ result: SanityGoat[] }>(
  `/data/query/${DATASET}?perspective=raw&query=${encodeURIComponent(
    `*[_type == "goat"]{..., "slug": slug.current, images[]{_key, alt, asset, "url": asset->url}}`,
  )}`,
)
// One entry per goat: its draft when there is one (that's what the studio
// shows and what publishing keeps), else the published document.
const sanityGoats = new Map<string, { doc: SanityGoat; published: boolean; draft: boolean }>()
for (const doc of rawDocs) {
  const base = doc._id.replace(/^drafts\./, '')
  const isDraft = doc._id.startsWith('drafts.')
  const entry = sanityGoats.get(base)
  if (!entry) sanityGoats.set(base, { doc, published: !isDraft, draft: isDraft })
  else if (isDraft) sanityGoats.set(base, { doc, published: true, draft: true })
  else entry.published = true
}

const regOf = (url?: string | null) => url?.match(/RegNumber=([A-Z0-9]+)/i)?.[1]?.toUpperCase()

// --- Milk Manager -------------------------------------------------------------------

let herdId = arg('herd')
if (!herdId) {
  const { data: herds, error } = await db.from('herds').select('id, name')
  if (error) throw error
  if (herds?.length !== 1) {
    console.error(`Pick a herd with --herd:\n${(herds ?? []).map((h) => `  ${h.id}  ${h.name}`).join('\n')}`)
    process.exit(1)
  }
  herdId = herds[0]!.id
}

/** Every row, a page at a time (a single select stops at 1000). */
async function all<T>(
  table: string,
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data!)
    if (data!.length < 1000) return rows
  }
}

const goats = await all('goats', (from, to) =>
  db
    .from('goats')
    .select(
      'id, registered_name, barn_name, title_prefix, title_suffix, sex, birth_date, registry, registration_number, pedigree_url, sire_id, dam_id, status, breed, breed_category, color_markings, horn_status, tattoo_left, tattoo_right, scrapie_tag, microchip',
    )
    .eq('herd_id', herdId!)
    .order('id')
    .range(from, to),
)
const appraisals = await all('linear_appraisals', (from, to) =>
  db
    .from('linear_appraisals')
    .select('goat_id, appraised_on, general_appearance, dairy_strength, body_capacity, mammary_system, final_score')
    .eq('herd_id', herdId!)
    .order('appraised_on')
    .order('id')
    .range(from, to),
)
const photos = await all('goat_photos', (from, to) =>
  db
    .from('goat_photos')
    .select('id, goat_id, storage_path, thumb_path, kind, is_primary, created_at')
    .eq('herd_id', herdId!)
    .order('created_at')
    .order('id')
    .range(from, to),
)

type Goat = (typeof goats)[number]
type Photo = (typeof photos)[number]
const byId = new Map(goats.map((g) => [g.id, g]))
const latestAppraisal = new Map(appraisals.map((a) => [a.goat_id, a])) // ordered, so the last wins

/** As the website writes it: "GCH Bird's Eye Farm Ina May 5*M VVEV 88". */
function fullName(g: Goat) {
  const a = latestAppraisal.get(g.id)
  const score = a
    ? `${[a.general_appearance, a.dairy_strength, a.body_capacity, a.mammary_system].filter(Boolean).join('')} ${a.final_score}`
    : null
  return [g.title_prefix, g.registered_name || g.barn_name, g.title_suffix, score]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(' ')
}
const shortName = (g: Goat) => g.barn_name?.trim() || g.registered_name?.trim() || 'Goat'
const pedigreeUrl = (g: Goat) =>
  g.pedigree_url ??
  (g.registration_number ? `https://adgagenetics.org/GoatDetail.aspx?RegNumber=${g.registration_number}` : null)

// Match each goat to its Sanity document: registration number, then name.
const sanityByReg = new Map<string, string>()
const sanityByName = new Map<string, string>()
for (const [base, { doc }] of sanityGoats) {
  const reg = regOf(doc.adgaPedigree)
  if (reg) sanityByReg.set(reg, base)
  if (doc.name) sanityByName.set(nameKey(doc.name), base)
}
const isCurrent = (g: Goat) => ['active', 'for_sale'].includes(g.status)
const current = goats.filter(isCurrent)

// A goat with no registered name is matched (and created) by its barn name.
const claims = new Map<string, Goat[]>()
for (const g of goats) {
  const reg = g.registration_number?.trim().toUpperCase() || regOf(g.pedigree_url)
  const name = g.registered_name?.trim() || g.barn_name?.trim()
  const base = (reg && sanityByReg.get(reg)) || (name && sanityByName.get(nameKey(name)))
  if (base) claims.set(base, [...(claims.get(base) ?? []), g])
}
// Two goats on one Sanity document: the current one gets it. If that doesn't
// settle it, the current ones are skipped (not created anew) and listed.
const matchOf = new Map<string, string>()
const conflicted = new Map<string, Goat[]>()
for (const [base, gs] of claims) {
  const winners = gs.length === 1 ? gs : gs.filter(isCurrent)
  if (winners.length === 1) matchOf.set(winners[0]!.id, base)
  else conflicted.set(base, gs)
}
const skipped = new Set([...conflicted.values()].flat().map((g) => g.id))

/**
 * Whether two spellings of a name say the same thing, ignoring curly
 * apostrophes, spacing, the order of titles and scores, notes in brackets
 * like "(pending)", and "+" for Good Plus in an older score.
 */
function sameName(a: string, b: string) {
  const words = (s: string) =>
    s
      .replace(/[’‘]/g, "'")
      .replace(/\([^)]*\)/g, ' ')
      .replace(/^[\s:]+/, '')
      .replace(/\b([EVGAFP+]{3,4})(\d{2})\b/g, '$1 $2')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (/^[EVGAFP+]{3,4}$/.test(w) ? w.replace(/\+/g, 'G') : w.toLowerCase()))
      .sort()
      .join(' ')
  return words(a) === words(b)
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}
const usedSlugs = new Set([...sanityGoats.values()].map((s) => s.doc.slug).filter(Boolean))
const newSlugs = new Map<string, string>()
for (const g of current.filter((g) => !matchOf.has(g.id) && !skipped.has(g.id))) {
  const base = slugify(g.registered_name || g.barn_name || 'goat')
  let slug = base
  for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`
  usedSlugs.add(slug)
  newSlugs.set(g.id, slug)
}

/**
 * A parent or grandparent's link: their page on the website if it's published
 * (a draft has no page yet), else their pedigree.
 */
function linkOf(g: Goat) {
  const base = matchOf.get(g.id)
  const entry = base ? sanityGoats.get(base) : undefined
  const slug = entry?.published ? entry.doc.slug : undefined
  return slug ? `${SITE}/goats/${slug}` : (pedigreeUrl(g) ?? undefined)
}
function ancestor(id: string | null): Ancestor | undefined {
  const g = id ? byId.get(id) : undefined
  if (!g) return undefined
  const link = linkOf(g)
  return { name: fullName(g), ...(link ? { link } : {}) }
}
function parent(id: string | null): Parent | undefined {
  const g = id ? byId.get(id) : undefined
  const self = ancestor(id)
  if (!g || !self) return undefined
  const sire = ancestor(g.sire_id)
  const dam = ancestor(g.dam_id)
  return { ...self, ...(sire ? { sire } : {}), ...(dam ? { dam } : {}) }
}

/**
 * Paths to set so Sanity's parent gains what it's missing, never replacing
 * anything. A different goat under the same branch is reported and left alone.
 */
function fillParent(
  path: string,
  have: Parent | Ancestor | undefined,
  want: Parent | Ancestor | undefined,
  out: Record<string, unknown>,
  notes: string[],
) {
  if (!want?.name) return
  if (!have || typeof have !== 'object') {
    out[path] = want
    return
  }
  // Something is there: fill only its empty parts, so a link or grandparents
  // entered without a name are kept.
  if (!have.name?.trim()) out[`${path}.name`] = want.name
  else if (nameKey(have.name) !== nameKey(want.name)) {
    notes.push(`${path}: Sanity has "${have.name}", Milk Manager has "${want.name}"`)
    return
  } else if (!sameName(have.name, want.name))
    notes.push(`${path} name: Sanity "${have.name.trim()}", Milk Manager "${want.name}"`)
  if (!have.link?.trim() && want.link) out[`${path}.link`] = want.link
  for (const side of ['sire', 'dam'] as const) {
    if (side in want) fillParent(`${path}.${side}`, (have as Parent)[side], (want as Parent)[side], out, notes)
  }
}

// --- Photos: a small "looks like" fingerprint (difference hash) -------------------------

const work = mkdtempSync(join(tmpdir(), 'goat-sync-'))
let files = 0

/** 9×9 grey values of an image, via sips (squashing it square is fine, both sides get the same). */
function grid(bytes: Uint8Array): number[][] {
  const src = join(work, `${files++}.img`)
  const bmp = `${src}.bmp`
  writeFileSync(src, bytes)
  execFileSync('sips', ['-z', '9', '9', '-s', 'format', 'bmp', src, '--out', bmp], { stdio: 'ignore' })
  const b = readFileSync(bmp)
  const offset = b.readUInt32LE(10)
  const width = b.readInt32LE(18)
  const rawHeight = b.readInt32LE(22)
  const height = Math.abs(rawHeight)
  const bytesPer = b.readUInt16LE(28) / 8
  const rowSize = Math.ceil((width * bytesPer) / 4) * 4
  const rows: number[][] = []
  for (let y = 0; y < height; y++) {
    const row = rawHeight > 0 ? height - 1 - y : y
    const cells: number[] = []
    for (let x = 0; x < width; x++) {
      const p = offset + row * rowSize + x * bytesPer
      cells.push(0.114 * b[p]! + 0.587 * b[p + 1]! + 0.299 * b[p + 2]!)
    }
    rows.push(cells)
  }
  return rows
}
const rotate = (g: number[][]) => g[0]!.map((_, x) => g.map((row) => row[x]!).reverse())
const dhash = (g: number[][]) =>
  g
    .slice(0, 8)
    .map((row) =>
      row
        .slice(0, 8)
        .map((v, x) => (v < row[x + 1]! ? '1' : '0'))
        .join(''),
    )
    .join('')
const distance = (a: string, b: string) => [...a].filter((c, i) => c !== b[i]).length

const sanityHashes = new Map<string, string>()
async function sanityHash(img: SanityImage) {
  if (!img.url) return undefined
  if (!sanityHashes.has(img.url)) {
    try {
      const res = await fetch(`${img.url}?w=256`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      sanityHashes.set(img.url, dhash(grid(new Uint8Array(await res.arrayBuffer()))))
    } catch (e) {
      // Not comparable, so a matching photo may be offered again; better than stopping.
      console.warn(`Couldn't read Sanity image ${img.url}: ${(e as Error).message}`)
      return undefined
    }
  }
  return sanityHashes.get(img.url)
}
/** The photo's fingerprint turned all four ways, since a file's rotation flag may or may not have been applied. */
async function photoHashes(photo: Photo) {
  const { data, error } = await db.storage.from(BUCKET).download(photo.thumb_path ?? photo.storage_path)
  if (error) throw new Error(`${photo.storage_path}: ${error.message}`)
  let g = grid(new Uint8Array(await data.arrayBuffer()))
  const out: string[] = []
  for (let i = 0; i < 4; i++, g = rotate(g)) out.push(dhash(g))
  return out
}

// --- Plan --------------------------------------------------------------------------------

const keyOf = (photoId: string) => `mm${photoId.replace(/-/g, '').slice(0, 20)}`
type Plan = {
  goat: Goat
  base?: string
  set: Record<string, unknown>
  newPhotos: Photo[]
  notes: string[]
}
const plans: Plan[] = []

for (const g of current) {
  if (skipped.has(g.id)) continue
  const base = matchOf.get(g.id)
  if (!base && !createNew) continue
  const doc = base ? sanityGoats.get(base)!.doc : undefined
  const set: Record<string, unknown> = {}
  const notes: string[] = []
  const want = {
    name: fullName(g),
    aka: g.barn_name?.trim() || undefined,
    date: g.birth_date ?? undefined,
    adgaPedigree: pedigreeUrl(g) ?? undefined,
    goatType: g.sex,
    // Herd records, in the studio's "Herd records" group.
    breed: g.breed ?? undefined,
    breedCategory: g.breed_category ?? undefined,
    registry: g.registry ?? undefined,
    registrationNumber: g.registration_number ?? undefined,
    colorMarkings: g.color_markings ?? undefined,
    hornStatus: g.horn_status === 'unknown' ? undefined : g.horn_status,
    tattooLeft: g.tattoo_left ?? undefined,
    tattooRight: g.tattoo_right ?? undefined,
    scrapieTag: g.scrapie_tag ?? undefined,
    microchip: g.microchip ?? undefined,
  }
  for (const [field, value] of Object.entries(want)) {
    if (!value) continue
    const have = (doc?.[field as keyof SanityGoat] as string | undefined)?.trim()
    if (!have) set[field] = value
    else if (
      have !== value &&
      !(field === 'adgaPedigree' && regOf(have) === regOf(value)) &&
      !(field === 'name' && sameName(have, value))
    )
      notes.push(`${field}: Sanity "${have}", Milk Manager "${value}"`)
  }
  fillParent('sire', doc?.sire, parent(g.sire_id), set, notes)
  fillParent('dam', doc?.dam, parent(g.dam_id), set, notes)

  // Photos Sanity doesn't have: not added by an earlier run, and not looking like one of its images.
  const mine = photos.filter((p) => p.goat_id === g.id).sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
  const keys = new Set((doc?.images ?? []).map((i) => i._key))
  const theirs = (await Promise.all((doc?.images ?? []).map(sanityHash))).filter(Boolean) as string[]
  const newPhotos: typeof mine = []
  for (const p of mine) {
    if (keys.has(keyOf(p.id))) continue
    const hashes = await photoHashes(p)
    if (theirs.some((t) => hashes.some((h) => distance(h, t) <= SAME_PHOTO))) continue
    newPhotos.push(p)
  }
  if (Object.keys(set).length || newPhotos.length || notes.length) plans.push({ goat: g, base, set, newPhotos, notes })
}

// --- Report ------------------------------------------------------------------------------

const show = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))
console.log(`Milk Manager: ${target.url}, ${current.length} current goats. Sanity: ${sanityGoats.size} goats.\n`)
for (const p of plans) {
  const entry = p.base ? sanityGoats.get(p.base)! : undefined
  const where = !entry ? 'NEW (as a draft)' : entry.draft ? `${p.base} (draft)` : p.base!
  console.log(`${fullName(p.goat)}  →  ${where}`)
  for (const [path, value] of Object.entries(p.set)) console.log(`    + ${path}: ${show(value)}`)
  if (!entry) console.log(`    + slug: ${newSlugs.get(p.goat.id)}`)
  for (const photo of p.newPhotos)
    console.log(`    + photo: ${photo.kind}${photo.is_primary ? ' (main)' : ''}  ${photo.storage_path}`)
  for (const n of p.notes) console.log(`    ≠ ${n} (left alone)`)
}
if (!plans.length) console.log('Sanity already has everything.')
const matchedBases = new Set([...matchOf.values(), ...conflicted.keys()])
const unmatched = [...sanityGoats.entries()].filter(([base]) => !matchedBases.has(base))
if (unmatched.length)
  console.log(`\nIn Sanity only (left alone): ${unmatched.map(([, s]) => s.doc.aka || s.doc.name).join(', ')}`)
for (const [base, gs] of conflicted) {
  const s = sanityGoats.get(base)!.doc
  console.log(
    `\nSkipped: ${gs.map(shortName).join(' and ')} all match Sanity's "${s.aka || s.name}" (${base}). Fix the duplicate in Milk Manager.`,
  )
}

if (!apply) {
  rmSync(work, { recursive: true, force: true })
  console.log('\nDry run only. Add --apply to write to Sanity.')
  process.exit(0)
}

// --- Write --------------------------------------------------------------------------------

async function upload(photo: Photo, g: Goat) {
  const { data, error } = await db.storage.from(BUCKET).download(photo.storage_path)
  if (error) throw new Error(`${photo.storage_path}: ${error.message}`)
  const filename = `${slugify(shortName(g))}-${photo.id.slice(0, 8)}.jpg`
  const { document } = await sanity<{ document: { _id: string } }>(
    `/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`,
    { method: 'POST', headers: { 'Content-Type': data.type || 'image/jpeg' }, body: await data.arrayBuffer() },
  )
  const alt = [shortName(g), KIND_ALT[photo.kind] ?? ''].filter(Boolean).join(' ')
  return { _type: 'image', _key: keyOf(photo.id), asset: { _type: 'reference', _ref: document._id }, alt }
}

let created = 0
let updated = 0
let added = 0
const failed: string[] = []
try {
  for (const p of plans) {
    if (!Object.keys(p.set).length && !p.newPhotos.length) continue
    // One goat failing (say, edited in the studio mid-run) doesn't stop the rest;
    // running again picks it up.
    try {
      const images = []
      for (const photo of p.newPhotos) images.push(await upload(photo, p.goat))
      let mutation: unknown
      if (!p.base) {
        mutation = {
          create: {
            _id: `drafts.${crypto.randomUUID()}`,
            _type: 'goat',
            slug: { _type: 'slug', current: newSlugs.get(p.goat.id) },
            ...p.set,
            ...(images.length ? { images } : {}),
          },
        }
      } else {
        const { doc } = sanityGoats.get(p.base)!
        const set = { ...p.set, ...(images.length && !doc.images?.length ? { images } : {}) }
        mutation = {
          patch: {
            id: doc._id,
            ifRevisionID: doc._rev, // stops if someone edited it in the studio since it was read
            ...(Object.keys(set).length ? { set } : {}),
            ...(images.length && doc.images?.length ? { insert: { after: 'images[-1]', items: images } } : {}),
          },
        }
      }
      await sanity(`/data/mutate/${DATASET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutations: [mutation] }),
      })
      if (p.base) updated += 1
      else created += 1
      added += images.length
      console.log(`Saved ${fullName(p.goat)}`)
    } catch (e) {
      failed.push(fullName(p.goat))
      console.error(`Not saved: ${fullName(p.goat)}: ${(e as Error).message}`)
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
console.log(`\nSanity: ${created} drafts created, ${updated} goats filled in, ${added} photos added.`)
if (failed.length) {
  console.error(`${failed.length} not saved (run again to retry): ${failed.join(', ')}`)
  process.exitCode = 1
}
