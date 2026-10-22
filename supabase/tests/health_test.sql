begin;
select plan(10);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;
insert into goats (id, herd_id, barn_name, sex)
select '10000000-0000-0000-0000-000000000001', id, 'Ina', 'doe' from herds;

select results_eq(
  $$ select name, interval_days, dose_unit from care_types order by sort_order $$,
  $$ values ('Hoof trim', 56, null::text), ('Replamin Gel Plus', 30, null), ('Copper bolus', 180, 'g'), ('CDT vaccine', 365, null), ('CAE, CL, OPP & Johne''s test', 365, null) $$,
  'a new herd starts with the usual care routine'
);

select lives_ok($$
  insert into care_types (herd_id, name, interval_days) select id, 'BoSe', 180 from herds
$$, 'owner can add a care type');

select throws_ok($$
  insert into care_types (herd_id, name) select id, 'hoof TRIM' from herds
$$, '23505', null, 'care type names are unique per herd, ignoring case');

-- Helper ------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));

select lives_ok($$
  insert into care_events (herd_id, goat_id, care_type_id, done_on, dose)
  select herd_id, '10000000-0000-0000-0000-000000000001', id, '2026-10-01', 4 from care_types where name = 'Copper bolus'
$$, 'helper can log care');

select lives_ok($$
  insert into care_events (id, herd_id, goat_id, care_type_id, done_on)
  select '30000000-0000-0000-0000-000000000001', herd_id, '10000000-0000-0000-0000-000000000001', id, '2026-10-01' from care_types where name = 'Hoof trim'
  on conflict (id) do nothing
$$, 'care can be logged with a client-made id');
select lives_ok($$
  insert into care_events (id, herd_id, goat_id, care_type_id, done_on)
  select '30000000-0000-0000-0000-000000000001', herd_id, '10000000-0000-0000-0000-000000000001', id, '2026-10-01' from care_types where name = 'Hoof trim'
  on conflict (id) do nothing
$$, 'sending the same care log twice is harmless');
select is((select count(*)::int from care_events where care_type_id = (select id from care_types where name = 'Hoof trim')), 1,
  'and only one hoof trim is recorded');

update care_types set interval_days = 1 where name = 'Hoof trim';
select is((select interval_days from care_types where name = 'Hoof trim'), 56, 'helper cannot change the care routine');

select lives_ok($$
  insert into treatments (herd_id, goat_id, started_on, ended_on, medication, dose, route, lot_number, milk_withdrawal_days)
  select herd_id, '10000000-0000-0000-0000-000000000001', '2026-10-10', '2026-10-14', 'Penicillin', '5 ml', 'subq', 'LOT123', 10 from goats
$$, 'helper can record a treatment with milk withdrawal');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select is_empty($$ select 1 from treatments union all select 1 from care_events union all select 1 from care_types $$,
  'a stranger sees no health records');

select * from finish();
rollback;
