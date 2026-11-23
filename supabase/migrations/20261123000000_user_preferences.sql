-- Each person's own settings for the app, the same in every herd they belong
-- to and on every device they sign in on. One row per person, made the first
-- time they change something; with no row the app uses its defaults.
--
-- New preferences get their own column here, null meaning "use the default".

create table public.user_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- The sections in the phone's tab bar, in order, as app paths ('/milk').
  -- The app ignores any it doesn't know or the person can't open.
  nav_tabs text[] check (
    nav_tabs is null
    or (cardinality(nav_tabs) between 1 and 4 and array_to_string(nav_tabs, '') ~ '^[/a-z-]*$')
  ),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "people can read their own preferences" on public.user_preferences
for select to authenticated using (user_id = (select auth.uid()));

create policy "people can save their own preferences" on public.user_preferences
for insert to authenticated with check (user_id = (select auth.uid()));

create policy "people can change their own preferences" on public.user_preferences
for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Nobody deletes the row (clearing a preference sets it back to null), and
-- nobody moves it to another person.
revoke all on public.user_preferences from authenticated;
grant select, insert (nav_tabs, updated_at) on public.user_preferences to authenticated;
grant update (nav_tabs, updated_at) on public.user_preferences to authenticated;
