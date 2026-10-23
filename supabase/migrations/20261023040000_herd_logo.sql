-- A herd's own picture for the app header, set by owners. Small (the app
-- shrinks it to a 192px square), so it's kept on the row as a data: URL:
-- it loads with the herd, works offline and never needs a signed link.

alter table public.herds add column logo text
  check (logo is null or (logo ~ '^data:image/(png|jpeg|webp);base64,' and length(logo) <= 200000));

-- Owners only, through the existing "owners can update their herds" policy.
grant update (logo) on public.herds to authenticated;
