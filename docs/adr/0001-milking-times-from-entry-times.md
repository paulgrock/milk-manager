# Milking start and stop times come from when weights were entered

The DHIR Owner's Options form asks for the start and stop time of the previous milking and of each test-day milking. We take them from `milk_weights.entered_at`: the first and last time a weight was entered for that milking. A time corrected by hand for that day (`milking_times`, one row per herd and milking day) wins over the one worked out. Corrections belong to the day, not to a test, because the sheet is filled in on test day, before the lab's results (and so the test) are recorded.

`entered_at` is the phone's clock when the weight was saved, not `recorded_at` (when the server got it). Saves made with no signal are sent later, and the server's time would be wrong for them. The server keeps the phone's time unless it's in the future or more than 30 days old.

## Considered options

- **Ask for start and stop times on test day.** One more thing to remember at milking, and it's forgotten when it matters most.
- **Use `recorded_at`.** Wrong whenever weights were saved offline and uploaded later.

## Consequences

- The first time is after the first doe is milked, not when milking began, so it runs a few minutes late. That's close enough for the lab and can be corrected.
- Weights typed in afterwards from paper give times that mean nothing. The test sheet shows them as worked out from entry times so they're checked, and a milking with no weights, or only a day total, has no times at all.
