import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A stand-in for the browser's Cache Storage, which outlives page loads.
const stores = new Map<string, Map<string, Response>>()
const fakeCaches = {
  open: async (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map())
    const s = stores.get(name)!
    return {
      match: async (k: string) => s.get(k)?.clone(),
      put: async (k: string, r: Response) => void s.set(k, r),
      delete: async (k: string) => s.delete(k),
    }
  },
  delete: async (name: string) => stores.delete(name),
}

// A fresh copy of the module, as after reopening the app.
const reopen = async () => {
  vi.resetModules()
  return import('./photoCache')
}
const photo = () => new Blob([new Uint8Array([255, 216, 255])], { type: 'image/jpeg' })

beforeEach(() => {
  stores.clear()
  vi.stubGlobal('caches', fakeCaches)
  vi.stubGlobal('location', { origin: 'https://milk.example' })
})
afterEach(() => vi.unstubAllGlobals())

describe('photo cache', () => {
  it('downloads a photo once, then shows the saved copy after the app is reopened', async () => {
    const download = vi.fn(async () => photo())
    let cache = await reopen()
    await cache.loadPhoto('h/g/a.jpg', download)
    expect(cache.photoUrl('h/g/a.jpg')).toMatch(/^blob:/)

    cache = await reopen()
    await cache.loadPhoto('h/g/a.jpg', download)
    expect(cache.photoUrl('h/g/a.jpg')).toMatch(/^blob:/)
    expect(download).toHaveBeenCalledTimes(1)
  })

  it('with no signal and nothing saved, leaves it unloaded and tries again later', async () => {
    const cache = await reopen()
    const download = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch')).mockResolvedValue(photo())
    await cache.loadPhoto('h/g/b.jpg', download)
    expect(cache.photoUrl('h/g/b.jpg')).toBeUndefined()
    await cache.loadPhoto('h/g/b.jpg', download)
    expect(cache.photoUrl('h/g/b.jpg')).toMatch(/^blob:/)
  })

  it('asks for a photo once even when several pages want it at the same time', async () => {
    const cache = await reopen()
    const download = vi.fn(async () => photo())
    await Promise.all([cache.loadPhoto('h/g/c.jpg', download), cache.loadPhoto('h/g/c.jpg', download)])
    expect(download).toHaveBeenCalledTimes(1)
  })

  it('a photo just uploaded is already saved', async () => {
    let cache = await reopen()
    await cache.savePhoto('h/g/d.jpg', photo())
    cache = await reopen()
    const download = vi.fn(async () => photo())
    await cache.loadPhoto('h/g/d.jpg', download)
    expect(download).not.toHaveBeenCalled()
  })

  it('forgets deleted photos, and everything on sign-out', async () => {
    let cache = await reopen()
    const download = vi.fn(async () => photo())
    await cache.loadPhoto('h/g/e.jpg', download)
    await cache.loadPhoto('h/g/f.jpg', download)
    await cache.forgetPhoto('h/g/e.jpg')
    expect(cache.photoUrl('h/g/e.jpg')).toBeUndefined()
    await cache.clearPhotoCache()
    expect(cache.photoUrl('h/g/f.jpg')).toBeUndefined()

    cache = await reopen()
    await cache.loadPhoto('h/g/f.jpg', download)
    expect(download).toHaveBeenCalledTimes(3)
  })
})
