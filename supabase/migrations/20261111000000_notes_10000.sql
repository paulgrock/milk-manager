-- Every notes field allows up to 10,000 characters, the same as a goat's notes.
-- (health_observations and disease_tests are no longer used, so are left as they were.)

alter table public.linear_appraisals drop constraint linear_appraisals_notes_check,
  add constraint linear_appraisals_notes_check check (length(notes) <= 10000);
alter table public.lactations drop constraint lactations_notes_check,
  add constraint lactations_notes_check check (length(notes) <= 10000);
alter table public.milk_weights drop constraint milk_weights_note_check,
  add constraint milk_weights_note_check check (length(note) <= 10000);
alter table public.breedings drop constraint breedings_notes_check,
  add constraint breedings_notes_check check (length(notes) <= 10000);
alter table public.pregnancy_checks drop constraint pregnancy_checks_notes_check,
  add constraint pregnancy_checks_notes_check check (length(notes) <= 10000);
alter table public.kiddings drop constraint kiddings_notes_check,
  add constraint kiddings_notes_check check (length(notes) <= 10000);
alter table public.kids drop constraint kids_notes_check,
  add constraint kids_notes_check check (length(notes) <= 10000);
alter table public.care_events drop constraint care_events_notes_check,
  add constraint care_events_notes_check check (length(notes) <= 10000);
alter table public.treatments drop constraint treatments_notes_check,
  add constraint treatments_notes_check check (length(notes) <= 10000);
alter table public.milk_tests drop constraint milk_tests_notes_check,
  add constraint milk_tests_notes_check check (length(notes) <= 10000);
alter table public.milk_test_results drop constraint milk_test_results_notes_check,
  add constraint milk_test_results_notes_check check (length(notes) <= 10000);
alter table public.finance_entries drop constraint finance_entries_notes_check,
  add constraint finance_entries_notes_check check (length(notes) <= 10000);
alter table public.cheese_makes drop constraint cheese_makes_notes_check,
  add constraint cheese_makes_notes_check check (length(notes) <= 10000);
alter table public.chores_done drop constraint chores_done_notes_check,
  add constraint chores_done_notes_check check (length(notes) <= 10000);
alter table public.buyers drop constraint buyers_notes_check,
  add constraint buyers_notes_check check (length(notes) <= 10000);
alter table public.reservations drop constraint reservations_notes_check,
  add constraint reservations_notes_check check (length(notes) <= 10000);
alter table public.sales drop constraint sales_notes_check,
  add constraint sales_notes_check check (length(notes) <= 10000);
