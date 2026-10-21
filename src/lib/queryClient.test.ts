import { describe, expect, it } from 'vitest'
import { CACHE_LIFETIME, queryClient } from './queryClient'

describe('offline cache', () => {
  it('keeps gcTime under the largest setTimeout delay, or restored data is dropped at once', () => {
    const MAX_TIMEOUT = 2 ** 31 - 1
    expect(CACHE_LIFETIME).toBeLessThan(MAX_TIMEOUT)
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBeLessThan(MAX_TIMEOUT)
  })
})
