begin;
select plan(3);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","email":"owner@example.com","role":"authenticated"}', true);
select public.create_herd('Farm A');

-- A pedigree and a breeding: deleting goats clears the sire, dam and buck
-- links on the goats and breedings being deleted alongside them.
insert into goats (id, herd_id, barn_name, sex) values
  ('10000000-0000-0000-0000-000000000001', (select id from herds), 'Rex', 'buck'),
  ('10000000-0000-0000-0000-000000000002', (select id from herds), 'Mama', 'doe');
insert into goats (id, herd_id, barn_name, sex, sire_id, dam_id) values
  ('10000000-0000-0000-0000-000000000003', (select id from herds), 'Ina', 'doe', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');
insert into breedings (herd_id, doe_id, buck_id, bred_on) values
  ((select id from herds), '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2026-09-01');

select lives_ok($$ delete from goats where id = '10000000-0000-0000-0000-000000000001' $$, 'a buck with breedings and kids can be deleted');
select is((select buck_id from breedings), null, 'his breedings keep the doe, without him');

select lives_ok($$ delete from herds $$, 'a whole herd can be deleted');

select * from finish();
rollback;
