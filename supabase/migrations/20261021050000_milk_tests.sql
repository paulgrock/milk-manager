-- Milk tests: DHIR test days, ADGA one-day milking competitions, and the
-- owner's own samples. Each test has one result per doe: her 24-hour milk
-- weight and the lab's butterfat, protein and somatic cell count.

create type public.milk_test_kind as enum ('dhir', 'one_day', 'owner');

create table public.milk_tests (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  tested_on date not null,
  kind public.milk_test_kind not null default 'dhir',
  lab text check (length(lab) <= 100),
  tester text check (length(tester) <= 100),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint milk_tests_id_herd_key unique (id, herd_id)
);

create index milk_tests_herd_id_idx on public.milk_tests (herd_id, tested_on desc);

create table public.milk_test_results (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  test_id uuid not null,
  goat_id uuid not null,
  -- The test day's total for her, every milking.
  milk_g integer check (milk_g between 0 and 20000),
  butterfat_pct numeric(4, 2) check (butterfat_pct between 0.5 and 15),
  protein_pct numeric(4, 2) check (protein_pct between 0.5 and 15),
  -- Cells per mL.
  scc integer check (scc between 0 and 100000000),
  notes text check (length(notes) <= 500),
  foreign key (test_id, herd_id) references public.milk_tests (id, herd_id) on delete cascade,
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  unique (test_id, goat_id),
  check (milk_g is not null or butterfat_pct is not null or protein_pct is not null or scc is not null)
);

create index milk_test_results_herd_id_idx on public.milk_test_results (herd_id);
create index milk_test_results_goat_id_idx on public.milk_test_results (goat_id);

create trigger milk_test_results_check_doe before insert or update of goat_id on public.milk_test_results
for each row execute function public.check_doe();
create trigger milk_tests_keep_herd_id before update of herd_id on public.milk_tests
for each row execute function public.keep_herd_id();
create trigger milk_test_results_keep_herd_id before update of herd_id on public.milk_test_results
for each row execute function public.keep_herd_id();

do $$
declare
  t text;
begin
  foreach t in array array['milk_tests', 'milk_test_results'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "members can read" on public.%I for select to authenticated using ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can add" on public.%I for insert to authenticated with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can edit" on public.%I for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can delete" on public.%I for delete to authenticated using ((select public.is_herd_member(herd_id)))', t);
  end loop;
end;
$$;
