# FACILITATOR migration audit

## Audit status

- Baseline: `3816fed47be7bb519973a550bfe139a5d1ab8da3`
- Audit type: audit plus LIGHT implementation status tracking.
- Current overall standardization: `53/59`
- `FACILITATOR`: `11/11` — Conditional Snap, Zoom, Verbal Memory, Story Cards, Price Estimation, Word Chain, Guess Who, Treasure, Higher/Lower, Positive Reappraisal, and Roulette are complete and reviewer real-device accepted. Roulette's previous FULL attempt and the later THREE-COLUMN V2 correction remain recorded as historical evidence.
- Runtime/browser tooling: in-app browser runtime was available at a fixed `655×552` viewport for this batch. Unmeasured target viewport findings remain labeled `STATIC SOURCE INFERENCE`; reviewer-provided findings are labeled `REAL-DEVICE CONFIRMED` or `REAL-DEVICE ACCEPTED`.
- Phone landscape is evaluated by short height (`640×360`, `844×390`, `932×430`), not by a width-only `max-width: 700px` rule.
- Platform note: the intermittent iOS Home Screen Web App top blank strip was resolved after reinstall (REAL-DEVICE PASS). The later edge-to-edge pass exposed Dynamic Island overlap on MainMenu and some dedicated screens; safe-area integration, MainMenu ownership, and Price ownership are now REAL-DEVICE PASS.

## Methodology

The audit inspected the actual route/catalog entries and all eleven component files, including their root sizing, `landscape:`/`sm:`/`lg:` branches, fixed and minimum heights, overflow behavior, primary stimulus geometry, facilitator controls, status/reveal surfaces, and state-sensitive interactions. The target is a facilitator holding a phone in landscape for a group: the stimulus must remain prominent, core controls must be reachable, and only secondary lists or instructions may scroll locally.

The classification means:

- `KEEP`: the current architecture already meets the practical acceptance intent; no production migration is recommended.
- `LIGHT`: the regions and gameplay model are correct, but targeted responsive, accessibility, spacing, or modal work is needed.
- `FULL`: the primary regions cannot coexist at `640×360` with a readable stimulus and usable controls without a new composition. This is a recommendation only; no FULL work is included here.

## 11-game summary matrix

| Game | Component | Classification | Primary visible issue | Why change / why keep | Evidence level | Primary stimulus dominance | Touch targets | Overflow risk | Gameplay-state risk | Recommended model | Reviewer should check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 局部猜全貌 | `components/ZoomGame.tsx` | LIGHT | Scoring and normal gameplay passed reviewer real-device check; completion screen overflowed in landscape, and reviewer requested stronger initial crop. | Keep the single-stage image/reveal flow and current landscape footprint; compact completion state and use the approved NORMAL/ADVANCED initial zoom values. | REAL-DEVICE CONFIRMED | YES | MINOR ISSUE | HIGH (pre-fix completion overflow) | MEDIUM | Luna Medium | Initial crop, potential score, completion card, header actions |
| 記憶翻牌（口語版） | `components/VerbalMemoryGame.tsx` | LIGHT | REAL-DEVICE CONFIRMED pre-fix: the memory field was held toward the upper area, leaving a large unused lower region; direct emoji-size refinement was also accepted. | Keep the memory grid and flip state; size the complete 4×4/5×4 field from remaining landscape height and center it, then label/reset controls. | REAL-DEVICE CONFIRMED | YES | MINOR ISSUE | HIGH (pre-fix allocation) | MEDIUM | Luna Medium | NORMAL/ADVANCED whole-grid visibility, balance, card selection, completion |
| 語意聯想 | `components/WordChainGame.tsx` | LIGHT | The landscape row is viable, but icon-only Back/Reset are about 40px and the timeout modal has no height contract. | Keep the prompt plus timer/score rail; make controls accessible and protect the timed modal. | STATIC SOURCE INFERENCE | YES | MINOR ISSUE | MEDIUM | HIGH | Luna High | Prompt dominance, timer, add-score/start, timeout modal |
| 猜猜我是誰 | `components/GuessWhoGame.tsx` | LIGHT | REAL-DEVICE ACCEPTED: the three-column correction keeps candidates, 2×5 questions, and history usable in phone landscape. | Keep the accepted safe-area/header/history semantics, with horizontal `candidate | questions | history` composition. | REAL-DEVICE ACCEPTED | YES | ACCEPTED | LOW | MEDIUM | Luna High | Avatar visibility, 2×5 questions, history review |
| 故事聯想卡 | `components/StoryCardsGame.tsx` | LIGHT | REAL-DEVICE ACCEPTED: 4/5-card layout, clipping fixes, ADVANCED spacing, zoom size/upper-left position, 60-card pool, category-diverse draws, and immediate repeat prevention. | Keep the accepted 4/5-card stage and UI; content enhancement is complete without changing the visual composition. | REAL-DEVICE CONFIRMED | YES | ACCEPTED | LOW | MEDIUM | Luna Medium | Final content variety and accepted touch UI |
| 條件反應大挑戰 | `components/ConditionalSnapGame.tsx` | LIGHT | REAL-DEVICE CONFIRMED pre-fix: the bottom of the game extended beyond the phone screen in landscape; source risk was an unconstrained circle/arrow height combination. | Keep the large central stimulus and two-arrow facilitator flow; constrain it by short height and add names/targets. | REAL-DEVICE CONFIRMED (pre-fix) | YES | MINOR ISSUE | HIGH | LOW | Luna Medium | Circle visibility, target selector, arrows, rules modal |
| 尋寶大冒險 | `components/TreasureGame.tsx` | LIGHT | REAL-DEVICE ACCEPTED: dedicated safe-stage ownership, compact two-column setup, 44px-class controls, compact status, and remaining-stage 4×4/5×5 board sizing. | Keep the map/grid, preview/radar settings, inline game-over banner, and original state machine; use scoped responsive spacing and remaining-stage sizing. | REAL-DEVICE ACCEPTED | YES | ACCEPTED | MEDIUM | HIGH | Luna High | Setup completion, 4×4/5×5 grid, preview timer, radar, game-over |
| 命運轉盤 | `components/RouletteGame.tsx` | FULL | Previous compact-summary + popup-editor attempt was REAL-DEVICE FAILED: it reduced facilitator visibility, left large unused space, made wheel/action/footer compete, and exposed a real candidate before the first spin. The THREE-COLUMN V2 direct-control composition then passed reviewer, including the later fixed 44×44 Back/Settings alignment. | Restore immediate visibility of both teams' item/amount/confirm controls while preserving wheel behavior, neutral pre-spin state, result flow, and game-over semantics. | REAL-DEVICE ACCEPTED (after confirmed failure and correction) | YES | ACCEPTED | HIGH | HIGH | Luna Max | A｜CENTER｜B fit, all item/amount controls, neutral wheel, spin/result, event guide, setup and game-over |
| 步步高升 | `components/HigherLowerGame.tsx` | LIGHT | REAL-DEVICE ACCEPTED after final visual refinement: team name/score hierarchy, card label spacing, horizontal reveal action, compact result/action bar, and nowrap next control. | Keep the two-team simultaneous prediction/card flow, original card rules and score semantics, and use scoped short-height layout corrections. | REAL-DEVICE ACCEPTED | YES | ACCEPTED | MEDIUM | HIGH | Luna Medium | Current/previous card, both teams, prediction controls, result/action bar, Rules bounds |
| 價格估算 | `components/PriceEstimationGame.tsx` | LIGHT | REAL-DEVICE CONFIRMED: normal gameplay is usable, but the final 挑戰完成 state exceeds phone landscape; the edge-to-edge screen can also place content under the Dynamic Island/unsafe horizontal region. | Keep prompt plus three-option answer semantics; apply the non-GameShell safe-area contract, compact and center completion, and label header/actions without changing gameplay. | REAL-DEVICE CONFIRMED | YES | MINOR ISSUE | HIGH (pre-fix completion/safe-area) | MEDIUM | Luna High | Prompt, three options, completion bounds, safe-area ownership |
| 轉念練習 | `components/PositiveReappraisalGame.tsx` | LIGHT | Landscape deliberately reduces progress text to `10px` and the reveal/next controls to compact heights; the fixed bottom bar competes with the two-column text stage. | Keep the event/negative-thought/reframe split and local text scrolling; restore minimum readability and predictable controls. | STATIC SOURCE INFERENCE | BORDERLINE | MINOR ISSUE | MEDIUM | MEDIUM | Luna High | Scenario text, reveal, reframe list, next action, bottom bar |

