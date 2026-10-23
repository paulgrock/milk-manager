-- A readable name for each goat's page address (/goats/ina-may), unique
-- within the herd. Made from the barn name, or the registered name when
-- there's no barn name, and kept in step when those change.

alter table public.goats add column slug text;

create function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(trim(both '-' from regexp_replace(lower(regexp_replace(coalesce(value, ''), '[''’]', '', 'g')), '[^a-z0-9]+', '-', 'g')), '')
$$;

create function public.set_goat_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base text := left(coalesce(public.slugify(new.barn_name), public.slugify(new.registered_name), 'goat'), 60);
  candidate text;
  n integer := 1;
begin
  -- /goats/new is the add-goat page.
  if base = 'new' then
    base := 'new-goat';
  end if;
  candidate := base;
  if tg_op = 'UPDATE' and old.slug is not null
    and new.barn_name is not distinct from old.barn_name
    and new.registered_name is not distinct from old.registered_name then
    new.slug := old.slug;
    return new;
  end if;
  -- The current slug still fits (e.g. "ina-2" when only the registered name changed).
  if tg_op = 'UPDATE' and (old.slug = base or old.slug ~ ('^' || base || '-[0-9]+$')) then
    new.slug := old.slug;
    return new;
  end if;
  while exists (select 1 from public.goats g where g.herd_id = new.herd_id and g.slug = candidate and g.id <> new.id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

create trigger goats_set_slug before insert or update on public.goats
for each row execute function public.set_goat_slug();

-- Existing goats, oldest first so the first Ina keeps "ina".
do $$
declare
  g record;
begin
  for g in select id from public.goats order by created_at, id loop
    update public.goats set slug = null where id = g.id;
  end loop;
end;
$$;

-- Always set by the trigger; the default only makes it optional when inserting.
alter table public.goats alter column slug set not null, alter column slug set default '';
alter table public.goats add constraint goats_herd_slug_key unique (herd_id, slug);
