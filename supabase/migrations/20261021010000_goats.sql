-- Goats, linear appraisals and photos.
-- Outside sires and dams are stored as goats with status 'reference' so
-- pedigrees can link all the way up.

create type public.goat_sex as enum ('doe', 'buck', 'wether');
create type public.goat_status as enum ('active', 'for_sale', 'sold', 'deceased', 'reference');
create type public.horn_status as enum ('disbudded', 'polled', 'horned', 'unknown');

create table public.goats (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,

  registered_name text check (length(registered_name) <= 200),
  barn_name text check (length(barn_name) <= 100),
  -- e.g. "GCH" / "SGCH" before the name, "5*M *D" / "+*B" after it.
  title_prefix text check (length(title_prefix) <= 50),
  title_suffix text check (length(title_suffix) <= 50),

  sex public.goat_sex not null,
  breed text check (length(breed) <= 100),
  -- ADGA herd book: Purebred, American, Experimental, Recorded Grade.
  breed_category text check (breed_category in ('purebred', 'american', 'experimental', 'recorded_grade')),
  birth_date date,
  color_markings text check (length(color_markings) <= 200),
  horn_status public.horn_status not null default 'unknown',

  registry text check (length(registry) <= 50),
  registration_number text check (length(registration_number) <= 50),
  pedigree_url text check (pedigree_url ~* '^https?://'),
  tattoo_left text check (length(tattoo_left) <= 20),
  tattoo_right text check (length(tattoo_right) <= 20),
  scrapie_tag text check (length(scrapie_tag) <= 50),
  microchip text check (length(microchip) <= 50),

  sire_id uuid,
  dam_id uuid,

  status public.goat_status not null default 'active',
  left_herd_on date,
  left_herd_reason text check (length(left_herd_reason) <= 500),
  notes text check (length(notes) <= 10000),

  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint goats_has_a_name check (
    coalesce(trim(registered_name), '') <> '' or coalesce(trim(barn_name), '') <> ''
  ),
  -- Lets child tables use (goat_id, herd_id) foreign keys so a row can't
  -- point at a goat in another herd.
  constraint goats_id_herd_key unique (id, herd_id),
  constraint goats_sire_fk foreign key (sire_id, herd_id)
    references public.goats (id, herd_id) on delete set null (sire_id),
  constraint goats_dam_fk foreign key (dam_id, herd_id)
    references public.goats (id, herd_id) on delete set null (dam_id)
);

create index goats_herd_id_idx on public.goats (herd_id);
create index goats_sire_id_idx on public.goats (sire_id);
create index goats_dam_id_idx on public.goats (dam_id);

