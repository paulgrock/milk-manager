begin;
select plan(8);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ann@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com');

create function pg_temp.act_as(uid text, email text) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true);
$$;

select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'ann@example.com');
select lives_ok(
  $$ insert into user_preferences (nav_tabs) values (array['/', '/milk', '/health', '/cheese'])
     on conflict (user_id) do update set nav_tabs = excluded.nav_tabs $$,
  'someone can save their tabs');
select is((select user_id::text from user_preferences), '00000000-0000-0000-0000-00000000000a', 'the row is theirs');
select lives_ok(
  $$ insert into user_preferences (nav_tabs) values (array['/goats'])
     on conflict (user_id) do update set nav_tabs = excluded.nav_tabs $$,
  'and save them again');
select is((select nav_tabs from user_preferences), array['/goats'], 'which replaces the old ones');
select throws_ok($$ update user_preferences set nav_tabs = array['/', '/milk', '/goats', '/chores', '/health'] $$,
  '23514', null, 'no more than four tabs');
select throws_ok($$ insert into user_preferences (user_id, nav_tabs) values ('00000000-0000-0000-0000-00000000000b', array['/']) $$,
  '42501', null, 'nobody can save preferences for someone else');

select pg_temp.act_as('00000000-0000-0000-0000-00000000000b', 'bob@example.com');
select is((select count(*)::int from user_preferences), 0, 'nobody sees anyone else''s preferences');
update user_preferences set nav_tabs = array['/'];
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a', 'ann@example.com');
select is((select nav_tabs from user_preferences), array['/goats'], 'or changes them');

select * from finish();
rollback;
