# Ratio Compliance App

A Vite + React + TypeScript MVP for planning child/caregiver ratio compliance using age-aware standards.

## What this version includes

- Schedule setup with date, open/close time, and interval size.
- Child/student entries using one of three age sources:
  - Date of birth, preferred.
  - Static age in months, warning shown.
  - Manual age bucket, warning shown.
- Caregiver schedule entries with count, start/end time, and whether they count toward ratio.
- Built-in Texas licensed child-care home standards based on the provided pages:
  - 26 TAC §747.1801, one-caregiver licensed child-care home table.
  - 26 TAC §747.1803, two-caregiver licensed child-care home table.
- Standards-first compliance engine under `src/core`.
- JSON import/export.
- Standards JSON import/export intake when no built-in standard should be used.
- CSV compliance export.
- Human-readable staffing script export.
- Printable HTML report export.

## Important compliance note

This app is a planning/support tool. It does not provide legal advice. Verify the embedded standards against the current official source before operational reliance. The engine intentionally does not extrapolate beyond the loaded one- and two-caregiver tables.

## Run locally

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Source layout

```text
src/
  app/
    RatioComplianceApp.tsx       UI shell and editable tables
    sampleSchedule.ts            Starter data

  core/
    age/
      ageBuckets.ts              DOB/static/manual bucket resolution

    standards/
      types.ts                   Standards and age-mix types
      builtInTexasLicensedChildCareHome.ts

    time/
      time.ts                    Time parsing, formatting, interval grid

    compliance/
      calculateCompliance.ts     Main engine
      standardsEvaluation.ts     One/two caregiver table checks
      collapseIntervals.ts       Human-readable timeline compression
      types.ts

    export/
      exporters.ts               JSON/CSV/script/HTML exports
```

## Design rule

UI does not own compliance logic. The reusable engine is:

```ts
calculateCompliance(schedule)
```

That makes the logic portable to a CLI, backend API, spreadsheet import tool, or admin-panel integration later.
