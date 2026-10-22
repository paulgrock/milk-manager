begin;
select plan(8);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
select set_config('test.herd_id', (select id::text from herds limit 1), true);
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;
insert into goats (id, herd_id, barn_name, sex) values
  ('10000000-0000-0000-0000-000000000001', current_setting('test.herd_id')::uuid, 'Ina', 'doe'),
  ('10000000-0000-0000-0000-000000000002', current_setting('test.herd_id')::uuid, 'Rex', 'buck');
insert into breedings (id, herd_id, doe_id, buck_id, bred_on, service_fee_cents) values
  ('20000000-0000-0000-0000-000000000001', current_setting('test.herd_id')::uuid, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '2026-03-01', 7500);

select lives_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents, goat_id)
  values (current_setting('test.herd_id')::uuid, 'income', 'kid_sale', '2026-06-01', 45000, '10000000-0000-0000-0000-000000000001')
$$, 'owner records a kid sale');

select throws_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents)
  values (current_setting('test.herd_id')::uuid, 'income', 'feed', '2026-06-01', 100)
$$, '23514', null, 'a category must match income or expense');

select throws_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents)
  values (current_setting('test.herd_id')::uuid, 'expense', 'feed', '2026-06-01', 0)
$$, '23514', null, 'amounts are positive');

select lives_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents, breeding_id)
  values (current_setting('test.herd_id')::uuid, 'expense', 'stud_fee', '2026-03-01', 7500, '20000000-0000-0000-0000-000000000001')
$$, 'a stud fee can be recorded from its breeding');
select throws_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents, breeding_id)
  values (current_setting('test.herd_id')::uuid, 'expense', 'stud_fee', '2026-03-01', 7500, '20000000-0000-0000-0000-000000000001')
$$, '23505', null, 'but only once');

-- Helper ------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));
select is_empty($$ select 1 from finance_entries $$, 'helpers cannot see finances');
select throws_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents)
  values (current_setting('test.herd_id')::uuid, 'expense', 'feed', '2026-06-01', 2500)
$$, '42501', null, 'helpers cannot add finances');

-- Deleting the goat keeps the money record.
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
delete from goats where id = '10000000-0000-0000-0000-000000000001';
select is((select count(*)::int from finance_entries where category = 'kid_sale' and goat_id is null), 1,
  'deleting a goat keeps her sale, without the link');

select * from finish();
rollback;
