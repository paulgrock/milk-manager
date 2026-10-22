begin;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex)
select v.id::uuid, h.id, v.name, v.sex::goat_sex from herds h, (values
  ('10000000-0000-0000-0000-000000000001', 'Ina', 'doe'),
  ('10000000-0000-0000-0000-000000000002', 'Rex', 'buck')) v (id, name, sex);
insert into milk_tests (id, herd_id, tested_on, kind, lab)
select '20000000-0000-0000-0000-000000000001', id, '2026-10-01', 'dhir', 'DHI Provo' from herds;

select lives_ok($$
  insert into milk_test_results (herd_id, test_id, goat_id, milk_g, butterfat_pct, protein_pct, scc)
  select id, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2722, 6.4, 4.1, 450000 from herds
$$, 'record a doe''s test-day result');

select throws_ok($$
  insert into milk_test_results (herd_id, test_id, goat_id, milk_g)
  select id, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2000 from herds
$$, '23505', null, 'one result per doe per test');

select throws_ok($$
  insert into milk_test_results (herd_id, test_id, goat_id, milk_g)
  select id, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2000 from herds
$$, '23514', 'Only does can have lactations or milk records', 'bucks have no milk tests');

select throws_ok($$
  insert into milk_test_results (herd_id, test_id, goat_id, butterfat_pct)
  select id, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 40 from herds
$$, '23514', null, 'butterfat must be a believable percentage');

delete from milk_tests;
select set_config('test.herd_id', (select id::text from herds limit 1), true);
select is((select count(*)::int from milk_test_results), 0, 'deleting a test removes its results');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select is_empty($$ select 1 from milk_tests $$, 'a stranger cannot see milk tests');
select throws_ok($$
  insert into milk_tests (herd_id, tested_on) values (current_setting('test.herd_id')::uuid, '2026-10-01')
$$, '42501', null, 'a stranger cannot add a test to another herd');

select * from finish();
rollback;
