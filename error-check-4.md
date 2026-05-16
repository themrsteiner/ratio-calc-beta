# Code Audit Report 4

## Findings (Exhaustive Final Pass)

| File Path | Line(s) | Explanation |
| :--- | :--- | :--- |
| `src/app/hooks/useWorkspace.ts` | 28-30 | Potential runtime error: `localStorage` access is not wrapped in a try/catch during JSON parsing, potentially crashing the app if malformed data exists. |
| `src/core/compliance/calculateCompliance.ts` | 64 | Hardcoded magic number `5` in `interval.scheduledCaregivers * 5` creates a tight coupling that assumes all standards use a 1:5 ratio, breaking support for other standards. |
| `src/ui/editor/WeeklyStaffEditor.tsx` | 134 | Use of `window.confirm` for destructive data deletion is non-standard and blocks the UI thread. Should be replaced with a component-based modal confirmation. |
| `src/ui/dashboard/TexasStandardsTable.tsx` | 12 | The component hardcodes the usage of `TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS` instead of receiving a `standardSet` prop, which limits the extensibility of the dashboard. |
| `src/app/RatioComplianceApp.tsx` | 275-290 | Manual generation of hamburger menu DOM using `div` elements is redundant, as a reusable `MenuIcon` or `PanelToggle` (stylized) component could encapsulate this logic. |
| `src/styles.css` | 100-300 | Several duplicate selectors exist (e.g., multiple definitions of `.panel` and button states) despite consolidation efforts, leading to CSS specificity issues. |
| `src/core/week/weekHelpers.ts` | 20 | Use of `crypto.randomUUID()` will fail in environments where `crypto` is not available or non-secure (e.g., older browsers or non-HTTPS connections). |

## Proposed Fixes

1.  **Robust Persistence:** Implement a schema validation library like `zod` in `useWorkspace.ts` to ensure that loaded JSON strictly adheres to the expected `RatioScheduleWeek` interface.
2.  **Standards Abstraction:** Refactor `calculateCompliance.ts` to fetch ratio multipliers from the `activeWeek.standards` configuration object rather than relying on hardcoded literals.
3.  **UI Component Registry:** Create a `src/ui/components/ConfirmationModal.tsx` to standardize all destructive deletion actions, replacing `window.confirm`.
4.  **Table Generalization:** Refactor `TexasStandardsTable.tsx` to become a generic `ComplianceStandardsTable` component that accepts a `standardSet` configuration object, allowing it to render any state standard seamlessly.
5.  **Icon Componentization:** Extract the hamburger icon DOM structure used in the `RatioComplianceApp.tsx` global menu into a functional `MenuIcon` component.
6.  **CSS Cleanup:** Perform a single, definitive pass on `styles.css` to remove all overlapping style blocks and ensure all UI elements inherit directly from the established variable registry.
7.  **Polyfill UUID:** Import a small `uuid` utility function to replace `crypto.randomUUID()` in `weekHelpers.ts` for consistent cross-browser ID generation.
