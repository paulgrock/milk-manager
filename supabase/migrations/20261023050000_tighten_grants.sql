-- Belt and braces under RLS. Supabase grants every table to anon and
-- authenticated by default, including TRUNCATE, which RLS doesn't cover.
-- Neither is reachable through the API, but nothing needs them: signed-out
-- visitors read no tables at all, and nobody empties a table.

revoke all on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;

-- The same for tables added later.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke truncate on tables from authenticated;
