begin;
select plan(4);

-- A brand-new project, with no accounts yet (all undone by the rollback).
delete from public.herds;
delete from auth.users;
select is(public.before_user_created('{"user":{"email":"first@example.com"}}'), '{}'::jsonb,
  'the first account on a new project is let through');

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","email":"owner@example.com","role":"authenticated"}', true);
select public.create_herd('Farm A');
insert into herd_invites (herd_id, email) select id, 'helper@example.com' from herds;
reset role;

select is(public.before_user_created('{"user":{"email":"helper@example.com"}}'), '{}'::jsonb, 'an invited email can make an account');
select is(public.before_user_created('{"user":{"email":" Helper@Example.com "}}'), '{}'::jsonb, 'whatever the capitals and spaces');
select is((public.before_user_created('{"user":{"email":"stranger@example.com"}}') -> 'error' ->> 'http_code')::int, 403,
  'anyone else is turned away');

select * from finish();
rollback;
