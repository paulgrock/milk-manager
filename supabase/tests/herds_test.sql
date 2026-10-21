begin;
select plan(16);

-- Three users: an owner, a helper they invite, and a stranger.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

-- Owner creates a herd ------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');

select lives_ok($$ select public.create_herd('Test Farm') $$, 'a signed-in user can create a herd');
select is((select role::text from herd_members), 'owner', 'creator becomes the owner');
select is((select display_name from herd_members), 'owner', 'display name defaults to the email name');

select throws_ok(
  $$ insert into herds (name) values ('Sneaky') $$,
  '42501', null, 'herds cannot be inserted directly'
);

select lives_ok(
  $$ insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds $$,
  'owner can invite a helper'
);

-- A stranger sees nothing ---------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

select is_empty($$ select * from herds $$, 'stranger cannot see the herd');
select is_empty($$ select * from herd_invites $$, 'stranger cannot see invites for others');
select throws_ok(
  $$ select public.accept_invite((select id from herd_invites limit 1)) $$,
  'P0002', null, 'stranger cannot accept an invite'
);
select throws_ok(
  $$ insert into herd_members (herd_id, user_id, role, display_name, email)
     values ((select id from herds limit 1), auth.uid(), 'owner', 'x', 'x') $$,
  '42501', null, 'stranger cannot add themselves to a herd'
);

-- Helper accepts and is limited ---------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');

select is((select count(*)::int from public.pending_invites()), 1, 'helper sees their invite');
select lives_ok(
  $$ select public.accept_invite((select id from public.pending_invites() limit 1)) $$,
  'helper can accept the invite'
);
select is((select count(*)::int from herd_members), 2, 'helper can see both members');

update herds set name = 'Renamed by helper';
select isnt((select name from herds), 'Renamed by helper', 'helper cannot rename the herd');

update herd_members set role = 'owner' where user_id = auth.uid();
select is((select role::text from herd_members where user_id = auth.uid()), 'helper', 'helper cannot promote themselves');

-- Owner cannot leave the herd ownerless -------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');

select throws_ok(
  $$ delete from herd_members where user_id = auth.uid() $$,
  '23514', 'A herd needs at least one owner', 'the last owner cannot leave'
);

select lives_ok($$ delete from herds $$, 'owner can delete the herd, members and all');

select * from finish();
rollback;
