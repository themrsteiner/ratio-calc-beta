# Code Audit Report 2

## Findings

| File Path | Line(s) | Explanation |
| :--- | :--- | :--- |
| `src/app/RatioComplianceApp.tsx` | 380-450 | Redundant component definitions: `PanelToggle` is redefined locally, conflicting with the global version. |
| `src/app/RatioComplianceApp.tsx` | 570-588 | Double-header/Double-toggle issue: `WeeklyStaffEditor` and `WeeklyStudentEditor` contain internal `panelHeader` and `PanelToggle` elements, while being wrapped in a `CollapsibleSection` that provides its own header. |
| `src/ui/nav/WeekOverview.tsx` | 40-70 | Logic discrepancy: The hero header contains mixed alignment logic (absolute positioning for settings button, flexbox for content), making it fragile to text length changes. |
| `src/styles.css` | 200-678 | CSS duplication: Several style blocks (like `.panel`, `.panelHeader`, `.miniTimelineTable`) are redefined or contain conflicting rules, which can lead to layout instability. |
| `src/ui/editor/WeeklyStaffEditor.tsx` | 130-150 | Use of `window.confirm` for destructive 'Delete' actions blocks the UI thread and is inconsistent with the 'Settings' menu modal patterns. |
| `src/ui/editor/WeeklyStudentEditor.tsx` | 120-140 | Use of `window.confirm` for destructive 'Delete' actions. |
| `src/core/week/weekHelpers.ts` | 17-27 | Browser compatibility: `crypto.randomUUID()` is used; lacks fallback for non-secure contexts or older browsers. |

## Proposed Fixes

1.  **Remove Redundant PanelToggles:** Consolidate `PanelToggle` usage by removing all local definitions and ensuring they reference the global component in `src/ui/components/PanelToggle.tsx`.
2.  **Harmonize Editor Headers:** Remove internal `panelHeader` components from the editor files, as the parent `CollapsibleSection` in `RatioComplianceApp.tsx` manages this.
3.  **Refactor Hero Layout:** Standardize the `WeekOverview` hero container using a consistent Flexbox strategy that accounts for both the content and the 'Settings' button within the same layout stream, avoiding absolute positioning.
4.  **Purge CSS Redundancy:** Perform a full sweep of `styles.css` to delete redundant style definitions and apply a single source-of-truth for each component class.
5.  **Replace Confirmations:** Replace `window.confirm` with a custom, application-branded confirmation modal component to improve user experience and maintain interface design standards.
6.  **UUID Polyfill:** Implement a simple fallback for `crypto.randomUUID()` to ensure ID generation works reliably across all deployment environments.
