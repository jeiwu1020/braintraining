# IMMERSIVE migration audit

## Audit status

- Audit scope: exactly the six catalog entries whose `layoutPreset` is `IMMERSIVE`.
- Current formal status: `56/59`; `FACILITATOR 11/11 COMPLETE`; `IMMERSIVE 3/6`.
- Reference selected: `呼吸律動` / `components/BreathingExercise.tsx`.
- Reference status: `REAL-DEVICE ACCEPTED`; Breathing is counted as the first completed IMMERSIVE migration. Affirmation and Muscle Relaxation are also `REAL-DEVICE ACCEPTED`, so three IMMERSIVE games are formally complete.
- Evidence: `STATIC SOURCE INFERENCE` for the target viewports. No target-size browser or iPhone measurements are claimed in this audit.
- Shared component decision: **A — no shared IMMERSIVE component yet**. The first reference establishes scoped CSS and safe-stage conventions only; the six games have materially different canvas, microphone, WebAudio, timer, and content models.

## Inventory and classification summary

| Game | Component | Catalog state | Classification | Recommended model | Confidence |
|---|---|---|---|---|---|
| 呼吸律動 | `components/BreathingExercise.tsx` | `GameState.BREATHING` | LIGHT reference — accepted | Luna Max | High |
| 環境白噪音 | `components/AmbientSoundGame.tsx` | `GameState.AMBIENT_SOUND` | FULL — implementation complete, pending reviewer | Luna Max | High |
| 紓壓聲繪 | `components/MandalaGame.tsx` | `GameState.MANDALA` | FULL — implementation complete, pending reviewer | Luna Max | High |
| 正向肯定小卡 | `components/AffirmationCardGame.tsx` | `GameState.AFFIRMATION` | LIGHT — REAL-DEVICE ACCEPTED | Luna Medium | High |
| 指尖星空 | `components/StarryRippleGame.tsx` | `GameState.STARRY_RIPPLE` | LIGHT — implementation complete, pending reviewer | Luna High | Medium |
| 漸進式放鬆 | `components/MuscleRelaxationGame.tsx` | `GameState.MUSCLE_RELAXATION` | LIGHT — REAL-DEVICE ACCEPTED | Luna High | Medium-high |

All six remain cataloged as `layoutPreset: IMMERSIVE`. This batch changes that classification nowhere.

## Shared IMMERSIVE reference contract

The Breathing implementation establishes these local conventions, without introducing a shared component:

- An edge-to-edge outer root owns `100dvh`, min/max height, background, and landscape overflow policy.
- A child `.app-safe-screen` is the only safe-area owner; the visual layout owns ordinary padding and gaps.
- Immersive chrome remains minimal. The Back control is inside the safe stage, has the name `返回遊戲選單`, and uses a practical `min-h-11 min-w-11` target.
- The primary stimulus gets a named stage with explicit room for its functional maximum scale. Secondary copy is compacted only at `(orientation: landscape) and (max-height: 480px)`.
- Functional animation and timing are game-specific. Reduced motion must not remove breathing size guidance or alter exercise timing.
- Completion states use the same safe-stage contract and a compact short-landscape treatment; they are not converted into a shared modal.

These are contracts to reuse deliberately, not a generic page shell. Each future game must retain its own stimulus, state, resource ownership, and interaction semantics.

## 1. 呼吸律動 — reference implementation

### Component

`components/BreathingExercise.tsx`, `GameState.BREATHING`.

### Current structure

The component has a three-state visual flow: an initial countdown, an active breathing exercise, and a completion card. The active state keeps the title/cycle progress, a central breathing stimulus, and the existing helper text. The completed reference now renders both active and complete views through an outer fullscreen root, an inner `.app-safe-screen`, and a game-local layout.

### Primary immersive stimulus

The expanding/holding/shrinking circular glow, main circle, inner core, instruction, and seconds countdown. The stimulus remains the dominant active content. Its stage reserves room for the maximum `scale = 1.5` and the larger glow rather than allowing transformed content to collide with the layout.

### Controls

A minimal Back control during countdown and active exercise; a primary `回到主選單` action on completion. There is intentionally no pause, skip, audio, or extra therapeutic control.

### State model

