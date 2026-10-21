import { execSync } from 'node:child_process'

/** Local Supabase URLs and keys, read once from `supabase status`. */
function load() {
  if (!process.env.E2E_API_URL) {
    const out = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const vars = Object.fromEntries(
      out
        .split('\n')
        .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => [m[1], m[2]]),
    )
    if (!vars.API_URL || !vars.SECRET_KEY) throw new Error('Local Supabase is not running. Start it with `npm run db:start`.')
    process.env.E2E_API_URL = vars.API_URL
    process.env.E2E_PUBLISHABLE_KEY = vars.PUBLISHABLE_KEY
    process.env.E2E_SECRET_KEY = vars.SECRET_KEY
    process.env.E2E_MAILPIT_URL = vars.MAILPIT_URL
  }
  return {
    apiUrl: process.env.E2E_API_URL!,
    publishableKey: process.env.E2E_PUBLISHABLE_KEY!,
    secretKey: process.env.E2E_SECRET_KEY!,
    mailpitUrl: process.env.E2E_MAILPIT_URL!,
  }
}

export const env = load()
