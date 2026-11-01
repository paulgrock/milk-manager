# Milk Manager

Records for a dairy goat herd: the goats, their milk, breeding and care, and what the farm makes from the milk.

## Language

### Cheese

**Make**:
One session of making a single cheese type on one day, from milk in, to cheese out.
_Avoid_: Batch, wheel, lot

**Cheese type**:
A kind of cheese the farm makes, such as chèvre or tomme, with its usual aging time. The farm keeps its own list and adds to it.
_Avoid_: Cheese kind, recipe, style

**Aging time**:
How long a cheese type usually ages before it's ready, in months; zero for fresh cheese.
_Avoid_: Cure time, ripening period

**Ready date**:
The day a make is expected to be ready to eat or sell: the make date plus its type's aging time, unless changed for that make.
_Avoid_: Done date, due date

**Finished**:
A make that has all been eaten, sold or given away.
_Avoid_: Closed, archived, used up

### Chores

**Chore**:
A farm task that repeats every so many days and belongs to the farm rather than to a goat, such as cleaning stalls or filling waterers.
_Avoid_: Task, job, to-do

**Chore done**:
One time a chore was done: the date, who did it, and an optional note. A chore is next due its repeat time after the last one.
_Avoid_: Completion, check-off

**Not recorded yet**:
A chore with no chore done on record, so it has no due date. It stays off Today and the calendar until a date is entered.
_Avoid_: Never done, overdue

### Reminders

**Due soon**:
Coming due within a quarter of its repeat time, and never more than 7 days ahead. Applies to care and chores alike.
_Avoid_: Upcoming, almost due
