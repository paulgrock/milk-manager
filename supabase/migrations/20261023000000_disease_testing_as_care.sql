-- Disease testing is logged like any other routine care, once a year. (The
-- separate disease_tests and health_observations tables are no longer used
-- by the app.)

create or replace function public.add_default_care_types()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.care_types (herd_id, name, interval_days, dose_unit, sort_order) values
    (new.id, 'Hoof trim', 56, null, 1),
    (new.id, 'Replamin Gel Plus', 30, null, 2),
    (new.id, 'Copper bolus', 180, 'g', 3),
    (new.id, 'CDT vaccine', 365, null, 4),
    (new.id, 'CAE, CL, OPP & Johne''s test', 365, null, 5);
  return new;
end;
$$;

insert into public.care_types (herd_id, name, interval_days, sort_order)
select h.id, 'CAE, CL, OPP & Johne''s test', 365, coalesce((select max(sort_order) from public.care_types t where t.herd_id = h.id), 0) + 1
from public.herds h
on conflict do nothing;
