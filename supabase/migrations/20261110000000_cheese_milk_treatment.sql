-- Whether a make's milk was raw or pasteurized. Blank for makes recorded before
-- this was asked, or when it wasn't noted.

alter table public.cheese_makes
  add column milk_treatment text check (milk_treatment in ('raw', 'pasteurized'));
