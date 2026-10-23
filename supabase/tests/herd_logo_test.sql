begin;
select plan(4);

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
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'helper@example.com');
select public.accept_invite((select id from public.pending_invites() limit 1));

update herds set logo = 'data:image/png;base64,AAAA';
select is((select logo from herds), null, 'a helper cannot change the logo');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'owner@example.com');
select lives_ok($$ update herds set logo = 'data:image/png;base64,AAAA' $$, 'an owner can set it');
select is((select logo from herds), 'data:image/png;base64,AAAA', 'and it is kept');
select throws_ok($$ update herds set logo = 'https://example.com/logo.png' $$, '23514', null, 'only an image, not a link');

select * from finish();
rollback;
