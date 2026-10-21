begin;
select plan(17);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex, breed)
select v.id::uuid, h.id, v.name, v.sex::goat_sex, v.breed from herds h, (values
  ('10000000-0000-0000-0000-000000000001', 'Ina', 'doe', 'Nigerian Dwarf'),
  ('10000000-0000-0000-0000-000000000002', 'Rex', 'buck', 'Nigerian Dwarf'),
  ('10000000-0000-0000-0000-000000000003', 'Clover', 'doe', 'Nigerian Dwarf')) v (id, name, sex, breed);

-- Breedings ---------------------------------------------------------------------
select lives_ok($$
  insert into breedings (id, herd_id, doe_id, buck_id, bred_on)
  select '20000000-0000-0000-0000-000000000001', id, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '2026-03-01' from herds
$$, 'a doe can be bred to a buck');

select throws_ok($$
  insert into breedings (herd_id, doe_id, buck_id, bred_on)
  select id, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '2026-03-01' from herds
$$, '23514', 'The sire must be a buck', 'the sire must be a buck');

select throws_ok($$
  insert into breedings (herd_id, doe_id, bred_on)
  select id, '10000000-0000-0000-0000-000000000002', '2026-03-01' from herds
$$, '23514', 'Only does can be bred or kid', 'a buck cannot be bred');

select throws_ok($$
  insert into breedings (herd_id, doe_id, method, bred_on, exposure_end)
  select id, '10000000-0000-0000-0000-000000000003', 'hand', '2026-03-01', '2026-03-20' from herds
$$, '23514', null, 'only pen breedings have an exposure end');

select lives_ok($$
  insert into pregnancy_checks (herd_id, breeding_id, checked_on, method, result)
  select id, '20000000-0000-0000-0000-000000000001', '2026-04-05', 'blood', 'pregnant' from herds
$$, 'record a positive blood test');

-- A doe milked through her pregnancy -------------------------------------------------
insert into lactations (herd_id, goat_id, lactation_number, freshened_on)
select id, '10000000-0000-0000-0000-000000000001', 3, '2025-04-01' from herds;

-- Kidding -----------------------------------------------------------------------
select lives_ok($$
  select public.record_kidding(
    '10000000-0000-0000-0000-000000000001', '2026-07-29', '20000000-0000-0000-0000-000000000001', 'assisted', 'Twins, one backwards',
    '[{"sex": "doe", "birth_weight_g": 1100, "add_to_herd": true, "name": "Ivy"},
      {"sex": "buck", "birth_weight_g": 1300, "add_to_herd": true},
      {"sex": "buck", "outcome": "stillborn"}]'::jsonb
  )
$$, 'record twins plus a stillborn');

select is((select count(*)::int from kids), 3, 'all three kids are recorded');
select is((select count(*)::int from kids where goat_id is not null), 2, 'only live kids staying in the herd become goats');

select results_eq($$
  select barn_name, sex::text, birth_date::text, dam_id::text, sire_id::text, breed
  from goats where birth_date = '2026-07-29' order by barn_name
$$, $$ values
  ('Ina kid 2', 'buck', '2026-07-29', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Nigerian Dwarf'),
  ('Ivy', 'doe', '2026-07-29', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Nigerian Dwarf')
$$, 'kids get dam, sire, birth date and breed; unnamed ones get a placeholder name');

select results_eq($$
  select lactation_number, freshened_on::text, dried_off_on::text from lactations
  where goat_id = '10000000-0000-0000-0000-000000000001' order by freshened_on
$$, $$ values (3::smallint, '2025-04-01', '2026-07-28'), (4::smallint, '2026-07-29', null)
$$, 'the old lactation ends the day before and a new one starts');

select throws_ok($$
  select public.record_kidding('10000000-0000-0000-0000-000000000001', '2026-08-01', '20000000-0000-0000-0000-000000000001')
$$, '23505', null, 'a breeding can only lead to one kidding');

select throws_ok($$
  select public.record_kidding('10000000-0000-0000-0000-000000000003', '2026-08-01', '20000000-0000-0000-0000-000000000001')
$$, '23514', null, 'a kidding cannot use another doe''s breeding');

-- Kidding without a lactation, then one already on the milk line --------------------
select public.record_kidding('10000000-0000-0000-0000-000000000003', '2026-05-01', p_start_lactation => false);
select is((select count(*)::int from lactations where goat_id = '10000000-0000-0000-0000-000000000003'), 0,
  'p_start_lactation false leaves lactations alone');

insert into lactations (herd_id, goat_id, lactation_number, freshened_on)
select id, '10000000-0000-0000-0000-000000000003', 1, '2026-09-01' from herds;
select public.record_kidding('10000000-0000-0000-0000-000000000003', '2026-09-01');
select is((select count(*)::int from lactations where goat_id = '10000000-0000-0000-0000-000000000003'), 1,
  'no duplicate lactation when she was already added to the milk line that day');

select throws_ok($$ update goats set sex = 'wether' where id = '10000000-0000-0000-0000-000000000002' $$,
  '23514', null, 'a buck with breedings stays a buck');

-- Stranger ------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select is_empty($$ select 1 from breedings $$, 'a stranger cannot see breedings');
select throws_ok($$ select public.record_kidding('10000000-0000-0000-0000-000000000001', '2026-10-01') $$,
  'P0002', 'Goat not found', 'a stranger cannot record a kidding');

select * from finish();
rollback;
