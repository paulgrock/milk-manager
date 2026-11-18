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
How long a cheese type usually ages before it's ready, in days; zero for fresh cheese.
_Avoid_: Cure time, ripening period

**Ready date**:
The day a make is expected to be ready to eat or sell: the make date plus its type's aging time, unless changed for that make.
_Avoid_: Done date, due date

**Fresh**:
A make that's ready the day it's made (its ready date is its make date), such as chèvre. It has no wait, so it's never listed as coming ready.
_Avoid_: Unaged

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

### Milk

**Milking order**:
The order does come onto the milking stand. Milk entry lists them that way, so typing follows the barn.
_Avoid_: Sort order, line order

### Adoptions

**Adopter**:
A person who reserves or adopts a kid or goat from the farm. The farm keeps them from year to year.
_Avoid_: Buyer, customer, client

**Kidding season**:
The year a doe's kids are born. A reservation is for one season.
_Avoid_: Year, kidding year

**Reservation**:
An adopter's place in line for kids in a kidding season: from one doe or any doe, of the sex they want, and how many.
_Avoid_: Waitlist entry, hold, booking

**Place in line**:
Where a reservation stands among others for the same doe's kids that season. First in line gets first pick.
_Avoid_: Priority, rank, queue position

**Deposit**:
Money an adopter pays to hold a reservation. It comes off the adoption fee when they adopt; otherwise it's refunded, kept, or moved to another doe or season.
_Avoid_: Down payment, hold fee

**Match**:
Pairing a kid that's been born with a reservation, before it's adopted.
_Avoid_: Assign, allocate

**Adoption**:
One kid or goat going to an adopter for an adoption fee, with an optional pickup date. The goat leaves the herd on pickup. The books still count it as a kid or goat sale.
_Avoid_: Sale, purchase, order

**Adoption fee**:
What an adopter pays for a kid or goat, before any deposit comes off.
_Avoid_: Price, sale price

### Milk tests

**Test sheet**:
What gets written by hand on the lab's two DHIR forms for one test day (the Owner's Options form and the barn sheet), shown in the app in the forms' order so it can be copied across. Opened from Milk tests for any milking day, whether or not the test has been recorded yet. Only the handwritten parts: the lab prints everything else.
_Avoid_: Test form, printout, report

**Barn sheet**:
The lab's form with one row per doe, printed with her last test's results. On test day the owner writes each doe's 1st (AM) and 2nd (PM) milk weights on it, in pounds to one decimal.
_Avoid_: Weigh sheet, test sheet

**DHIR sample number**:
A doe's row number on the lab's barn sheet, set once and kept from test to test, so the test sheet lists does in the same order as the lab's paper.
_Avoid_: Cow number, row, position

**Previous milking**:
The milking before the test day's first one: the evening (PM) milking the day before. The form asks for its start and stop times so the lab can work out the 24-hour period.
_Avoid_: Last milking, prior milking

**Milking start/stop**:
When a milking began and ended, as written on the Owner's Options form. Taken from the first and last time a weight was entered for that milking, and corrected by hand for that day when that's wrong.
_Avoid_: Milking window, milking time

**New to test**:
A doe in milk on a test day that has no result on any earlier DHIR test, so she isn't on the lab's barn sheet yet and goes under New Cow Enrollment.
_Avoid_: New cow, new enrollment, fresh doe
