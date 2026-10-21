-- Heats, breedings, pregnancy checks and kiddings.
--
-- A breeding's status (bred, confirmed, open, kidded) isn't stored; the app
-- works it out from its pregnancy checks and whether a kidding followed, so
-- it can never disagree with the records.

create type public.breeding_method as enum ('hand', 'pen', 'ai');
create type public.pregnancy_check_method as enum ('blood', 'ultrasound', 'observation');
create type public.pregnancy_result as enum ('pregnant', 'open', 'unsure');
create type public.kidding_difficulty as enum ('unassisted', 'assisted', 'vet');
create type public.kid_outcome as enum ('alive', 'stillborn', 'died');

create table public.heats (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  observed_on date not null,
  signs text check (length(signs) <= 500),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade
);

create index heats_herd_id_idx on public.heats (herd_id);

create table public.breedings (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  doe_id uuid not null,
  buck_id uuid,
  method public.breeding_method not null default 'hand',
  bred_on date not null,
  -- Pen breeding: the last day the buck was in with her.
  exposure_end date,
  service_fee_cents integer check (service_fee_cents between 0 and 10000000),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (doe_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  foreign key (buck_id, herd_id) references public.goats (id, herd_id) on delete set null (buck_id),
  constraint breedings_id_herd_key unique (id, herd_id),
  check (exposure_end is null or (method = 'pen' and exposure_end >= bred_on))
);

create index breedings_herd_id_idx on public.breedings (herd_id);
create index breedings_doe_id_idx on public.breedings (doe_id, bred_on desc);

create table public.pregnancy_checks (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  breeding_id uuid not null,
  checked_on date not null,
  method public.pregnancy_check_method not null,
  result public.pregnancy_result not null,
  notes text check (length(notes) <= 1000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (breeding_id, herd_id) references public.breedings (id, herd_id) on delete cascade
);

create index pregnancy_checks_herd_id_idx on public.pregnancy_checks (herd_id);

create table public.kiddings (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  doe_id uuid not null,
  breeding_id uuid,
  kidded_on date not null,
  difficulty public.kidding_difficulty not null default 'unassisted',
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (doe_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  foreign key (breeding_id, herd_id) references public.breedings (id, herd_id) on delete set null (breeding_id),
  constraint kiddings_id_herd_key unique (id, herd_id)
);

create index kiddings_herd_id_idx on public.kiddings (herd_id);
create unique index kiddings_one_per_breeding_idx on public.kiddings (breeding_id) where breeding_id is not null;

create table public.kids (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  kidding_id uuid not null,
  sex public.goat_sex not null check (sex in ('doe', 'buck')),
  birth_weight_g integer check (birth_weight_g between 100 and 10000),
  outcome public.kid_outcome not null default 'alive',
  -- The goat record made for this kid, if one was.
  goat_id uuid,
  notes text check (length(notes) <= 500),
  foreign key (kidding_id, herd_id) references public.kiddings (id, herd_id) on delete cascade,
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete set null (goat_id)
);

create index kids_herd_id_idx on public.kids (herd_id);

-- ---------------------------------------------------------------------------
-- Sex checks: does are bred and kid, the sire is a buck.
-- ---------------------------------------------------------------------------

create function public.check_breeding_sexes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.goats where id = new.doe_id and sex = 'doe') then
    raise exception 'Only does can be bred or kid' using errcode = '23514';
  end if;
  -- Nested: PL/pgSQL would read new.buck_id even when the table check is false.
  if tg_table_name = 'breedings' then
    if new.buck_id is not null and not exists (select 1 from public.goats where id = new.buck_id and sex = 'buck') then
      raise exception 'The sire must be a buck' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger breedings_check_sexes before insert or update of doe_id, buck_id on public.breedings
for each row execute function public.check_breeding_sexes();
create trigger kiddings_check_sexes before insert or update of doe_id on public.kiddings
for each row execute function public.check_breeding_sexes();
create trigger heats_check_doe before insert or update of goat_id on public.heats
for each row execute function public.check_doe();

-- A kidding's breeding must be hers.
create function public.check_kidding_breeding()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.breeding_id is not null and not exists (
    select 1 from public.breedings
    where id = new.breeding_id and doe_id = new.doe_id and bred_on < new.kidded_on
  ) then
    raise exception 'That breeding is not this doe''s, or is after the kidding date' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger kiddings_check_breeding before insert or update of breeding_id, doe_id, kidded_on on public.kiddings
for each row execute function public.check_kidding_breeding();

create trigger heats_keep_herd_id before update of herd_id on public.heats
for each row execute function public.keep_herd_id();
create trigger breedings_keep_herd_id before update of herd_id on public.breedings
for each row execute function public.keep_herd_id();
create trigger pregnancy_checks_keep_herd_id before update of herd_id on public.pregnancy_checks
for each row execute function public.keep_herd_id();
create trigger kiddings_keep_herd_id before update of herd_id on public.kiddings
for each row execute function public.keep_herd_id();
create trigger kids_keep_herd_id before update of herd_id on public.kids
for each row execute function public.keep_herd_id();

-- Goats that have bred or kidded keep their sex, like sires and dams do.
create function public.keep_breeding_goats_sex()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.sex = 'doe' and new.sex <> 'doe' and (
    exists (select 1 from public.breedings where doe_id = new.id)
    or exists (select 1 from public.kiddings where doe_id = new.id)
    or exists (select 1 from public.heats where goat_id = new.id)
  ) then
    raise exception 'This goat has breeding records, so it must stay a doe' using errcode = '23514';
  end if;
  if old.sex = 'buck' and new.sex <> 'buck' and exists (select 1 from public.breedings where buck_id = new.id) then
    raise exception 'This goat has sired breedings, so it must stay a buck' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger goats_keep_breeding_goats_sex before update of sex on public.goats
for each row when (old.sex is distinct from new.sex)
execute function public.keep_breeding_goats_sex();

-- ---------------------------------------------------------------------------
-- Row-level security: any member can record; that's day-to-day barn work.
-- ---------------------------------------------------------------------------

alter table public.heats enable row level security;
alter table public.breedings enable row level security;
alter table public.pregnancy_checks enable row level security;
alter table public.kiddings enable row level security;
alter table public.kids enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['heats', 'breedings', 'pregnancy_checks', 'kiddings', 'kids'] loop
    execute format('create policy "members can read" on public.%I for select to authenticated using ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can add" on public.%I for insert to authenticated with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can edit" on public.%I for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)))', t);
    execute format('create policy "members can delete" on public.%I for delete to authenticated using ((select public.is_herd_member(herd_id)))', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Recording a kidding, all in one go: the kidding, each kid, goat records
-- for kids staying in the herd (with dam, sire and birth date filled in),
-- and the dam's new lactation.
--
-- p_kids is a JSON array of
--   { sex: 'doe'|'buck', outcome?: 'alive'|'stillborn'|'died',
--     birth_weight_g?: int, notes?: text, add_to_herd?: bool, name?: text }
-- ---------------------------------------------------------------------------

create function public.record_kidding(
  p_doe_id uuid,
  p_kidded_on date,
  p_breeding_id uuid default null,
  p_difficulty public.kidding_difficulty default 'unassisted',
  p_notes text default null,
  p_kids jsonb default '[]'::jsonb,
  p_start_lactation boolean default true
)
returns public.kiddings
language plpgsql
set search_path = ''
as $$
declare
  v_doe public.goats;
  v_sire public.goats;
  v_kidding public.kiddings;
  v_kid jsonb;
  v_n integer := 0;
  v_goat_id uuid;
  v_outcome public.kid_outcome;
begin
  select * into v_doe from public.goats where id = p_doe_id;
  if not found then
    raise exception 'Goat not found' using errcode = 'P0002';
  end if;
  if jsonb_typeof(p_kids) <> 'array' or jsonb_array_length(p_kids) > 8 then
    raise exception 'Kids must be a list of up to 8' using errcode = '22023';
  end if;

  if p_breeding_id is not null then
    select g.* into v_sire from public.breedings b join public.goats g on g.id = b.buck_id where b.id = p_breeding_id;
  end if;

  insert into public.kiddings (herd_id, doe_id, breeding_id, kidded_on, difficulty, notes)
  values (v_doe.herd_id, p_doe_id, p_breeding_id, p_kidded_on, p_difficulty, nullif(trim(p_notes), ''))
  returning * into v_kidding;

  for v_kid in select value from jsonb_array_elements(p_kids) loop
    v_n := v_n + 1;
    v_goat_id := null;
    v_outcome := coalesce(v_kid ->> 'outcome', 'alive')::public.kid_outcome;

    if v_outcome = 'alive' and coalesce((v_kid ->> 'add_to_herd')::boolean, false) then
      insert into public.goats (herd_id, barn_name, sex, birth_date, dam_id, sire_id, breed)
      values (
        v_doe.herd_id,
        coalesce(nullif(trim(v_kid ->> 'name'), ''), coalesce(v_doe.barn_name, v_doe.registered_name) || ' kid ' || v_n),
        (v_kid ->> 'sex')::public.goat_sex,
        p_kidded_on,
        p_doe_id,
        v_sire.id,
        -- Same breed as the dam when the sire matches or is unknown.
        case when v_sire.id is null or v_sire.breed is null or v_sire.breed = v_doe.breed then v_doe.breed end
      )
      returning id into v_goat_id;
    end if;

    insert into public.kids (herd_id, kidding_id, sex, birth_weight_g, outcome, goat_id, notes)
    values (
      v_doe.herd_id,
      v_kidding.id,
      (v_kid ->> 'sex')::public.goat_sex,
      (v_kid ->> 'birth_weight_g')::integer,
      v_outcome,
      v_goat_id,
      nullif(trim(v_kid ->> 'notes'), '')
    );
  end loop;

  if p_start_lactation and not exists (
    select 1 from public.lactations where goat_id = p_doe_id and freshened_on = p_kidded_on
  ) then
    -- A doe milked through to kidding is dried off the day before.
    update public.lactations
    set dried_off_on = p_kidded_on - 1
    where goat_id = p_doe_id
      and freshened_on < p_kidded_on
      and (dried_off_on is null or dried_off_on >= p_kidded_on);

    insert into public.lactations (herd_id, goat_id, lactation_number, freshened_on)
    values (
      v_doe.herd_id,
      p_doe_id,
      coalesce((select max(lactation_number) from public.lactations where goat_id = p_doe_id), 0) + 1,
      p_kidded_on
    );
  end if;

  return v_kidding;
end;
$$;

revoke execute on function public.record_kidding(uuid, date, uuid, public.kidding_difficulty, text, jsonb, boolean) from anon, public;
grant execute on function public.record_kidding(uuid, date, uuid, public.kidding_difficulty, text, jsonb, boolean) to authenticated;
