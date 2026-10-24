begin;
select plan(3);

select is((select count(*)::int from information_schema.table_privileges where grantee = 'anon' and table_schema = 'public'), 0,
  'signed-out visitors have no access to any table');
select is((select count(*)::int from information_schema.table_privileges where grantee = 'authenticated' and table_schema = 'public' and privilege_type = 'TRUNCATE'), 0,
  'nobody can empty a table (TRUNCATE skips RLS)');
select is((select count(*)::int from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and not c.relrowsecurity), 0,
  'every table has row level security on');

select * from finish();
rollback;