`countdown` begins at `3`; `isStarted` changes after the countdown. `phase` remains `Inhale | Hold | Exhale`; `seconds`, `scale`, and `duration` drive the functional visual guidance. `completedCycles` and `cyclesRef` protect five-cycle completion; `isFinished` selects the completion state.

### Audio / mic / canvas / timer dependencies

No audio, microphone, or canvas. Countdown, phase changes, visual seconds, and cycle progression use timeouts held by the existing local timeout/ref architecture.

### Root height strategy

Reference implementation: outer `h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden`; inner `app-safe-screen h-full w-full`; visual `.breathing-layout` owns padding. Short landscape uses a two-region metadata/stimulus grid so horizontal space can preserve stimulus size.

### Safe area status

Implemented in this batch with one `.app-safe-screen` owner. Back is positioned relative to the safe layout instead of raw viewport edges. No global inset or GameShell change.

### Phone landscape findings

- `640×360`: static source inference indicates that the former vertical stack is tight. The reference moves title/progress/helper to a compact left rail and keeps a height-aware square stimulus on the right. The functional circle and glow have an explicit reserve frame; target-size overflow is not claimed without runtime evidence.
- `844×390`: the same height-aware composition can use the additional horizontal/vertical room while retaining the helper and cycle progress.
- `932×430`: the same compact landscape contract allows a larger stimulus stage; no width-only breakpoint is used.

### Portrait findings — `390×844`

The default layout remains a centered vertical exercise with the full helper and a spacious stimulus. The landscape grid is scoped to short landscape and is not forced into portrait.

### Desktop findings — `1280×720`

The default vertical immersive presentation remains larger and centered; the reference does not apply short-landscape typography or side-rail composition on this roomy viewport.

### Touch target status

Back and completion action are practical 44px-class controls. The stimulus itself is not a button. The acceptance test protects the Back name and minimum target classes.

### Overflow / clipping risk

The former root and transformed circle could approach viewport/control boundaries. The reference uses an overflow-visible stimulus stage whose reserved size accounts for the maximum glow/circle scale, while the fullscreen layout remains clipped at the outer edge. Target-device clipping still requires reviewer inspection.

### Reduced motion considerations

Breathing size is functional guidance, so the reference does not disable inhale/hold/exhale scaling or change the 4/7/8 timing under reduced motion. No unrelated motion system was added.

### Cleanup / resource-lifecycle risk

Countdown, phase, and visual-second timeouts retain cleanup. The existing cycle timeout collection is cleared on effect teardown, and the visual countdown timeout has its own cleanup. No background resource is introduced.

### Classification / confidence / recommended model

`LIGHT` as the reference: the interaction and timing architecture are valid; the migration is primarily safe-stage ownership, height-aware stimulus composition, and completion sizing. Confidence: high. Recommended model: `Luna Max` for establishing the first reference and verifying timer/visual semantics.

### Why

It has a single central stimulus, timed active phases, a countdown, and completion without microphone permission, WebAudio graph, canvas drawing, or permission-sensitive cleanup. It is complex enough to establish useful immersive contracts while keeping cross-system risk low.

### What reviewer should check

Dynamic Island-safe Back during countdown and active state; clear 3/2/1; readable 4/7/8 instruction and seconds; cycle `X / 5`; no clipping at maximum inhale scale; no duplicate/restarted cycle; completion message and `回到主選單` fully reachable; no PWA blank strip.

### Acceptance result

Breathing passed the reviewer real-device gate. Its 100dvh/safe-stage ownership, countdown, active stimulus, maximum-scale reserve, and completion presentation are now the accepted reference contract for the two simple-DOM migrations below.

## 2. 環境白噪音

### Component / current structure

`components/AmbientSoundGame.tsx`, `GameState.AMBIENT_SOUND`. A dark fullscreen soundboard presents five sound controls, per-sound volume/toggle behavior, timer choices, and a master play/pause control. The current composition uses a root `min-h-[100dvh]` with ordinary padding and a responsive tile grid.

### Primary immersive stimulus

The active ambient sound mix and the dark soundscape surface. The five sound sources are the user-facing selection surface, while the master timer/play state is the session stimulus.

### Controls

Five sound tiles (rain, waves, wind, fire, bowl), sound-specific enable/volume controls, timer options `5/15/30/60/infinite`, and master play/pause. This is a high-density control set that must remain understandable to a facilitator/user.

