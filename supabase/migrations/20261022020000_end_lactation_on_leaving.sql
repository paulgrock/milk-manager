-- A goat that's sold or dies stops being milked: end any lactation still open
-- on the day she left (or today, if no date was given), so she drops off the
-- milk line and her lactation totals stop there.

create function public.end_lactations_on_leaving()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_left date := coalesce(new.left_herd_on, current_date);
begin
  update public.lactations
  set dried_off_on = v_left
  where goat_id = new.id
    and freshened_on <= v_left
    and (dried_off_on is null or dried_off_on > v_left);
  return new;
end;
$$;

create trigger goats_end_lactations_on_leaving
after insert or update of status, left_herd_on on public.goats
for each row
when (new.status in ('sold', 'deceased'))
execute function public.end_lactations_on_leaving();
