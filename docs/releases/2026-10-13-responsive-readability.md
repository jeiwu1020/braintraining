# Responsive readability release — 2026-10-13

## Scope

- Includes the prior 14-game desktop readability pass and the current mobile-landscape priority corrections.
- Desktop enhancements are opt-in and require width >=1024px, height >=650px, landscape, fine pointer and hover.
- Short-landscape priority styles apply only at height <=480px.
- Logic Detective gives clues the full right-side main area, moves tools and confirmation into one bottom row, and shows challenge comparisons on the main stage.
- Current puzzle information precedes mode/settings visually. Word Path history and detective derived-reason details can be expanded on demand.
- Nim retains its original piles, column proportions and rules. Only the commit/opponent button is fixed; quantity options and long supporting text remain scrollable, including at 320px-high guard viewports.
- Guess Card desktop values and suits are larger inside the unchanged 24/52-card grids.
- Pyramid desktop card dimensions and row spacing fit the available playfield; stock, waste and empty slots share dimensions.
- No game rules, puzzle banks, scoring, timers, hint knowledge, undo semantics or confirmation transactions are changed.

## Verification

- 125 Vitest files: 826 passed and one pre-existing conditional skip.
- TypeScript noEmit, Vite production build and git diff --check passed.
- CSS/DOM contracts include 852x393, 640x360, 844x390, 932x430 and Nim guards at 568x320/640x320.
- Full 67-route source inventory completed. Six existing short-height cases remain candidates for device checks; games without evidence of this defect were not blindly rewritten.
- Source review closed the Nim fixed-control overflow finding.

## Limits

The tests are DOM, CSS-cascade and dimensional-formula checks, not real-browser pixel/layout validation. Phone safe areas, browser toolbar changes, device rotation and true keyboard/assistive-technology order still require device verification. Visual CSS ordering intentionally differs from existing DOM order in the compact information panel; current controls remain semantic and focusable.
