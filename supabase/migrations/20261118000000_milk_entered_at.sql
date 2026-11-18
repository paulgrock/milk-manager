-- When a milking was typed on the phone, as opposed to recorded_at, when the
-- server saved it. They differ when a save made offline is sent later.
--
-- The phone's clock decides entered_at, so it isn't trusted blindly: a time
-- in the future becomes now, and one more than 30 days old (or missing, from
-- a save queued before this existed) falls back to now.

alter table public.milk_weights add column entered_at timestamptz;
update public.milk_weights set entered_at = recorded_at;
alter table public.milk_weights
  alter column entered_at set not null,
  alter column entered_at set default now();

drop function public.record_milking(uuid, date, smallint, integer, integer[], text);

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
  p_note text default null,
  p_entered_at timestamptz default null
)
returns setof public.milk_weights
language plpgsql
set search_path = ''
as $$
declare
  v_herd_id uuid;
  v_day_total public.milk_weights;
  v_other smallint;
  v_entered_at timestamptz := case
    when p_entered_at is null or p_entered_at < now() - interval '30 days' then now()
    else least(p_entered_at, now())
  end;
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
      insert into public.milk_weights (herd_id, goat_id, milked_on, milking, weight_g, recorded_by, entered_at)
      values (v_herd_id, p_goat_id, p_milked_on, v_other, v_day_total.weight_g - p_weight_g, (select auth.uid()), v_entered_at);
    end if;
  end if;

  insert into public.milk_weights (herd_id, goat_id, milked_on, milking, weight_g, portions_g, note, recorded_by, entered_at)
  values (v_herd_id, p_goat_id, p_milked_on, p_milking, p_weight_g, p_portions_g, nullif(trim(p_note), ''), (select auth.uid()), v_entered_at)
  on conflict (goat_id, milked_on, milking) do update set
    weight_g = excluded.weight_g,
    portions_g = excluded.portions_g,
    note = excluded.note,
    recorded_by = excluded.recorded_by,
    recorded_at = now(),
    entered_at = excluded.entered_at;

  return query
    select * from public.milk_weights
    where goat_id = p_goat_id and milked_on = p_milked_on
    order by milking;
end;
$$;

revoke execute on function public.record_milking(uuid, date, smallint, integer, integer[], text, timestamptz) from anon, public;
grant execute on function public.record_milking(uuid, date, smallint, integer, integer[], text, timestamptz) to authenticated;
