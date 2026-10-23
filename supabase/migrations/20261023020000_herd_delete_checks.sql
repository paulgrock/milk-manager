-- Deleting a herd (or a goat) clears links to the deleted goats: a
-- breeding's buck, a goat's sire or dam. Those updates re-ran the parent and
-- breeding checks against a herd half-way through being deleted, where the
-- doe or the other parent was already gone, so the whole delete failed.
-- The checks now only look at the parent or doe that actually changed.

create or replace function public.check_goat_parents()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sire_id is not null and (tg_op = 'INSERT' or new.sire_id is distinct from old.sire_id) and not exists (
    select 1 from public.goats where id = new.sire_id and sex = 'buck'
  ) then
    raise exception 'Sire must be a buck' using errcode = '23514';
  end if;

  if new.dam_id is not null and (tg_op = 'INSERT' or new.dam_id is distinct from old.dam_id) and not exists (
    select 1 from public.goats where id = new.dam_id and sex = 'doe'
  ) then
    raise exception 'Dam must be a doe' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and new.sex is distinct from old.sex then
    if new.sex <> 'buck' and exists (select 1 from public.goats where sire_id = new.id) then
      raise exception 'This goat is listed as a sire, so it must stay a buck' using errcode = '23514';
    end if;
    if new.sex <> 'doe' and exists (select 1 from public.goats where dam_id = new.id) then
      raise exception 'This goat is listed as a dam, so it must stay a doe' using errcode = '23514';
    end if;
  end if;

  if new.id in (new.sire_id, new.dam_id) then
    raise exception 'A goat cannot be its own parent' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and exists (
    with recursive ancestors (id) as (
      select unnest(array[new.sire_id, new.dam_id])
      union
      select unnest(array[g.sire_id, g.dam_id])
      from public.goats g join ancestors a on g.id = a.id
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'A goat cannot be its own ancestor' using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.check_breeding_sexes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT' or new.doe_id is distinct from old.doe_id)
    and not exists (select 1 from public.goats where id = new.doe_id and sex = 'doe') then
    raise exception 'Only does can be bred or kid' using errcode = '23514';
  end if;
  -- Nested: PL/pgSQL would read new.buck_id even when the table check is false.
  if tg_table_name = 'breedings' then
    if new.buck_id is not null and (tg_op = 'INSERT' or new.buck_id is distinct from old.buck_id) and not exists (select 1 from public.goats where id = new.buck_id and sex = 'buck') then
      raise exception 'The sire must be a buck' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
