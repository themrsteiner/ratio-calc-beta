# Code Audit Report 6 (Exhaustive Line-by-Line Findings)

## Findings

| File Path | Line(s) | Explanation |
| :--- | :--- | :--- |
| `src/core/week/types.ts` | 1-20 | Data models (e.g., `RatioScheduleWeek`) are defined without strict validation, relying on manual interface contracts rather than runtime checked schemas. |
| `src/core/time/time.ts` | 5-15 | `formatTime` assumes 24-hour input and returns 12-hour/24-hour output based on simple string splitting; potentially brittle for edge cases in time representation. |
| `src/core/compliance/calculateCompliance.ts` | 64 | Logic relies on `interval.scheduledCaregivers * 5`. Hardcoded multiplier ignores variable ratio requirements per facility standard. |
| `src/app/hooks/useWorkspace.ts` | 27-30 | LocalStorage access is not inside a `try/catch` block; `JSON.parse` will crash the application state initializer if data is corrupted. |
| `src/ui/dashboard/TexasStandardsTable.tsx` | 12 | The table component is coupled to `TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS` rather than accepting a generic standards configuration. |
| `src/ui/editor/WeeklyStaffEditor.tsx` | 134 | The `onRemoveStaff` handler uses `window.confirm`. This blocks the main thread and lacks integration with the application's unified modal/UX system. |
| `src/ui/editor/WeeklyStudentEditor.tsx` | 128 | Similar to StaffEditor, destructive 'Delete' actions rely on `window.confirm`. |
| `src/styles.css` | 1-600 | Despite cleanup efforts, some residual CSS specificities exist (e.g., global `h1, h2, h3` margin resets) that might conflict with component-level spacing. |
| `src/core/week/weekHelpers.ts` | 20 | `crypto.randomUUID()` is used; without a fallback for older environments (like non-HTTPS local development or legacy browsers), ID generation will fail. |
| `src/app/RatioComplianceApp.tsx` | 467-580 | The Dashboard section render logic is monolithic, containing mixed concerns of data calculation, timeline rendering, and warning box logic, complicating maintenance. |

## Proposed Fixes

1.  **Schema Validation:** Introduce `zod` for `RatioScheduleWeek` and related interfaces to validate `localStorage` and imported JSON data at runtime.
2.  **Standards Configuration:** Refactor `TexasStandardsTable.tsx` and the compliance calculation core to accept `standardSet` configurations as props, allowing the application to support new states without modifying core business logic.
3.  **UI Component Registry:** Create a custom `ConfirmationModal` component to replace all `window.confirm` calls.
4.  **Decouple Compliance:** Introduce a `ratioMultiplier` property into the standard set configurations and refactor `calculateCompliance.ts` to use this dynamic multiplier rather than a hardcoded `5`.
5.  **Componentize Dashboard:** Break down `RatioComplianceApp.tsx` into smaller functional modules (`TimelineView.tsx`, `ComplianceWarnings.tsx`, `SettingsModal.tsx`) to improve readability and testability.
6.  **UUID Polyfill:** Import a small `uuid` utility library or a simple fallback function for ID generation to ensure broad compatibility.
7.  **Global Style Cleanup:** Perform one final pass on `styles.css` to define and enforce standardized margins for header levels `h1-h4` instead of relying on individual resets.
