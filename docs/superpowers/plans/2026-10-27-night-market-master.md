# Night Market Master Implementation Plan
Goal: Add the approved independent six-food, twelve-order Master ruleset; two rounds of eight picks per team.
Architecture: Preserve all legacy engines, saved journals, AI, and CSS. Add a separate Master engine, strict v1 Master journal/replay, AI, React screen, and scoped stylesheet; a thin NightMarket entry chooses legacy or Master without migrating legacy data.
Tech: Existing React 19, TypeScript, Vite, Vitest. No new production dependency.
Spec: Approved user design in parent task; 24 cards (6 x 4), 4 market slots, 3 of 12 orders, only 33 actions.
Global constraints: No Codex invocation; no branch ref/deploy from this worker; generated raster art required, old art unchanged; old exact game seed/replay behavior unchanged.
Review focus: old unfinished sessions, repeated confirmation, corrupted/unknown journals, AI stale messages, short landscape viewport and final summary.

- [ ] Task 1: Retrieve pinned source and art references. Save original source manifest. Generate three new matched-style dishes and save each raw image immediately to Library with provenance.
- [ ] Task 2: Write failing Master rule/journal/AI tests, run RED, implement isolated modules, run GREEN. Pin 24-card conservation, 951 hands, all twelve order boundaries, 29/26 example, public-only AI, and 33-action replay.
- [ ] Task 3: Write failing interaction tests, run RED, implement independent Master screen plus thin entry navigation, scoped CSS, and explicit last-pick/summary flow. Preserve old imports/behavior and journals. Verify reload/undo/cancel, stale double clicks, and AI reveal.
- [ ] Task 4: Integrate generated assets, save incremental source checkpoint before extended checks. Run full legacy/new suite, typecheck, build, and viewport QA through available supported browser. Report blocked stages honestly.
- [ ] Task 5: Prepare focused diff/manifest and durable Library backup for root review; root alone handles publication.

Rulings: Source-only isolated materialization instead of git worktree because current workspace has no repository checkout and GitHub connector is the authorized private source route. No product code changes before the corresponding RED tests. Parent-specified native execution and user delegation waive further design/plan questions. No public assets are deleted or modified in remote; manifest carries only additive/changed files.
