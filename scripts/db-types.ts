// Regenerates src/lib/database.types.ts from the local database. Only replaces
// the file when the output really is the types: with the database down, the
// Supabase CLI prints an error instead, which once overwrote the file.
//
//   npm run db:types

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const FILE = new URL('../src/lib/database.types.ts', import.meta.url)

let out: string
try {
  out = execFileSync('npx', ['supabase', 'gen', 'types', 'typescript', '--local'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
} catch (e) {
  console.error(`Could not generate types; ${FILE.pathname} is unchanged. Is the local database running (npm run db:start)?`)
  console.error((e as { stderr?: string }).stderr ?? e)
  process.exit(1)
}
if (!out.includes('export type Database')) {
  console.error(`Unexpected output from supabase gen types; ${FILE.pathname} is unchanged:\n${out.slice(0, 500)}`)
  process.exit(1)
}
writeFileSync(FILE, out)
console.log('Updated src/lib/database.types.ts')
