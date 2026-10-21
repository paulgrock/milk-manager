import { QueryClient } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'

const DAY = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data immediately and refetch in the background, so the
      // app opens with the last-known herd even with no signal in the barn.
      networkMode: 'offlineFirst',
      gcTime: 30 * DAY,
      staleTime: 30 * 1000,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})

const CACHE_KEY = 'milk-manager-cache'

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get<string>(key).then((value) => value ?? null),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_KEY,
})

/** Restores the cache saved on this device. Await before mounting the app. */
export function restoreQueryCache(): Promise<void> {
  const [, restored] = persistQueryClient({ queryClient, persister, maxAge: 30 * DAY })
  return restored
}

/** Drops everything cached on this device, e.g. on sign-out. */
export async function clearQueryCache() {
  queryClient.clear()
  await del(CACHE_KEY)
}
