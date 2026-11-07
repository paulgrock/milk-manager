-- Aging time in days rather than months, so short-aged cheeses (a few weeks)
-- fit. Existing times convert at 30 days a month; makes keep their ready dates.

alter table public.cheese_types rename column aging_months to aging_days;
alter table public.cheese_types drop constraint cheese_types_aging_months_check;
update public.cheese_types set aging_days = aging_days * 30;
alter table public.cheese_types add constraint cheese_types_aging_days_check check (aging_days between 0 and 1095);

create or replace function public.add_default_cheese_types()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cheese_types (herd_id, name, aging_days, sort_order) values
    (new.id, 'Chèvre', 0, 1),
    (new.id, 'Mozzarella', 0, 2),
    (new.id, 'Valençay', 30, 3),
    (new.id, 'Feta', 60, 4),
    (new.id, 'Tomme', 120, 5),
    (new.id, 'Cheddar', 180, 6);
  return new;
end;
$$;
