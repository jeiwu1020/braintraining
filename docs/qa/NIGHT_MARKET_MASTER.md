# Night Market Master

Approved additive variant: two rounds, eight selections per team per round. Legacy normal/advanced remain on their original engine and 25-action journal. Master has independent ruleset `night-market-master-v1`, independent session key, 24 cards (six foods x four), four market slots, 16 selections and 15 refills per round, 33 actions per complete game. Next-round swaps starter and resets plates/deck. Round two selects a compatible order set disjoint from round one.

Three of twelve orders are active, scored once per team at round end. Shared ingredients can satisfy multiple orders without consumption. The original named three-flavour order still means rice/corn/tofu specifically. The original rice/corn/tofu score formulas are retained. Noodle/chicken/tea score two each. Exact four types can be broken by a fifth type; preview explicitly warns about lost orders.

The new entry is an additional button in the table-game gallery. Legacy NightMarket.tsx and its rules/AI/session/styles are unchanged. New CSS selectors are scoped to .pg-master. Both finished and first-round final cards remain visible until explicit score review; undo cannot cross a round boundary. AI has a public-only observation boundary and deliberate reveal button. Unknown journal versions are preserved until explicit reset of Master only.

Verification evidence is kept by the implementation task: new rule and interaction tests, full legacy suite, typecheck/build, artwork provenance, and browser gate if available. jsdom is not geometric or actual-device verification. Scoring feasibility enumeration is not a claim of game balance or clinical efficacy.

## Browser verification, 2026-10-27

The first preview was tested in the dedicated cloud browser using a same-origin iframe at actual CSS sizes, not injected game fixtures or jsdom measurements. Two complete rounds, final-pick review, order-loss warning, reload without committing a preview, solo deliberate AI reveal/undo, and separate legacy six-card saves were exercised through visible controls. The initial game and final summary fit 844×390, 896×414 and 932×430. All six food images loaded.

The browser gate caught three layout defects before production: solo setup overflow at 844×390, a six-column count label overflowing at 1024×768, and tight controls/art/summary at the optional 844×300 short-height case. The follow-up candidate scopes fixes to Master: compact setup grid, three-column medium-width counts, horizontal mini-art and nonessential repeated-text reduction below 340 CSS pixels. Quantities, base/order totals, every active order and decision buttons stay visible. Its actual geometric recheck is pending; passing unit tests alone does not close that gate. Reset/restart confirmation now accurately describes Master-only clearing and does not promise a legacy unfinished-game history entry.
