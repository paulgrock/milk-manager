begin;
select plan(2);

-- Every notes field in use allows 10,000 characters, no more and no less.
-- (health_observations and disease_tests are no longer used.)
select is_empty(
  $$ select conrelid::regclass::text, pg_get_constraintdef(oid)
     from pg_constraint
     where contype = 'c' and connamespace = 'public'::regnamespace
       and pg_get_constraintdef(oid) ~ 'length\(notes?\)'
       and conrelid::regclass::text not in ('health_observations', 'disease_tests')
       and pg_get_constraintdef(oid) !~ '<= 10000\)' $$,
  'every notes field allows 10,000 characters'
);
select is(
  (select count(*)::int from pg_constraint
   where contype = 'c' and connamespace = 'public'::regnamespace
     and pg_get_constraintdef(oid) ~ 'length\(notes?\) <= 10000'),
  18,
  'all 18 notes fields have the limit'
);

select * from finish();
rollback;
