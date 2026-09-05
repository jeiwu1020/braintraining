# Tailwind Production Audit

Audit date: 2026-09-05  
Baseline: `2ef90d80326706a7b4309429e044d9d5259abba3`  
Scope: historical audit baseline plus the controlled local production
migration. Implementation is complete and pending reviewer real-device
acceptance.

## 1. Executive finding

Historical audit finding before implementation: the repository used
Tailwind's browser CDN as the utility-style
generator. Vite emits `index.css`, but it does not process the Tailwind
directives because the project has no direct Tailwind/PostCSS integration.
The emitted CSS therefore still contains the literal `@tailwind` directives
and one `@apply` rule; the browser CDN supplies the actual utility and
Preflight rules at runtime.

This is why the application is styled in a connected browser, while a
production build still carries a runtime CDN dependency. The CDN warning is a
browser console warning, not a Vite build warning.

The audit recommended Tailwind 3.4.x with the existing PostCSS directive
model and a local content scan. The controlled implementation below adopts
that recommendation; Tailwind 4's Vite integration was not used because it
would change the directive and configuration model at the same time as
removing the CDN.

## 2. Historical CDN architecture (before implementation)

`index.html` contains:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

at line 14. It also links `/index.css` and then `/responsive-polish.css`.
The import map and Google Fonts `@import` are independent of Tailwind and
must remain untouched by a future migration. The PWA metadata, including
`viewport-fit=cover`, is also independent and remains unchanged.

`index.css` begins with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

and contains ordinary CSS, `@layer` blocks, the safe-area contracts, and the
project's scoped migration rules. `package.json` has no direct `tailwindcss`,
`postcss`, or `autoprefixer` dependency. `postcss` exists only transitively
in the lockfile; `node_modules/tailwindcss` and `node_modules/autoprefixer`
are absent. `vite.config.ts` has the React plugin but no Tailwind plugin or
PostCSS configuration.

### Development

Vite serves the source stylesheet and React modules. The CDN script executes
in the browser, scans the rendered class attributes, and injects generated
utility/Preflight CSS. The custom rules in `index.css` and
`responsive-polish.css` are served by Vite as ordinary CSS.

### Production build

Vite emits `/assets/index-5gGprLo-.css`, but without a local Tailwind processor
it preserves the three `@tailwind` at-rules and the `@apply` token. Vite does
not generate the utility classes. The built `index.html` still references the
CDN, so the final browser behavior remains CDN-dependent.

### Runtime browser

With network access to `https://cdn.tailwindcss.com`, the runtime CDN supplies
the utility classes used by the 59-game application. If the CDN is blocked,
slow, or unavailable, the custom CSS still loads but most Tailwind utility
layout, color, spacing, responsive, and state rules do not. This is a
production reliability and offline/PWA risk.

## 3. Historical warning evidence

`npm run build` completed successfully with Vite 6.4.2 and did not emit a
Tailwind warning. It only reports bundle information; Vite does not inspect
the external script's purpose.

The exact warning text emitted by the fetched CDN script is:

```text
cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation
```

Origin: the `console.warn` in the runtime script referenced by
`index.html:14`. Classification: **RUNTIME CONSOLE WARNING**, not
BUILD-TIME WARNING. The local development page loaded normally in the browser;
the warning source was confirmed from the current CDN response. The browser
automation surface did not expose a DevTools console transcript, so no
real-device console claim is made.

