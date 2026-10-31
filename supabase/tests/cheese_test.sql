begin;
select plan(12);

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
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));

select results_eq(
  $$ select name, aging_months::int from cheese_types order by sort_order $$,
  $$ values ('Chèvre', 0), ('Mozzarella', 0), ('Valençay', 1), ('Feta', 2), ('Tomme', 4), ('Cheddar', 6) $$,
  'a new herd starts with the farm''s cheeses'
);

select lives_ok($$
  insert into cheese_types (herd_id, name, aging_months) select id, 'Gouda', 3 from herds
$$, 'a helper can add a cheese');
select throws_ok($$
  insert into cheese_types (herd_id, name) select id, 'gouda' from herds
$$, '23505', null, 'each cheese is in the list once');

update cheese_types set aging_months = 12, hidden = true where name = 'Gouda';
select is((select aging_months::int from cheese_types where name = 'Gouda'), 3, 'only owners change a cheese');

select lives_ok($$
  insert into cheese_makes (herd_id, cheese_type_id, made_on, ready_on, milk_gallons, pieces, cheese_weight_g)
  select herd_id, id, '2026-10-30', '2027-02-28', 2.5, 4, 1134 from cheese_types where name = 'Tomme'
$$, 'a helper records a make');
select throws_ok($$
  insert into cheese_makes (herd_id, cheese_type_id, made_on, ready_on)
  select herd_id, id, '2026-10-30', '2026-10-01' from cheese_types where name = 'Feta'
$$, '23514', null, 'a make can''t be ready before it''s made');
select throws_ok($$
  insert into cheese_makes (herd_id, cheese_type_id, made_on, ready_on, milk_gallons)
  select herd_id, id, '2026-10-30', '2026-10-30', 0 from cheese_types where name = 'Chèvre'
$$, '23514', null, 'milk used is more than nothing');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
update cheese_types set hidden = true where name = 'Cheddar';
select ok((select hidden from cheese_types where name = 'Cheddar'), 'an owner can hide a cheese');
select throws_ok($$ delete from cheese_types where name = 'Tomme' $$, '23503', null, 'a cheese with makes can''t be deleted, only hidden');

select lives_ok($$
  insert into finance_entries (herd_id, kind, category, occurred_on, amount_cents) select id, 'income', 'cheese_sale', '2026-10-30', 2400 from herds
$$, 'cheese sales are an income category');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
select is_empty($$ select 1 from cheese_makes union all select 1 from cheese_types $$, 'a stranger sees no cheese');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select lives_ok($$ delete from herds $$, 'a herd with cheese makes can still be deleted');

select * from finish();
rollback;
