// Makes the small copy (384 px on its longest side) that icons and gallery
// tiles use, for photos uploaded before the app made one itself.
//
//   node scripts/make-thumbnails.ts [--hosted] [--apply]
//
// Local Supabase by default; --hosted works on the linked hosted project (its
// secret key is fetched through the Supabase CLI and never saved). Without
// --apply it only counts what it would do. Resizes with macOS's `sips`. Safe to
// run again: photos that already have a copy are skipped.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { adminClient, hostedTarget, scriptTarget } from './lib/supabase.ts'

const THUMB_SIZE = 384
const BUCKET = 'goat-photos'
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const target = args.includes('--hosted') ? hostedTarget() : scriptTarget()
const db = adminClient(target)

const photos: { id: string; storage_path: string }[] = []
for (let start = 0; ; start += 1000) {
  const { data, error } = await db.from('goat_photos').select('id, storage_path').is('thumb_path', null).order('id').range(start, start + 999)
  if (error) throw error
  photos.push(...data)
  if (data.length < 1000) break
}
console.log(`${photos.length} photos without a small copy on ${target.url}`)
if (!apply) {
  console.log('Dry run only. Add --apply to make them.')
  process.exit(0)
}

const work = mkdtempSync(join(tmpdir(), 'goat-thumbs-'))
let made = 0
try {
  for (const photo of photos) {
    const { data: file, error } = await db.storage.from(BUCKET).download(photo.storage_path)
    if (error) {
      console.warn(`  skipped ${photo.storage_path}: ${error.message}`)
      continue
    }
    const original = join(work, 'original')
    const small = join(work, 'small.jpg')
    writeFileSync(original, Buffer.from(await file.arrayBuffer()))
    execFileSync('sips', ['-Z', String(THUMB_SIZE), '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', original, '--out', small], { stdio: 'ignore' })
    const thumbPath = photo.storage_path.replace(/\.[^./]+$/, '') + '-thumb.jpg'
    const { error: upError } = await db.storage.from(BUCKET).upload(thumbPath, readFileSync(small), { contentType: 'image/jpeg', upsert: true })
    if (upError) throw new Error(`Upload ${thumbPath}: ${upError.message}`)
    const { error: rowError } = await db.from('goat_photos').update({ thumb_path: thumbPath }).eq('id', photo.id)
    if (rowError) throw new Error(`Photo ${photo.id}: ${rowError.message}`)
    made += 1
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
console.log(`Made ${made} small copies.`)
