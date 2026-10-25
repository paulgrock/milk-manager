// Goat photos, kept on the device once seen so they show with no signal.
//
// Photos are private, so they're downloaded with the signed-in user's
// session (the herd's storage rules apply) and stored in Cache Storage under
// their storage path. A photo file never changes once uploaded (each upload
// gets a new path), so a saved copy never goes stale. The page shows each one
// through a blob: URL made from the saved copy.

import { reactive } from 'vue'

const CACHE = 'goat-photos-v1'
// Cache Storage keys are URLs; this one is never fetched, it only names the entry.
const cacheKey = (path: string) => new URL(`/__goat-photos/${path}`, location.origin).toString()
// Cache Storage needs a secure page (https or localhost); elsewhere photos still load, just aren't kept.
const canCache = () => typeof caches !== 'undefined'

/** Photo path → blob: URL, for the photos this page has loaded. */
const urls = reactive(new Map<string, string>())
const loading = new Map<string, Promise<void>>()

function show(path: string, blob: Blob) {
  const old = urls.get(path)
  urls.set(path, URL.createObjectURL(blob))
  if (old) URL.revokeObjectURL(old)
}

/** The blob: URL for a photo, once `loadPhoto` has it. */
export function photoUrl(path: string): string | undefined {
  return urls.get(path)
}

/**
 * Shows a photo from the device if it's saved there, otherwise downloads and
 * saves it. With no signal and no saved copy it stays unloaded, and a later
 * call tries again.
 */
export function loadPhoto(path: string, download: (path: string) => Promise<Blob>): Promise<void> {
  if (urls.has(path)) return Promise.resolve()
  const pending = loading.get(path)
  if (pending) return pending
  const job = (async () => {
    try {
      const saved = canCache() ? await (await caches.open(CACHE)).match(cacheKey(path)) : undefined
      if (saved) return show(path, await saved.blob())
      const blob = await download(path)
      show(path, blob)
      await savePhoto(path, blob)
    } catch {
      // Offline with nothing saved, or the photo is gone: try again next time.
    } finally {
      loading.delete(path)
    }
  })()
  loading.set(path, job)
  return job
}

/** Keeps a photo on the device, e.g. one just uploaded, so it needn't be downloaded again. */
export async function savePhoto(path: string, blob: Blob) {
  if (!canCache()) return
  const cache = await caches.open(CACHE)
  await cache.put(cacheKey(path), new Response(blob, { headers: { 'Content-Type': blob.type || 'image/jpeg' } }))
}

/** Drops one photo from the device, e.g. after it's deleted. */
export async function forgetPhoto(path: string) {
  const url = urls.get(path)
  if (url) URL.revokeObjectURL(url)
  urls.delete(path)
  if (canCache()) await (await caches.open(CACHE)).delete(cacheKey(path))
}

/** Drops every photo from the device, on sign-out. */
export async function clearPhotoCache() {
  for (const url of urls.values()) URL.revokeObjectURL(url)
  urls.clear()
  if (canCache()) await caches.delete(CACHE)
}
