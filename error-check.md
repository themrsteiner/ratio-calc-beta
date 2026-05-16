# Code Audit Report

## Findings

| File Path | Line(s) | Explanation |
| :--- | :--- | :--- |
| `src/core/week/weekHelpers.ts` | 17-27 | Uses `crypto.randomUUID()` in the browser; while supported in modern browsers, it may fail in legacy environments. Consider a fallback generator. |
| `src/app/hooks/useWorkspace.ts` | 27-31 | `localStorage.getItem` is parsed directly inside `useState`. If corrupted JSON is stored, it throws, causing the app to crash on load. A `try-catch` with a graceful recovery or schema validation is safer. |
| `src/core/compliance/calculateCompliance.ts` | Multiple | The logic relies on `interval.scheduledCaregivers * 5`. The multiplier `5` is hardcoded, which assumes a fixed ratio across all facility types, violating the standard-set flexibility. |
| `src/core/compliance/standardsEvaluation.ts` | 13 | The `ruleLevel: 'beyondLoadedStandards'` return is a fallback, but the application doesn't seem to explicitly handle this case in the UI, potentially leading to 'Review' states that aren't well-defined for users. |
| `src/ui/dashboard/TexasStandardsTable.tsx` | 23-45 | Tables are using `compactTable` class in some places and `dataTable` in others; inconsistent padding and font-size overrides are present. |
| `src/app/RatioComplianceApp.tsx` | 467-550 | The JSX return is excessively large, containing complex business logic (e.g., timeline rendering, conditional warnings) directly in the render method. This should be extracted into smaller, isolated components. |

## Proposed Fixes

1.  **Browser UUID Compatibility:** Replace `crypto.randomUUID()` in `weekHelpers.ts` with a small, robust UUID generator library or a polyfill to ensure consistent behavior across all supported browsers.
2.  **Robust Storage Handling:** Refactor the `useWorkspace` hook in `useWorkspace.ts` to implement a proper schema validator (like `zod`) when parsing `localStorage`. If validation fails, reset to a default state rather than crashing.
3.  **Decouple Compliance Multipliers:** Remove the hardcoded `* 5` ratio in `calculateCompliance.ts`. Introduce a `ratioMultiplier` property into the `RatioStandardSet` object to allow for different rules per standard (e.g., 1:5, 1:12, etc.).
4.  **Enhance 'Beyond Standards' Logic:** Update `standardsEvaluation.ts` and the UI to explicitly handle `beyondLoadedStandards`. Provide an informative modal or clear UI flag when the compliance engine encounters an age mix outside its loaded regulatory database.
5.  **Componentize Dashboard:** Refactor `RatioComplianceApp.tsx` by moving the timeline rendering logic and warning box generation into dedicated components (e.g., `ComplianceTimelineView.tsx`, `ComplianceWarningBox.tsx`). This will improve readability and testability.
6.  **Style Standardization:** Audit the CSS classes across all tables to consolidate padding, margin, and font styles into a unified `DataTable` pattern, removing local style overrides in TSX files.
