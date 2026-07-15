# Design QA

- Source visual truth: `C:/Users/tavri/AppData/Local/Temp/codex-clipboard-da1d0f9e-3037-42e4-8756-de4b6741fd55.png`
- Implementation screenshot: unavailable; repository instructions prohibit in-app browser preview.
- Viewport: 1093 × 1007 source pixels.
- State: desktop equipment detail in `processing`, with the bottom action area visible; account UID is a separate settings state.

## Full-view comparison evidence

The source was opened at original resolution. The equipment detail layout already matches the shared detail shell, but the dark `更新狀態` button does not communicate its next action and differs from proposal detail actions.

## Focused-region comparison evidence

The circled bottom-right action region was inspected. The implementation now uses the same `DetailActionButton` component as proposal detail, with an edit icon and state-specific copy: `開始處理` while pending and `完成／無法處理` while processing. The account header now places a small copy icon beside the UID.

## Findings

- [Blocked] A rendered after-screenshot cannot be captured under the repository's no-browser-preview rule, so final pixel spacing and text wrapping cannot be signed off visually.
- Code-level component reuse, accessible labels, clipboard fallback, feedback states, responsive build, and static behavior checks pass.

## Comparison history

- Initial finding: generic dark status button did not reveal whether it would start or finish processing.
- Fix: replaced it with the proposal detail action component and explicit next-action wording; added UID copy affordance and feedback.
- Post-fix evidence: typecheck, lint, unused checks, 32 architecture tests, and production build pass; rendered evidence remains unavailable.

final result: blocked
