begin;
select plan(4);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","email":"owner@example.com","role":"authenticated"}', true);
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex)
select v.id::uuid, h.id, v.name, 'doe' from herds h, (values
  ('10000000-0000-0000-0000-000000000001', 'Chimi'),
  ('10000000-0000-0000-0000-000000000002', 'Zadie')) v (id, name);
insert into lactations (herd_id, goat_id, lactation_number, freshened_on, dried_off_on)
select h.id, v.goat::uuid, v.n, v.fresh::date, v.dry::date from herds h, (values
  ('10000000-0000-0000-0000-000000000001', 1, '2024-03-01', '2024-12-01'),
  ('10000000-0000-0000-0000-000000000001', 2, '2025-03-01', null),
  ('10000000-0000-0000-0000-000000000002', 1, '2025-03-01', null)) v (goat, n, fresh, dry);

update goats set status = 'deceased', left_herd_on = '2025-05-01' where id = '10000000-0000-0000-0000-000000000001';
select is((select dried_off_on::text from lactations where goat_id = '10000000-0000-0000-0000-000000000001' and lactation_number = 2),
  '2025-05-01', 'her open lactation ends the day she died');
select is((select dried_off_on::text from lactations where goat_id = '10000000-0000-0000-0000-000000000001' and lactation_number = 1),
  '2024-12-01', 'a lactation that had already ended is left alone');
select is((select dried_off_on from lactations where goat_id = '10000000-0000-0000-0000-000000000002'), null,
  'other goats are not touched');

update goats set status = 'sold', left_herd_on = null where id = '10000000-0000-0000-0000-000000000002';
select is((select dried_off_on from lactations where goat_id = '10000000-0000-0000-0000-000000000002'), current_date,
  'sold without a date: her lactation ends today');

select * from finish();
rollback;
