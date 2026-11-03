# Four tabletop games integration

Baseline: `018f44ccbcc86eeb8c2f89f07aeb4affa11a9007` (approved Wall Race palette).

The existing seven catalog entries and their gameplay/storage are unchanged. Four additive entries load the V5 games from same-origin static files in `public/boardgames-v5`. Their global CSS is isolated inside an iframe, with an allowlisted game ID, normalized difficulty/mode, local assets, restrictive CSP, and origin/source/channel-checked ready/exit/error messages. No network requests, accounts, external scripts, user data transmission, or leaderboard integration are added.

Only settings and Borrow tutorial completion persist under the `braintraining.playground.four-tables.v1` namespace. Current rounds are deliberately not saved or included in platform statistics; the setup screen discloses this. Exit asks confirmation, results offer replay or return, and failed loads offer retry/return. The outer header disappears during play to avoid double toolbars.

Lost reveals the intersection of actual question answers only after a claim. Manual exclusions do not change this result. No questions means every item remains possible. Actual target and player choice are separate. Borrow starts interactive practice on first use, offers skip/replay, and restores the original round after practice. All four use system sans-serif typography.

Validation: 159 Vitest files, 1181 passing tests plus one pre-existing skip; 73 shipped-module Node tests; TypeScript noEmit; production Vite build. Browser checks covered 1024x720 desktop, 812x375 landscape, and compact 640x360, including complete Borrow tutorial/skip/replay, Lost multiple-question and no-question reveal, result keyboard loop/exit, Bean flying animation and AI response, Animal exchanges, catalog navigation, and original Wall Race move. Physical iOS touch hardware was not available.

Rollback: revert the single integration commit normally, preserving subsequent unrelated work. The original commit is the exact full repository baseline. The accompanying external baseline archive contains 503 of 504 original blobs, all hash-verified, and the full remote tree manifest. The sole unavailable offline blob is unused `assets/relaxing-music.mp3` (SHA `62bc68fe7922946ad0cab2f4823ba983aa29c085`, 3530799 bytes). It remains untouched in the remote base tree. The distinct used `public/relaxing-music.mp3` is present and verified. Do not describe the offline baseline archive as a complete repository clone.
