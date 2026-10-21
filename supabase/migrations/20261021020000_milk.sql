-- Lactations and daily milk weights.
--
-- A doe is "in milk" on a date when one of her lactations covers it.
-- Weights are stored in grams so totals don't depend on the herd's display
-- unit. Each row is one milking: 1 = AM, 2 = PM, 3+ = extra milkings, or
-- 0 = a whole-day total entered without a breakdown.

create extension if not exists btree_gist with schema extensions;

create table public.lactations (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  lactation_number smallint not null check (lactation_number between 1 and 30),
  freshened_on date not null,
  dried_off_on date,
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  check (dried_off_on is null or dried_off_on >= freshened_on),
  constraint lactations_no_overlap exclude using gist (
    goat_id with =,
    daterange(freshened_on, dried_off_on, '[]') with &&
  )
);

create index lactations_herd_id_idx on public.lactations (herd_id);

create table public.milk_weights (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  milked_on date not null,
  milking smallint not null check (milking between 0 and 6),
  weight_g integer not null check (weight_g between 0 and 20000),
  -- When a milking was weighed in parts (e.g. two jars), the parts in grams.
  portions_g integer[] check (portions_g is null or cardinality(portions_g) between 2 and 20),
  note text check (length(note) <= 500),
  recorded_by uuid references auth.users (id) on delete set null default auth.uid(),
  recorded_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  unique (goat_id, milked_on, milking)
);

create index milk_weights_herd_date_idx on public.milk_weights (herd_id, milked_on);

-- Only does freshen or get milked.
create function public.check_doe()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.goats where id = new.goat_id and sex = 'doe') then
    raise exception 'Only does can have lactations or milk records' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger lactations_check_doe before insert or update of goat_id on public.lactations
for each row execute function public.check_doe();
create trigger milk_weights_check_doe before insert or update of goat_id on public.milk_weights
for each row execute function public.check_doe();

create trigger lactations_keep_herd_id before update of herd_id on public.lactations
for each row execute function public.keep_herd_id();
create trigger milk_weights_keep_herd_id before update of herd_id on public.milk_weights
for each row execute function public.keep_herd_id();

-- A goat that's been milked must stay a doe.
create function public.keep_milked_goats_does()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sex <> 'doe' and (
    exists (select 1 from public.lactations where goat_id = new.id)
    or exists (select 1 from public.milk_weights where goat_id = new.id)
  ) then
    raise exception 'This goat has milk records, so it must stay a doe' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger goats_keep_milked_goats_does before update of sex on public.goats
for each row when (old.sex = 'doe' and new.sex <> 'doe')
execute function public.keep_milked_goats_does();

-- ---------------------------------------------------------------------------
-- Recording milk. These are the only way the app writes milk weights. Both
-- are safe to replay, which matters because saves made offline are retried
-- when the phone reconnects.
-- ---------------------------------------------------------------------------

-- Saves one milking for a doe on a day.
--
-- A day is either a single whole-day total (milking 0) or separate
-- milkings, never both. Recording AM or PM on a day that only has a total
-- splits it: the other one gets whatever is left of the total.
create function public.record_milking(
  p_goat_id uuid,
  p_milked_on date,
  p_milking smallint,
  p_weight_g integer,
  p_portions_g integer[] default null,
  p_note text default null
)
returns setof public.milk_weights
language plpgsql
set search_path = ''
as $$
declare
  v_herd_id uuid;
  v_day_total public.milk_weights;
  v_other smallint;
begin
  select herd_id into v_herd_id from public.goats where id = p_goat_id;
  if v_herd_id is null then
    raise exception 'Goat not found' using errcode = 'P0002';
  end if;

  if p_portions_g is not null
     and (select sum(x) from unnest(p_portions_g) x) <> p_weight_g then
    raise exception 'Portions must add up to the weight' using errcode = '23514';
  end if;

  if p_milking = 0 then
    if exists (
      select 1 from public.milk_weights
      where goat_id = p_goat_id and milked_on = p_milked_on and milking > 0
    ) then
      raise exception 'This day already has separate milkings; edit those instead' using errcode = '23514';
    end if;
  else
    select * into v_day_total from public.milk_weights
    where goat_id = p_goat_id and milked_on = p_milked_on and milking = 0
    for update;

    if found then
      if p_milking not in (1, 2) then
        raise exception 'Split the day total into AM and PM before adding an extra milking' using errcode = '23514';
      end if;
      if p_weight_g > v_day_total.weight_g then
        raise exception 'That is more than the day total' using errcode = '23514';
      end if;

      v_other := case p_milking when 1 then 2 else 1 end;
      delete from public.milk_weights where id = v_day_total.id;
      insert into public.milk_weights (herd_id, goat_id, milked_on, milking, weight_g, recorded_by)
      values (v_herd_id, p_goat_id, p_milked_on, v_other, v_day_total.weight_g - p_weight_g, (select auth.uid()));
    end if;
  end if;

  insert into public.milk_weights (herd_id, goat_id, milked_on, milking, weight_g, portions_g, note, recorded_by)
  values (v_herd_id, p_goat_id, p_milked_on, p_milking, p_weight_g, p_portions_g, nullif(trim(p_note), ''), (select auth.uid()))
  on conflict (goat_id, milked_on, milking) do update set
    weight_g = excluded.weight_g,
    portions_g = excluded.portions_g,
    note = excluded.note,
    recorded_by = excluded.recorded_by,
    recorded_at = now();

  return query
    select * from public.milk_weights
    where goat_id = p_goat_id and milked_on = p_milked_on
    order by milking;
end;
$$;

create function public.clear_milking(p_goat_id uuid, p_milked_on date, p_milking smallint)
returns void
language sql
set search_path = ''
as $$
  delete from public.milk_weights
  where goat_id = p_goat_id and milked_on = p_milked_on and milking = p_milking;
$$;

revoke execute on function public.record_milking(uuid, date, smallint, integer, integer[], text) from anon, public;
revoke execute on function public.clear_milking(uuid, date, smallint) from anon, public;
grant execute on function public.record_milking(uuid, date, smallint, integer, integer[], text) to authenticated;
grant execute on function public.clear_milking(uuid, date, smallint) to authenticated;

-- One row per doe per day, for history and (later) lactation curves.
create view public.milk_day_totals
with (security_invoker = true)
as
select
  herd_id,
  goat_id,
  milked_on,
  sum(weight_g)::integer as total_g,
  bool_or(milking = 0) as is_day_total,
  bool_or(milking = 1) as has_am,
  bool_or(milking = 2) as has_pm,
  count(*)::integer as milkings
from public.milk_weights
group by herd_id, goat_id, milked_on;

-- ---------------------------------------------------------------------------
-- Row-level security: any member can record and correct milk.
-- ---------------------------------------------------------------------------

alter table public.lactations enable row level security;
alter table public.milk_weights enable row level security;

create policy "members can read lactations" on public.lactations
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add lactations" on public.lactations
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit lactations" on public.lactations
for update to authenticated
using ((select public.is_herd_member(herd_id)))
with check ((select public.is_herd_member(herd_id)));
create policy "members can delete lactations" on public.lactations
for delete to authenticated using ((select public.is_herd_member(herd_id)));

create policy "members can read milk" on public.milk_weights
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add milk" on public.milk_weights
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit milk" on public.milk_weights
for update to authenticated
using ((select public.is_herd_member(herd_id)))
with check ((select public.is_herd_member(herd_id)));
create policy "members can delete milk" on public.milk_weights
for delete to authenticated using ((select public.is_herd_member(herd_id)));
