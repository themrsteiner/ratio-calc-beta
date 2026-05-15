# Happy Baby import datasets

This package contains two importable dataset options for the Ratio Compliance App v1.

Important: the provided roster did not include student birthdays or ages. To keep the files importable, every student is currently assigned this placeholder age source:

manualAgeBucket: eighteenMonthsToThreeYears

Each student row includes a TODO note. Replace the placeholder with each student's date of birth or correct age category before relying on compliance results. Until then, the imported files are schedule-entry scaffolds, not final ratio-compliance records.

The app currently imports one schedule JSON at a time, so each weekday is a separate JSON file.

Option A: Rylie Monday/Tuesday/Thursday
- option-a-rylie-mon-tue-thu/happy-baby-option-a-rylie-mon-tue-thu-monday.json
- option-a-rylie-mon-tue-thu/happy-baby-option-a-rylie-mon-tue-thu-tuesday.json
- option-a-rylie-mon-tue-thu/happy-baby-option-a-rylie-mon-tue-thu-wednesday.json
- option-a-rylie-mon-tue-thu/happy-baby-option-a-rylie-mon-tue-thu-thursday.json
- option-a-rylie-mon-tue-thu/happy-baby-option-a-rylie-mon-tue-thu-friday.json

Option B: Rylie Monday/Wednesday/Friday
- option-b-rylie-mon-wed-fri/happy-baby-option-b-rylie-mon-wed-fri-monday.json
- option-b-rylie-mon-wed-fri/happy-baby-option-b-rylie-mon-wed-fri-tuesday.json
- option-b-rylie-mon-wed-fri/happy-baby-option-b-rylie-mon-wed-fri-wednesday.json
- option-b-rylie-mon-wed-fri/happy-baby-option-b-rylie-mon-wed-fri-thursday.json
- option-b-rylie-mon-wed-fri/happy-baby-option-b-rylie-mon-wed-fri-friday.json

Schedules use a sample week:
- Monday: 2026-05-18
- Tuesday: 2026-05-19
- Wednesday: 2026-05-20
- Thursday: 2026-05-21
- Friday: 2026-05-22

No staff schedule was provided, so each file imports with an empty staff list. Add caregivers in the app after import.
