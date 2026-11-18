begin;
select plan(6);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex)
select '10000000-0000-0000-0000-000000000001', id, 'Ina', 'doe' from herds;

select lives_ok(
  $$ update goats set dhir_sample_number = 3 where id = '10000000-0000-0000-0000-000000000001' $$,
  'a member can set a doe''s sample number'
);
select throws_ok(
  $$ update goats set dhir_sample_number = 0 where id = '10000000-0000-0000-0000-000000000001' $$,
  '23514', null, 'sample numbers start at 1'
);
select lives_ok(
  $$ insert into milking_times (herd_id, milked_on, times)
     select id, '2026-11-15', '{"previous": {"start": "20:00"}}' from herds $$,
  'a member can correct a day''s milking times, with no test that day'
);
select throws_ok(
  $$ insert into milking_times (herd_id, milked_on, times) select id, '2026-11-16', '[]' from herds $$,
  '23514', null, 'corrected times are an object'
);
select is(
  (select count(*)::int from milking_times),
  1, 'one row per day'
);

reset role;
select set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
set local role authenticated;
select is_empty(
  $$ select * from milking_times $$,
  'someone outside the herd can''t see its milking times'
);

select * from finish();
rollback;
