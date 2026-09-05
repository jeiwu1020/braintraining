# Bundle Optimization Audit

Audit date: 2026-09-05
Baseline: `aa7adfbb3e6d6eddc66ab403d77fa355a470baaa`
Scope: analysis and documentation only. No production optimization was implemented.

## 1. Baseline build

The baseline command was `npm run build`.

```text
> copy-of-mindful-garden超級金頭腦-綜合腦訓練---ot-cognitive-games@0.0.0 build
> vite build

vite v6.4.2 building for production...
transforming...
✓ 2190 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                        1.70 kB │ gzip:   0.82 kB
dist/assets/index-5gGprLo-.css        60.99 kB │ gzip:   8.63 kB
dist/assets/mancalaAI-DrzaruHw.js      1.76 kB │ gzip:   0.85 kB
dist/assets/index-7Spk2zPK.js      1,332.53 kB │ gzip: 381.35 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit via build.chunkSizeWarningLimit.
✓ built in 19.61s
```

The warning is the standard Vite chunk-size warning. The generated JavaScript chunks are:

| Chunk | Raw size | Gzip size | Role |
| --- | ---: | ---: | --- |
| `dist/assets/index-7Spk2zPK.js` | 1,332.53 kB | 381.35 kB | Initial application entry; the only chunk over 500 kB |
| `dist/assets/mancalaAI-DrzaruHw.js` | 1.76 kB | 0.85 kB | Existing dynamic `mancalaAI` import |

CSS is emitted separately at `60.99 kB` raw / `8.63 kB` gzip. The >500 kB warning is therefore triggered exactly by `index-7Spk2zPK.js`.

## 2. Manifest and initial graph

`npx vite build --manifest` produced `dist/.vite/manifest.json` with two entries:

- `index.html` → `assets/index-7Spk2zPK.js`, marked `isEntry: true`, with `assets/index-5gGprLo-.css` and one dynamic import: `utils/mancalaAI.ts`.
- `utils/mancalaAI.ts` → `assets/mancalaAI-DrzaruHw.js`, marked `isDynamicEntry: true`.

The entry has no separate static `imports` list in the manifest because Vite/Rollup emitted the statically reachable graph into the single entry chunk. There are no game-level dynamic imports.

### App import evidence

`App.tsx` contains:

- 59 static imports matching `./components/...`.
- 59 `GameState` render cases.
- 0 `React.lazy` calls.
- 0 game-level `import()` calls.

The only dynamic import found in the application source is the existing `MancalaGame` import of `../utils/mancalaAI`. The `MainMenu` is defined in `App.tsx` and uses `gameCatalog` metadata to render categories/cards, so it does not need game implementations to render the menu. However, all 59 static component imports are evaluated as part of loading `App.tsx`, before the menu is shown.

### Initial graph classification

| Group | Current initial-graph contents | Finding |
| --- | --- | --- |
| Core initial UI | React/ReactDOM, `App.tsx`, `gameCatalog`, MainMenu, `lucide-react`, shared game UI | Correctly needed for the menu, but currently bundled with all games because App statically imports them. |
| Game-specific code | All 59 game components, including immersive games and board/table games | Eagerly included in the entry even though only one game is active at a time. |
| Large shared/data modules | `staticData` through `geminiService`, hazard/social/positive data, idiom data, Go engine/puzzles/joseki data, `soundService` | Reachable through statically imported components and therefore included in the initial graph. |
| Optional/heavy libraries | `motion/react` is used by 13 components; WebAudio/canvas are browser APIs. | Motion code is initial because its consumers are initial. `framer-motion` has no direct source import. |

## 3. Large source module audit

Source sizes below are raw source-file sizes, not emitted bundle attribution. They are used only to prioritize future graph work; the authoritative current payload is the emitted entry chunk above.

