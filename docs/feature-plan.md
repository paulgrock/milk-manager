# Dairy Goat Herd Tracker — Feature Plan

## Context
You want a herd tracker for dairy goats with features like herdmanager.app (dairy and breeding only, no meat, fiber or pack). Goat profiles should hold the details shown on birdseyefarm.com/goats. The core is daily milk weights, entered per milking, that roll up into lactation curves. The project folder (`/Users/paulgrock/Code/milk-manager`) is empty, so this is a new build. This document lists features only. We pick the tech stack in the next step.

Phases: **MVP** = what you asked for. **P2** = high value, comes next. **P3** = nice to have later.

---

## 1. Goat Records (MVP)
Fields are modeled on the Bird's Eye Farm goat listings.
- **Identity:** registered name, barn name, herd prefix, tattoo (L/R ear), registration # and registry (ADGA, AGS, AMGRA, etc.), a link to the ADGA pedigree, microchip/scrapie tag.
- **Basics:** sex (doe, buck, wether), breed, % / American / Purebred, birth date (age is calculated), color and markings, horned/disbudded/polled, photos (conformation, head, udder).
- **Titles and suffixes:** milk stars (e.g. 5\*M), \*B / +B / ++B, \*D, GCH, plus any pending status.
- **Linear Appraisal:** history of scores by year (e.g. "VVEV 88" with breakdown: General Appearance / Dairy Strength / Body Capacity / Mammary), the age when scored, and the appraiser.
- **Pedigree:** sire and dam (linked when they're in the herd, free text when not), shown 3 generations deep (S, SS, SD, D, DS, DD) to match Bird's Eye, with more generations later.
- **Status:** active, dry, in milk, for sale, sold, deceased, reference only (an outside goat kept for its pedigree). Also the date and reason the goat left the herd.
- **Notes**, and a herd list you can search and filter by status, sex, breed and in-milk.

## 2. Daily Milk Recording (MVP)
- **Quick herd entry:** one screen for today's milking that lists every doe in milk, so you can tap through and enter weights fast.
- **Split by milking:** each day's total is the sum of its milkings. AM and PM are the defaults, and you can add an extra milking on a given day. Enter the parts and the app adds up the daily total. You can also enter just a total and add the breakdown later. The app flags a day where a milking is missing.
- **Units:** lbs or kg, with an optional conversion from volume.
- Edit and backfill past dates, and attach a note to a single milking (e.g. "kicked bucket").
- A flag for milk that can't be sold, tied to the treatment withdrawal periods in section 5.

## 3. Lactation Tracking and Curves (MVP)
- **Lactations:** each one starts at a freshening (kidding) date and ends on its dry-off date. Track lactation number and days in milk (DIM).
- **Lactation curve chart:** daily weights plotted against DIM, with a smoothed line. You can overlay the doe's previous lactations, or other does, to compare.
- **Totals:** lactation to date, a projected 305-day total (Wood's curve fit), peak yield and the DIM it came on, plus averages.
- **Herd view:** today's herd total, a trend over time, and a top-producer ranking.

## 4. Breeding and Kidding (MVP)
- **Heat log:** observed heats, with the next one predicted (~21-day cycle).
- **Breeding records:** date, buck (from your herd or an outside stud), method (hand breeding, pen breeding, AI), and service fee.
- **Due dates:** calculated automatically at ~150 days, with a "due soon" list and status (open, bred, confirmed pregnant, kidded).
- **Pregnancy checks:** date, method (blood test, ultrasound), result.
- **Kidding records:** date, number of kids, sex and weight of each, presentation, difficulty, notes. Each kid can be turned into a new goat record with its sire and dam already linked, and the record starts a new lactation for the dam.
- **Dry-off planning:** a suggested dry-off date about 60 days before the due date.

## 5. Health and Routine Care (MVP)
- **Routine care log, with a "last done / next due" date for each goat:** hoof trims, Replamin Gel Plus, copper bolus (with dose in grams), and vaccinations (CDT, etc.). You set the interval for each care type (e.g. hoof trim every 6–8 weeks, copper every 6 months). You can log one item for many goats at once ("trimmed 8 does today").
- You can add your own care types, such as deworming or selenium/BoSe.
- Treatments and medications with dose, route and lot #. **Milk withdrawal periods**, with a banner for "milk withheld until X" that also flags the milk records from section 2.
- FAMACHA scores, body condition score (BCS), body weight, and disease testing (CAE, CL, Johne's, with dates and results).

## 6. Milk Quality / DHIA (MVP)
- Official DHIA test days, which carry their own weights and also show on the curve.
- Somatic cell count (SCC), butterfat %, protein %. Butterfat and protein pounds are calculated from the milk weights.
- Progress toward milk stars and ADGA milk-star qualification.

## 7. Calendar and Reminders (MVP)
- One calendar for expected heats, due dates, dry-offs, hoof trims, Replamin/copper due dates, vaccinations, withdrawal end dates and test days.
- A "today" dashboard showing what needs doing (overdue / due this week) and today's milk total.
- Notifications are optional (push or email). We decide which during tech planning.

## 8. Genetics (P3)
- Inbreeding coefficient (COI) for a planned breeding.
- A pairing planner to check a doe × buck match before breeding.
- ADGA pedigree import.

## 9. Data and Reports (MVP basics, more later)
- **MVP:** export to CSV, and import a herd list from CSV.
- **MVP finances:** income (milk, kid and goat sales, stud fees) and expenses (feed, vet, minerals, registration) by category. Each entry can be tied to a goat, and there's a yearly summary.
- **Later:** PDF goat summary sheets (a sales packet with pedigree, LA and milk), lactation reports, and Schedule F tax categories.

## 10. Users and Access (MVP)
- One shared herd with several logins (you plus family and helpers), so the app needs cloud sync.
- Each entry records who made it ("milked by", "trimmed by").
- Roles: owner (everything) and helper (enter milk and care records, no deleting goats or editing finances).
- Accounts are invite-only: a new account needs a pending herd invite from an owner (built).
- **P2: invite emails.** Today, adding an invite doesn't email anyone; the owner has to tell the person to sign in. Send one instead:
  a Supabase Edge Function checks the owner owns the herd, records the invite, and calls Supabase Auth's invite-user email
  (needs the secret key, so it can't run in the browser), with a branded "You've been invited to {herd} on Milk Manager" template
  like the sign-in code one. Needs real email delivery (SMTP) on the hosted project. Supabase's invite email only works for people
  without an account yet; existing users would see the invite the next time they open the app.

## Going live: sign-in email (done 2026-11-03)
Sign-in codes go out through **Resend** from milk@birdseyefarm.com (free for 3,000 emails a month). Supabase's built-in
sender only reaches people on the Supabase team, a few times an hour, and won't take a custom template.
- **DNS:** birdseyefarm.com is registered at Namecheap but its DNS is hosted by Netlify (nameservers `dns1–4.p01.nsone.net`),
  so the records live in Netlify → Domains → birdseyefarm.com → DNS settings: TXT `resend._domainkey` (DKIM), CNAMEs `send`
  and `rsend` (sending, pointing at `*.forge.rmta.net`), and TXT `_dmarc` `v=DMARC1; p=none;`. Don't add them at Namecheap,
  and leave its nameservers on Custom DNS.
- **Supabase → Authentication → Emails → SMTP Settings:** host `smtp.resend.com`, port `465`, username `resend`, password a
  Resend API key with sending access; sender `milk@birdseyefarm.com`, name `Milk Manager`.
- **Templates:** Magic Link and Confirm signup both use `supabase/templates/sign_in_code.html`, subject
  `Your Milk Manager sign-in code`.
- **Sign In / Providers → Email → Email OTP Length: 6.** The hosted default is 8; the app's code boxes take 6, the same as
  `otp_length` in `supabase/config.toml`.
- **Rate Limits:** emails per hour raised to about 30.

## 11. Milk records, LA and photos on the farm website (P3)
Show each goat's appraisals and DHI milk records on birdseyefarm.com straight from the app, so they're never typed twice.
The website is an Astro site built ahead of time from Sanity (`output: 'static'`) on Netlify.
- **App:** one database function readable without signing in (the only thing visitors can reach) that returns, per goat:
  registration number, name and titles; linear appraisals (date, codes, final score); DHI lactation records (lactation
  number, days, milk/fat/protein lb, 305-day figures, milk stars); and the current lactation's to-date and projected
  305-day figures from the latest test. No notes, health, finances, daily weights or people. A herd setting, "Share milk
  records and appraisals on the website", off until switched on.
- **Website:** at build time, fetch that list and match goats to their Sanity entries by registration number (already in
  the ADGA pedigree link), then add a Milk records table and the LA line to each goat page. Visitors never contact the
  app, so it can't slow or break the site.
- **Photos:** manage goat photos in the app instead of Sanity, so there's one copy (most are taken on a phone in the
  barn). Each photo gets a "Show on website" switch, off by default since many are record shots (udders, hooves, kids
  at birth), plus a choice of the goat's main website photo and alt text. The bucket stays private: the public list
  includes short-lived links only for photos switched on, the website build downloads them once, and Astro serves
  resized copies from Netlify, so visitors never reach Supabase storage. Sanity keeps the rest of each goat page
  (description, layout, sale status). Trade-off: no Sanity focal-point cropping or captions unless the app adds them.
- **Freshness:** a nightly Netlify build hook, or have the app trigger a rebuild after a DHI test, appraisal or website
  photo change is saved.
- Considered instead: writing app notes back into Sanity. Not worth it: notes are private, the website's rich text
  would be flattened, and it would need a secret Sanity token on a server.

## 12. Cheese (live)
A Cheese tab for cheese made from the herd's milk. Each **make** is one cheese type made on one day, with its ready date
(from the type's aging time, editable), optional gallons of milk, notes, and a Finished mark. The farm
keeps its own list of cheeses: anyone adds, owners rename, re-time or hide. Ready dates show on the calendar (Cheese
filter) and Today; Finances has a Cheese sales category. Terms are in `GLOSSARY.md`.
The Cheese page groups makes by cheese type and shows only those made in the last week or ready within a week either
side of today (not finished). Tapping a type lists all its makes (date, milk, status); tapping a make shows its details
and notes, with Edit and Mark finished.

## 13. Chores (built, not live yet)
A Chores tab for farm tasks that repeat and belong to the farm, not a goat. It starts with clean milking equipment
(weekly), fill waterers and refill mineral feeder (every other week), and clean stalls and clean coop (every 30 days).
A chore is due its repeat time after it was last done. "Done today" is one tap (with undo); a past date and a note
go through the chore's history, which also shows who did each one. It works with no signal, like care logs. Anyone
adds chores; owners rename, re-time or hide them. A chore not recorded yet stays off Today and the calendar. Overdue
chores show on Today, and all due dates on the calendar under a Chores filter. **Due soon** is now a quarter of the
repeat time, at most 7 days, for care as well as chores.

## 14. Adoptions: kid reservations (built, not live yet)
An Adoptions page under Breeding, owners only. **Adopters** are kept year to year. A **reservation** holds an adopter's
place in line for one doe's kids (or any doe's) in a kidding season: the sex wanted (doeling, buckling, wether or
either) and how many. Its **deposit** goes into Finances the day it's received; marking it refunded takes it back out,
and it can be kept or moved to another doe or season. Once a doe kids, each reservation is **matched** to a kid that
fits, in line order; marking it **adopted** puts the adoption fee less the deposit into Finances (Kid sales, or Goat sales for
an adult) and marks the goat sold, leaving on the pickup date. Unmatched kids and goats from the herd can be adopted
out the same way. Finance entries made this way are changed from Adoptions. Not yet: default prices by sex,
reservations on the doe's page, and registration-transfer paperwork.

Milk entry also has a **milking order**, set by anyone in the herd, so the list follows the milking stand.

## Whole-app review (2026-10-31)
Reviewed after Cheese went live: bundle sizes, unused code and packages, repeated code, data loading, offline
behavior, tests and tooling. Security was audited separately on 2026-10-23.

**Worth doing, most valuable first**
1. **Done:** **Small photo copies for icons.** The goat list, milk line and goat page header show photos as small icons but
   download the full photo (average 372 KB, up to 1.4 MB): about 5 MB the first time a phone opens the goat list,
   often on barn signal. Save a ~256 px copy at upload, backfill existing photos with a script, and use it for icons.
2. **Run the tests automatically on every push** (GitHub Actions: typecheck, unit, database and Playwright tests
   against a local Supabase). Today Netlify only typechecks before deploying, so a broken change can go live.
3. **Done:** **Safer `db:types`.** It writes straight into `src/lib/database.types.ts`, so with the database down it replaces
   the types with an error message. Write to a temporary file and only move it into place when it worked.
4. **One shared save/delete helper** for the data composables. Six of them repeat the same code (Health and Breeding
   share a copy that skips type checking with `as never` casts; Finances, Cheese and Milk tests each write their own).
5. **Done:** **One shared local-Supabase setup for the scripts** (copied into four scripts).
6. **Done:** **Page the goat list** like every other list: it's fetched in one request, so it would stop at Supabase's
   1,000-row limit (reference goats from pedigree imports add up).
7. **Drop the unused `health_observations` and `disease_tests` tables** (empty since health checks were removed).

**Smaller or optional**
- Package updates: all a minor version behind. The audit warnings are in test and build tools only, not shipped code.
- Offline saves: milk and care work with no signal; treatments, breeding, cheese, goats and photos need signal.
  Decide whether any of those should work offline too.
- **Done:** opening the app downloaded 575 KB of JavaScript (180 KB compressed). Supabase's unused live-updates
  module is now replaced by a stand-in, bringing it to 521 KB (164 KB compressed). The rest is Vue, the router,
  sign-in and the UI kit; going much smaller would mean replacing one of those.
- About 40 exported values and types are only used in their own file; harmless tidiness.
- No linter. ESLint's Vue rules would catch some mistakes earlier; optional.

**Checked and fine**
- The chart library is already trimmed to what's used and only loads on the lactation and production pages.
- Milk data loads by date range (one day for entry, a window for history and production, one goat for her curves).
- No unused files, components or packages; no file over about 370 lines.
- Owner-managed lists sit on the page they're used on (care routine on Health, cheeses on Cheese), consistently.

## Explicitly out of scope
Meat, fiber and pack features. A marketplace or public farm page (could be added later).

---

## Suggested additions (my picks)
- **Per-milking breakdown** that adds up to the total, as you asked. It's built into section 2.
- **Withdrawal-aware milk flags:** this is the most important safety feature for selling milk.
- **Kid → goat promotion:** pedigrees fill in over time as kids are born into the herd.
- **Fast phone-friendly entry, possibly working offline:** milking happens in a barn, often with bad signal.
- **Reference goats for outside sires and dams,** so pedigrees can link to them.

## Next step
Choose the tech stack (web, mobile or PWA; how offline entry syncs; how logins work; hosting), then break the MVP into build milestones: goats → milk → lactation → breeding → care/health → DHIA → calendar → finances.

## Verification (once built)
- Enter a week of AM/PM weights for 3 does and check that the daily totals match the sum of the milkings.
- Record a kidding → check that a lactation starts and that DIM is correct → check that the curve shows and gives a 305-day projection.
- Record a breeding → check that the due date is the breeding date + 150 days and that it appears in "due soon".