### State model

Per-sound enabled/volume state, `isPlaying`, `timeLeft`, and timer selection. Audio nodes are constructed/started and stopped through local WebAudio helpers.

### Audio / mic / canvas / timer dependencies

WebAudio `AudioContext`, oscillators/buffers/gain/filter nodes for the sound generators, a countdown interval, volume updates, and master playback state. No mic or canvas.

### Root height strategy / safe area status

Current root is `min-h-[100dvh] bg-slate-900 p-4` without a dedicated `.app-safe-screen`; Back is absolute near the raw viewport corner and lacks the reference 44px/name contract. Global `GameShell` is not used.

### Phone landscape findings

- `640×360`: static inference indicates five sound controls plus timer/master controls compete with the title and helper; current grid/gaps and padding risk either cramped controls or vertical overflow.
- `844×390`: extra width helps the tile grid, but the timer and master controls still need a deliberate short-height rail/strip.
- `932×430`: likely viable with compact groups, but no target runtime measurement is claimed.

### Portrait / desktop findings

`390×844` can naturally stack the sound controls and timer, but should keep local content usable. `1280×720` can retain a richer multi-tile soundboard.

### Touch target status / overflow risk

The many sound and timer controls need a dedicated 44px audit. Main risk is control density, tile wrapping, and timer/master controls falling below the viewport in short landscape; no document-wide scroll should be used as the primary fix.

### Reduced motion / lifecycle risk

Decorative tile transitions may respect reduced motion, but audio playback semantics must remain available. High lifecycle risk: AudioContext and each generated node must stop/close on pause, timer expiry, and unmount without orphaned audio or intervals. The existing unmount cleanup is a useful baseline but should be re-verified during migration.

### Classification / confidence / recommended model

`FULL`, confidence high, recommended `Luna Max`. The five simultaneous sound controls, timer, master state, and WebAudio lifecycle cannot be safely treated as a small spacing-only correction at `640×360`.

### Why / reviewer checks

Use a lower-density but still visible soundboard contract without hiding essential sound/timer controls. Reviewer should check all five sounds, volume/toggle state, timer choices, master state, safe Back, audio stopping/closing, no document overflow, and behavior after leaving/re-entering.

### Current batch status

`FULL IMPLEMENTATION COMPLETE`, pending reviewer real-device acceptance. The migrated version keeps all five sound controls and volume sliders directly reachable in a short-landscape grid, moves timer/master controls into a compact session region, and preserves generated WebAudio semantics with immutable sound state and explicit node/context cleanup. PWA cold-start viewport infrastructure was not changed.

## 3. 紓壓聲繪

### Component / current structure

`components/MandalaGame.tsx`, `GameState.MANDALA`. A draw/voice mode experience combines a square 600×600 canvas with mode controls, color/brush/erase/download controls, or voice-recording controls. Landscape currently places a controls region beside a canvas; the root is edge-to-edge-ish but uses ordinary padding and raw absolute chrome.

### Primary immersive stimulus

The live mandala drawing canvas in DRAW mode, or the audio-reactive mandala visualization in VOICE mode.

### Controls

Mode selection, color palette, brush size, erase, clear/download, microphone start/stop, and the canvas pointer interaction. The active control set changes with mode.

### State model

Drawing/canvas state, selected color/size/mode, voice recording state, analyser data, and animation/render refs. Pointer events create the drawing interaction; voice mode drives reactive rendering.

### Audio / mic / canvas / timer dependencies

Canvas drawing and rendering; `getUserMedia`, `MediaStream`, `AudioContext`, `AnalyserNode`, and `requestAnimationFrame` in voice mode. No gameplay timer, but the animation loop is a resource lifecycle.

### Root height strategy / safe area status

Current root is `min-h-[100dvh] bg-slate-950 p-4 touch-none`; landscape uses a large panel/canvas arrangement. Back is raw absolute `top-4` with no dedicated safe stage or explicit accessible 44px contract.

### Phone landscape findings

- `640×360`: static inference indicates controls plus a square canvas cannot all remain comfortable without a new composition. The canvas should remain dominant while mode-specific controls use a compact rail.
- `844×390`: a canvas/control rail is plausible, but microphone and drawing controls must preserve reachable targets and avoid canvas clipping.
- `932×430`: additional room helps the square canvas and rail; exact fit remains unmeasured.