-- Sire must be a buck, dam a doe, and a goat can't be its own ancestor.
create function public.check_goat_parents()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sire_id is not null and not exists (
    select 1 from public.goats where id = new.sire_id and sex = 'buck'
  ) then
    raise exception 'Sire must be a buck' using errcode = '23514';
  end if;

  if new.dam_id is not null and not exists (
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

create trigger goats_check_parents
before insert or update of sire_id, dam_id, sex on public.goats
for each row execute function public.check_goat_parents();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger goats_touch_updated_at
before update on public.goats
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Linear appraisal. Each trait is scored E (Excellent), V (Very Good),
-- G (Good Plus), A (Acceptable), F (Fair) or P (Poor). Bucks have no
-- mammary score.
-- ---------------------------------------------------------------------------

create table public.linear_appraisals (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  appraised_on date not null,
  general_appearance char(1) not null check (general_appearance in ('E', 'V', 'G', 'A', 'F', 'P')),
  dairy_strength char(1) not null check (dairy_strength in ('E', 'V', 'G', 'A', 'F', 'P')),
  body_capacity char(1) not null check (body_capacity in ('E', 'V', 'G', 'A', 'F', 'P')),
  mammary_system char(1) check (mammary_system in ('E', 'V', 'G', 'A', 'F', 'P')),
  final_score smallint not null check (final_score between 50 and 99),
  appraiser text check (length(appraiser) <= 100),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade
);

create index linear_appraisals_herd_id_idx on public.linear_appraisals (herd_id);
create index linear_appraisals_goat_id_idx on public.linear_appraisals (goat_id, appraised_on desc);

-- ---------------------------------------------------------------------------
-- Photos. Files live in the private goat-photos bucket at
-- <herd_id>/<goat_id>/<photo id>.<ext>; this table holds the metadata.
-- ---------------------------------------------------------------------------

create table public.goat_photos (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  goat_id uuid not null,
  storage_path text not null unique,
  kind text not null default 'other' check (kind in ('conformation', 'head', 'udder', 'other')),
  is_primary boolean not null default false,
  taken_on date,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  check (storage_path like herd_id::text || '/' || goat_id::text || '/%')
);

create index goat_photos_herd_id_idx on public.goat_photos (herd_id);
create unique index goat_photos_one_primary_idx on public.goat_photos (goat_id) where is_primary;

-- Makes one photo primary. Clears the old one first: the unique index is
-- checked row by row, so doing both in one update could collide.
create function public.set_primary_photo(photo_id uuid)
returns void
language sql
set search_path = ''
as $$
  update public.goat_photos
  set is_primary = false
  where is_primary and id <> photo_id
    and goat_id = (select goat_id from public.goat_photos where id = photo_id);

  update public.goat_photos set is_primary = true where id = photo_id;
$$;

revoke execute on function public.set_primary_photo(uuid) from anon, public;
grant execute on function public.set_primary_photo(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('goat-photos', 'goat-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- ---------------------------------------------------------------------------
-- Row-level security: any member can read and record; only owners delete
-- goats. Appraisals and photos can be removed by any member.
-- ---------------------------------------------------------------------------

alter table public.goats enable row level security;
alter table public.linear_appraisals enable row level security;
alter table public.goat_photos enable row level security;

create policy "members can read goats" on public.goats
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add goats" on public.goats
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit goats" on public.goats
for update to authenticated
using ((select public.is_herd_member(herd_id)))
with check ((select public.is_herd_member(herd_id)));
create policy "owners can delete goats" on public.goats
for delete to authenticated using ((select public.is_herd_owner(herd_id)));

create policy "members can read appraisals" on public.linear_appraisals
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add appraisals" on public.linear_appraisals
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit appraisals" on public.linear_appraisals
for update to authenticated
using ((select public.is_herd_member(herd_id)))
with check ((select public.is_herd_member(herd_id)));
create policy "members can delete appraisals" on public.linear_appraisals
for delete to authenticated using ((select public.is_herd_member(herd_id)));

create policy "members can read photos" on public.goat_photos
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add photos" on public.goat_photos
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit photos" on public.goat_photos
for update to authenticated
using ((select public.is_herd_member(herd_id)))
with check ((select public.is_herd_member(herd_id)));
create policy "members can delete photos" on public.goat_photos
for delete to authenticated using ((select public.is_herd_member(herd_id)));

-- Storage: the first folder of the path is the herd id.
create function public.storage_path_herd(path text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return (storage.foldername(path))[1]::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create policy "members can read goat photo files" on storage.objects
for select to authenticated
using (bucket_id = 'goat-photos' and (select public.is_herd_member(public.storage_path_herd(name))));
create policy "members can upload goat photo files" on storage.objects
for insert to authenticated
with check (bucket_id = 'goat-photos' and (select public.is_herd_member(public.storage_path_herd(name))));
create policy "members can delete goat photo files" on storage.objects
for delete to authenticated
using (bucket_id = 'goat-photos' and (select public.is_herd_member(public.storage_path_herd(name))));

-- Records never move between herds.
create function public.keep_herd_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.herd_id <> old.herd_id then
    raise exception 'Records cannot be moved to another herd' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger goats_keep_herd_id before update of herd_id on public.goats
for each row execute function public.keep_herd_id();
create trigger linear_appraisals_keep_herd_id before update of herd_id on public.linear_appraisals
for each row execute function public.keep_herd_id();
create trigger goat_photos_keep_herd_id before update of herd_id on public.goat_photos
for each row execute function public.keep_herd_id();
