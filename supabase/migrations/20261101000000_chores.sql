-- Chores: farm tasks that repeat every so many days and belong to the farm
-- rather than to a goat (cleaning stalls, filling waterers...). Like routine
-- care, the app works out "next due" from the last time each was done.

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  interval_days integer not null check (interval_days between 1 and 1095),
  -- Chores the farm no longer does stay for their history but leave the list.
  hidden boolean not null default false,
  sort_order smallint not null default 0,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint chores_id_herd_key unique (id, herd_id)
);

create unique index chores_herd_name_idx on public.chores (herd_id, lower(name));

-- One time a chore was done. created_by is who did it.
create table public.chores_done (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  chore_id uuid not null,
  done_on date not null,
  notes text check (length(notes) <= 500),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (herd_id) references public.herds (id) on delete cascade,
  foreign key (chore_id, herd_id) references public.chores (id, herd_id) on delete cascade
);

create index chores_done_herd_id_idx on public.chores_done (herd_id);
create index chores_done_chore_idx on public.chores_done (chore_id, done_on desc);

create trigger chores_keep_herd_id before update of herd_id on public.chores
for each row execute function public.keep_herd_id();
create trigger chores_done_keep_herd_id before update of herd_id on public.chores_done
for each row execute function public.keep_herd_id();

-- Every herd starts with Bird's Eye Farm's chores.
create function public.add_default_chores()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.chores (herd_id, name, interval_days, sort_order) values
    (new.id, 'Clean milking equipment', 7, 1),
    (new.id, 'Fill waterers', 14, 2),
    (new.id, 'Refill mineral feeder', 14, 3),
    (new.id, 'Clean stalls', 30, 4),
    (new.id, 'Clean coop', 30, 5);
  return new;
end;
$$;

create trigger herds_add_default_chores after insert on public.herds
for each row execute function public.add_default_chores();

insert into public.chores (herd_id, name, interval_days, sort_order)
select h.id, t.name, t.interval_days, t.sort_order
from public.herds h,
  (values ('Clean milking equipment', 7, 1), ('Fill waterers', 14, 2), ('Refill mineral feeder', 14, 3), ('Clean stalls', 30, 4), ('Clean coop', 30, 5))
    t (name, interval_days, sort_order)
on conflict do nothing;

alter table public.chores enable row level security;
alter table public.chores_done enable row level security;

-- Anyone in the herd can add a chore; renaming, changing how often and hiding are the owner's.
create policy "members can read chores" on public.chores
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add chores" on public.chores
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "owners can edit chores" on public.chores
for update to authenticated using ((select public.is_herd_owner(herd_id))) with check ((select public.is_herd_owner(herd_id)));
create policy "owners can delete chores" on public.chores
for delete to authenticated using ((select public.is_herd_owner(herd_id)));

create policy "members can read chores done" on public.chores_done
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add chores done" on public.chores_done
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit chores done" on public.chores_done
for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)));
create policy "members can delete chores done" on public.chores_done
for delete to authenticated using ((select public.is_herd_member(herd_id)));
