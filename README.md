# Milk Manager

A dairy goat herd tracker for goats, milk weights, lactation curves, breeding and kidding, health, DHIA, the calendar and finances.
The full feature plan is in [docs/feature-plan.md](docs/feature-plan.md).

## Stack

- **Vue 3 + Vite + TypeScript**, built as a static installable app (PWA). There's no app server.
- **Nuxt UI** (Tailwind) for components.
- **Supabase**: Postgres, Auth (email sign-in codes) and Storage. Permissions are enforced by row-level security.
- **TanStack Vue Query**: the cache is saved to IndexedDB, so the app opens with the last-known data even when offline.

## Local development

Requires Node 22+ and Docker Desktop running.

```bash
npm install
npm run db:start        # starts local Supabase and applies migrations
cp .env.example .env.local   # then paste PUBLISHABLE_KEY from `npx supabase status`
npm run dev             # http://localhost:5173
```

Sign-in emails don't go out locally. They're captured by Mailpit at http://127.0.0.1:54324.

| Command | What it does |
|---|---|
| `npm run build` | Type-check and build to `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, `e2e/`), against a production build and the local Supabase |
| `npm run db:test` | Database permission tests (pgTAP, `supabase/tests`) |
| `npm run db:reset` | Wipe the local DB and re-run migrations |
| `npm run db:types` | Regenerate `src/lib/database.types.ts` after a schema change |

## Tests

Every feature ships with three kinds of tests:

- **Unit** (`src/**/*.test.ts`): calculations such as weights, parsing, curve fits and projections.
- **Database** (`supabase/tests`): permissions and data rules, run as real users.
- **Browser** (`e2e/`): the user flows, including offline and weak-signal milk entry and a phone-width layout check.
  Each test creates its own user and herd and deletes them afterwards. The local stack must be running (`npm run db:start`).
  On first use, install the browser with `npx playwright install chromium`.

## Herds and permissions

- Every record belongs to a herd. Members are either **owners** (everything) or **helpers** (day-to-day entry only).
- New tables get a `herd_id` and RLS policies using `is_herd_member(herd_id)` / `is_herd_owner(herd_id)`.
  See `supabase/migrations/20261021000000_herds_and_members.sql`.
- Owners invite people by email from Settings. The invitee signs in with that email and accepts the invite.

## Deploying

1. Create a Supabase project, then run `npx supabase link` and `npx supabase db push`.
2. In the dashboard, under **Auth → Email Templates**, set the Magic Link and Confirm Signup templates to show `{{ .Token }}`
   (copy `supabase/templates/sign_in_code.html`). This makes sign-in use a code instead of a link, which works inside an installed iPhone app.
3. Set up custom SMTP for real email delivery. Supabase's built-in sender is heavily rate-limited.
4. On Netlify, import the GitHub repo. `netlify.toml` sets the build, the single-page-app routing and cache headers.
   Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under Site configuration → Environment variables, then deploy.
5. In Supabase, set Auth → URL Configuration → Site URL to the Netlify address.
