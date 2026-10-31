// Stands in for @supabase/realtime-js (see vite.config.ts). supabase-js always
// bundles its live-updates client, about 55 KB of the first load, but this
// app never subscribes to live updates. supabase-js only creates the client
// and hands it the sign-in token; anything that tries to open a channel fails
// loudly instead of silently doing nothing.

const NOT_INCLUDED = 'Supabase Realtime is not included in this app (see src/lib/realtimeStub.ts)'

export class RealtimeClient {
  constructor(..._args: unknown[]) {}
  setAuth(_token?: string | null): Promise<void> {
    return Promise.resolve()
  }
  channel(..._args: unknown[]): never {
    throw new Error(NOT_INCLUDED)
  }
  getChannels(): never[] {
    return []
  }
  removeChannel(..._args: unknown[]): Promise<'ok'> {
    return Promise.resolve('ok')
  }
  removeAllChannels(): Promise<'ok'[]> {
    return Promise.resolve([])
  }
}