### Portrait / desktop findings

`390×844` may stack controls above/below the canvas and use natural content height. `1280×720` can preserve the richer side-by-side drawing layout.

### Touch target status / overflow risk

Canvas pointer interaction is primary and `touch-none` is intentional, but mode/color/tool controls need 44px-class targets. High risk of square-canvas clipping, control density, and an unsafe Back edge.

### Reduced motion / lifecycle risk

Reduced motion must not remove voice-reactive or drawing feedback without a separate product decision. High lifecycle risk: stop RAF, stop media tracks, disconnect nodes, close AudioContext, and release permission-sensitive resources on mode changes, stop, Back, and unmount.

### Classification / confidence / recommended model

`FULL`, confidence high, recommended `Luna Max`. Canvas, mic permission, audio analysis, and mode-dependent controls need a new landscape composition and a careful lifecycle audit.

### Why / reviewer checks

Protect the square canvas and direct touch drawing while making controls usable. Reviewer should check DRAW/VOICE switching, microphone denial and stop cleanup, RAF cancellation, canvas bounds, color/brush/erase/download, safe Back, and no page overflow.

### Current batch status

`FULL IMPLEMENTATION COMPLETE`, pending reviewer real-device acceptance. The migrated version keeps a safe-stage owner, a compact control rail, and a square dominant canvas; DRAW and VOICE controls remain directly reachable. MediaStream tracks, analyser/audio resources, and voice RAF cleanup are explicitly handled. PWA cold-start viewport infrastructure was not changed.

## 4. 正向肯定小卡

### Component / current structure

`components/AffirmationCardGame.tsx`, `GameState.AFFIRMATION`. A single affirmation card flips between front/back states and advances through a local 35-item content array. The current root is a centered `min-h-[100dvh]` pink surface; landscape already has a card plus supporting text/action arrangement.

### Primary immersive stimulus

The large affirmation card and its flip reveal. The card content is the experience; Next is secondary.

### Controls / state model

Back, flip, and next. State is `currentIndex`, `isFlipped`, and `isAnimating`; next uses a short 400ms guard/transition and avoids an immediate repeat.

### Audio / mic / canvas / timer dependencies

No audio, mic, canvas, or long-running timer. One local flip timeout controls the transition guard.

### Root height strategy / safe area status

Current root uses `min-h-[100dvh] bg-pink-50 p-4 sm:p-8`; Back is absolute with `p-2` and no safe-stage owner/name. Landscape card sizing uses an aspect ratio and height cap.

### Phone landscape findings

- `640×360`: static inference suggests the card/support copy can fit with compact chrome, but `sm:` width behavior must not make the card or typography consume the short height.
- `844×390`: likely comfortable after safe-stage and target corrections; preserve card dominance.
- `932×430`: roomy enough for the existing card/support relationship.

### Portrait / desktop findings

`390×844` should remain a calm centered card with natural vertical spacing. `1280×720` can retain the fuller card and supporting copy presentation.

### Touch target status / overflow risk

Flip/Next/Back need explicit 44px-class targets. Main risk is card clipping or an oversized `sm:` card in short landscape, not complex resource leakage.

### Reduced motion / lifecycle risk

The flip transition should remain meaningful; reduced motion may reduce decorative transition duration without changing flip semantics. Clear the existing transition timeout on unmount or when advancing.

### Classification / confidence / recommended model

`LIGHT`, confidence high, recommended `Luna Medium`. It has one DOM stimulus and a contained animation; safe-area, chrome, and height-aware card sizing are the main work.

### Why / reviewer checks

Preserve the quiet affirmation-card experience rather than turning it into a panel dashboard. Reviewer should check card readability, flip/next semantics, no immediate repeat, safe Back, target sizes, and no short-landscape clipping.

### Acceptance status

`LIGHT — REAL-DEVICE ACCEPTED`. The safe-stage, two-region card composition, 44px-class actions, guarded flip timeout cleanup, and original content/progression are accepted.

## 5. 指尖星空

### Component / current structure

