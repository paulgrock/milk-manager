-- Corrected milking start and stop times belong to a milking day, not a test:
-- the test sheet opens on any day, usually before the lab's results (and so
-- the test) exist. Replaces milk_tests.milking_times.

-- Times corrected by hand, as 'H:MM' by milking:
-- {"previous": {"start": "20:00", "stop": "21:00"}, "1": {...}, "2": {...}}.
-- "previous" is the last milking the evening before milked_on. Anything not
-- here is worked out from when the weights were entered.
create table public.milking_times (
  herd_id uuid not null references public.herds (id) on delete cascade,
  milked_on date not null,
  times jsonb not null default '{}'
    check (jsonb_typeof(times) = 'object' and length(times::text) <= 2000),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (herd_id, milked_on)
);

insert into public.milking_times (herd_id, milked_on, times)
select distinct on (herd_id, tested_on) herd_id, tested_on, milking_times
from public.milk_tests
where milking_times <> '{}'
order by herd_id, tested_on, created_at desc;

alter table public.milk_tests drop column milking_times;

alter table public.milking_times enable row level security;

create policy "members can read milking times" on public.milking_times
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add milking times" on public.milking_times
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit milking times" on public.milking_times
for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)));
create policy "members can delete milking times" on public.milking_times
for delete to authenticated using ((select public.is_herd_member(herd_id)));
