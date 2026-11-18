-- For the test sheet: copying a DHIR test day onto the lab's paper forms.

-- A doe's row on the lab's barn sheet, kept from test to test.
alter table public.goats add column dhir_sample_number smallint
  check (dhir_sample_number between 1 and 999);

-- Milking start and stop times corrected by hand, as 'HH:MM' by milking:
-- {"previous": {"start": "20:00", "stop": "21:00"}, "1": {...}, "2": {...}}.
-- Anything not here is worked out from when the weights were entered.
alter table public.milk_tests add column milking_times jsonb not null default '{}'
  check (jsonb_typeof(milking_times) = 'object' and length(milking_times::text) <= 2000);