The official Tailwind documentation describes Play CDN as development-only;
the v3 PostCSS guide documents the existing `@tailwind` directive flow:
[Play CDN](https://tailwindcss.com/docs/installation/play-cdn) and
[Tailwind v3 PostCSS installation](https://v3.tailwindcss.com/docs/installation/using-postcss).

## 4. Audit baseline CSS output

The current production command was:

```text
> ...@0.0.0 build
> vite build

vite v6.4.2 building for production...
transforming...
✓ 2190 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                     1.70 kB │ gzip:  0.82 kB
dist/assets/index-5gGprLo-.css                     60.99 kB │ gzip:  8.63 kB
...
✓ built in 12.13s
```

The emitted CSS file is `dist/assets/index-5gGprLo-.css`, 60.99 kB raw and
8.63 kB gzip.

Direct inspection of that file found:

| Sample | In emitted local CSS? | Finding |
| --- | --- | --- |
| `flex` utility | No | No `.flex` utility rule; the CDN supplies it. |
| `grid` utility | No | `.grid` text occurs only inside project-specific selectors, not as the utility rule. |
| `bg-emerald-500` | No | Runtime CDN utility. |
| `min-h-[100dvh]` | No | Runtime CDN arbitrary utility. |
| `landscape:*` | No | Runtime CDN responsive variant. |
| `max-[...]:*` | No | Runtime CDN arbitrary responsive variant. |
| `@tailwind` | Yes | All three literal directives remain. |
| `@apply` | Yes | The body `@apply antialiased text-gray-900` remains literal. |

Therefore the sampled utility styling comes from **B, runtime Tailwind CDN**,
not **A, local build CSS**. The emitted CSS size is not a complete measure of
the current styling payload because the CDN-generated stylesheet is fetched
and generated only in the browser.

## 5. Class usage inventory

The source scan covered `App.tsx`, all `components/**/*.tsx`,
`components/game-ui/**/*.tsx`, `data/**/*.ts`, and `services/**/*.ts`.

| Category | Finding |
| --- | --- |
| A. Static literals | The dominant pattern: ordinary `className="..."` strings throughout App, shared UI, and game components. |
| B. Static template strings | Common and safe when each branch contains complete class literals. A scan found 307 `className` expressions using JSX interpolation/template composition and 269 template-literal `className` sites. |
| C. Dynamic generated names | No true `bg-${...}`, `text-${...}`, `border-${...}`, `grid-cols-${...}`, `w-${...}`, or `h-${...}` construction was found. |
| D. Arbitrary/variant usage | Extensive and intentional: `landscape:`, `sm:`, `md:`, `lg:`, `portrait:`, `max-[767px]:landscape:`, `min-[768px]:`, arbitrary dimensions/colors, selector variants such as `[&>svg]`, and `data-*`-scoped CSS. |
| E. Data/config classes | Complete class literals occur in local config/data maps, including App's category/theme presentation, `services/geminiService.ts` color codes, `services/mastermind.ts` color arrays, and component-local size/color maps. |

The scan found approximately 114 distinct `landscape:` tokens and 612
distinct `sm:` tokens across the source set. These are counts from a lexical
inventory, not a claim that every token is emitted once or used at runtime.

Classes in category/config maps are not a reason to safelist the entire
Tailwind framework: they remain complete literals in files included by the
future content globs. The future scanner must include `App.tsx`, all game
components, `components/game-ui`, `data`, and `services` so these literals are
visible.

## 6. Dynamic-class audit

No true generated utility-name pattern was found. The apparent dynamic cases
are complete class choices, not concatenated utility names:

| File/pattern | Actual behavior | Future action |
| --- | --- | --- |
| `App.tsx`: `${theme.bg}`, `${theme.titleColor}`, `${cat.color}` | Values come from local objects containing complete class literals such as `bg-indigo-50` and `text-emerald-700`. | No change; include `App.tsx` in content scanning. |
| `GobbletGame.tsx`: `${sizeClasses[p.size]}` and `${colorClass}` | `sizeClasses` and `colorClass` resolve to complete literal strings. | No change; include the component. |
| `MancalaGame.tsx`: `${colorClass}` | Branches assign complete background/border literals. | No change; include the component. |
| `QwirkleGame.tsx`, `RummikubGame.tsx`, `SevensGame.tsx`, `MahjongMeldsGame.tsx` | Local size/color/glow maps contain complete literals. | No change; include the components. |
| `DotsAndBoxesGame.tsx` and `SudokuGame.tsx` | Conditional branches select complete classes; CSS grid repeat counts are inline styles, not Tailwind class generation. | No change. |
| `services/geminiService.ts`, `services/mastermind.ts` | Data contains complete `text-*`/`bg-*` class literals. | Include `services/**/*.ts` in content globs. |

No conversion to explicit mappings or safelist is required by the current
source audit. This must be rechecked after a local build because a missing
class would be immediately user-visible.

## 7. Responsive contract

The source uses both Tailwind responsive variants and scoped CSS media
queries. The important phone-landscape behavior is correctly expressed in
scoped CSS as:

```css
@media (orientation: landscape) and (max-height: 480px) { ... }
```

This is not a width-only contract. The implemented local Tailwind
configuration preserves the existing `sm`, `md`, `lg`, `portrait`,
`landscape`, and arbitrary `max-*`/`min-*` variants. Tailwind 3.4.x supports
this existing utility syntax with the least semantic change.

The target review set remains 640×360, 844×390, 932×430, and portrait
390×844. The migration must validate those targets rather than assuming that
`sm` width implies adequate phone-landscape height.

## 8. Version and integration decision

### Recommended version

Use **Tailwind `3.4.17`** for the local build. This best matches the existing
`@tailwind base/components/utilities` directives, JIT content scanning,
arbitrary values, variants, and current CDN-era syntax.

Tailwind 4 is not the safest first step here. Its official Vite integration
uses `@tailwindcss/vite` and its CSS-first setup uses a different entry model;
moving to it would combine CDN removal, directive changes, configuration
changes, Preflight changes, and a large 59-game visual regression surface.
The current official Vite guidance is useful for a later deliberate upgrade,
but it is not the smallest semantic migration for this repository:
[Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite).

### Recommended integration

The implementation uses **Tailwind 3 + PostCSS**, not `manualChunks`-style
build customization and not the Tailwind 4 Vite plugin. The implemented files
are:

```text
package.json          add devDependencies
package-lock.json     lock the additions
tailwind.config.cjs   content globs and any existing theme extensions
postcss.config.cjs    tailwindcss + autoprefixer plugins
index.css             keep directives and existing scoped CSS
index.html            remove only the Tailwind CDN script
```

The package additions are `tailwindcss@3.4.17`, `postcss`, and
`autoprefixer` as dev dependencies. `vite.config.ts` should not need a change
because Vite discovers `postcss.config.cjs` automatically. No PWA file,
viewport metadata, import map, or Google Fonts markup needs to change.

## 9. CSS order and Preflight

`index.html` links `index.css` before `responsive-polish.css`. That order must
remain unchanged. The local PostCSS build emits Tailwind
base/components/utilities into `index.css`; the project-specific rules remain
in that file,
and `responsive-polish.css` remains last so the reviewer-driven Breathing,
MainMenu, Starry, and Ambient refinements retain their winning source order.

The historical CDN runtime supplied the effective Tailwind utility layer and
Tailwind-like Preflight. The local build now makes Preflight explicit. This
can affect:

- `html` and `body` default margins and text rendering;
- `button` and form-control font/inheritance/reset behavior;
- `canvas` display/alignment behavior;
- `input[type=range]` appearance and sizing;
- default borders, background, and focus behavior.

Preflight remains enabled. The implementation preserves it; representative
visual validation and narrowly scoped compatibility rules remain the path if
a real regression is found. The main risk is not the
Tailwind utility syntax; it is a CDN-vs-local reset/cascade difference across
59 already accepted games.

## 10. Risk assessment

Overall pre-implementation risk assessment: **MEDIUM-HIGH**. The code syntax is largely
compatible, but the current runtime generator is external and the accepted
visual surface is broad.

| Risk | User-observable symptom | Mitigation |
| --- | --- | --- |
| Content scanner misses a class | Cards lose color/spacing, grids stack, or controls lose responsive sizing. | Scan all `App.tsx`, `components`, `data`, and `services`; build and inspect representative games. |
| Preflight mismatch | Buttons, range sliders, inputs, or canvas alignment look different. | Keep local v3 Preflight; compare MainMenu, form-heavy games, canvas games, and audio controls. |
| Cascade/order mismatch | Reviewer polish or game-specific CSS no longer wins; safe-area or compact-landscape geometry shifts. | Keep `responsive-polish.css` after `index.css`; inspect `@layer` output and computed styles. |
| CDN version vs local 3.4.x difference | Opacity, arbitrary values, variants, or responsive behavior differs subtly. | Pin `~3.4.17`, generate a production build, and do visual QA at all target viewports. |
| Runtime CDN dependency disappears | Offline/blocked CDN currently leaves most utility styling missing; this should improve after migration but exposes any unscanned class. | Treat offline/PWA smoke as a required acceptance case. |
| CSS payload interpretation | A smaller local CSS file could be mistaken for a complete optimization while missing classes. | Validate visual behavior, not only raw/gzip size. |

The considered technical options had these risk levels:

| Option | Risk | Assessment |
| --- | --- | --- |
| Tailwind 3.4.x + PostCSS | MEDIUM | Smallest semantic change; still requires broad visual validation. |
| Tailwind 4 + Vite plugin | HIGH | New directive/config/reset model and larger regression surface. |
| Keep CDN and add a local partial stylesheet | HIGH | Two competing generators can create precedence and drift problems. |
| Manual safelist for all utilities | MEDIUM-HIGH | Brittle and unnecessary while current classes are source-visible literals. |

## 11. Historical temporary experiment

No temporary dependency/config experiment was performed. It would require
installing and then removing build dependencies and config files. The
controlled implementation subsequently installed the dependencies in the
working tree and validated the local build before committing.

## 12. Completed implementation batch

1. Add pinned Tailwind 3.4.x, PostCSS, and Autoprefixer dev dependencies.
2. Add `tailwind.config.cjs` with content globs for `App.tsx`,
   `components/**/*.{ts,tsx}`, `data/**/*.{ts,tsx}`, and
   `services/**/*.{ts,tsx}`.
3. Add `postcss.config.cjs` with Tailwind and Autoprefixer.
4. Keep the existing `index.css` directives and custom scoped rules.
5. Build and inspect generated CSS for representative utilities, arbitrary
   values, variants, and all custom migration contracts.
6. Remove only `<script src="https://cdn.tailwindcss.com"></script>` from
   `index.html`; leave import map, fonts, PWA metadata, and viewport strategy
   unchanged.
7. Run TypeScript, full tests, production build, CSS-content checks, and
   browser QA for MainMenu, one game from each layout family, Blackjack,
   Roulette, Breathing, StarryRipple, and AmbientSound or Mandala.
8. Run real-device Home Screen QA for safe-area, landscape, typography,
   controls, canvas, audio, and representative game states.

Rollback condition: if any accepted representative game shows a real visual,
safe-area, interaction, or responsive regression, restore the CDN-based
stylesheet path and investigate the specific missing utility, Preflight, or
cascade difference before retrying. Do not change the PWA cold-start issue as
part of this batch.

## 13. Acceptance criteria for the implementation gate

1. No Tailwind CDN script remains in production HTML.
2. The exact CDN runtime warning is absent from the browser console.
3. Utilities are generated at build time and the built CSS contains sampled
   utilities including layout, colors, `100dvh`, responsive, and arbitrary
   variants.
4. `responsive-polish.css` remains after the generated main CSS and its
   refinements still win where intended.
5. MainMenu and representative games are visually unchanged at 640×360,
   844×390, 932×430, 390×844, and 1280×720.
6. All 59 GameState mappings and lazy-loaded game boundaries remain untouched.
7. TypeScript remains at 0 errors and the full test suite remains passing.
8. Production build passes without the CDN warning and lazy loading remains
   intact.
9. No PWA viewport or standalone metadata changes are made.
10. Offline/reload smoke confirms styles do not depend on an external CDN.

## 14. Audit baseline

The audit baseline was the CDN-backed build: CSS 60.99 kB raw / 8.63 kB gzip,
with the runtime CDN warning and unresolved `@tailwind`/`@apply` directives in
the emitted stylesheet. The audit itself made no production changes. The
controlled implementation below records the subsequently approved local
Tailwind migration.

## 15. Local Tailwind 3.4.17 implementation results

At the implementation checkpoint, the migration was pending reviewer
real-device acceptance; the final status is recorded below.

| Item | Result |
| --- | --- |
| Local Tailwind | `tailwindcss@3.4.17` exact version |
| Build integration | PostCSS with `tailwindcss` and `autoprefixer` |
| CDN script | Removed from `index.html`; no production runtime reference remains |
| Content scan | `index.html`, `index.tsx`, `App.tsx`, and production `components`, `data`, `services`, `utils` trees |
| Preflight | Enabled by default, matching the prior CDN normalization contract |
| CSS before | 60.99 kB raw / 8.63 kB gzip |
| CSS after | 184.86 kB raw / 27.51 kB gzip |
| JS entry after | 244.75 kB raw / 76.83 kB gzip |
| CDN warning | Resolved: the script that emitted it is absent |
| `>500 kB` warning | Remains resolved |
| Lazy loading | 59 dynamic game imports preserved; App has no static game implementation imports |

The larger generated CSS is expected: the local build now emits the utility
and Preflight rules that were previously generated at runtime. This is a
correctness and CDN-independence migration, not a CSS-minification pass.

### Built CSS verification

The production stylesheet is `dist/assets/index-DFsiemiF.css` for the
verification build. It contains compiled representatives for `.flex`,
`.grid`, `.bg-emerald-500`, arbitrary `100dvh` utilities, landscape variants,
and height/orientation media rules. Raw `@tailwind base`, `@tailwind
components`, `@tailwind utilities`, and `@apply` directives are absent from
the emitted CSS.

The HTML link order remains `index.css` followed by
`responsive-polish.css`, so reviewer-specific polish continues to win in the
cascade. `viewport-fit=cover`, the manifest link, Apple metadata, Google
Fonts, and the import map were not changed.

### Dynamic utility audit

The post-migration source audit found zero true dynamically generated Tailwind
utility names. Existing conditional class expressions contain complete static
class literals, so no safelist was added. No game component or accepted layout
was changed.

### Validation and evidence

- Focused Tailwind acceptance: 1 file / 3 tests passed.
- Production build after the migration: PASS; no `>500 kB` chunk warning.
- TypeScript remains `0 errors`.
- Browser QA could not be completed in the in-app browser because the local
  Vite server is not reachable from that isolated browser surface; no runtime
  visual result is claimed here. Real-device QA remains pending.
- The npm install audit reported 2 existing dependency advisories (1 low, 1
  high); dependency remediation is outside this migration.

The iOS Home Screen Web App cold-start bottom blank strip remains deferred.
This migration does not change PWA infrastructure or viewport strategy.

## Final reviewer closeout

The local Tailwind migration subsequently passed representative iPhone
real-device review and is `REAL-DEVICE ACCEPTED`. Gomoku was the only observed
visual regression: the first clipping correction flattened its square board
and was rejected; the second safe-area-aware, width-driven square correction
was accepted. No remaining Tailwind visual regression is known. The CDN
production warning remains resolved, and the existing PWA cold-start viewport
work is documented separately from this Tailwind migration.
