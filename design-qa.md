# Design QA

- Source visual truth: `C:/Users/tavri/AppData/Local/Temp/codex-clipboard-87b1e3cc-9c52-4ce8-9df7-d5df4701c815.png`
- Implementation screenshot: unavailable; repository instructions prohibit in-app browser preview.
- Viewport: 617 × 969 source pixels.
- State: mobile role management exact UID lookup returning an incorrect empty result; equipment detail compact actions and operation times are related requested states.

## Full-view comparison evidence

The source was opened at original resolution. The entered mixed-case Firebase UID matches the signed-in account shown in the earlier account state, but the lookup incorrectly reports no user because the backend lowercased the UID before exact matching.

## Focused-region comparison evidence

The lookup path now preserves UID casing and only normalizes Email. Equipment actions consume the detail shell's mobile `compact` state, and equipment/proposal details share the same operation-time list presentation. Equipment shows existing timestamps for `待受理`, `開始處理`, and the applicable terminal state (`已完成` or `無法處理`).

## Findings

- [Blocked] A rendered after-screenshot cannot be captured under the repository's no-browser-preview rule, so final pixel spacing and text wrapping cannot be signed off visually.
- Code-level exact lookup behavior, shared component reuse, compact action wiring, and timestamp-state mapping pass static checks.

## Comparison history

- Initial finding: exact UID lookup changed case and could not find the current user; equipment action sizing and operation times did not follow proposal detail behavior on mobile.
- Fix: preserve exact UID casing, normalize Email only, wire all equipment actions to compact mode, and reuse a common operation-time list for proposal and equipment details.
- Post-fix evidence: typecheck, lint, unused checks, Edge checks, 32 architecture tests, and production build pass; rendered evidence remains unavailable.

final result: blocked
