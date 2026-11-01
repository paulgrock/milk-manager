begin;
select plan(10);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));

select results_eq(
  $$ select name, interval_days from chores order by sort_order $$,
  $$ values ('Clean milking equipment', 7), ('Fill waterers', 14), ('Refill mineral feeder', 14), ('Clean stalls', 30), ('Clean coop', 30) $$,
  'a new herd starts with the farm''s chores'
);

select lives_ok($$
  insert into chores (herd_id, name, interval_days) select id, 'Check fences', 30 from herds
$$, 'a helper can add a chore');
select throws_ok($$
  insert into chores (herd_id, name, interval_days) select id, 'check fences', 7 from herds
$$, '23505', null, 'each chore is in the list once');

update chores set interval_days = 1, hidden = true where name = 'Check fences';
select is((select interval_days from chores where name = 'Check fences'), 30, 'only owners change a chore');

select lives_ok($$
  insert into chores_done (herd_id, chore_id, done_on, notes) select herd_id, id, '2026-10-30', 'Scrubbed the tank too' from chores where name = 'Fill waterers'
$$, 'a helper marks a chore done');
select is((select created_by::text from chores_done), '00000000-0000-0000-0000-00000000000b', 'it records who did it');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
update chores set interval_days = 21, hidden = true where name = 'Check fences';
select results_eq($$ select interval_days, hidden from chores where name = 'Check fences' $$, $$ values (21, true) $$, 'an owner can change and hide a chore');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select is_empty($$ select 1 from chores union all select 1 from chores_done $$, 'a stranger sees no chores');
select throws_ok($$
  insert into chores (herd_id, name, interval_days) select '00000000-0000-0000-0000-000000000099'::uuid, 'Sneaky', 7
$$, '42501', null, 'a stranger can''t add chores');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select lives_ok($$ delete from herds $$, 'a herd with chores done can still be deleted');

select * from finish();
rollback;
