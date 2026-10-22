-- Routine care (hoof trims, Replamin, copper, vaccines...), treatments with
-- milk withdrawal, FAMACHA / body condition / weight, and disease tests.

-- ---------------------------------------------------------------------------
-- Routine care. Each herd has its own list of care types with a repeat
-- interval; the app works out "next due" from the last time each was done.
-- ---------------------------------------------------------------------------

create table public.care_types (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  -- Days between doses; null for as-needed care with no reminder.
  interval_days integer check (interval_days between 1 and 1095),
  -- e.g. 'g' for copper bolus, 'ml' for a drench. Null when no dose is recorded.
  dose_unit text check (length(dose_unit) <= 10),
  sort_order smallint not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  constraint care_types_id_herd_key unique (id, herd_id)
);

create unique index care_types_herd_name_idx on public.care_types (herd_id, lower(name));

create table public.care_events (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  care_type_id uuid not null,
  done_on date not null,
  dose numeric(8, 2) check (dose > 0),
  notes text check (length(notes) <= 500),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  foreign key (care_type_id, herd_id) references public.care_types (id, herd_id) on delete cascade
);

create index care_events_herd_id_idx on public.care_events (herd_id);
create index care_events_goat_type_idx on public.care_events (goat_id, care_type_id, done_on desc);

-- Every herd starts with the usual dairy-goat routine.
create function public.add_default_care_types()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.care_types (herd_id, name, interval_days, dose_unit, sort_order) values
    (new.id, 'Hoof trim', 56, null, 1),
    (new.id, 'Replamin Gel Plus', 30, null, 2),
    (new.id, 'Copper bolus', 180, 'g', 3),
    (new.id, 'CDT vaccine', 365, null, 4);
  return new;
end;
$$;

create trigger herds_add_default_care_types after insert on public.herds
for each row execute function public.add_default_care_types();

insert into public.care_types (herd_id, name, interval_days, dose_unit, sort_order)
select h.id, t.name, t.interval_days, t.dose_unit, t.sort_order
from public.herds h,
  (values ('Hoof trim', 56, null, 1), ('Replamin Gel Plus', 30, null, 2), ('Copper bolus', 180, 'g', 3), ('CDT vaccine', 365, null, 4))
    t (name, interval_days, dose_unit, sort_order);

-- ---------------------------------------------------------------------------
-- Treatments. Milk is withheld through the last dose plus the withdrawal days.
-- ---------------------------------------------------------------------------

create type public.treatment_route as enum ('oral', 'subq', 'im', 'iv', 'topical', 'intramammary', 'other');

create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  started_on date not null,
  -- Last dose, for a course of treatment. Null means a single dose on started_on.
  ended_on date,
  reason text check (length(reason) <= 200),
  medication text not null check (length(trim(medication)) between 1 and 120),
  dose text check (length(dose) <= 60),
  route public.treatment_route,
  lot_number text check (length(lot_number) <= 60),
  milk_withdrawal_days integer not null default 0 check (milk_withdrawal_days between 0 and 365),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  check (ended_on is null or ended_on >= started_on)
);

create index treatments_herd_id_idx on public.treatments (herd_id);

-- ---------------------------------------------------------------------------
-- Health checks: FAMACHA (1-5), body condition (1-5 in halves), weight.
-- ---------------------------------------------------------------------------

create table public.health_observations (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  observed_on date not null,
  famacha smallint check (famacha between 1 and 5),
  body_condition numeric(2, 1) check (body_condition between 1 and 5 and body_condition * 2 = floor(body_condition * 2)),
  weight_g integer check (weight_g between 500 and 200000),
  notes text check (length(notes) <= 1000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  check (famacha is not null or body_condition is not null or weight_g is not null)
);

create index health_observations_herd_id_idx on public.health_observations (herd_id);

create type public.test_result as enum ('negative', 'positive', 'inconclusive', 'pending');

create table public.disease_tests (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  tested_on date not null,
  -- CAE, CL, Johne's, TB, Brucellosis, Q fever, or anything else.
  disease text not null check (length(trim(disease)) between 1 and 60),
  result public.test_result not null default 'pending',
  lab text check (length(lab) <= 100),
  notes text check (length(notes) <= 1000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade
);

create index disease_tests_herd_id_idx on public.disease_tests (herd_id);

-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['care_events', 'treatments', 'health_observations', 'disease_tests'] loop
    execute format('create trigger %I before update of herd_id on public.%I for each row execute function public.keep_herd_id()', t || '_keep_herd_id', t);
  end loop;
  foreach t in array array['care_types', 'care_events', 'treatments', 'health_observations', 'disease_tests'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "members can read" on public.%I for select to authenticated using ((select public.is_herd_member(herd_id)))', t);
  end loop;
  -- Day-to-day health records: any member.
  foreach t in array array['care_events', 'treatments', 'health_observations', 'disease_tests'] loop
    execute format('create policy "members can add" on public.%I for insert to authenticated with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can edit" on public.%I for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can delete" on public.%I for delete to authenticated using ((select public.is_herd_member(herd_id)))', t);
  end loop;
end;
$$;

-- The care routine itself (types and intervals) is the owner's to set.
create policy "owners can add care types" on public.care_types
for insert to authenticated with check ((select public.is_herd_owner(herd_id)));
create policy "owners can edit care types" on public.care_types
for update to authenticated using ((select public.is_herd_owner(herd_id))) with check ((select public.is_herd_owner(herd_id)));
create policy "owners can delete care types" on public.care_types
for delete to authenticated using ((select public.is_herd_owner(herd_id)));
