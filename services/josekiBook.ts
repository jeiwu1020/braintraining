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
  { prefix: [{ role: 'F', top: 2, right: 2 }], next: { role: 'S', top: 3, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'S', top: 3, right: 3 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }], next: { role: 'S', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 3, right: 6 } },
  { prefix: [{ role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 3, right: 6 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 5, right: 1 } },
  { prefix: [{ role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 1, right: 4 }, { role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 8, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 3, right: 5 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 5, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 3, right: 5 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 6 }], next: { role: 'F', top: 2, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 6 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 3, right: 5 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 6 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 5, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 3, right: 5 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 5, right: 6 }], next: { role: 'S', top: 2, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 5, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }, { role: 'S', top: 5, right: 4 }], next: { role: 'F', top: 2, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'S', top: 2, right: 7 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 4 }, { role: 'S', top: 2, right: 7 }], next: { role: 'F', top: 5, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }], next: { role: 'S', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'S', top: 3, right: 6 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 2, right: 4 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'S', top: 2, right: 5 }], next: { role: 'F', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 2, right: 5 }], next: { role: 'S', top: 2, right: 8 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 5 }], next: { role: 'S', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 5 }, { role: 'S', top: 3, right: 5 }], next: { role: 'F', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 5 }, { role: 'S', top: 2, right: 5 }, { role: 'S', top: 3, right: 5 }], next: { role: 'S', top: 4, right: 6 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }], next: { role: 'S', top: 5, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 7 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 8, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 6, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 6, right: 3 }], next: { role: 'F', top: 6, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 1 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 1 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 1, right: 5 } },
  { prefix: [{ role: 'F', top: 1, right: 5 }, { role: 'F', top: 2, right: 5 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 4, right: 1 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'F', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 6, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 6, right: 2 }], next: { role: 'F', top: 5, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 6, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 6, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 5, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 4 }, { role: 'F', top: 6, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 6, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 4 }, { role: 'F', top: 6, right: 3 }, { role: 'F', top: 6, right: 4 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 4 }, { role: 'F', top: 6, right: 3 }, { role: 'F', top: 6, right: 4 }, { role: 'S', top: 2, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 1, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'S', top: 2, right: 6 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 4, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 4, right: 4 }, { role: 'S', top: 2, right: 6 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 4, right: 4 }, { role: 'S', top: 2, right: 6 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 3, right: 7 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 6 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 6 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }], next: { role: 'S', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 8, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 8, right: 2 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 8, right: 2 }], next: { role: 'F', top: 7, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 5 }], next: { role: 'F', top: 3, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 5 }], next: { role: 'F', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 1 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 5 }], next: { role: 'F', top: 3, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 4, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 4 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 2 }, { role: 'F', top: 3, right: 3 }, { role: 'F', top: 3, right: 5 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 4 }], next: { role: 'S', top: 8, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 4, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 4 }], next: { role: 'S', top: 6, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 3 }, { role: 'S', top: 4, right: 4 }, { role: 'S', top: 6, right: 3 }], next: { role: 'S', top: 3, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 3, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 2 }, { role: 'S', top: 4, right: 3 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 2, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'F', top: 2, right: 8 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'S', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 3 }], next: { role: 'S', top: 4, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 8 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 4, right: 5 }, { role: 'S', top: 5, right: 3 }], next: { role: 'F', top: 2, right: 6 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 3 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 8 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'S', top: 4, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'F', top: 4, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'S', top: 5, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'F', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 2, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 1 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 2, right: 5 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }], next: { role: 'S', top: 6, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 6, right: 2 }], next: { role: 'S', top: 3, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 6, right: 2 }], next: { role: 'F', top: 7, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'F', top: 5, right: 3 }, { role: 'F', top: 7, right: 2 }, { role: 'S', top: 3, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 2 }, { role: 'S', top: 6, right: 2 }], next: { role: 'S', top: 6, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 1 }], next: { role: 'S', top: 2, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 4, right: 3 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }, { role: 'S', top: 5, right: 1 }], next: { role: 'F', top: 1, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 5, right: 2 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'S', top: 1, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 5, right: 2 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'F', top: 1, right: 5 } },
  { prefix: [{ role: 'F', top: 1, right: 5 }, { role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'F', top: 5, right: 2 }, { role: 'S', top: 1, right: 4 }, { role: 'S', top: 3, right: 2 }, { role: 'S', top: 4, right: 1 }], next: { role: 'F', top: 7, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'S', top: 2, right: 2 }], next: { role: 'F', top: 4, right: 2 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 2 }], next: { role: 'S', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 3, right: 4 }, { role: 'F', top: 4, right: 2 }, { role: 'S', top: 2, right: 2 }, { role: 'S', top: 2, right: 4 }], next: { role: 'F', top: 3, right: 5 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }], next: { role: 'S', top: 3, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 5 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 5 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 2, right: 1 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 5 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }], next: { role: 'F', top: 2, right: 3 } },
  { prefix: [{ role: 'F', top: 2, right: 2 }, { role: 'F', top: 2, right: 3 }, { role: 'F', top: 2, right: 5 }, { role: 'S', top: 2, right: 1 }, { role: 'S', top: 3, right: 2 }], next: { role: 'S', top: 4, right: 1 } },
  { prefix: [{ role: 'F', top: 3, right: 5 }], next: { role: 'S', top: 3, right: 3 } },
  { prefix: [{ role: 'F', top: 3, right: 5 }, { role: 'S', top: 3, right: 3 }], next: { role: 'F', top: 5, right: 3 } },
  { prefix: [{ role: 'F', top: 4, right: 4 }], next: { role: 'S', top: 2, right: 2 } },
  { prefix: [{ role: 'F', top: 4, right: 4 }, { role: 'S', top: 2, right: 2 }], next: { role: 'F', top: 2, right: 4 } },
  { prefix: [{ role: 'F', top: 2, right: 4 }, { role: 'F', top: 4, right: 4 }, { role: 'S', top: 2, right: 2 }], next: { role: 'S', top: 4, right: 2 } }
];
