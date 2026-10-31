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

## Going live: sign-in email (to do)
The site runs on Netlify (https://bef-milk-manager.netlify.app) with the hosted Supabase project, and Bird's Eye Farm's data is
copied there (`scripts/copy-herd.ts`). What's left is email: Supabase's built-in sender only delivers to people on the Supabase
team and a couple of times an hour, so invited helpers would never get a sign-in code, and the code template can't be set
without custom SMTP. Plan: send through **Resend** from the birdseyefarm.com domain (free for 3,000 emails a month).
1. Sign up at resend.com and add **birdseyefarm.com** under Domains.
2. Add the DNS records Resend shows (DKIM, SPF, and an MX record for bounces) wherever birdseyefarm.com's DNS is managed,
   then click **Verify** in Resend. It can take a few minutes up to a few hours.
3. Create an API key in Resend with sending access.
4. Supabase → Authentication → Emails → SMTP Settings, turn on custom SMTP (or use Resend → Integrations → Supabase,
   which fills these in):
   - Sender email `milk@birdseyefarm.com`, sender name `Milk Manager`
   - Host `smtp.resend.com`, port `465`, username `resend`, password: the Resend API key
5. Supabase → Authentication → Emails → Templates: for **Magic Link** and **Confirm signup**, set the subject to
   `Your Milk Manager sign-in code` and paste in `supabase/templates/sign_in_code.html`, so emails carry a 6-digit code.
6. Supabase → Authentication → Rate Limits: raise emails per hour (e.g. to 30) so a few people signing in at once aren't blocked.
7. Check it: invite a helper's email in Settings, have them sign in, and confirm the code arrives from milk@birdseyefarm.com.

Stopgap if DNS has to wait: Gmail SMTP with an app password (2-step verification on, then host `smtp.gmail.com`, port `465`,
the Gmail address as username, the app password as password). Codes come from that Gmail address; about 500 a day.

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

## 12. Cheese (built, not live yet)
A Cheese tab for cheese made from the herd's milk. Each **make** is one cheese type made on one day, with its ready date
(from the type's aging time, editable), optional gallons of milk, notes, and a Finished mark. The farm
keeps its own list of cheeses: anyone adds, owners rename, re-time or hide. Ready dates show on the calendar (Cheese
filter) and Today; Finances has a Cheese sales category. Terms are in `GLOSSARY.md`.
To go live: push the cheese migration to the hosted database first, then push the code.

## After Cheese is live: whole-app review
Once Cheese is live, review the whole app for tech debt and optimizations before adding more. Known starting points:
- Unused tables left from earlier changes: `health_observations` and `disease_tests` (empty; dropping them needs an OK).
- The main JavaScript bundle is large (Vite warns about chunk size); check what loads on first open and split by page.
- Repeated patterns that could share code: care types and cheese types (per-herd lists owners manage), the several
  "loads a herd's records, saves online" composables, and the import/copy/backup scripts' Supabase setup.
- Which saves work offline (milk, care) and which don't (cheese, treatments, breeding): decide if more should.
- Test suite speed and the one-off test setup failures; dependency updates (Supabase CLI, npm audit).
- Settings vs page placement of owner-managed lists, and other UI consistency.

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
