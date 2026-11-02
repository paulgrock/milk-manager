-- Buyers, kid reservations and sales. Owners only, like Finances: these hold
-- money and customers' contact details.
--
-- A reservation holds a buyer's place in line for a doe's kids in a kidding
-- season (or any doe's). Its deposit goes into Finances the day it's
-- received. A sale is one kid or goat going to a buyer: matched to a
-- reservation once the kids are born, then sold, when the price less any
-- deposit goes into Finances and the goat is marked sold.

alter table public.kids add constraint kids_id_herd_key unique (id, herd_id);

create table public.buyers (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  phone text check (length(phone) <= 40),
  email text check (length(email) <= 200),
  town text check (length(town) <= 100),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint buyers_id_herd_key unique (id, herd_id)
);

create index buyers_herd_id_idx on public.buyers (herd_id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  buyer_id uuid not null,
  -- The year of the kidding season.
  season smallint not null check (season between 2000 and 2100),
  -- Null: any doe's kids.
  doe_id uuid,
  wants text not null default 'any' check (wants in ('doeling', 'buckling', 'wether', 'any')),
  kid_count smallint not null default 1 check (kid_count between 1 and 10),
  -- Place in line among the season's reservations for the same doe.
  position integer not null default 0,
  deposit_cents integer check (deposit_cents between 1 and 10000000),
  deposit_on date,
  -- applied: taken off the price of a sale. kept: not refunded after a cancellation.
  deposit_status text not null default 'held' check (deposit_status in ('held', 'applied', 'refunded', 'kept')),
  cancelled_on date,
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (herd_id) references public.herds (id) on delete cascade,
  -- A buyer with reservations can't be deleted.
  foreign key (buyer_id, herd_id) references public.buyers (id, herd_id),
  foreign key (doe_id, herd_id) references public.goats (id, herd_id) on delete set null (doe_id),
  check ((deposit_cents is null) = (deposit_on is null)),
  constraint reservations_id_herd_key unique (id, herd_id)
);

create index reservations_herd_season_idx on public.reservations (herd_id, season);
create index reservations_buyer_idx on public.reservations (buyer_id);
create index reservations_doe_idx on public.reservations (doe_id);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null,
  buyer_id uuid not null,
  reservation_id uuid,
  -- A kid from a kidding record, a goat in the herd, or a kid that has a goat record (both).
  kid_id uuid,
  goat_id uuid,
  price_cents integer check (price_cents between 1 and 10000000),
  -- Null while matched but not yet sold.
  sold_on date,
  pickup_on date,
  -- Set by the database when sold: the reservation's deposit, taken off the price.
  deposit_applied_cents integer not null default 0 check (deposit_applied_cents >= 0),
  notes text check (length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (herd_id) references public.herds (id) on delete cascade,
  foreign key (buyer_id, herd_id) references public.buyers (id, herd_id),
  foreign key (reservation_id, herd_id) references public.reservations (id, herd_id) on delete set null (reservation_id),
  foreign key (kid_id, herd_id) references public.kids (id, herd_id) on delete cascade,
  foreign key (goat_id, herd_id) references public.goats (id, herd_id) on delete cascade,
  check (kid_id is not null or goat_id is not null),
  check (sold_on is null or price_cents is not null),
  check (pickup_on is null or sold_on is null or pickup_on >= sold_on)
);

create index sales_herd_id_idx on public.sales (herd_id);
create index sales_buyer_idx on public.sales (buyer_id);
create index sales_reservation_idx on public.sales (reservation_id);
create unique index sales_one_per_kid_idx on public.sales (kid_id) where kid_id is not null;
create index sales_goat_idx on public.sales (goat_id);

-- Finance entries made from a deposit or a sale, so each is in the books once.
alter table public.finance_entries
  add column reservation_id uuid,
  add column sale_id uuid,
  add foreign key (reservation_id) references public.reservations (id) on delete cascade,
  add foreign key (sale_id) references public.sales (id) on delete cascade;
create unique index finance_entries_one_per_reservation_idx on public.finance_entries (reservation_id) where reservation_id is not null;
create unique index finance_entries_one_per_sale_idx on public.finance_entries (sale_id) where sale_id is not null;

do $$
declare
  t text;
begin
  foreach t in array array['buyers', 'reservations', 'sales'] loop
    execute format('create trigger %I before update of herd_id on public.%I for each row execute function public.keep_herd_id()', t || '_keep_herd_id', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "owners can read" on public.%I for select to authenticated using ((select public.is_herd_owner(herd_id)))', t);
    execute format('create policy "owners can add" on public.%I for insert to authenticated with check ((select public.is_herd_owner(herd_id)))', t);
    execute format('create policy "owners can edit" on public.%I for update to authenticated using ((select public.is_herd_owner(herd_id))) with check ((select public.is_herd_owner(herd_id)))', t);
    execute format('create policy "owners can delete" on public.%I for delete to authenticated using ((select public.is_herd_owner(herd_id)))', t);
  end loop;
end;
$$;

-- A deposit is income the day it's received; a refund takes it back out.
create function public.reservation_deposit_to_finances()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deposit_cents is not null and new.deposit_status <> 'refunded' then
    insert into public.finance_entries (herd_id, kind, category, occurred_on, amount_cents, description, party, reservation_id)
    select new.herd_id, 'income', 'kid_sale', new.deposit_on, new.deposit_cents,
      'Deposit for ' || new.season || ' kids' || coalesce(' from ' || coalesce(g.barn_name, g.registered_name), ''),
      b.name, new.id
    from public.buyers b left join public.goats g on g.id = new.doe_id
    where b.id = new.buyer_id
    on conflict (reservation_id) where reservation_id is not null do update
      set occurred_on = excluded.occurred_on, amount_cents = excluded.amount_cents,
          description = excluded.description, party = excluded.party;
  else
    delete from public.finance_entries where reservation_id = new.id;
  end if;
  return null;
end;
$$;

create trigger reservations_deposit_to_finances
after insert or update of deposit_cents, deposit_on, deposit_status, buyer_id, doe_id, season on public.reservations
for each row execute function public.reservation_deposit_to_finances();

-- When a sale is made, the reservation's deposit (if still held) comes off
-- the price. Un-selling puts it back.
create function public.sale_apply_deposit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_deposit integer;
begin
  if new.sold_on is not null and (tg_op = 'INSERT' or old.sold_on is null) then
    if new.reservation_id is not null then
      select deposit_cents into v_deposit from public.reservations
      where id = new.reservation_id and deposit_status = 'held' and deposit_cents is not null
      for update;
      if v_deposit is not null then
        new.deposit_applied_cents := least(v_deposit, new.price_cents);
        update public.reservations set deposit_status = 'applied' where id = new.reservation_id;
      end if;
    end if;
  elsif new.sold_on is null and tg_op = 'UPDATE' and old.sold_on is not null then
    if old.deposit_applied_cents > 0 then
      update public.reservations set deposit_status = 'held' where id = old.reservation_id and deposit_status = 'applied';
    end if;
    new.deposit_applied_cents := 0;
  end if;
  if new.sold_on is not null then
    new.deposit_applied_cents := least(new.deposit_applied_cents, new.price_cents);
  end if;
  return new;
end;
$$;

create trigger sales_apply_deposit
before insert or update on public.sales
for each row execute function public.sale_apply_deposit();

-- A sale puts the price, less any deposit, into Finances and marks the goat sold.
create function public.sale_to_finances()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_goat uuid;
  v_birth date;
  v_buyer text;
  v_balance integer;
begin
  if tg_op = 'DELETE' then
    if old.deposit_applied_cents > 0 then
      update public.reservations set deposit_status = 'held' where id = old.reservation_id and deposit_status = 'applied';
    end if;
    v_goat := coalesce(old.goat_id, (select goat_id from public.kids where id = old.kid_id));
    if old.sold_on is not null and v_goat is not null then
      update public.goats set status = 'active', left_herd_on = null, left_herd_reason = null where id = v_goat and status = 'sold';
    end if;
    return null;
  end if;

  v_goat := coalesce(new.goat_id, (select goat_id from public.kids where id = new.kid_id));
  select birth_date into v_birth from public.goats where id = v_goat;
  select name into v_buyer from public.buyers where id = new.buyer_id;
  v_balance := coalesce(new.price_cents, 0) - new.deposit_applied_cents;

  if new.sold_on is not null and v_balance > 0 then
    insert into public.finance_entries (herd_id, kind, category, occurred_on, amount_cents, description, party, goat_id, sale_id)
    values (
      new.herd_id, 'income',
      -- A kid is under a year old; a kid with no goat record always is.
      case when new.kid_id is not null or v_birth > new.sold_on - interval '1 year' then 'kid_sale' else 'goat_sale' end,
      new.sold_on, v_balance,
      case when new.deposit_applied_cents > 0 then 'Sale, less deposit' else 'Sale' end,
      v_buyer, v_goat, new.id
    )
    on conflict (sale_id) where sale_id is not null do update
      set category = excluded.category, occurred_on = excluded.occurred_on, amount_cents = excluded.amount_cents,
          description = excluded.description, party = excluded.party, goat_id = excluded.goat_id;
  else
    delete from public.finance_entries where sale_id = new.id;
  end if;

  if v_goat is not null then
    if new.sold_on is not null then
      update public.goats
      set status = 'sold', left_herd_on = coalesce(new.pickup_on, new.sold_on), left_herd_reason = 'Sold to ' || v_buyer
      where id = v_goat;
    elsif tg_op = 'UPDATE' and old.sold_on is not null then
      update public.goats set status = 'active', left_herd_on = null, left_herd_reason = null where id = v_goat and status = 'sold';
    end if;
  end if;
  return null;
end;
$$;

create trigger sales_to_finances
after insert or update or delete on public.sales
for each row execute function public.sale_to_finances();