`components/StarryRippleGame.tsx`, `GameState.STARRY_RIPPLE`. A full-screen canvas renders stars and touch-generated ripples. A centered instruction overlay and a floating Back control sit above the canvas.

### Primary immersive stimulus

The edge-to-edge animated star field and touch ripples.

### Controls / state model

Touch/pointer interaction on the canvas and Back. Stars/ripples live in refs; the render loop updates them continuously. There is no conventional settings panel.

### Audio / mic / canvas / timer dependencies

Canvas, `requestAnimationFrame`, a resize listener, pointer/touch handlers, and no audio, mic, or gameplay timer.

### Root height strategy / safe area status

Current root already uses `relative w-full h-[100dvh] bg-slate-900 overflow-hidden touch-none`, and the canvas uses `window.innerWidth/innerHeight`. However, Back and instruction overlays are positioned against the raw viewport; there is no dedicated `.app-safe-screen` owner or explicit Back name/44px contract.

### Phone landscape findings

- `640×360`: edge-to-edge canvas is appropriate; the instruction and Back overlay need safe-area placement and readable compact sizing without blocking touch ripples.
- `844×390`: the wide canvas should remain dominant; overlay placement must avoid the cutout/unsafe top region.
- `932×430`: same contract with more canvas area; no width-only rule is necessary.

### Portrait / desktop findings

`390×844` can keep a full portrait canvas with the instruction overlay. `1280×720` can retain the same edge-to-edge visual with more star field space.

### Touch target status / overflow risk

Canvas touch surface is intentionally full-screen and `touch-none` is correct for the interaction. Back needs a safe 44px target. Main risk is overlay/cutout collision and resize/DPR rendering quality rather than document scroll.

### Reduced motion / lifecycle risk

Reduced motion may reduce decorative star/ripple animation density or transition effects only if the touch feedback remains understandable; do not break pointer semantics. Existing RAF cancellation and resize-listener cleanup are important and should stay.

### Classification / confidence / recommended model

`LIGHT`, confidence medium, recommended `Luna High`. The canvas architecture already suits immersive fullscreen; migration is mostly safe chrome, overlay placement, and a scoped reduced-motion/resize audit.

### Why / reviewer checks

Do not put the experience inside a conventional panel. Reviewer should check edge-to-edge canvas, safe Back/instruction placement at all target orientations, ripple response, RAF cleanup, resize handling, and no blank-strip regression.

### Current batch status

`LIGHT IMPLEMENTATION COMPLETE`, pending reviewer real-device acceptance. The migrated version preserves an edge-to-edge canvas, places Back and instruction inside a safe overlay, sizes the backing buffer from rendered geometry with DPR support, and retains tap/drag ripple semantics with RAF and resize cleanup. No PWA cold-start viewport work was included.

## 6. 漸進式放鬆

### Component / current structure

`components/MuscleRelaxationGame.tsx`, `GameState.MUSCLE_RELAXATION`. A step-based relaxation flow presents a large progress/status circle, step instruction, timer, play/pause/reset controls, and optional music. A completion state presents the end message and restart behavior.

### Primary immersive stimulus

The current muscle group instruction, countdown, progress circle, and calm visual treatment. Music is supportive rather than the only stimulus.

### Controls / state model

Back, play/pause, reset, music toggle, current step, `timeLeft`, `isPlaying`, `finished`, and audio failure/fallback state. Steps are driven by a local duration table.

### Audio / mic / canvas / timer dependencies

An HTML audio element for `/relaxing-music.mp3` with synthesized fallback through `soundService`; a step timer implemented with timeouts; audio play/pause and error handling. No mic or canvas.

### Root height strategy / safe area status

Current root uses a padded `min-h-[100dvh]` teal surface with raw absolute Back and music controls. There is no dedicated safe stage; the music control also needs an explicit accessible name and 44px-class target.

### Phone landscape findings

- `640×360`: static inference indicates the large circle, instructions, timer, play/pause/reset, music control, and title can compete for short height; instruction text must remain readable and use a compact control rail.
- `844×390`: likely viable with height-aware circle sizing and a compact action row; audio state must remain visible.
- `932×430`: additional room can preserve a more spacious calm composition.

### Portrait / desktop findings

`390×844` can remain a centered vertical flow and scroll naturally only if content genuinely needs it. `1280×720` can retain the fuller relaxation card and controls.

