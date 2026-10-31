-- Cheese made from the herd's milk. A make is one cheese type made on one
-- day; its ready date starts as the made date plus the type's aging time
-- and can be changed for that make.

create table public.cheese_types (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  -- Whole months; 0 for fresh cheese, ready the day it's made.
  aging_months smallint not null default 0 check (aging_months between 0 and 36),
  -- Types the farm no longer makes stay for old makes but leave the dropdown.
  hidden boolean not null default false,
  sort_order smallint not null default 0,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint cheese_types_id_herd_key unique (id, herd_id)
);

create unique index cheese_types_herd_name_idx on public.cheese_types (herd_id, lower(name));

create table public.cheese_makes (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  cheese_type_id uuid not null,
  made_on date not null,
  ready_on date not null,
  milk_gallons numeric(6, 2) check (milk_gallons > 0 and milk_gallons <= 1000),
  notes text check (length(notes) <= 2000),
  -- All eaten, sold or given away.
  finished_on date,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  -- Deleting the herd deletes its makes; a type with makes can't be deleted on its own, only hidden.
  foreign key (herd_id) references public.herds (id) on delete cascade,
  foreign key (cheese_type_id, herd_id) references public.cheese_types (id, herd_id),
  check (ready_on >= made_on),
  check (finished_on is null or finished_on >= made_on)
);

create index cheese_makes_herd_made_idx on public.cheese_makes (herd_id, made_on desc);
create index cheese_makes_type_idx on public.cheese_makes (cheese_type_id);

create trigger cheese_types_keep_herd_id before update of herd_id on public.cheese_types
for each row execute function public.keep_herd_id();
create trigger cheese_makes_keep_herd_id before update of herd_id on public.cheese_makes
for each row execute function public.keep_herd_id();

-- Every herd starts with the cheeses Bird's Eye Farm makes.
create function public.add_default_cheese_types()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cheese_types (herd_id, name, aging_months, sort_order) values
    (new.id, 'Chèvre', 0, 1),
    (new.id, 'Mozzarella', 0, 2),
    (new.id, 'Valençay', 1, 3),
    (new.id, 'Feta', 2, 4),
    (new.id, 'Tomme', 4, 5),
    (new.id, 'Cheddar', 6, 6);
  return new;
end;
$$;

create trigger herds_add_default_cheese_types after insert on public.herds
for each row execute function public.add_default_cheese_types();

insert into public.cheese_types (herd_id, name, aging_months, sort_order)
select h.id, t.name, t.aging_months, t.sort_order
from public.herds h,
  (values ('Chèvre', 0, 1), ('Mozzarella', 0, 2), ('Valençay', 1, 3), ('Feta', 2, 4), ('Tomme', 4, 5), ('Cheddar', 6, 6))
    t (name, aging_months, sort_order)
on conflict do nothing;

alter table public.cheese_types enable row level security;
alter table public.cheese_makes enable row level security;

-- Anyone in the herd can add a type (e.g. from the dropdown while recording a
-- make); renaming, changing the aging time and hiding are the owner's.
create policy "members can read cheese types" on public.cheese_types
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add cheese types" on public.cheese_types
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "owners can edit cheese types" on public.cheese_types
for update to authenticated using ((select public.is_herd_owner(herd_id))) with check ((select public.is_herd_owner(herd_id)));
create policy "owners can delete cheese types" on public.cheese_types
for delete to authenticated using ((select public.is_herd_owner(herd_id)));

create policy "members can read cheese makes" on public.cheese_makes
for select to authenticated using ((select public.is_herd_member(herd_id)));
create policy "members can add cheese makes" on public.cheese_makes
for insert to authenticated with check ((select public.is_herd_member(herd_id)));
create policy "members can edit cheese makes" on public.cheese_makes
for update to authenticated using ((select public.is_herd_member(herd_id))) with check ((select public.is_herd_member(herd_id)));
create policy "members can delete cheese makes" on public.cheese_makes
for delete to authenticated using ((select public.is_herd_member(herd_id)));

-- Cheese sales get their own income category.
alter table public.finance_entries drop constraint finance_entries_category_check;
alter table public.finance_entries add constraint finance_entries_category_check check (
  (kind = 'income' and category in ('milk', 'cheese_sale', 'kid_sale', 'goat_sale', 'stud_service', 'other_income'))
  or (kind = 'expense' and category in ('feed', 'vet', 'minerals', 'registration', 'equipment', 'stud_fee', 'other_expense'))
);