| Module | Source size | Initial graph? | Evidence / implication |
| --- | ---: | --- | --- |
| `services/staticData.ts` | 95,080 B | Yes | Imported by `services/geminiService.ts`; `geminiService` is statically imported by 15 game components. |
| `services/goEngine.ts` | 58,808 B | Yes | Imported by `WeiqiGame`, `WeiqiBoard`, `WeiqiLandscapeLayout`, and `data/goPuzzles`. |
| `data/goPuzzles.ts` | 23,236 B | Yes | Statically imported by the Weiqi components. |
| `data/hazardData.ts` | 81,535 B | Yes | Statically imported by `HazardIdentificationGame`, which App imports eagerly. |
| `data/positiveData.ts` | 51,450 B | Yes | Statically imported by `PositiveReappraisalGame`, which App imports eagerly. |
| `data/socialContextData.ts` | 72,937 B | Yes | Statically imported by `SocialContextGame`, which App imports eagerly. |
| `components/WeiqiGame.tsx` | 72,018 B | Yes | Direct App import; also pulls Go board/puzzle dependencies. |
| `components/QwirkleGame.tsx` | 53,466 B | Yes | Direct App import; motion, audio service, shared layout. |
| `components/RummikubGame.tsx` | 41,899 B | Yes | Direct App import; motion, audio service, shared layout. |
| `components/MahjongMeldsGame.tsx` | 36,984 B | Yes | Direct App import; motion, audio service, shared layout. |
| `components/CheckersGame.tsx` | 33,920 B | Yes | Direct App import; audio service and board controls. |
| `components/BlackjackGame.tsx` | 30,341 B | Yes | Direct App import; motion and rules UI. |

Other notable reachable data includes `data/idiomsData.ts` through `WordTileGame`. `services/soundService.ts` is imported by 44 components, so it is also reachable from the initial graph even though actual sound starts only after user interaction.

### Static data boundary finding

`services/geminiService.ts` imports a broad list of arrays from `services/staticData.ts` (sorting, sentence, find, market, steps, shadow, emotion, pattern, time, odd-one, sound, and puzzle data). Therefore a future lazy-loaded game that imports one `geminiService` function will still pull the whole `staticData.ts` module into that game chunk unless the data boundary is split. The minimum safe correction is to split the data by game/function family and keep each generator importing only its own data; this is separate from the App lazy-loading change and must preserve all existing data values and selection semantics.

The directly imported `hazardData`, `positiveData`, `socialContextData`, and Go puzzle data already have clearer game boundaries. They can follow their owning game's dynamic boundary, subject to testing.

## 4. Dependency audit

- `motion` is genuinely used: 13 files import from `motion/react` (`BlackjackGame`, `ChineseTenGame`, `GuessCardGame`, `HigherLowerGame`, `MahjongMeldsGame`, `QwirkleGame`, `RouletteGame`, `RummikubGame`, `SevensGame`, `TreasureGame`, `WeiqiBoard`, `WeiqiGame`, and `WeiqiLandscapeLayout`). It is therefore part of the current initial graph.
- `framer-motion` has no direct import in `App.tsx`, `index.tsx`, `components/`, `data/`, or `services/`. It appears redundant at source level, but removal is not part of this audit; package-lock, build, and any external consumer checks would be required.
- `lucide-react` is imported by App and 65 source files using named icon imports. This is compatible with tree-shaking. There is no evidence in this baseline that replacing the icon package would be a better optimization than establishing game-level boundaries.

## 5. Strategy comparison and recommendation

### Preferred: game-level dynamic imports

Use `React.lazy(() => import('./components/XGame'))` (or an equivalent typed game registry) for the active game and place a minimal `Suspense` boundary around the active-game region. Keep `MainMenu` and `gameCatalog` in the initial graph. Let Rollup extract genuinely shared modules rather than adding brittle hand-maintained chunk rules.

This directly changes the graph from “menu + all 59 games” to “menu + the selected game and its dependencies”. It is the best fit for the existing one-`GameState`-at-a-time navigation and preserves maintainability because the dynamic boundary follows the existing component boundary. It will produce more emitted chunks, but only the selected game chunk and shared dependencies need to be fetched after selection; this is different from 59 initial requests.

### Alternatives