### Touch target status / overflow risk

Play/pause, reset, music, and Back require explicit practical targets. Risk is vertical collision between circle/instruction/timer and controls, plus audio fallback state being visually unclear.

### Reduced motion / lifecycle risk

Timer and relaxation phase semantics must remain unchanged. Decorative transitions may respect reduced motion, but do not remove progress guidance. Audio element and fallback playback must pause/stop safely on Back, completion, reset, and unmount; verify no timeout or fallback audio remains active.

### Classification / confidence / recommended model

`LIGHT`, confidence medium-high, recommended `Luna High`. The single DOM stimulus and local timer are conceptually simple, but audio fallback and step lifecycle warrant a stronger implementation/review pass.

### Why / reviewer checks

Preserve a calm single-focus exercise while moving chrome into the safe stage and allocating short landscape height intentionally. Reviewer should check step timing, play/pause/reset, music on/off and fallback, progress/timer readability, Back/music targets, completion, cleanup, and no overflow.

### Acceptance status

`LIGHT — REAL-DEVICE ACCEPTED`. The safe-stage/two-region layout, practical controls, completion handling, and audio/fallback cleanup were accepted with the original step, timer, and therapeutic semantics unchanged.

## Migration batch 1 — completed and accepted

- Games: `AffirmationCardGame` (`LIGHT`), `MuscleRelaxationGame` (`LIGHT`).
- Recommended model: `Luna High`.
- Status: `LIGHT IMPLEMENTATION COMPLETE` and `REAL-DEVICE ACCEPTED` for both games.
- Why these belong together: both are centered DOM experiences with a single dominant visual treatment, no canvas or microphone permission, and local interaction/timer work. They reuse the safe-stage/minimal-chrome/short-height allocation conventions established by Breathing without forcing identical content layouts.
- Shared contracts that can safely be reused: outer 100dvh and inner `.app-safe-screen`, safe 44px Back/control targets, `(orientation: landscape) and (max-height: 480px)` scoping, primary-stimulus reservation, compact completion handling, and timer/transition cleanup review.
- Must remain game-specific: affirmation flip/index/non-repeat semantics; Muscle Relaxation step durations, audio element/fallback, music state, and completion flow.

## Migration batch 2 — final resource-sensitive batch

- Games: `StarryRippleGame` (`LIGHT`), `AmbientSoundGame` (`FULL`), `MandalaGame` (`FULL`).
- Recommended model: `Luna Max`.
- Status: implementation complete for all three games; pending reviewer real-device acceptance. Formal IMMERSIVE count remains `3/6`.
- Why these belong together: all need an explicit resource-lifecycle and edge-to-edge interaction review, and their primary surface is either a canvas or a multi-source audio experience. They should be migrated after the simple DOM batch proves the reference safe-stage contract, with separate per-game composition decisions.
- Shared contracts that can safely be reused: one safe-area owner, edge-to-edge stimulus surface, safe floating controls, no document scroll in short landscape, local secondary control scrolling only where necessary, and explicit cleanup on unmount/exit.
- Must remain game-specific: Starry Ripple canvas/RAF/ripple physics; Ambient Sound WebAudio graph, five sources, timer, volume and master controls; Mandala DRAW/VOICE modes, canvas drawing, microphone permission, analyser graph, media tracks, and RAF.

## Final audit decision

Breathing remains the accepted `LIGHT` reference and its 5-cycle, 3-countdown, 4/7/8 timing and functional size guidance are unchanged. Affirmation and Muscle Relaxation are `LIGHT — REAL-DEVICE ACCEPTED`; their content, flip/step/timer/audio semantics remain game-specific. StarryRipple is `LIGHT IMPLEMENTATION COMPLETE`; AmbientSound and Mandala are `FULL IMPLEMENTATION COMPLETE`; all three are pending reviewer real-device acceptance. No shared IMMERSIVE component is justified yet. The formal status remains `56/59`, `FACILITATOR 11/11`, `IMMERSIVE 3/6`; after all three pending reviewer gates, expected status is `59/59`, `IMMERSIVE 6/6 COMPLETE`. The intermittent iOS Home Screen Web App cold-start bottom blank strip remains `DEFERRED` and was not modified in this batch.
