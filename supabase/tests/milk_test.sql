begin;
select plan(18);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.day(goat text, d date) returns text language sql as $$
  select string_agg(milking || ':' || weight_g, ' ' order by milking)
  from public.milk_weights where goat_id = goat::uuid and milked_on = d;
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex)
select v.id::uuid, h.id, v.name, v.sex::goat_sex from herds h, (values
  ('10000000-0000-0000-0000-000000000001', 'Ina', 'doe'),
  ('10000000-0000-0000-0000-000000000002', 'Rex', 'buck')) v (id, name, sex);

-- Lactations ----------------------------------------------------------------------
select lives_ok($$
  insert into lactations (herd_id, goat_id, lactation_number, freshened_on, dried_off_on)
  select id, '10000000-0000-0000-0000-000000000001', 1, '2025-03-01', '2025-12-31' from herds
$$, 'a doe can have a lactation');

select throws_ok($$
  insert into lactations (herd_id, goat_id, lactation_number, freshened_on)
  select id, '10000000-0000-0000-0000-000000000001', 2, '2025-12-01' from herds
$$, '23P01', null, 'lactations cannot overlap');

select lives_ok($$
  insert into lactations (herd_id, goat_id, lactation_number, freshened_on)
  select id, '10000000-0000-0000-0000-000000000001', 2, '2026-03-01' from herds
$$, 'a new lactation after drying off is fine');

select throws_ok($$
  insert into lactations (herd_id, goat_id, lactation_number, freshened_on)
  select id, '10000000-0000-0000-0000-000000000002', 1, '2026-03-01' from herds
$$, '23514', 'Only does can have lactations or milk records', 'bucks cannot freshen');

-- Recording milkings ----------------------------------------------------------------
select lives_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 1::smallint, 1500) $$, 'record AM');
select lives_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 2::smallint, 1200) $$, 'record PM');
select is(pg_temp.day('10000000-0000-0000-0000-000000000001', '2026-10-20'), '1:1500 2:1200', 'AM and PM are separate rows');

select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 1::smallint, 1600);
select is(pg_temp.day('10000000-0000-0000-0000-000000000001', '2026-10-20'), '1:1600 2:1200', 'recording again replaces the weight');

select is(
  (select total_g from milk_day_totals where goat_id = '10000000-0000-0000-0000-000000000001' and milked_on = '2026-10-20'),
  2800, 'the day total is the sum of the milkings'
);

select throws_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 0::smallint, 3000) $$,
  '23514', 'This day already has separate milkings; edit those instead', 'cannot add a day total over separate milkings');

select throws_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 3::smallint, 500, array[200, 200]) $$,
  '23514', 'Portions must add up to the weight', 'portions must add up');

select lives_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 3::smallint, 500, array[300, 200]) $$,
  'an extra milking can be weighed in portions');

-- Day totals and splitting -------------------------------------------------------------
select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-21', 0::smallint, 3000);
select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-21', 1::smallint, 1700);
select is(pg_temp.day('10000000-0000-0000-0000-000000000001', '2026-10-21'), '1:1700 2:1300', 'recording AM on a day total splits it');

select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-21', 1::smallint, 1700);
select is(pg_temp.day('10000000-0000-0000-0000-000000000001', '2026-10-21'), '1:1700 2:1300', 'replaying the same save changes nothing');

select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-22', 0::smallint, 3000);
select throws_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-22', 2::smallint, 3500) $$,
  '23514', 'That is more than the day total', 'a split cannot exceed the day total');

select public.clear_milking('10000000-0000-0000-0000-000000000001', '2026-10-20', 3::smallint);
select is(pg_temp.day('10000000-0000-0000-0000-000000000001', '2026-10-20'), '1:1600 2:1200', 'clear_milking removes one milking');

select throws_ok($$ update goats set sex = 'wether' where id = '10000000-0000-0000-0000-000000000001' $$,
  '23514', null, 'a doe with milk records stays a doe');

-- Stranger -------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select throws_ok($$ select public.record_milking('10000000-0000-0000-0000-000000000001', '2026-10-23', 1::smallint, 1000) $$,
  'P0002', 'Goat not found', 'a stranger cannot record milk for another herd');

select * from finish();
rollback;
