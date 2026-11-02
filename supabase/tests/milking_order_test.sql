begin;
select plan(2);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into goats (id, herd_id, barn_name, sex) select '00000000-0000-0000-0000-0000000000a1', id, 'Ina', 'doe' from herds;
insert into goats (id, herd_id, barn_name, sex) select '00000000-0000-0000-0000-0000000000a2', id, 'Clover', 'doe' from herds;

select public.set_milking_order(array['00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1']::uuid[]);
select results_eq($$ select barn_name, milking_position::int from goats order by milking_position $$, $$ values ('Clover', 1), ('Ina', 2) $$,
  'the order is saved as given');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select public.set_milking_order(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2']::uuid[]);
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select results_eq($$ select barn_name, milking_position::int from goats order by milking_position $$, $$ values ('Clover', 1), ('Ina', 2) $$,
  'someone outside the herd can''t change it');


select * from finish();
rollback;
