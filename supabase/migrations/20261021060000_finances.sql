-- Income and expenses. Owners only: helpers never see dollar amounts.

create type public.finance_kind as enum ('income', 'expense');

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  kind public.finance_kind not null,
  category text not null,
  occurred_on date not null,
  amount_cents integer not null check (amount_cents between 1 and 100000000),
  description text check (length(description) <= 200),
  -- Who paid or was paid.
  party text check (length(party) <= 100),
  goat_id uuid,
  -- A stud fee recorded from a breeding, so it's only entered once.
  breeding_id uuid,
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete set null (goat_id),
  foreign key (breeding_id, herd_id) references public.breedings (id, herd_id) on delete set null (breeding_id),
  constraint finance_entries_category_check check (
    (kind = 'income' and category in ('milk', 'kid_sale', 'goat_sale', 'stud_service', 'other_income'))
    or (kind = 'expense' and category in ('feed', 'vet', 'minerals', 'registration', 'equipment', 'stud_fee', 'other_expense'))
  )
);

create index finance_entries_herd_date_idx on public.finance_entries (herd_id, occurred_on desc);
create index finance_entries_goat_id_idx on public.finance_entries (goat_id);
create unique index finance_entries_one_per_breeding_idx on public.finance_entries (breeding_id) where breeding_id is not null;

create trigger finance_entries_keep_herd_id before update of herd_id on public.finance_entries
for each row execute function public.keep_herd_id();

alter table public.finance_entries enable row level security;

create policy "owners can read finances" on public.finance_entries
for select to authenticated using ((select public.is_herd_owner(herd_id)));
create policy "owners can add finances" on public.finance_entries
for insert to authenticated with check ((select public.is_herd_owner(herd_id)));
create policy "owners can edit finances" on public.finance_entries
for update to authenticated using ((select public.is_herd_owner(herd_id))) with check ((select public.is_herd_owner(herd_id)));
create policy "owners can delete finances" on public.finance_entries
for delete to authenticated using ((select public.is_herd_owner(herd_id)));
