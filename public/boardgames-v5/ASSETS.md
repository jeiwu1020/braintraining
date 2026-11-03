# V2 art provenance (2026-11-03)
Existing user project reference: jeiwu1020/braintraining public/playground/box-night-market.webp and components/playground/playground.css + NightMarket.tsx. Reference inspected as style source only; reference illustration is not redistributed in this Site. Style: warm hand-inked tabletop / Taiwanese market, cream paper, honey wood, jade felt, dark outlines and tactile shadows.

New image assets generated using built-in image_gen (not paid fal or external image marketplace):
- dist/assets/tabletop-atlas-v2.png — 2x2 original illustrated scene atlas: carved sowing bowls/golden beans; ceramic lost-property counter; animal-token bench; wooden strategy board and move cards. Displayed as decorative selection cards only; illustrated counts are not live game state.
- dist/assets/animal-tokens-v2.png — transparent 4x2 sprite sheet of rabbit, fox, cat, bear / panda, dog, deer, owl on carved floral wooden pedestals. Used as actual game tokens; names/seat numbers remain DOM, SVG fallback retained.

Prompt set:
1. "Use case stylized-concept; one game-selection atlas four equal quadrants; warm hand-inked Taiwanese tabletop game illustrations, dark brown contours, honey wood grain, cream paper, forest green felt, amber lantern illumination. Top-left carved bowls and golden beans, top-right ceramic cups/pots/bowls on evidence cards, bottom-left eight carved animal tokens on bench, bottom-right wooden chess-like board and paper move cards. No text, letters, numbers, logos or watermark. Rich painterly material detail; actual game text is DOM."
2. "Single transparent sprite atlas, four columns two rows; rabbit fox cat brown bear / panda floppy-eared dog deer owl. Each whole token centered in equal square cell with transparent space; warm illustrated hand-carved honey wood, dark hand-inked outlines, floral pedestal and jade accents, consistent gentle three-quarter view. Not plastic, plush or flat vector. No text, letters, numbers or logo."

All remaining boards, bowls, beans, ceramics, move diagrams and controls are original code-native CSS/SVG. Rules, scores and clue attributes are always explicit DOM text and deterministic state, never inferred from generated decorative art. No third-party image/music license dependencies added.

## V3 actual bowl artwork
- `dist/assets/carved-bowl-v3.png`: generated with built-in image_gen, 2026-11-03, RGBA 1536×1024. Original isolated empty honey-wood bowl, wide shallow oval, high three-quarter view, hand-inked dark contours, wood grain, restrained floral engraving on front rim. No text, numbers or beans. Used on actual playable bowls, not only selection covers. DOM overlays supply every bean, count and label. CSS fallback remains until image loads. No paid image service used.
- V3 typography/nameplates/counters/felt/frames are original CSS; existing original night-market illustration was reference only, not redistributed.

## V4 actual pieces and hierarchy
- `dist/assets/carved-disc-v4.png`: generated with built-in image_gen 2026-11-03. Transparent isolated round thick honey-wood disc, floral carved narrow rim, large blank cream center. Used on actual Borrow pieces with separate DOM 将/衛 and team badge, never generated lettering. Source original retained in workspace generated_images. No paid fal or external marketplace.
- Existing NightMarket.tsx/main and playground.css/main inspected directly via GitHub; live Night Market rendered in separate reference tab. Borrow follows dominant framed board + right paper actions; Lost follows original wood-backed illustrated food cards with ivory number/name labels; Animals uses real wooden bench and retained generated animal tokens; Bean retains accepted bowl/flight and shares new action hierarchy.
- Lost ceramic SVG remains deterministic code-native: its shape, glaze, dots/stripes and handle are clues. Generated pictures could contradict attributes; preserve accurate live illustrations instead. All labels and diagrams remain readable DOM/code.