| Option | Assessment | Why not preferred now |
| --- | --- | --- |
| Category/layout chunks | Viable fallback | Fewer chunks, but selecting one game downloads unrelated games in that category and category boundaries do not match data/resource boundaries consistently. |
| Heavy games only lazy | Partial optimization | Leaves many small games and the broad `geminiService`/`staticData` graph eager; likely reduces less initial payload and creates a less predictable rule. |
| `manualChunks` / vendor-only split | Not sufficient by itself | It can make the warning disappear while static imports still request the resulting chunks eagerly. Splitting output files is not proof that initial transfer or parse work fell. It also adds brittle Rollup configuration. |

### Minimal future dependency-boundary correction

First establish the App/game boundary. Then measure the selected-game chunks. If a selected game imports a broad barrel/module, split only the data boundary that is proven to be over-broad (starting with `staticData.ts`/`geminiService.ts`). Keep Go engine/puzzles together for Weiqi, and keep audio/canvas resources game-specific. Do not add a generic shared game component as part of bundle work.

## 6. Suspense and offline UX contract

The future fallback should be a compact, background-matching region with accessible text such as `載入遊戲中…`. It should be safe-area compatible, avoid a full-page white flash, and not change MainMenu layout. A failed chunk should have an explicit recovery path in a later implementation design; PWA/offline behavior must be tested because a newly selected game chunk may not yet be cached on first use.

Current tests mostly use source-contract assertions and direct imports of components/helpers. There are no `render(<App />)` or `React.lazy`-aware async tests in the current inventory. Direct component tests should remain unaffected by App lazy loading. Any future App-level interaction tests will need async `findBy`/`waitFor` or an equivalent Suspense-aware wait, plus a chunk-load failure case if the UI exposes recovery.

## 7. Risk classification

| Optimization | Risk | User-observable failure mode |
| --- | --- | --- |
| Game-level `React.lazy` | MEDIUM | First selection can show loading or fail if a chunk is unavailable; incorrect registry mapping could prevent a game from opening. |
| Category-level chunks | MEDIUM | A category boundary mistake can load unrelated games or fail several games together; category selection may incur a larger first load. |
| Manual Rollup `manualChunks` | HIGH | Output may be split without reducing initial requests, and brittle rules can create missing/shared-chunk or cache-invalidation failures. |
| Removing unused `framer-motion` dependency | LOW | Low expected runtime risk because no source imports it, but package-lock/tooling or an unsearched external consumer could fail. Validate separately. |
| Splitting large data modules | MEDIUM | Wrong boundary can alter content availability or selection behavior; duplicate data can increase total payload. |
| Vendor chunk split | MEDIUM | Better browser caching is possible, but preload/request behavior and cache invalidation need measurement; it is not a substitute for game laziness. |

## 8. Future implementation batches

### Batch 1 — establish and measure the boundary

- Scope: typed game registry, App-level game lazy loading, one minimal Suspense fallback, and tests for menu render, first game selection, back navigation, and chunk-load failure behavior.
- Model: Luna High.
- Why: this changes the graph at the highest-leverage boundary while keeping game implementations untouched.
- Shared contracts: current `GameState` mapping, existing MainMenu/catalog, accessible loading text, and current safe-area ownership inside each game.
- Game-specific constraints: preserve each component's default props, lifecycle, and direct-test import path.

### Batch 2 — data-boundary and resource-sensitive follow-up

- Scope: split `staticData.ts`/`geminiService.ts` only where profiling proves it is needed; validate Go puzzle/engine and audio/canvas games as selected chunks; review automatic shared/vendor extraction.
- Model: Luna Max.
- Why: these modules have the highest data/resource coupling and the largest regression surface.
- Shared contracts: no gameplay/content changes, no PWA viewport changes, explicit cleanup tests, and baseline full-suite parity.
- Game-specific constraints: Go rules/puzzles, WebAudio graphs, microphone/canvas lifecycles, and timers remain isolated and unchanged.

## 9. Measurable acceptance criteria for a future implementation

The current baseline is 1,332.53 kB raw / 381.35 kB gzip for the initial JS entry, with one 1.76 kB dynamic AI chunk. Future work should report both raw and gzip sizes for the entry and selected-game chunks.

Required evidence should include:

1. MainMenu loads without downloading all 59 game implementations in the initial graph.
2. Initial JS transfer is materially lower than the baseline; do not count a warning disappearing alone as success.
3. The entry chunk is substantially below the current 1,332.53 kB raw baseline, and no initial chunk over 500 kB is the preferred outcome where achievable without brittle rules.
4. First selection loads the chosen game and its required data correctly; subsequent back/re-entry works.
5. All 59 catalog mappings remain reachable, with gameplay/content/layout semantics unchanged.
6. `npm exec -- tsc --noEmit` remains at 0 errors and the current 51 files / 128 tests remain passing, or any legitimate count change is explained.
7. Production build succeeds, offline/PWA behavior is explicitly checked, and chunk-load fallback behavior is covered.

The warning-removal metric and the initial-download metric must be reported separately.

## 10. Batch 1 implementation results

Batch 1 implemented game-level lazy loading in `App.tsx` with one minimal `React.Suspense` fallback. No game component, data module, CSS, PWA file, Vite configuration, or dependency was changed.

| Metric | Baseline | Batch 1 | Change |
| --- | ---: | ---: | ---: |
| Initial entry JS raw | 1,332.53 kB | 244.75 kB | −1,087.78 kB |
| Initial entry JS gzip | 381.35 kB | 76.81 kB | −304.54 kB |
| JS files emitted | 2 | 102 | More on-demand boundaries; not initial requests |
| >500 kB warning | Yes | No | Warning removed |

The entry is `assets/index-CS-WSqsy.js`. The build emitted 102 JavaScript files in total: the entry, 59 game dynamic entries, the existing `mancalaAI` dynamic entry, and shared/icon/dependency chunks. The larger lazy game chunks are:

| Game chunk | Raw | Gzip |
| --- | ---: | ---: |
| `WeiqiGame-Ct2CyuKl.js` | 106.43 kB | 26.78 kB |
| `HazardIdentificationGame-i6DEMtK1.js` | 57.27 kB | 19.52 kB |
| `SocialContextGame-Guq__dIE.js` | 55.42 kB | 18.71 kB |
| `PositiveReappraisalGame-DLijnvdi.js` | 50.58 kB | 18.73 kB |
| `WordTileGame-NNDYi9y2.js` | 40.35 kB | 16.52 kB |
| `QwirkleGame-DUDHgfws.js` | 33.70 kB | 9.32 kB |
| `RummikubGame-D5XlJ30J.js` | 28.34 kB | 8.21 kB |
| `MahjongMeldsGame-OYKMzBn1.js` | 23.37 kB | 7.24 kB |
| `CheckersGame-CxotCkSV.js` | 23.28 kB | 6.80 kB |
| `BlackjackGame-3HHimJLh.js` | 19.95 kB | 5.68 kB |

Manifest verification from `dist/.vite/manifest.json`:

- `index.html` is the single entry and points to `assets/index-CS-WSqsy.js`.
- It has 0 static imports and 59 dynamic imports for the game components.
- The manifest has 59 `components/*.tsx` dynamic entries plus the existing `utils/mancalaAI.ts` dynamic entry.
- The 59 game implementations are therefore absent from the menu entry's static dependency graph.

The warning-removal result and the initial-load result are separate: this batch achieved both. The emitted file count increased, but those files are requested on game selection rather than eagerly downloading all game implementations with MainMenu.

Runtime smoke evidence in the local browser confirmed MainMenu load, the visible `載入遊戲中…` fallback, game resolution, Back navigation, second-game navigation, and re-entry. No real-device or iOS cold-start claim is made here.

## 11. Decision and deferred work

Batch 1 is complete. The next approved optimization should be measured data-boundary work only where selected-game profiling proves it necessary, starting with the broad `staticData.ts`/`geminiService.ts` relationship. Manual chunks, dependency cleanup, and PWA cold-start work remain separate; no Batch 2 work was implemented here.

## 12. Final reviewer closeout

Bundle optimization Batch 1 subsequently passed real-device review and is
`REAL-DEVICE ACCEPTED`. The 59 game modules remain lazy-loaded, the initial
entry reduction and resolved `>500 kB` warning remain accepted, and no game
behavior or layout regression is known. Batch 2 data-boundary optimization is
deferred and is not currently required; reopen it only when measured profiling
shows a concrete need.
