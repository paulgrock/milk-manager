begin;
select plan(8);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","email":"owner@example.com","role":"authenticated"}', true);
select public.create_herd('Farm A');

insert into goats (id, herd_id, registered_name, barn_name, sex) values
  ('10000000-0000-0000-0000-000000000001', (select id from herds), 'Bird''s Eye Farm Ina May', 'Ina', 'doe'),
  ('10000000-0000-0000-0000-000000000002', (select id from herds), 'Castle Rock Bugatti', null, 'buck'),
  ('10000000-0000-0000-0000-000000000003', (select id from herds), 'Other Farm Ina', 'Ina', 'doe');

select is((select slug from goats where id = '10000000-0000-0000-0000-000000000001'), 'ina', 'made from the barn name');
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000002'), 'castle-rock-bugatti', 'or the registered name');
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000003'), 'ina-2', 'a second Ina gets a number');

update goats set slug = 'something-else', notes = 'hi' where id = '10000000-0000-0000-0000-000000000001';
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000001'), 'ina', 'cannot be set by hand');

update goats set registered_name = 'Other Farm Ina Marie' where id = '10000000-0000-0000-0000-000000000003';
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000003'), 'ina-2', 'kept when the name it came from is unchanged');

update goats set barn_name = 'Pearl' where id = '10000000-0000-0000-0000-000000000003';
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000003'), 'pearl', 'follows a new barn name');

insert into goats (id, herd_id, barn_name, sex) values ('10000000-0000-0000-0000-000000000004', (select id from herds), 'New', 'doe');
select is((select slug from goats where id = '10000000-0000-0000-0000-000000000004'), 'new-goat', '"new" is the add-goat page');

select is(public.slugify('  Diji Farm Jackson’s Royal Bayliner!! '), 'diji-farm-jacksons-royal-bayliner', 'punctuation and apostrophes dropped');

select * from finish();
rollback;
