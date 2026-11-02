-- The order does are milked in, so the milk entry list matches the milking
-- stand. Null goes after the rest, by name.
alter table public.goats add column milking_position smallint check (milking_position between 1 and 1000);

-- Sets the order in one go. Runs as the caller, so RLS keeps it to goats in
-- their own herd; anyone who milks can change it.
create function public.set_milking_order(goat_ids uuid[])
returns void
language sql
set search_path = ''
as $$
  update public.goats g
  set milking_position = o.position
  from unnest(goat_ids) with ordinality as o (id, position)
  where g.id = o.id;
$$;

revoke execute on function public.set_milking_order(uuid[]) from public, anon;
grant execute on function public.set_milking_order(uuid[]) to authenticated;
