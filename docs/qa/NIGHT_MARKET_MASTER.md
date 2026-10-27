# Night Market Master

Approved additive variant: two rounds, eight selections per team per round. Legacy normal/advanced remain on their original engine and 25-action journal. Master has independent ruleset `night-market-master-v1`, independent session key, 24 cards (six foods x four), four market slots, 16 selections and 15 refills per round, 33 actions per complete game. Next-round swaps starter and resets plates/deck. Round two selects a compatible order set disjoint from round one.

Three of twelve orders are active, scored once per team at round end. Shared ingredients can satisfy multiple orders without consumption. The original named three-flavour order still means rice/corn/tofu specifically. The original rice/corn/tofu score formulas are retained. Noodle/chicken/tea score two each. Exact four types can be broken by a fifth type; preview explicitly warns about lost orders.

The new entry is an additional button in the table-game gallery. Legacy NightMarket.tsx and its rules/AI/session/styles are unchanged. New CSS selectors are scoped to .pg-master. Both finished and first-round final cards remain visible until explicit score review; undo cannot cross a round boundary. AI has a public-only observation boundary and deliberate reveal button. Unknown journal versions are preserved until explicit reset of Master only.

Verification evidence is kept by the implementation task: new rule and interaction tests, full legacy suite, typecheck/build, artwork provenance, and browser gate if available. jsdom is not geometric or actual-device verification. Scoring feasibility enumeration is not a claim of game balance or clinical efficacy.
