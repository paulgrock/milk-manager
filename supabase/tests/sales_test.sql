begin;
select plan(17);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'helper@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select public.create_herd('Farm A');
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;

insert into goats (id, herd_id, barn_name, sex, birth_date) select '00000000-0000-0000-0000-0000000000d1', id, 'Clover', 'doe', '2022-03-01' from herds;
insert into goats (id, herd_id, barn_name, sex, birth_date) select '00000000-0000-0000-0000-0000000000d2', id, 'Rosie', 'doe', '2023-03-01' from herds;
insert into goats (id, herd_id, barn_name, sex, birth_date) select '00000000-0000-0000-0000-0000000000a1', id, 'Clover kid', 'doe', '2027-02-20' from herds;
insert into kiddings (id, herd_id, doe_id, kidded_on) select '00000000-0000-0000-0000-0000000000e1', id, '00000000-0000-0000-0000-0000000000d1', '2027-02-20' from herds;
insert into kids (id, herd_id, kidding_id, sex, goat_id) select '00000000-0000-0000-0000-0000000000f1', id, '00000000-0000-0000-0000-0000000000e1', 'doe', '00000000-0000-0000-0000-0000000000a1' from herds;
insert into kids (id, herd_id, kidding_id, sex) select '00000000-0000-0000-0000-0000000000f2', id, '00000000-0000-0000-0000-0000000000e1', 'buck' from herds;

insert into buyers (id, herd_id, name) select '00000000-0000-0000-0000-0000000000b1', id, 'Jo Smith' from herds;
insert into reservations (id, herd_id, buyer_id, season, doe_id, wants, deposit_cents, deposit_on)
select '00000000-0000-0000-0000-0000000000c1', id, '00000000-0000-0000-0000-0000000000b1', 2027, '00000000-0000-0000-0000-0000000000d1', 'doeling', 10000, '2026-11-01' from herds;

select results_eq(
  $$ select category, occurred_on, amount_cents, party, description from finance_entries $$,
  $$ values ('kid_sale', '2026-11-01'::date, 10000, 'Jo Smith', 'Deposit for 2027 kids from Clover') $$,
  'a deposit goes into Finances the day it''s received'
);

update reservations set deposit_status = 'refunded';
select is_empty($$ select 1 from finance_entries $$, 'a refunded deposit comes back out');
update reservations set deposit_status = 'held';

insert into sales (id, herd_id, buyer_id, reservation_id, kid_id, goat_id)
select '00000000-0000-0000-0000-000000000051', id, '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1',
  '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a1' from herds;
select is((select count(*)::int from finance_entries), 1, 'matching a kid isn''t income yet');

update sales set price_cents = 45000, sold_on = '2027-04-01', pickup_on = '2027-04-20';
select results_eq(
  $$ select category, occurred_on, amount_cents, description from finance_entries where sale_id is not null $$,
  $$ values ('kid_sale', '2027-04-01'::date, 35000, 'Adoption, less deposit') $$,
  'a sale puts the price less the deposit into Finances'
);
select is((select deposit_status from reservations), 'applied', 'the deposit is used up');
select results_eq(
  $$ select status::text, left_herd_on, left_herd_reason from goats where barn_name = 'Clover kid' $$,
  $$ values ('sold', '2027-04-20'::date, 'Adopted by Jo Smith') $$,
  'the kid''s goat record is marked sold, leaving on pickup day'
);

update sales set price_cents = 50000;
select is((select amount_cents from finance_entries where sale_id is not null), 40000, 'changing the price updates Finances');

update sales set sold_on = null, pickup_on = null;
select is_empty($$ select 1 from finance_entries where sale_id is not null $$, 'un-selling takes the sale out of Finances');
select is((select deposit_status from reservations), 'held', 'and puts the deposit back');
select is((select status::text from goats where barn_name = 'Clover kid'), 'active', 'and the kid is back in the herd');

select throws_ok($$
  insert into sales (herd_id, buyer_id, kid_id) select id, '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000f1' from herds
$$, '23505', null, 'a kid goes to one buyer');

insert into sales (herd_id, buyer_id, goat_id, price_cents, sold_on)
select id, '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000d2', 60000, '2027-05-01' from herds;
select results_eq(
  $$ select category, amount_cents from finance_entries where goat_id = '00000000-0000-0000-0000-0000000000d2' $$,
  $$ values ('goat_sale', 60000) $$,
  'an adult sold with no reservation is a goat sale, in full'
);

insert into sales (herd_id, buyer_id, kid_id, price_cents, sold_on)
select id, '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000f2', 30000, '2027-04-10' from herds;
select is((select category from finance_entries where amount_cents = 30000), 'kid_sale', 'a kid with no goat record is a kid sale');

select throws_ok($$ delete from buyers $$, '23503', null, 'a buyer with reservations or sales can''t be deleted');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));
select is_empty($$ select 1 from buyers union all select 1 from reservations union all select 1 from sales $$, 'helpers don''t see buyers, reservations or sales');
select throws_ok($$
  insert into buyers (herd_id, name) select herd_id, 'Sneaky' from herd_members limit 1
$$, '42501', null, 'helpers can''t add buyers');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select lives_ok($$ delete from herds $$, 'a herd with sales can still be deleted');

select * from finish();
rollback;
