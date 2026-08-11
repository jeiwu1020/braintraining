// Auto-extracted from Kogo's Joseki Dictionary (public-domain corner-joseki SGF collection,
// billyellow/Kogo-s-Joseki-Dictionary on GitHub, itself a compilation of 石田芳夫's joseki reference).
// Only the "main line" / explicitly recommended branches were kept, limited to the first ~8-9
// lines/columns from a corner, to keep this a small, local opening reference rather than a full
// professional-strength book.
//
// Coordinate system: every entry is expressed relative to ONE corner, as if it were the
// top-right corner of the board:
//   top   = distance (in lines) from the top edge (0 = first line)
//   right = distance (in lines) from the right edge (0 = first line)
// `role` is relative, not an absolute color: 'F' = whichever color played first in that corner,
// 'S' = the other color. This lets the same table be reused for any of the 4 board corners and
// for either color, by transforming real board coordinates into this local frame at runtime.

export type JosekiRole = 'F' | 'S';

export interface JosekiPoint {
  role: JosekiRole;
  top: number;
  right: number;
}

export interface JosekiEntry {
  // The exact set of stones (in local corner coordinates) that must already be on the board
  // for this entry to apply.
  prefix: JosekiPoint[];
  // The suggested next move once `prefix` matches exactly.
  next: JosekiPoint;
}

export const JOSEKI_BOOK: JosekiEntry[] = [
  // --- Modern & Classic San-san (3-3) Invasion into Star Point (星位點三三全套定式與做活) ---
  { prefix: [{ role: 'F', top: 3, right: 3 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 2, right: 2 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 2, right: 2 }], next: { role: 'F', top: 2, right: 3 } }, // Symmetric block
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 2, right: 2 }], next: { role: 'S', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }], next: { role: 'F', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }], next: { role: 'S', top: 1, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }], next: { role: 'F', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 1, right: 4 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }], next: { role: 'S', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 1, right: 4 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 3, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 1, right: 4 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'S', top: 1, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 1, right: 4 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 1, right: 2 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 1, right: 1 } },

  // --- Symmetric 3-3 Block at 3-4 F(2,3) ---
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'S', top: 2, right: 2 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 1 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 1 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 1 } },

  // --- Star Point Low Knight Approach (星位小飛掛角: S(5,2) / S(2,5)) ---
  { prefix: [{ role: 'F', top: 3, right: 3 }], next: { role: 'S', top: 5, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }], next: { role: 'S', top: 2, right: 5 } },
  // Modern Knight's Response F(3,5)
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 2, right: 5 }], next: { role: 'F', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 2 } }, // 3-3 invasion reply
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 7 } }, // 2-space base extension
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 2, right: 4 } },

  // Attachment Response F(4,2) (星位頂切與做活)
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 2, right: 2 } },

  // One-Space High Pincer F(5,4)
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 5, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 5, right: 4 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 5, right: 4 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 3, right: 2 } },

  // --- Star Point High Approach (星位高掛 S(5,3)) ---
  { prefix: [{ role: 'F', top: 3, right: 3 }], next: { role: 'S', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 2, right: 3 } }, // Underneath attachment
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 2, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 3, right: 2 } },

  // --- Komoku (3-4) Low Approach & Attachment (小目一間低掛與定式) ---
  { prefix: [{ role: 'F', top: 2, right: 3 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }], next: { role: 'S', top: 2, right: 4 } },

  // Contact Attachment & Making Life (托角做活: F(2,2))
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 1, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'S', top: 1, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 1, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 1, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 1, right: 2 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 1, right: 2 }, { role: 'S', top: 1, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 1 } },

  // Knight's response F(2,4)
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 6 } },

  // One-space high pincer F(4,3)
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 1, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 1, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 1, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 1, right: 2 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 1 } },

  // --- Komoku High Approach (小目高掛 S(4,3)) ---
  { prefix: [{ role: 'F', top: 2, right: 3 }], next: { role: 'S', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 3, right: 2 } },

  // --- San-san (3-3 Corner Opening) ---
  { prefix: [{ role: 'F', top: 2, right: 2 }], next: { role: 'S', top: 3, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'S', top: 3, right: 3 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }], next: { role: 'S', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 3, right: 6 } }
];

