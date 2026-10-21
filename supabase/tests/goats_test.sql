begin;
select plan(17);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

-- Owner's herd with a helper; stranger has their own herd.
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select public.create_herd('Farm B');

-- Helper adds goats -----------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');

select lives_ok($$
  insert into goats (id, herd_id, registered_name, sex, status) values
    ('10000000-0000-0000-0000-000000000001', (select id from herds where name = 'Farm A'), 'Curbstone Valley Tigris', 'buck', 'reference'),
    ('10000000-0000-0000-0000-000000000002', (select id from herds where name = 'Farm A'), 'Harley Hillside Dime Piece', 'doe', 'reference')
$$, 'helper can add goats');

select lives_ok($$
  insert into goats (id, herd_id, registered_name, barn_name, sex, sire_id, dam_id) values
    ('10000000-0000-0000-0000-000000000003', (select id from herds where name = 'Farm A'),
     'Bird''s Eye Farm Ina May', 'Ina', 'doe',
     '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
$$, 'goat can link to a sire and dam');

select throws_ok($$
  insert into goats (herd_id, sex) values ((select id from herds where name = 'Farm A'), 'doe')
$$, '23514', null, 'a goat needs a registered or barn name');

select throws_ok($$
  insert into goats (herd_id, barn_name, sex, sire_id) values
    ((select id from herds where name = 'Farm A'), 'Bad', 'doe', '10000000-0000-0000-0000-000000000002')
$$, '23514', 'Sire must be a buck', 'sire must be a buck');

select throws_ok($$
  insert into goats (herd_id, barn_name, sex, dam_id) values
    ((select id from herds where name = 'Farm A'), 'Bad', 'doe', '10000000-0000-0000-0000-000000000001')
$$, '23514', 'Dam must be a doe', 'dam must be a doe');

select throws_ok($$
  update goats set sex = 'wether' where id = '10000000-0000-0000-0000-000000000001'
$$, '23514', 'This goat is listed as a sire, so it must stay a buck', 'a sire cannot be changed to a wether');

select throws_ok($$
  update goats set dam_id = '10000000-0000-0000-0000-000000000003' where id = '10000000-0000-0000-0000-000000000002'
$$, '23514', 'A goat cannot be its own ancestor', 'pedigree loops are rejected');

select lives_ok($$
  insert into linear_appraisals (herd_id, goat_id, appraised_on, general_appearance, dairy_strength, body_capacity, mammary_system, final_score)
  values ((select id from herds where name = 'Farm A'), '10000000-0000-0000-0000-000000000003', '2021-06-01', 'V', 'V', 'E', 'V', 88)
$$, 'helper can record a linear appraisal');

select throws_ok($$
  insert into linear_appraisals (herd_id, goat_id, appraised_on, general_appearance, dairy_strength, body_capacity, final_score)
  values ((select id from herds where name = 'Farm A'), '10000000-0000-0000-0000-000000000003', '2022-06-01', 'X', 'V', 'E', 88)
$$, '23514', null, 'appraisal codes must be E, V, G, A, F or P');

delete from goats where id = '10000000-0000-0000-0000-000000000003';
select isnt_empty($$ select 1 from goats where id = '10000000-0000-0000-0000-000000000003' $$, 'helper cannot delete goats');

-- Photos: only one primary per goat ---------------------------------------------
insert into goat_photos (id, herd_id, goat_id, storage_path, is_primary)
select v.id::uuid, h.id, '10000000-0000-0000-0000-000000000003', h.id || '/10000000-0000-0000-0000-000000000003/' || v.id || '.jpg', v.is_primary
from herds h, (values ('20000000-0000-0000-0000-000000000001', true), ('20000000-0000-0000-0000-000000000002', false)) v (id, is_primary)
where h.name = 'Farm A';

select public.set_primary_photo('20000000-0000-0000-0000-000000000002');
select results_eq(
  $$ select id::text from goat_photos where is_primary $$,
  $$ values ('20000000-0000-0000-0000-000000000002') $$,
  'set_primary_photo swaps the primary photo'
);

select throws_ok($$
  insert into goat_photos (herd_id, goat_id, storage_path)
  select id, '10000000-0000-0000-0000-000000000003', 'elsewhere/x.jpg' from herds where name = 'Farm A'
$$, '23514', null, 'photo paths must be under the herd and goat folder');

-- Stranger is walled off ----------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

select is_empty($$ select 1 from goats $$, 'stranger cannot see another herd''s goats');
select is_empty($$ select 1 from linear_appraisals $$, 'stranger cannot see another herd''s appraisals');

select throws_ok($$
  insert into goats (herd_id, barn_name, sex, sire_id) values
    ((select id from herds where name = 'Farm B'), 'Borrowed', 'doe', '10000000-0000-0000-0000-000000000001')
$$, null, null, 'a goat cannot use a parent from another herd');

-- Owner can delete; children keep living with no parent link -------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');

select lives_ok($$ delete from goats where id = '10000000-0000-0000-0000-000000000001' $$, 'owner can delete a goat');
select is(
  (select sire_id from goats where id = '10000000-0000-0000-0000-000000000003'), null,
  'deleting a sire clears the link but keeps the herd on the child'
);

select * from finish();
rollback;
