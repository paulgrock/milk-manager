-- Solids-not-fat, as printed on DHI reports: the test day's percentage, and
-- pounds to date and projected to 305 days alongside milk, fat and protein.
alter table public.milk_test_results
  add column snf_pct numeric(4, 2) check (snf_pct between 0.5 and 20),
  add column ltd_snf_g integer check (ltd_snf_g >= 0),
  add column proj305_snf_g integer check (proj305_snf_g >= 0);

-- A result needs at least one test-day number; SNF alone counts now.
alter table public.milk_test_results
  drop constraint milk_test_results_check,
  add constraint milk_test_results_check
    check (milk_g is not null or butterfat_pct is not null or protein_pct is not null or snf_pct is not null
      or scc is not null);
