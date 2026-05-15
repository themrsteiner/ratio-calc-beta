# Ratio Compliance App — Scope, Roadmap, and Architecture

## Current source of truth

This project treats the schedule as data, the standards as data, and compliance as a pure calculation.

The app is currently scoped to licensed child-care home planning using the standards tables provided by the user:

- One-caregiver table: birth-17 months, 18 months through 3 years, 4 years and older.
- Two-caregiver table: 0-17 months and 18 months and older.

The engine does not extrapolate beyond loaded standards.

## Core principle

The app should never claim compliance unless it has the standards required to evaluate the current child mix.

A staffing gap is different from missing standards:

- `gap`: standards are loaded, required caregivers are known, scheduled caregivers are insufficient.
- `needsReview`: loaded standards do not cover this child mix.
- `noStandards`: no standard set is configured.

## Phase 1 MVP

- Schedule date, open/close, interval size.
- Child/student rows with:
  - Name/group label.
  - Count.
  - Arrival time.
  - Departure time.
  - Age source.
- Age source modes:
  - DOB: preferred, auto-updates based on schedule date.
  - Static age in months: allowed, warning shown.
  - Manual bucket: allowed, warning shown.
- Staff/caregiver rows with:
  - Label.
  - Count.
  - Start/end time.
  - Counts toward ratio.
- Built-in ratio standard set.
- Compliance timeline.
- Collapsed timeline blocks.
- Export JSON, CSV, human-readable script, printable HTML.

## Standards model

The canonical internal age buckets are:

```ts
type CanonicalAgeMix = {
  birthTo17Months: number;
  eighteenMonthsToThreeYears: number;
  fourYearsAndOlder: number;
};
```

One-caregiver checks use those three buckets directly.

Two-caregiver checks project the canonical mix into:

```ts
zeroTo17Months = birthTo17Months;
eighteenMonthsAndOlder = eighteenMonthsToThreeYears + fourYearsAndOlder;
```

## Roadmap

### Phase 2

- Custom standards editor.
- Standards JSON import/export.
- Store multiple jurisdiction/facility profiles.
- Add notes/attestation to exports.
- Add validation report for strange schedules.

### Phase 3

- Individual student database.
- Birthday rollover alerts.
- Weekly templates.
- Actual attendance mode vs planned schedule mode.
- Audit log of exports.

### Phase 4

- Admin-panel integration.
- Backend persistence.
- Multi-room/group support.
- Staff qualification rules.
- Break/lunch coverage planning.

## Guardrails

- Do not hard-code compliance rules into the UI.
- Do not calculate ratio from a single `students / staff` number when age mix standards are loaded.
- Do not extrapolate 3+ caregiver rules unless explicit standards are provided.
- Manual age category entry must remain visibly warned.
- Birthday-based calculation requires a schedule date.
