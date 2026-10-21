-- Herds, membership and invites.
-- Every later table (goats, milk, breeding, ...) carries a herd_id and uses
-- is_herd_member / is_herd_owner in its row-level security policies.

create type public.herd_role as enum ('owner', 'helper');
create type public.weight_unit as enum ('lb', 'kg');

create table public.herds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  weight_unit public.weight_unit not null default 'lb',
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.herd_members (
  herd_id uuid not null references public.herds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.herd_role not null,
  display_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (herd_id, user_id)
);

create index herd_members_user_id_idx on public.herd_members (user_id);

create table public.herd_invites (
  id uuid primary key default gen_random_uuid(),
  herd_id uuid not null references public.herds (id) on delete cascade,
  email text not null check (email = lower(trim(email)) and email like '%_@_%'),
  role public.herd_role not null default 'helper',
  invited_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create unique index herd_invites_herd_email_idx on public.herd_invites (herd_id, email);

-- ---------------------------------------------------------------------------
-- Permission helpers. security definer so policies on herd_members can call
-- them without recursing into herd_members' own policies.
-- ---------------------------------------------------------------------------

create function public.is_herd_member(target_herd uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.herd_members
    where herd_id = target_herd and user_id = (select auth.uid())
  );
$$;

create function public.is_herd_owner(target_herd uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.herd_members
    where herd_id = target_herd and user_id = (select auth.uid()) and role = 'owner'
  );
$$;

create function public.current_user_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt()) ->> 'email', ''));
$$;

-- Name shown in "milked by" / "trimmed by": profile name if set, else the
-- part of the email before the @.
create function public.current_user_display_name()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(trim((select auth.jwt()) -> 'user_metadata' ->> 'full_name'), ''),
    split_part(public.current_user_email(), '@', 1)
  );
$$;

-- ---------------------------------------------------------------------------
-- RPCs. Herds and memberships are only created through these, never by a
-- direct insert, so a user can't add themselves to someone else's herd.
-- ---------------------------------------------------------------------------

create function public.create_herd(herd_name text)
returns public.herds
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_herd public.herds;
begin
  if (select auth.uid()) is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  insert into public.herds (name, created_by)
  values (trim(herd_name), (select auth.uid()))
  returning * into new_herd;

  insert into public.herd_members (herd_id, user_id, role, display_name, email)
  values (
    new_herd.id,
    (select auth.uid()),
    'owner',
    public.current_user_display_name(),
    public.current_user_email()
  );

  return new_herd;
end;
$$;

create function public.accept_invite(invite_id uuid)
returns public.herd_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.herd_invites;
  member public.herd_members;
begin
  select * into invite from public.herd_invites
  where id = invite_id and email = public.current_user_email();

  if not found then
    raise exception 'Invite not found' using errcode = 'P0002';
  end if;

  insert into public.herd_members (herd_id, user_id, role, display_name, email)
  values (
    invite.herd_id,
    (select auth.uid()),
    invite.role,
    public.current_user_display_name(),
    public.current_user_email()
  )
  on conflict (herd_id, user_id) do update set role = excluded.role
  returning * into member;

  delete from public.herd_invites where id = invite.id;

  return member;
end;
$$;

revoke execute on function public.create_herd(text) from anon, public;
revoke execute on function public.accept_invite(uuid) from anon, public;
grant execute on function public.create_herd(text) to authenticated;
grant execute on function public.accept_invite(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- A herd must always keep at least one owner.
-- ---------------------------------------------------------------------------

create function public.keep_last_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role <> 'owner' then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' then
    return new;
  end if;
  -- Deleting the herd itself cascades here; allow that.
  if not exists (select 1 from public.herds where id = old.herd_id) then
    return coalesce(new, old);
  end if;
  if not exists (
    select 1 from public.herd_members
    where herd_id = old.herd_id and role = 'owner' and user_id <> old.user_id
  ) then
    raise exception 'A herd needs at least one owner' using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger herd_members_keep_last_owner
before update or delete on public.herd_members
for each row execute function public.keep_last_owner();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.herds enable row level security;
alter table public.herd_members enable row level security;
alter table public.herd_invites enable row level security;

create policy "members can read their herds"
on public.herds for select to authenticated
using ((select public.is_herd_member(id)));

create policy "owners can update their herds"
on public.herds for update to authenticated
using ((select public.is_herd_owner(id)))
with check ((select public.is_herd_owner(id)));

create policy "owners can delete their herds"
on public.herds for delete to authenticated
using ((select public.is_herd_owner(id)));

create policy "members can see who else is in the herd"
on public.herd_members for select to authenticated
using ((select public.is_herd_member(herd_id)));

create policy "owners can change roles"
on public.herd_members for update to authenticated
using ((select public.is_herd_owner(herd_id)))
with check ((select public.is_herd_owner(herd_id)));

create policy "owners can remove members and anyone can leave"
on public.herd_members for delete to authenticated
using ((select public.is_herd_owner(herd_id)) or user_id = (select auth.uid()));

create policy "owners and the invitee can see invites"
on public.herd_invites for select to authenticated
using ((select public.is_herd_owner(herd_id)) or email = (select public.current_user_email()));

create policy "owners can invite"
on public.herd_invites for insert to authenticated
with check ((select public.is_herd_owner(herd_id)));

create policy "owners can cancel and the invitee can decline"
on public.herd_invites for delete to authenticated
using ((select public.is_herd_owner(herd_id)) or email = (select public.current_user_email()));

-- Invitees need the herd's name before they've joined.
create function public.pending_invites()
returns table (id uuid, herd_id uuid, herd_name text, role public.herd_role, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.herd_id, h.name, i.role, i.created_at
  from public.herd_invites i
  join public.herds h on h.id = i.herd_id
  where i.email = public.current_user_email()
  order by i.created_at;
$$;

revoke execute on function public.pending_invites() from anon, public;
grant execute on function public.pending_invites() to authenticated;

-- Limit which columns can be changed directly; everything else goes through RPCs.
revoke insert, update on public.herds from authenticated, anon;
grant update (name, weight_unit) on public.herds to authenticated;

revoke insert, update on public.herd_members from authenticated, anon;
grant update (role) on public.herd_members to authenticated;

revoke update on public.herd_invites from authenticated, anon;
revoke insert on public.herd_invites from anon;