## Detailed game reports

## 局部猜全貌

COMPONENT

`components/ZoomGame.tsx` (`GameState.ZOOM`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE (PRE-IMPLEMENTATION)

- Root: fixed `h-[100dvh]` / `max-h-[100dvh]` column with `overflow-hidden`.
- Header: title/subtitle with icon-only Back and Reset buttons using `p-2`.
- Primary: zoomable emoji/image stage, `w-64 h-64` normally but `landscape:w-40 landscape:h-40`.
- Controls: zoom out, reveal, then correct/wrong response buttons.
- Status: timer and score bar above the stage.
- Scroll: main region is `overflow-y-auto`; completed state is inside that region.
- Modal: no separate rules modal; completion is an in-flow result card.

VIEWPORT FINDINGS

640×360: reviewer real-device inspection confirms the existing `landscape:w-40` / `landscape:h-40` primary stage and normal gameplay composition are acceptable. Reviewer separately confirmed that the final completion screen overflowed below the phone viewport; completion now removes the in-round stats bar and uses the remaining region for a compact centered card.

844×390: preserve the existing landscape geometry and spacing; use the available row without introducing a larger image or a new layout. The completion state uses the same bounded region rather than page scrolling.

932×430: `lg:` is not active at this width; the same `160px` landscape stage persists despite additional room.

390×844: the normal `w-64 h-64` stage is used and the main region can locally scroll; the vertical arrangement is understandable, with the header controls still icon-only.

1280×720: `lg:w-80 lg:h-80` restores the spacious stage and the desktop layout is not the primary concern.

PRIMARY STIMULUS DOMINANCE

YES — reviewer real-device evidence confirms the current image/stimulus size and normal gameplay composition are acceptable; only the content scale inside the existing container is increased to make the initial crop harder.

TOUCH TARGETS

MINOR ISSUE — zoom/reveal and answer controls have useful padding, but Back/Reset are approximately 40px and lack explicit accessible names.

WHY CHANGE / WHY KEEP

Keep the existing zoom/reveal state machine, single-stage composition, and current phone-landscape image footprint. Retain the accepted hint-count scoring rule, increase only initial content scale to NORMAL 6 / ADVANCED 10, and compact the completion state so it fits the remaining viewport. Do not enlarge the stimulus container or redesign the landscape composition.

EVIDENCE

REAL-DEVICE CONFIRMED — reviewer accepted scoring and normal gameplay composition, confirmed the pre-fix completion overflow, and requested a harder initial crop. Earlier static evidence suggested enlarging the `landscape:w-40` stimulus container; that recommendation remains superseded.

EXPECTED / OBSERVED USER SYMPTOM

On a phone held sideways, normal gameplay and scoring are acceptable; before correction, the final completion card extended below the viewport, and the initial crop allowed identification too quickly.

GAMEPLAY / STATE LOCK

Preserve random item selection, the approved initial zoom values (NORMAL 6 / ADVANCED 10), zoom-out steps, round progression, hint-count potential score (100 minus 15 per successful hint, floor 25), reveal state, correct/wrong response, sounds, and completion behavior. The former elapsed-time score dependency is removed.

GAMEPLAY RISK

MEDIUM — layout work is near timer, reveal, scoring, and completion state; no state logic should move.

EXPECTED IMPLEMENTATION FILES

`components/ZoomGame.tsx`; later add `tests/zoomFacilitatorAcceptance.test.tsx` if the project chooses a per-game contract test.

RECOMMENDED MODEL

Luna Medium — one-component responsive/accessibility correction with timer/reveal regression checks.

REVIEWER SHOULD CHECK

1. At 640×360, the existing image/stimulus footprint remains essentially unchanged and group-readable, with the harder initial crop.
2. Each successful Zoom out reduces the visible potential score by 15, with a floor of 25; Reveal does not reduce it.
3. The completion card is fully visible without the in-round stats bar or document-level scrolling.

Final audit line: 局部猜全貌 — Recommendation: LIGHT. Why: reviewer accepted scoring and normal play, while completion overflow and initial crop required targeted correction without changing the container or composition. Evidence: REAL-DEVICE CONFIRMED. What reviewer should visually check: harder initial crop, accepted scoring, and bounded completion card.

## 記憶翻牌（口語版）

COMPONENT

`components/VerbalMemoryGame.tsx` (`GameState.VERBAL_MEMORY`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: dedicated `100dvh` edge-to-edge column with `.app-safe-screen` ownership and `overflow-hidden`.
- Header: title/subtitle plus icon-only Back and Reset.
- Primary: a 4-column NORMAL or 5-column ADVANCED memory grid.
- Controls: each card is the interaction; Reset is in the header.
- Status: card numbers and a completion score/time card.
- Scroll: landscape main region is centered and `overflow-hidden`; portrait retains controlled local scrolling.
- Modal: no modal; completion is an in-flow card.

VIEWPORT FINDINGS

640×360: REAL-DEVICE CONFIRMED — the grid is held toward the upper area and leaves a large unused lower region. The old `landscape:max-w-[60vh]` cap contributed to the constrained allocation.

844×390: REAL-DEVICE CONFIRMED — the available main-area height and width were not being used as a centered whole-grid allocation.

932×430: REAL-DEVICE CONFIRMED — the same upper-biased allocation leaves lower space unused instead of scaling from the remaining playable area.

390×844: `max-w-[90vw]` applies and the portrait grid has more width, but the main region can scroll for the completion state. Card interaction remains conceptually clear.

1280×720: `lg:max-w-4xl`, `lg:gap-4`, and larger text restore a spacious desktop grid.

PRIMARY STIMULUS DOMINANCE

MINOR ISSUE — the complete card field is the primary content, but the pre-fix width cap plus `justify-start` left substantial lower space unused.

TOUCH TARGETS

MINOR ISSUE — cards are interactive; header buttons were about 40px and unnamed before this LIGHT pass.

WHY CHANGE / WHY KEEP

Keep the 4×4/5×4 memory model and card renderer. Change only compact grid allocation, card spacing, and control semantics so NORMAL and ADVANCED remain visible and speakable to a group. This is LIGHT because no new panel or state model is needed.

EVIDENCE

REAL-DEVICE CONFIRMED — reviewer observed the upper-constrained field and large unused lower space. Root cause was `landscape:max-w-[60vh]` combined with top-aligned main content. The implementation now uses a centered, remaining-height landscape stage; runtime dimensions were not measured in this environment.

EXPECTED / OBSERVED USER SYMPTOM

The facilitator previously saw the memory field concentrated near the top with a large unused lower region; reset was a small icon with no spoken accessible name.

GAMEPLAY / STATE LOCK

Preserve pair generation, shuffle, flip lock, the 500ms mismatch delay, match scoring, timer measurement, completion state, NORMAL/ADVANCED card counts, and sounds.

GAMEPLAY RISK

MEDIUM — card click/flip timing and completion state are sensitive to DOM restructuring.

EXPECTED IMPLEMENTATION FILES

`components/VerbalMemoryGame.tsx` and `tests/verbalMemoryFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna Medium — localized grid geometry and accessibility work with a contained card-state regression surface.

REVIEWER SHOULD CHECK

1. NORMAL 16 cards and ADVANCED 20 cards are simultaneously visible at 640×360.
2. Card numbers/content remain readable for group call-outs and cards remain tappable.
3. Reset and completion feedback do not introduce page-level scrolling.

Verbal Memory: LIGHT COMPLETE and reviewer real-device accepted, including the direct emoji-size refinement.

Final audit line: 記憶翻牌（口語版） — Recommendation: LIGHT. Why: REAL-DEVICE CONFIRMED upper-biased allocation left a large unused lower region; the fix centers a remaining-height 4×4/5×4 grid without changing gameplay. Evidence: REAL-DEVICE CONFIRMED pre-fix issue; post-fix is pending reviewer acceptance. What reviewer should visually check: whole-grid visibility, balance, and card call-out readability.

## 語意聯想

COMPONENT

`components/WordChainGame.tsx` (`GameState.WORD_CHAIN`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: fixed `h-[100dvh]` column with `overflow-hidden`.
- Header: title/subtitle with icon-only Back and Reset.
- Primary: category prompt in a large blue card.
- Controls: Start or add-score button under the prompt.
- Status: timer and successful-association score cards in a right-side landscape rail.
- Scroll: no ordinary scroll region; the timeout surface is fixed.
- Modal: timeout overlay with final score and restart.

VIEWPORT FINDINGS

640×360: the landscape row places prompt/actions beside a vertical timer/score rail. Source sizing can fit the broad regions, but the header icons are only `p-2` around 24px icons, and the main prompt/control area has no explicit short-height contract.

844×390: the same landscape row has more width and the two status cards remain readable; there is no height-specific adjustment, so long prompt text or the timeout state should be checked.

932×430: the `lg` branch is still inactive; it remains the same compact landscape composition even though extra width is available.

390×844: portrait uses a vertical main flow, with the two status cards becoming a horizontal row; the timeout overlay has enough conceptual room but no max-height/internal-scroll rule.

1280×720: `lg` restores larger prompt, controls, and status cards; desktop hierarchy is sound.

PRIMARY STIMULUS DOMINANCE

YES — the category prompt is the largest semantic element and the timer/score cards support it rather than replacing it.

TOUCH TARGETS

MINOR ISSUE — Start/add-score use meaningful padding, but Back/Reset are approximately 40px and all icon-only header controls lack explicit names.

WHY CHANGE / WHY KEEP

Keep the prompt-plus-status-rail facilitator flow. A LIGHT pass should label and enlarge header controls, add a compact height guard for the timeout overlay, and preserve the existing timer/action arrangement. A full split is not justified because the prompt, action, timer, and score already have clear regions.

EVIDENCE

STATIC SOURCE INFERENCE — based on `h-[100dvh] overflow-hidden`, `landscape:flex-row`, `landscape:w-48` status cards, and the fixed timeout overlay with no max-height.

EXPECTED / OBSERVED USER SYMPTOM

The prompt remains usable, but Back/Reset feel like small unlabeled icons; when time expires, the large result card may press against the short viewport instead of scrolling internally.

GAMEPLAY / STATE LOCK

Preserve the 60-second timer, interval cleanup, start/add-score gating, score updates, timeout transition, sounds, and restart behavior.

GAMEPLAY RISK

HIGH — timer completion and score actions are stateful and should not be moved into a new component without regression coverage.

EXPECTED IMPLEMENTATION FILES

`components/WordChainGame.tsx`; later add `tests/wordChainFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna High — small visual change adjacent to timer and timeout state.

REVIEWER SHOULD CHECK

1. The category prompt remains the dominant surface at 640×360.
2. Start/add-score is reachable while timer and score remain visible.
3. Timeout result, score, and restart fit without document overflow.

Pre-implementation audit line: 語意聯想 — Recommendation: LIGHT. Why: the facilitator stage already works, but header semantics and timeout sizing need protection. Evidence: STATIC SOURCE INFERENCE. What reviewer should visually check: prompt dominance and timer/timeout reachability.

Post-implementation status: 語意聯想 — LIGHT COMPLETE; reviewer real-device accepted. The dedicated fullscreen root owns the existing non-GameShell safe-area contract, the fixed timeout overlay has its own safe-area content boundary, and short-landscape spacing is compacted by viewport height while preserving the prompt, timer, score, 60-second timer, and +1 scoring semantics. Evidence: REAL-DEVICE ACCEPTED.

## 猜猜我是誰

COMPONENT

`components/GuessWhoGame.tsx` (`GameState.GUESS_WHO`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

MEDIUM

CURRENT STRUCTURE

- Root: `min-h-[100dvh]` flex column below `sm`, row at `sm` and above.
- Header: absolute Back; title and small Rules button live in the candidate panel.
- Primary: candidate/person grid, 8 NORMAL or 12 ADVANCED.
- Controls: question chips in the right panel and full-width Reset.
- Status: target/win message and question history.
- Scroll: candidate panel and question/history regions use local `overflow-y-auto`.
- Modal: Rules is opened through the shared `RulesModal`.

VIEWPORT FINDINGS

640×360: because `sm` activates exactly at 640px, ADVANCED uses `grid-cols-6` while each avatar remains `sm:w-20 sm:h-20`. The left panel shares width with a fixed `sm:w-80` right panel, so six 80px avatars cannot be comfortably represented in the left half. NORMAL's four columns are more plausible; the advanced grid is the acceptance risk.

844×390: the same six-column ADVANCED rule remains; width is better, but the fixed 320px question panel still consumes a large fraction of the phone. Local history scroll protects the right panel but does not solve candidate readability by itself.

932×430: extra width helps the left panel, but no short-height branch changes the avatar/grid relationship. The advanced candidate grid should still be inspected for clipping and group readability.

390×844: the root stacks candidate panel and a `h-[40vh]` question panel, making the document taller than the viewport in likely normal use; the two panels remain semantically reachable but may require page scrolling.

1280×720: the six-column grid and 80px avatars have enough room; the split panel is a sensible desktop facilitator layout.

PRIMARY STIMULUS DOMINANCE

BORDERLINE — the candidate grid is the core stimulus, but ADVANCED compact columns can overlap/crowd and the right panel competes for width.

TOUCH TARGETS

MAJOR ISSUE — question buttons use `px-2 py-1 text-xs` and can be well under 44px; the Rules button and Back are also compact/icon-only.

WHY CHANGE / WHY KEEP

Keep the left candidate surface plus right question/history panel. The concrete fix is to make short landscape ADVANCED use a grid that respects available panel width, constrain avatar sizing without losing identity, and make question/Reset/Rules actions practical. This is still LIGHT: the existing split already separates group-visible candidates from facilitator questions, so a new facilitator shell is not justified.

EVIDENCE

STATIC SOURCE INFERENCE — based on `sm:flex-row`, `sm:w-80`, ADVANCED `grid-cols-4 sm:grid-cols-6`, fixed `sm:w-20 sm:h-20` avatars, and compact question chips. Browser measurements were unavailable.

EXPECTED / OBSERVED USER SYMPTOM

In ADVANCED phone landscape, candidate faces can crowd or extend past their grid tracks; the facilitator may need to scroll or tap small question chips while the candidate board remains visually dense.

GAMEPLAY / STATE LOCK

Preserve random target selection, question history, elimination/hidden-card state, wrong-guess count, score formula, win state, and RulesModal behavior.

GAMEPLAY RISK

MEDIUM — the UI is state-sensitive around candidate disabled state, question history, and winner rendering, but no rules redesign is required.

EXPECTED IMPLEMENTATION FILES

`components/GuessWhoGame.tsx`; later add `tests/guessWhoFacilitatorAcceptance.test.tsx` covering NORMAL/ADVANCED candidate counts and control names.

RECOMMENDED MODEL

Luna High — responsive grid work touches elimination and question-state presentation.

REVIEWER SHOULD CHECK

1. All 8 NORMAL and 12 ADVANCED candidate cards remain visible and distinct at 640×360.
2. Question chips, Rules, Back, and Reset are practical without hiding the candidate grid.
3. Eliminated cards, history scroll, and win feedback remain understandable.

Pre-implementation audit line: 猜猜我是誰 — Recommendation: LIGHT. Why: the advanced six-column grid is too aggressive at the `sm` boundary, but the existing split composition is correct. Evidence: STATIC SOURCE INFERENCE. What reviewer should visually check: complete candidate grid and question ergonomics.

Previous implementation status: 猜猜我是誰 — LIGHT IMPLEMENTATION COMPLETE, but reviewer real-device acceptance FAILED. REAL-DEVICE CONFIRMED findings: Dynamic Island overlap remained, the absolute Back crowded the title, the history area was too small, and questions competed with history in the same right panel.

Previous corrective status: 猜猜我是誰 — CORRECTIVE LIGHT IMPLEMENTED; the safe-area ownership was separated into an edge-to-edge outer root and an inner `.app-safe-screen` stage; Back moved into the header; the question dock moved below the candidate board; and the right column became history-dominant with local vertical scrolling. Short landscape retained 4×3 advanced geometry at 640-class widths and 6×2 from 760px upward. Gameplay, characters, questions, deduction, scoring, sounds, and win semantics were unchanged. Reviewer accepted this overall architecture but found horizontal question scrolling inconvenient.

Reviewer correction history: Attempt 1 kept questions and history in the right panel and failed because history space was too small, Dynamic Island overlap remained, and Back crowded the title. Attempt 2 moved questions below candidates, improving the architecture but requiring a horizontal question strip. Attempt 3 changed that dock to fixed 5×2 rows; REAL-DEVICE CONFIRMED failure then showed all candidate avatars were vertically squeezed/clipped in phone landscape.

Three-column correction status: 猜猜我是誰 — THREE-COLUMN CORRECTION IMPLEMENTED; PENDING REVIEWER REAL-DEVICE ACCEPTANCE. Landscape now uses `candidate | questions | history`: the left candidate workspace receives the available height, the middle panel uses a 2×5 question grid with compact short labels and practical 44px buttons, and the right panel remains history-dominant with local vertical scrolling and bottom reset. The canonical full question text remains in history and duplicate prevention still uses `q.text`; candidate geometry, safe-area ownership, header placement, and gameplay remain unchanged. Evidence remains STATIC SOURCE INFERENCE because browser and iPhone runtime measurements are unavailable in this environment.

## 故事聯想卡

COMPONENT

`components/StoryCardsGame.tsx` (`GameState.STORY_CARDS`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

MEDIUM

CURRENT STRUCTURE

- Root: centered `min-h-[100dvh]` stage with `p-2 sm:p-4`.
- Header: absolute Back; in-stage title and Refresh button.
- Primary: 4 NORMAL or 5 ADVANCED story cards, each selectable and zoomable.
- Controls: card selection, refresh, and per-card ZoomIn action.
- Status: selected-card styling and full-card zoom text.
- Scroll: the landscape root/stage is bounded with controlled overflow; the card row remains non-scrollable so all cards stay visible.
- Modal: zoom is an in-stage full-size view, not a shared modal.

VIEWPORT FINDINGS

640×360: REAL-DEVICE CONFIRMED pre-fix selected-card edges and the zoom control could clip; normal/advanced card sizing itself was accepted. The correction removes scale expansion and keeps zoom within the card bounds.

844×390: REAL-DEVICE CONFIRMED pre-fix overall row proportions were acceptable; selected-card expansion and inset zoom geometry are the targeted corrections.

932×430: REAL-DEVICE CONFIRMED pre-fix advanced five-card neighbors had very slight edge overlap; removing scale expansion preserves five distinct card boundaries without shrinking the row.

390×844: portrait cards use the smaller flexible branch and stack within the stage; the zoom view is readable, but Back and per-card zoom semantics still need labels.

1280×720: `lg` dimensions provide a large, recognizable card stage; desktop is structurally appropriate.

PRIMARY STIMULUS DOMINANCE

YES — reviewer accepted the card size and overall 4/5-card composition; selection now uses a non-geometric ring/shadow cue so it remains visible without clipping.

TOUCH TARGETS

MINOR ISSUE — pre-fix Back was about 40px and unnamed; ZoomIn was small, slightly clipped, hover-dependent, and unnamed. The LIGHT correction adds explicit names and 44px-class controls.

WHY CHANGE / WHY KEEP

Keep the card stage, active-card toggle, and zoom view. A LIGHT correction should let the row size from available short-height space, preserve four/five cards, and expose zoom as a reliable touch action. A new facilitator composition would duplicate the existing stage rather than solve a structural problem.

EVIDENCE

REAL-DEVICE CONFIRMED — reviewer observed acceptable overall sizing plus selected-edge clipping, a small/slightly clipped zoom control, and minor advanced five-card edge overlap. Runtime measurements were not collected in this environment.

EXPECTED / OBSERVED USER SYMPTOM

The facilitator previously saw a selected card edge and zoom affordance clipped; advanced neighboring cards were also extremely close. Zoom is now discoverable on touch and the selection cue does not expand card geometry.

GAMEPLAY / STATE LOCK

Preserve random card selection, active/inactive card toggling, zoom index, refresh behavior, text labels, and card order semantics.

GAMEPLAY RISK

MEDIUM — responsive changes touch selectable card and zoom hit areas, but not the card data model.

EXPECTED IMPLEMENTATION FILES

`components/StoryCardsGame.tsx` and `tests/storyCardsFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna Medium — contained stage sizing and touch-accessibility correction.

REVIEWER SHOULD CHECK

1. Four NORMAL and five ADVANCED cards are all visible at 640×360.
2. Card labels and emoji remain readable; zoom works with touch rather than hover.
3. Zoom-in/full-card view and Back do not create page overflow.

Story Cards: LIGHT COMPLETE and reviewer real-device accepted, including the final content enhancement.

Final audit line: 故事聯想卡 — Recommendation: LIGHT. Why: accepted UI corrections and reviewer-approved content enhancement are complete; the pool is 60 cards with 12 in each 人／事／時／地／物 category, NORMAL uses 4 distinct categories, ADVANCED uses all 5, and refresh excludes the immediately previous set. Evidence: REAL-DEVICE ACCEPTED. What reviewer checked: variety, category scaffolding, refresh non-repetition, and accepted touch UI.

## 條件反應大挑戰

COMPONENT

`components/ConditionalSnapGame.tsx` (`GameState.CONDITIONAL_SNAP`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

MEDIUM

CURRENT STRUCTURE

- Root: centered `min-h-[100dvh]` column with page-level flex sizing.
- Header: absolute Back and Rules icon buttons.
- Primary: large circular emoji target between left/right next arrows.
- Controls: target-category `<select>` and two arrows that advance the stimulus.
- Status: persistent task sentence describing the target category.
- Scroll: no deliberate local scroll; content can grow from its minimum-height root.
- Modal: shared `RulesModal`.

VIEWPORT FINDINGS

640×360: at `sm`, arrows become `96×192`, the circle can expand from `max-w-[30vh]` to the `sm:max-w-md` branch, and the target strip remains above it. The source does not cap the circle by available short-height space, so vertical overflow/crowding is likely even though the central interaction is simple.

844×390: the same `sm` geometry applies; wider space helps horizontally but does not guarantee the circle plus target strip and arrows fit into 390px height.

932×430: no `lg` variant is active, so the layout remains the same rather than using the extra area naturally.

390×844: the base `w-12 h-24` arrows and base circle cap are used; portrait remains a clear central interaction with the target selector above.

1280×720: `sm:w-24`, `sm:h-48`, and `sm:max-w-md` provide a generous desktop/large view, though the generic landscape branch is still source-driven rather than height-driven.

PRIMARY STIMULUS DOMINANCE

YES — the emoji circle is clearly the central group stimulus; the issue is fit, not semantic hierarchy.

TOUCH TARGETS

MINOR ISSUE — arrows are large, and the select is usable, but Back/Rules are approximately 40px and lack explicit accessible names.

WHY CHANGE / WHY KEEP

Keep the center-circle plus arrow composition. Apply a short-height cap to the circle/vertical allocation and add practical labels to Back, Rules, and arrows. This is a local geometry fix; turning it into a new stage would not improve the semantics.

EVIDENCE

REAL-DEVICE CONFIRMED pre-fix issue — reviewer observed that the bottom of the game extended beyond the phone screen in landscape. The earlier static evidence was based on `min-h-[100dvh]`, `sm:w-24 sm:h-48`, `sm:max-w-md`, `aspect-square`, and the absence of a local overflow contract.

LIGHT IMPLEMENTATION COMPLETE — pending reviewer real-device acceptance. The implementation uses a viewport-bound root, a short-height landscape contract, and a height-constrained stage while preserving the dedicated composition and gameplay.

EXPECTED / OBSERVED USER SYMPTOM

On a short phone landscape, the category instruction consumes top space and the circular stimulus/arrow rail can extend toward or below the viewport; Back and Rules read as unlabeled icons.

GAMEPLAY / STATE LOCK

Preserve target category, random category/item selection, next-button sound behavior, current emoji, and RulesModal state.

GAMEPLAY RISK

LOW — the state is small and has no timer or score, but random stimulus and sound must remain untouched.

EXPECTED IMPLEMENTATION FILES

`components/ConditionalSnapGame.tsx`; later add `tests/conditionalSnapFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna Medium — one-component short-height geometry and accessibility work.

REVIEWER SHOULD CHECK

1. The circular stimulus is fully visible at 640×360 and remains the dominant object.
2. Category select and both arrows are reachable and named.
3. Rules opens and closes without document overflow.

Final audit line: 條件反應大挑戰 — Recommendation: LIGHT. Why: the existing facilitator stage is correct but not constrained by short height. Evidence: STATIC SOURCE INFERENCE. What reviewer should visually check: full circle and arrow accessibility.

## 尋寶大冒險

COMPONENT

`components/TreasureGame.tsx` (`GameState.TREASURE`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: `min-h-screen` column with `py-6 px-4`.
- Header: Back, title/instructions, and Refresh icon buttons.
- Primary: NORMAL 4×4 or ADVANCED 5×5 map/grid with preview/reveal state.
- Controls: setup preview/radar toggles, preview +/- buttons, and Start.
- Status: score, timer, treasure progress, preview/game-over messages.
- Scroll: no intentional local map scroll; root can grow beyond viewport.
- Modal: no modal; game-over and preview are in-flow status surfaces.

VIEWPORT FINDINGS

640×360: setup has root `py-6`, panel padding, a title with `mb-8`, two `p-6` settings cards with large margins, and a `py-4` Start button. The complete setup stack is source-likely taller than 360px. In play, the map is capped by `landscape:max-w-[60vh] landscape:max-h-[60vh]`, about 216px at this height.

844×390: the setup vertical stack remains unchanged because there is no short-height branch; the map cap grows only to about 234px, leaving available width unused.

932×430: same landscape rule and approximately 258px cap; advanced 5×5 cells remain the dense case.

390×844: portrait has enough vertical room for settings and map but can still grow beyond the viewport because the root is `min-h-screen`; all primary setup controls are conceptually reachable.

1280×720: the max-width panel and generous spacing are appropriate; desktop should remain spacious.

PRIMARY STIMULUS DOMINANCE

BORDERLINE — the map is central in play, but the setup screen is control-heavy and the 60vh cap makes advanced cells small for group viewing.

TOUCH TARGETS

MINOR ISSUE — Start and header controls are practical, but +/- buttons are `32×32` and checkboxes are `24×24`; these are secondary setup controls but still deserve larger hit areas.

WHY CHANGE / WHY KEEP

Keep the map/grid, preview, radar, and result architecture. Compact only the setup vertical rhythm and use short-height space more intentionally for the 4×4/5×5 map. This resolves the concrete fold/scale issue without redesigning the treasure state machine, so the earlier FULL candidate is not justified from source alone.

EVIDENCE

STATIC SOURCE INFERENCE — based on `min-h-screen`, `py-6`, setup `p-6`/`mb-6`/`mb-8`, and the `landscape:max-w-[60vh] landscape:max-h-[60vh]` grid cap.

EXPECTED / OBSERVED USER SYMPTOM

In phone landscape, the facilitator must scroll before pressing Start or changing preview/radar settings; in play, the advanced map can look like a small 5×5 tile group surrounded by unused width.

GAMEPLAY / STATE LOCK

Preserve random emoji/type generation, preview timeout, elapsed timer, treasure/bomb/empty semantics, radar counts, score/time bonus, treasure progress, difficulty geometry, and game-over transition.

GAMEPLAY RISK

HIGH — preview timer, random map, scoring, and game-over updates are tightly coupled to setup/play presentation.

EXPECTED IMPLEMENTATION FILES

`components/TreasureGame.tsx`, `index.css`, and `tests/treasureFacilitatorAcceptance.test.tsx`. No shared FACILITATOR layout or GameShell migration.

RECOMMENDED MODEL

Luna High — responsive work crosses timed preview, grid state, and terminal feedback.

REVIEWER SHOULD CHECK

1. Setup Back/Start, preview toggle/time, and radar toggle are visible at 640×360.
2. NORMAL 4×4 and ADVANCED 5×5 grids remain fully visible with cell identity clear.
3. Preview, playing, radar result, and game-over messages do not cause page-level overflow.
4. Reviewer should confirm iPhone Home Screen Web App safe-area behavior, touch comfort, and no blank-strip regression.

Final audit line: 尋寶大冒險 — Recommendation: LIGHT. Why: setup rhythm, safe-area ownership, touch targets, and remaining-stage grid sizing are implemented without changing the map state machine. Evidence: STATIC SOURCE INFERENCE for target dimensions plus fixed `655×552` in-app browser confirmation. Status: `LIGHT IMPLEMENTATION COMPLETE`, pending reviewer real-device acceptance. What reviewer should visually check: setup completion, whole-map dominance, and status/game-over fit.

## 命運轉盤

COMPONENT

`components/RouletteGame.tsx` (`GameState.ROULETTE`)

CLASSIFICATION

`FULL`

CONFIDENCE

MEDIUM

PREVIOUS FULL IMPLEMENTATION — REAL-DEVICE FAILED

- Root and safe-stage improvements were accepted, but the playing interaction changed to compact A/B summaries with a popup bet editor.
- The popup reduced immediate facilitator visibility and made betting slower; large unused white space appeared, while wheel, spin action, and event footer competed for height.
- The wheel card crowded the spin action, and `currentIndex=0` rendered a real candidate before the first spin, which could bias participants.

CURRENT CORRECTION — THREE-COLUMN V2

- Root: dedicated `100dvh` outer stage with inner `.app-safe-screen`; compact phone-landscape rule remains based on `orientation: landscape` plus `max-height: 480px`.
- Header: Back, title/helper, and Settings/reset retain their accessible 44px-class controls.
- Playing: direct `A | CENTER | B` grid. Each TeamBetPanel simultaneously exposes its score, all standard item choices, all 10/20/50 amounts, and team-specific confirm; confirmed bets return to in-panel edit mode without an overlay.
- Center: round/target status, neutral pre-spin wheel frame, height-aware square wheel, and in-flow spin/result action only. The neutral state does not render or announce any wheel candidate before `startSpin`.
- Secondary: event guide remains a compact footer with local horizontal overflow for long ADVANCED labels; game-over remains an in-flow compact card.

VIEWPORT TARGETS

640×360: source layout uses 30% / 40% / 30% columns, compact gaps, direct team controls, a remaining-height wheel slot, and a one-row event footer. Exact device fit remains pending reviewer acceptance.

844×390 and 932×430: the same three-column contract can use additional center height for the square wheel without restoring permanent side-panel duplication or width-only breakpoints.

390×844: portrait changes the playing grid to A / CENTER / B stacked flow and permits natural page growth.

1280×720: the three-column table remains readable, with a larger center wheel and the same direct betting semantics.

PRIMARY STIMULUS DOMINANCE

YES BY SOURCE CONTRACT — the center receives a dedicated 40% column and a flexing remaining-height wheel slot; team controls remain visible without taking ownership of the center.

TOUCH TARGETS

The item, amount, confirm, modify, spin, next, setup, and reset controls use 44px-class minimum geometry where practical; ADVANCED item choices remain a 3×2 grid without default horizontal scrolling.

WHY CHANGE / WHY KEEP

The reviewer failure showed that hiding core facilitator controls was the wrong tradeoff. The correction restores immediate information visibility in a stable three-column composition while preserving the accepted fullscreen/safe-area architecture and all gameplay state transitions.

EVIDENCE

Previous failure: `REAL-DEVICE CONFIRMED`. Current correction: `STATIC SOURCE INFERENCE`; browser runtime was unavailable in this environment, so no target-size or iPhone Dynamic Island measurements are claimed.

GAMEPLAY / STATE LOCK

Preserve wheel option shuffle, spin timer/tick count/speed, landed result evaluation, team choices and amounts, event effects, round/score end conditions, next-round transition, game-over scores, reset behavior, and currentIndex progression. Only UI state `hasSpinStarted` controls whether the center displays the neutral placeholder or the already-existing wheel option.

GAMEPLAY / STATE LOCK

Preserve wheel option shuffle, spin timer/tick count/speed, landed result evaluation, team choices and amounts, event effects, round/score end conditions, next-round transition, game-over scores, and reset behavior.

GAMEPLAY RISK

HIGH — spin timing, result evaluation, team score updates, and round transitions are all presentation-adjacent.

EXPECTED IMPLEMENTATION FILES

Likely `components/RouletteGame.tsx` plus a game-local layout helper only if the new composition becomes too large; do not introduce a shared FACILITATOR component during the first implementation without a separate review. Add `tests/rouletteFacilitatorAcceptance.test.tsx` before production work.

RECOMMENDED MODEL

Luna Max — new compact composition across setup, betting, spin/result, and game-over states with high state risk.

REVIEWER SHOULD CHECK

1. At 640×360, the neutral pre-spin wheel, both direct TeamBetPanel controls, spin action, and event footer remain visible without hiding core information.
2. After both confirmations, spin/result/next actions remain reachable and the wheel does not overlap the action region.
3. ADVANCED exposes all six item choices per team, and next round returns both panels plus the center to the neutral pre-spin state.
4. ROUNDS/SCORE setup and game-over retain their existing semantics.

Final audit line: 命運轉盤 — Recommendation: FULL. Previous implementation: `REAL-DEVICE FAILED` because the popup editor reduced facilitator visibility, geometry left unused space and crowded wheel/action/footer, and a real candidate appeared before the first spin. Current correction: `THREE-COLUMN V2 IMPLEMENTED` with direct A/B TeamBetPanel controls, in-panel editing, a neutral pre-spin wheel, remaining-stage sizing, and retained event guide. Evidence: `STATIC SOURCE INFERENCE`; reviewer should verify all controls, wheel/action separation, neutral reset, Dynamic Island safety, and no PWA blank-strip regression.

## 步步高升

COMPONENT

`components/HigherLowerGame.tsx` (`GameState.HIGHER_LOWER`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: dedicated `100dvh` edge-to-edge screen with `overflow-hidden`; `.app-safe-screen` owns safe-area insets and the inner layout owns visual spacing.
- Header: Back, title, Rules icon, and Reset.
- Primary: previous/current card pair in a centered card area.
- Controls: A/B team prediction buttons (`大`, `小`, `PASS`) and reveal/next action; all six choices remain simultaneously visible with practical 44px-class targets and `aria-pressed` selected state.
- Status: two team score panels, round counter, choice/result feedback.
- Scroll: short landscape uses a bounded fullscreen stage with no document scroll; portrait may grow vertically.
- Modal: custom Rules overlay remains local to Higher/Lower, safe-area-aware, bounded by `calc(100dvh - ...)`, and internally scrollable when needed.

VIEWPORT FINDINGS

640×360: short-height CSS uses a remaining-stage layout, height-aware previous/current card clamps, compact scoreboard, six 44px-class choices, and a reserved compact action region. Whole-screen fit remains STATIC SOURCE INFERENCE pending reviewer device acceptance.

844×390: the same max-height branch preserves readable height-derived card geometry and keeps the Rules dialog bounded with local scroll.

932×430: extra short-landscape height is used by the card stage while the team choices remain compact-width, 44px-class controls.

390×844: portrait keeps the fuller base presentation and allows inner vertical growth; primary actions remain available and Rules retains the bounded local dialog contract.

1280×720: `lg`/base sizing creates a readable card game and enough room for team panels.

PRIMARY STIMULUS DOMINANCE

YES — current card remains larger than previous card; short-landscape sizing derives card geometry from viewport height while preserving the two-card stage.

TOUCH TARGETS

ACCEPTANCE PENDING — header, Rules, Reset, choices, reveal, next, and replay use 44px-class practical targets; final device usability remains for reviewer confirmation.

WHY CHANGE / WHY KEEP

Keep the current two-team prediction/card flow. Increase only the primary prediction hit areas, preserve card aspect ratio, add accessible names, and give the Rules overlay max-height/internal scroll. The current regions already coexist, so FULL is unnecessary.

EVIDENCE

STATIC SOURCE INFERENCE — implementation was validated by source contracts and acceptance tests; target iPhone dimensions and Dynamic Island behavior remain unmeasured in this environment.

EXPECTED / OBSERVED USER SYMPTOM

The facilitator should retain a readable current card, six simultaneous `大`/`小`/`PASS` controls, reachable actions, and a Rules dialog that can scroll locally within the usable short-landscape viewport.

GAMEPLAY / STATE LOCK

Preserve deck generation/shuffle, Joker behavior, current/previous card transitions, simultaneous A/B choices, PASS semantics, score deltas, round count, reveal, next-round, and game-over.

GAMEPLAY RISK

HIGH — card/deck and simultaneous choice state must remain unchanged while button geometry is adjusted.

EXPECTED IMPLEMENTATION FILES

`components/HigherLowerGame.tsx`, `index.css`, and `tests/higherLowerFacilitatorAcceptance.test.tsx`. No shared FACILITATOR layout or GameShell migration.

RECOMMENDED MODEL

Luna High — state-sensitive simultaneous controls and card/result presentation.

REVIEWER SHOULD CHECK

1. Current/previous cards are readable and preserve aspect ratio at 640×360.
2. Both teams can choose all three options with clear selected state.
3. Rules, reveal, next round, and game-over controls fit without page overflow.

Final audit line: 步步高升 — Recommendation: LIGHT. Why: the valid card/prediction architecture now also addresses the reviewer’s minor hierarchy, overlap, button-shape, and wrapping findings without gameplay changes. Evidence: REAL-DEVICE CONFIRMED for functional landscape acceptance; STATIC SOURCE INFERENCE plus browser smoke for the refinement. What reviewer should visually check: current card, simultaneous team choices, result/action bar, game-over, and Rules local scroll.

## 價格估算

COMPONENT

`components/PriceEstimationGame.tsx` (`GameState.PRICE_ESTIMATION`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: fixed `h-[100dvh]` column with `overflow-hidden`.
- Header: title/subtitle with icon-only Back and Reset.
- Primary: item question card beside a three-option numeric answer column in landscape.
- Controls: three price buttons and a conditional next/result button.
- Status: round and score bar, selected/correct/incorrect feedback.
- Scroll: main region is `overflow-y-auto`.
- Modal: no modal; completion is an in-flow result card.

VIEWPORT FINDINGS

640×360: REAL-DEVICE CONFIRMED pre-fix — normal gameplay is generally usable, while the final completion card exceeded the phone landscape viewport and edge-to-edge content could enter the unsafe horizontal region.

844×390: REAL-DEVICE CONFIRMED pre-fix — normal prompt/options composition was accepted; completion required a separate compact treatment.

932×430: REAL-DEVICE CONFIRMED pre-fix — normal landscape composition remained intact, with the completion state and horizontal safe-area ownership as the correction targets.

390×844: portrait stacks question and answer areas and allows main local scrolling; no horizontal overflow is implied by the source.

1280×720: `lg:grid-cols-3`, larger typography, and larger spacing produce a clear desktop choice layout.

PRIMARY STIMULUS DOMINANCE

BORDERLINE — the item prompt is clear, but the stats bar and three vertically stacked answers consume similar attention.

TOUCH TARGETS

MINOR ISSUE — answer and next buttons have useful padding, while Back/Reset remain approximately 40px and lack accessible names.

WHY CHANGE / WHY KEEP

Keep the prompt/options semantics and round progression. A LIGHT pass should reserve a compact but stable action area after selection, preserve readable item text, and label header actions; it should not alter random items, scoring, or answer state.

EVIDENCE

REAL-DEVICE CONFIRMED — reviewer observed completion overflow and Dynamic Island/unsafe horizontal overlap after edge-to-edge rendering. Source correction uses one non-GameShell safe-area owner and a bounded short-landscape completion state.

EXPECTED / OBSERVED USER SYMPTOM

The final 「挑戰完成」 card previously exceeded the phone landscape viewport, and some edge-to-edge content could be covered by the Dynamic Island.

GAMEPLAY / STATE LOCK

Preserve item randomization, generated price options, selected option lock, correct answer feedback, timed score bonus, round/used-index progression, total completion, and sounds.

GAMEPLAY RISK

MEDIUM — the correction is presentation-focused but the conditional post-answer action is coupled to round state.

EXPECTED IMPLEMENTATION FILES

`components/PriceEstimationGame.tsx`, `index.css`, and `tests/priceEstimationFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna High — targeted safe-area ownership and compact completion correction with preserved gameplay.

REVIEWER SHOULD CHECK

1. Prompt, all three price options, and round/score status are visible at 640×360.
2. After answering, Next/看結果 is immediately reachable without document scrolling.
3. Long item labels and final score remain readable at 844×390 and portrait.

After implementation: Price Estimation — LIGHT COMPLETE; reviewer real-device accepted. Safe-area integration and PWA reinstall QA are REAL-DEVICE PASS; the platform contract remains available for later dedicated-screen work.

Final audit line: 價格估算 — Recommendation: LIGHT. Why: REAL-DEVICE CONFIRMED completion overflow and Dynamic Island overlap were corrected with local safe-area ownership and compact completion spacing while preserving the accepted prompt/options composition. Evidence: REAL-DEVICE CONFIRMED pre-fix issue; reviewer real-device accepted.

## 轉念練習

COMPONENT

`components/PositiveReappraisalGame.tsx` (`GameState.POSITIVE_THINKING`)

CLASSIFICATION

`LIGHT`

CONFIDENCE

HIGH

CURRENT STRUCTURE

- Root: fixed `h-[100dvh]` column with `overflow-hidden`.
- Header: Back, progress pill, and title.
- Primary: left event plus negative-thought stage; right reframe stage/placeholder.
- Controls: 44px-class reveal button, then conditional in-flow next button.
- Status: question progress, event, negative thought, and reframe cards.
- Scroll: short landscape keeps the fullscreen stage bounded; long negative-thought and reframe content use local overflow, and the next action consumes in-flow space.
- Modal: no modal; reveal and next are in-stage/fixed surfaces.

VIEWPORT FINDINGS

640×360: the compact max-height branch keeps progress/helper text readable, uses height-aware two-column allocation, and keeps Reveal/Next at practical touch height. Long therapeutic text remains locally scrollable without a fixed bottom overlay.

844×390: the same short-height branch preserves readable event/negative-thought/prompt text and gives the main stage the remaining height; post-reveal content scrolls locally above the in-flow action.

932×430: extra height is available to the two-column stage while progress, prompt, and reframe typography remain facilitator-readable.

390×844: portrait retains the stacked flow and may grow vertically; the next action follows the reframes instead of overlaying them.

1280×720: desktop typography/padding improves and the two-column therapy prompt/reframe composition is appropriate.

PRIMARY STIMULUS DOMINANCE

BORDERLINE — the scenario and negative thought are central, but the blank reframe placeholder and fixed bottom bar dilute the first-state hierarchy.

TOUCH TARGETS

LIGHT COMPLETE — Back, Reveal, and Next have explicit practical targets; progress remains visible above the compact landscape readability floor.

WHY CHANGE / WHY KEEP

Keep the event → negative thought → reframe progression and local text scroll. The LIGHT pass keeps the short-height two-column stage, restores minimum progress/helper readability, makes Reveal/Next/Back practical, and removes the fixed action overlay without changing scenario progression or reveal semantics.

EVIDENCE

STATIC SOURCE INFERENCE — based on dedicated safe-stage hooks, short-height media rules, local `overflow-y-auto`, and the in-flow footer structure. Target iPhone/Dynamic Island behavior remains pending reviewer acceptance.

EXPECTED / OBSERVED USER SYMPTOM

The implementation addresses the prior tiny progress/reveal controls and fixed Next overlay by reserving actual footer space and keeping long therapeutic text in local scroll containers.

GAMEPLAY / STATE LOCK

Preserve randomized ten-scenario selection, current index, show/reframe state, last-scenario completion, Back behavior, reframe content, and next progression.

GAMEPLAY RISK

MEDIUM — state is simple but reveal/next visibility is coupled to progression and random scenario initialization.

EXPECTED IMPLEMENTATION FILES

`components/PositiveReappraisalGame.tsx`, `index.css`, and `tests/positiveReappraisalFacilitatorAcceptance.test.tsx`.

RECOMMENDED MODEL

Luna High — long-text local scrolling and reveal/progression presentation need careful visual QA.

REVIEWER SHOULD CHECK

1. Event and negative-thought text remain readable and visible at 640×360.
2. Reveal and Next are reachable without covering the key scenario text.
3. Reframe list local scrolling, progress labels, and portrait behavior remain usable.

Final audit line: 轉念練習 — Recommendation: LIGHT. Why: the therapy-specific split is correct; the implementation adds dedicated safe-area ownership, height-aware two-column landscape allocation, readable controls, local long-text scroll, and an in-flow next action without changing therapeutic content or progression. Evidence: REAL-DEVICE ACCEPTED. Status: `LIGHT IMPLEMENTATION COMPLETE`, reviewer accepted.

## Reference-layout decision

### Decision: B — do not create a shared FACILITATOR layout yet

The eleven games are too heterogeneous for one safe shared component at this point:

- Zoom and Conditional Snap are single central stimuli with facilitator advance/reveal controls.
- Verbal Memory, Story Cards, and Treasure are grids/card stages with different density and reveal semantics.
- Word Chain, Price Estimation, and Positive Reappraisal are prompt/status or long-text flows.
- Guess Who needs a candidate surface plus question/history rail.
- Higher/Lower and Roulette are simultaneous two-team betting/prediction tables.

A shared shell now would either overfit to the Roulette/Guess Who cases or flatten important facilitator semantics. Reusable standards should be extracted first: full-height stage allocation, short-height landscape by height, predictable facilitator rail/action grouping, local-only secondary scroll, 44px core controls, minimum 12px helper text, non-color state cues, and bounded reveal/rules surfaces. After two or three LIGHT implementations demonstrate the same region contract, re-evaluate whether a small shared scaffold is justified. Do not use Roulette as the first shared reference because it is the FULL candidate and has high state risk.

## Proposed FACILITATOR acceptance contract

This is a future implementation contract, not production code in this audit:

1. Landscape root uses the full dynamic viewport and avoids document horizontal/vertical scroll at `640×360`, `844×390`, and `932×430`.
2. Short landscape is classified by `orientation: landscape` plus a short-height condition around `max-height: 480px`, never by a narrow-width rule alone.
3. The primary group stimulus receives the remaining space and is not reduced merely to preserve decorative chrome.
4. Facilitator controls are grouped in a predictable rail or reserved action band; Back, Rules, Reset, Next, Reveal, Start, Stop, Confirm, and equivalent core actions are approximately `44×44px` where practical.
5. Only history, long instructions, candidate lists, and secondary result details may scroll locally. The primary stimulus and core action must not be hidden behind document scroll.
6. Current task, prompt, score/timer, and reveal state are visible without duplicating the same status in multiple persistent regions.
7. Main labels target `14–16px`; helper/status text generally stays at or above `12px` in facilitator landscape.
8. Selected, correct, incorrect, valid, and revealed states use text, icons, outlines, shape, or other cues in addition to color.
9. Rules/result/reveal surfaces have max-height, internal scroll where necessary, and an accessible close/confirm target.
10. Portrait `390×844` preserves minimal operability without forcing landscape geometry into a cramped column.
11. Timers, randomness, scoring, reveal, group turns, animations, reset, and progression remain behaviorally identical.

## Recommended implementation order

1. **Conditional Snap — LIGHT — Luna Medium.** Small state surface and a clear central-stage height correction make it the safest first representative single-stimulus implementation.
2. **Story Cards — LIGHT — Luna Medium.** Reuses a bounded visual stage with compact card/zoom accessibility concerns and low-to-medium state risk.
3. **Verbal Memory — LIGHT — Luna Medium.** Establishes a facilitator grid standard for NORMAL/ADVANCED whole-grid visibility.
4. **Zoom — LIGHT — Luna Medium.** Applies the single-stimulus sizing/accessibility standard to timer/reveal state.
5. **Price Estimation — LIGHT — Luna High.** Reuses predictable prompt/options/action allocation with moderate state risk plus dedicated safe-area integration.
6. **Word Chain — LIGHT — Luna High.** Adds timer and timeout modal checks after the simpler stages are stable.
7. **Positive Reappraisal — LIGHT — Luna High.** Handles long text, local scroll, and fixed action layering.
8. **Guess Who — LIGHT — Luna High.** Apply the three-column candidate/question/history correction while retaining elimination/history semantics.
9. **Treasure — LIGHT — Luna High.** Setup, preview timer, random map, radar, and game-over make this a higher-risk LIGHT.
10. **Higher/Lower — LIGHT — Luna High.** Simultaneous team choices, cards, Joker behavior, and rules bounds require careful regression.
11. **Roulette — FULL — Luna Max.** Do last because it needs the most consequential composition decision and carries spin, dual bets, scores, rounds, and game-over state risk.

## Status and scope conclusion

- FACILITATOR audit: complete for all 11 games.
- Production implementation: Conditional Snap, Zoom, Verbal Memory, Story Cards, Price Estimation, Word Chain, Guess Who, Treasure, Higher/Lower, Positive Reappraisal, and Roulette complete and reviewer accepted; Roulette retains its THREE-COLUMN V2 implementation and fixed 44×44 header controls.
- Production files changed in the Roulette batch: `components/RouletteGame.tsx` and `index.css`; shared FACILITATOR layout and `GameShell` remain unchanged.
- Acceptance test added in the Roulette batch: `tests/rouletteFacilitatorAcceptance.test.tsx`.
- Recommended classifications: `KEEP 0`, `LIGHT 10`, `FULL 1`.
- Overall standardization is `53/59`; FACILITATOR is `11/11 COMPLETE` after Roulette real-device acceptance. The next phase is one six-game IMMERSIVE audit and reference selection; Breathing is the first reference implementation and is tracked separately in `docs/IMMERSIVE_MIGRATION_AUDIT.md`.
