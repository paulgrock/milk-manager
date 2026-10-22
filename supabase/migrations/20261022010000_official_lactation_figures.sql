-- DHI reports' own figures, stored as printed so the app shows the official
-- numbers instead of re-deriving them.

-- At each test: days in milk, lactation to date and projected 305-day yields.
alter table public.milk_test_results
  add column dim smallint check (dim between 0 and 1000),
  add column ltd_milk_g integer check (ltd_milk_g >= 0),
  add column ltd_fat_g integer check (ltd_fat_g >= 0),
  add column ltd_protein_g integer check (ltd_protein_g >= 0),
  add column proj305_milk_g integer check (proj305_milk_g >= 0),
  add column proj305_fat_g integer check (proj305_fat_g >= 0),
  add column proj305_protein_g integer check (proj305_protein_g >= 0);

-- For a finished lactation: the complete record and the first-305-days record.
alter table public.lactations
  add column official_days smallint check (official_days between 1 and 1000),
  add column official_milk_g integer check (official_milk_g >= 0),
  add column official_fat_g integer check (official_fat_g >= 0),
  add column official_protein_g integer check (official_protein_g >= 0),
  add column official_305_milk_g integer check (official_305_milk_g >= 0),
  add column official_305_fat_g integer check (official_305_fat_g >= 0),
  add column official_305_protein_g integer check (official_305_protein_g >= 0);
