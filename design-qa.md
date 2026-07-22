# Design QA

- References: `C:/Users/tavri/Downloads/IMG_3460.PNG`, `IMG_3461.PNG`, `IMG_3462.PNG`, and `IMG_3463.PNG`.
- Target: correct mobile sheet padding, natural-height action menu, usable proposal composer, translated action labels, independently presented desktop settings/notification popups, centered sidebar avatar, and retained neumorphic shadows without iOS WebKit ghost layers.
- Structural review: sheet handle removed from layout flow; padded dialogs use equal outer padding; action menu uses content height; composer owns its viewport height; desktop utility panels no longer share visible navigation; skeleton opacity runs on a shadow-free inner node; keyed list teardown no longer recreates the shadow tree; iOS route transitions avoid transformed shadow ancestors.
- Automated review: `verify:local` passed; the separately rerun `verify:integration` passed 18 tests with 0 failures.
- Visual comparison: blocked because this repository's `AGENTS.md` explicitly prohibits in-app browser preview. No browser screenshot was captured.

final result: blocked
