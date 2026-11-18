begin;
select plan(5);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex)
select '10000000-0000-0000-0000-000000000001', id, 'Ina', 'doe' from herds;
insert into milk_tests (id, herd_id, tested_on)
select '20000000-0000-0000-0000-000000000001', id, '2026-11-15' from herds;

select lives_ok(
  $$ update goats set dhir_sample_number = 3 where id = '10000000-0000-0000-0000-000000000001' $$,
  'a member can set a doe''s sample number'
);
select throws_ok(
  $$ update goats set dhir_sample_number = 0 where id = '10000000-0000-0000-0000-000000000001' $$,
  '23514', null, 'sample numbers start at 1'
);
select is(
  (select milking_times from milk_tests where id = '20000000-0000-0000-0000-000000000001'),
  '{}'::jsonb, 'a test starts with no corrected times'
);
select lives_ok(
  $$ update milk_tests set milking_times = '{"previous": {"start": "20:00"}}'
     where id = '20000000-0000-0000-0000-000000000001' $$,
  'a member can correct a milking time'
);
select throws_ok(
  $$ update milk_tests set milking_times = '[]' where id = '20000000-0000-0000-0000-000000000001' $$,
  '23514', null, 'corrected times are an object'
);

select * from finish();
rollback;
