import { QueryClient, dehydrate } from '@tanstack/vue-query'
import { persistQueryClient, type PersistedClient } from '@tanstack/query-persist-client-core'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'

const DAY = 24 * 60 * 60 * 1000
// How long data stays cached on the device. Must stay under ~24.8 days:
// gcTime is a setTimeout delay, and longer delays overflow and fire
// immediately, which would throw the restored cache away on startup.
export const CACHE_LIFETIME = 20 * DAY

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data immediately and refetch in the background, so the
      // app opens with the last-known herd even with no signal in the barn.
      networkMode: 'offlineFirst',
      gcTime: CACHE_LIFETIME,
      staleTime: 30 * 1000,
    },
    mutations: {
      // With no connection a save waits ("paused") instead of failing, and is
      // kept with the cache so it survives the app being closed. A flaky
      // connection gets a few retries.
      networkMode: 'online',
      retry: 3,
    },
  },
})

const CACHE_KEY = 'milk-manager-cache'

// Unfinished saves are stored as "paused" so they resume after the app
// restarts. Without this, a save that was retrying on a weak connection
// (the phone thinks it's online, but requests fail) would be lost.
function serialize(client: PersistedClient): string {
  return JSON.stringify({
    ...client,
    clientState: {
      ...client.clientState,
      mutations: client.clientState.mutations.map((m) => ({ ...m, state: { ...m.state, isPaused: true } })),
    },
  })
}

const dehydrateOptions = {
  // Keep the last data we had even if the latest refresh failed (no
  // signal), or the app would open empty in the barn.
  shouldDehydrateQuery: (q: { state: { data: unknown } }) => q.state.data !== undefined,
  // Only milk saves have mutation defaults (milkSync.ts), so only they can be replayed later.
  shouldDehydrateMutation: (m: { state: { status: string }; options: { mutationKey?: readonly unknown[] } }) =>
    m.state.status === 'pending' && m.options.mutationKey?.[0] === 'milk',
}

const persister = createAsyncStoragePersister({
  serialize,
  storage: {
    getItem: (key) => get<string>(key).then((value) => value ?? null),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_KEY,
})

/**
 * Writes the cache to the device right now, skipping the usual 1-second
 * throttle. Called after every milk save, so a weight typed just before the
 * phone is locked or the app is closed is already on the device.
 */
export async function saveCacheNow(): Promise<void> {
  await set(CACHE_KEY, serialize({ buster: '', timestamp: Date.now(), clientState: dehydrate(queryClient, dehydrateOptions) }))
}

/**
 * Restores the cache saved on this device, then sends any saves that were
 * waiting for a connection. Mutation defaults (see milkSync.ts) must be
 * registered first so restored saves know how to run.
 */
export async function restoreQueryCache(): Promise<void> {
  const [, restored] = persistQueryClient({
    queryClient,
    persister,
    maxAge: CACHE_LIFETIME,
    dehydrateOptions,
  })
  await restored
  // Restored data shows straight away but always gets refreshed: whether a
  // query was out of date isn't saved with it, so a change made just before
  // a reload (e.g. a kidding starting a lactation) could otherwise look current.
  void queryClient.invalidateQueries({ refetchType: 'none' })
  // Also save when the app goes to the background or is closed.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void saveCacheNow()
  })
  window.addEventListener('pagehide', () => void saveCacheNow())
  void queryClient.resumePausedMutations()
}

/** Drops everything cached on this device, e.g. on sign-out. */
export async function clearQueryCache() {
  queryClient.clear()
  await del(CACHE_KEY)
}
