import { JOSEKI_BOOK, JosekiPoint, JosekiRole } from './josekiBook';

export type GoColor = 'BLACK' | 'WHITE' | 'EMPTY';

export interface Point {
  r: number;
  c: number;
}

export type GoBoard = GoColor[][];

export interface MoveResult {
  nextBoard: GoBoard;
  capturedCount: number;
  capturedStones: Point[];
  isLegal: boolean;
  koPoint: Point | null;
  error?: string;
}

// Create an empty board
export function createEmptyBoard(size: number): GoBoard {
  return Array(size).fill(null).map(() => Array(size).fill('EMPTY'));
}

// Clone a board
export function cloneBoard(board: GoBoard): GoBoard {
  return board.map(row => [...row]);
}

// Get adjacent orthogonal points
export function getAdjacentPoints(r: number, c: number, size: number): Point[] {
  const neighbors: Point[] = [];
  if (r > 0) neighbors.push({ r: r - 1, c });
  if (r < size - 1) neighbors.push({ r: r + 1, c });
  if (c > 0) neighbors.push({ r, c: c - 1 });
  if (c < size - 1) neighbors.push({ r, c: c + 1 });
  return neighbors;
}

// Get the connected group of stones and its liberties
export function getGroupAndLiberties(board: GoBoard, r: number, c: number): { stones: Point[]; liberties: Point[] } {
  const size = board.length;
  const color = board[r][c];
  if (color === 'EMPTY') return { stones: [], liberties: [] };

  const visited: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  const stones: Point[] = [];
  const libertiesSet = new Set<string>();
  const liberties: Point[] = [];

  const queue: Point[] = [{ r, c }];
  visited[r][c] = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    stones.push(curr);

    const neighbors = getAdjacentPoints(curr.r, curr.c, size);
    for (const n of neighbors) {
      if (board[n.r][n.c] === 'EMPTY') {
        const key = `${n.r},${n.c}`;
        if (!libertiesSet.has(key)) {
          libertiesSet.add(key);
          liberties.push(n);
        }
      } else if (board[n.r][n.c] === color && !visited[n.r][n.c]) {
        visited[n.r][n.c] = true;
        queue.push(n);
      }
    }
  }

  return { stones, liberties };
}

/** Removes one connected group during the players' final dead-stone review. */
export function removeGoGroup(
  board: GoBoard,
  r: number,
  c: number
): { board: GoBoard; removedColor: GoColor; removedCount: number } {
  const removedColor = board[r]?.[c] ?? 'EMPTY';
  if (removedColor === 'EMPTY') return { board, removedColor, removedCount: 0 };

  const nextBoard = cloneBoard(board);
  const group = getGroupAndLiberties(board, r, c);
  for (const stone of group.stones) nextBoard[stone.r][stone.c] = 'EMPTY';
  return { board: nextBoard, removedColor, removedCount: group.stones.length };
}

// Execute a move on the board
export function playGoMove(
  board: GoBoard,
  r: number,
  c: number,
  color: 'BLACK' | 'WHITE',
  koPoint: Point | null = null
): MoveResult {
  const size = board.length;

  // Check bounds and empty
  if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== 'EMPTY') {
    return {
      nextBoard: board,
      capturedCount: 0,
      capturedStones: [],
      isLegal: false,
      koPoint,
      error: '此位置已有棋子或超出棋盤'
    };
  }

  // Check Ko
  if (koPoint && koPoint.r === r && koPoint.c === c) {
    return {
      nextBoard: board,
      capturedCount: 0,
      capturedStones: [],
      isLegal: false,
      koPoint,
      error: '打劫禁著點：同形不能立即回提，請先尋劫！'
    };
  }

  const opponentColor: GoColor = color === 'BLACK' ? 'WHITE' : 'BLACK';
  const newBoard = cloneBoard(board);
  newBoard[r][c] = color;

  // Check captures of opponent's adjacent groups
  const neighbors = getAdjacentPoints(r, c, size);
  const capturedStones: Point[] = [];
  const checkedOpponents = new Set<string>();

  for (const n of neighbors) {
    if (newBoard[n.r][n.c] === opponentColor) {
      const oppKey = `${n.r},${n.c}`;
      if (!checkedOpponents.has(oppKey)) {
        const oppGroup = getGroupAndLiberties(newBoard, n.r, n.c);
        oppGroup.stones.forEach(s => checkedOpponents.add(`${s.r},${s.c}`));

        if (oppGroup.liberties.length === 0) {
          // Captured!
          for (const stone of oppGroup.stones) {
            newBoard[stone.r][stone.c] = 'EMPTY';
            capturedStones.push(stone);
          }
        }
      }
    }
  }

  // Check if own group has liberties now
  const ownGroup = getGroupAndLiberties(newBoard, r, c);
  if (ownGroup.liberties.length === 0) {
    // Suicide move (illegal)
    return {
      nextBoard: board,
      capturedCount: 0,
      capturedStones: [],
      isLegal: false,
      koPoint,
      error: '禁止自殺手：落子後無氣且未能提吃對方棋子'
    };
  }

  // Check if this move creates a Ko situation
  // Ko occurs if:
  // 1. Exactly 1 stone was captured
  // 2. The played stone is by itself (ownGroup size == 1)
  // 3. The played stone now only has 1 liberty (the spot of captured stone)
  let nextKoPoint: Point | null = null;
  if (capturedStones.length === 1 && ownGroup.stones.length === 1 && ownGroup.liberties.length === 1) {
    nextKoPoint = capturedStones[0];
  }

  return {
    nextBoard: newBoard,
    capturedCount: capturedStones.length,
    capturedStones,
    isLegal: true,
    koPoint: nextKoPoint
  };
}

// Find groups in Atari (only 1 liberty left)
export function findGroupsInAtari(board: GoBoard, color: 'BLACK' | 'WHITE'): { stones: Point[]; liberty: Point }[] {
  const size = board.length;
  const visited = new Set<string>();
  const atariGroups: { stones: Point[]; liberty: Point }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === color) {
        const key = `${r},${c}`;
        if (!visited.has(key)) {
          const group = getGroupAndLiberties(board, r, c);
          group.stones.forEach(s => visited.add(`${s.r},${s.c}`));
          if (group.liberties.length === 1) {
            atariGroups.push({ stones: group.stones, liberty: group.liberties[0] });
          }
        }
      }
    }
  }

  return atariGroups;
}

// ---------------------------------------------------------------------------
// Life & Death helpers (simplified real-eye detection)
// ---------------------------------------------------------------------------

// A point is a "real eye" for `color` if every orthogonal neighbor is that
// color, and at most 1 diagonal neighbor (0 on edges/corners) belongs to the
// opponent. This is the standard simplified false-eye test.
function isRealEye(board: GoBoard, r: number, c: number, color: 'BLACK' | 'WHITE'): boolean {
  const size = board.length;
  if (board[r][c] !== 'EMPTY') return false;

  const neighbors = getAdjacentPoints(r, c, size);
  for (const n of neighbors) {
    if (board[n.r][n.c] !== color) return false;
  }

  const diagonals: Point[] = [];
  if (r > 0 && c > 0) diagonals.push({ r: r - 1, c: c - 1 });
  if (r > 0 && c < size - 1) diagonals.push({ r: r - 1, c: c + 1 });
  if (r < size - 1 && c > 0) diagonals.push({ r: r + 1, c: c - 1 });
  if (r < size - 1 && c < size - 1) diagonals.push({ r: r + 1, c: c + 1 });

  const opponent: GoColor = color === 'BLACK' ? 'WHITE' : 'BLACK';
  let oppDiagonals = 0;
  for (const d of diagonals) {
    if (board[d.r][d.c] === opponent) oppDiagonals++;
  }

  const isEdgeOrCorner = diagonals.length < 4;
  const allowedOppDiagonals = isEdgeOrCorner ? 0 : 1;
  return oppDiagonals <= allowedOppDiagonals;
}

function countRealEyes(board: GoBoard, groupStones: Point[], color: 'BLACK' | 'WHITE'): number {
  const size = board.length;
  const candidateEyes = new Set<string>();
  for (const s of groupStones) {
    for (const n of getAdjacentPoints(s.r, s.c, size)) {
      if (board[n.r][n.c] === 'EMPTY') candidateEyes.add(`${n.r},${n.c}`);
    }
  }
  let eyes = 0;
  for (const key of candidateEyes) {
    const [r, c] = key.split(',').map(Number);
    if (isRealEye(board, r, c, color)) eyes++;
  }
  return eyes;
}

// Simplified life check: a group is considered "alive" once it has two real eyes.
export function isGroupAlive(board: GoBoard, r: number, c: number): boolean {
  const color = board[r][c];
  if (color === 'EMPTY') return false;
  const group = getGroupAndLiberties(board, r, c);
  return countRealEyes(board, group.stones, color) >= 2;
}

// ---------------------------------------------------------------------------
// Ladder reading
// ---------------------------------------------------------------------------
// Simulates a "chase": `anchorR/anchorC` belongs to a group whose liberties
// are already reduced to <=2. Alternates: if the group has exactly 1 liberty
// it's the defender's turn to try to extend; if it has exactly 2 liberties
// it's the chaser's turn to find a move that re-ataris it. Returns true if
// the group ends up fully captured (the ladder works), false if it escapes
// (gains 3+ liberties, or the chaser has no forcing move left).
function simulateLadderChase(
  board: GoBoard,
  anchorR: number,
  anchorC: number,
  chaserColor: 'BLACK' | 'WHITE',
  defenderColor: 'BLACK' | 'WHITE',
  stepsLeft: number
): boolean {
  if (stepsLeft <= 0) return false;

  const group = getGroupAndLiberties(board, anchorR, anchorC);
  if (group.stones.length === 0) return true;
  if (group.liberties.length === 0) return true;
  if (group.liberties.length >= 3) return false;

  if (group.liberties.length === 1) {
    // Defender's turn: only escape is to extend into the last liberty.
    const pt = group.liberties[0];
    const res = playGoMove(board, pt.r, pt.c, defenderColor);
    if (!res.isLegal) return true;
    const newGroup = getGroupAndLiberties(res.nextBoard, pt.r, pt.c);
    if (newGroup.liberties.length <= 1) return true; // ran into the wall, still in atari
    if (newGroup.liberties.length >= 3) return false; // ladder broken, escaped
    return simulateLadderChase(res.nextBoard, pt.r, pt.c, chaserColor, defenderColor, stepsLeft - 1);
  }

  // group.liberties.length === 2: chaser's turn, look for a move that re-ataris.
  for (const lib of group.liberties) {
    const res = playGoMove(board, lib.r, lib.c, chaserColor);
    if (!res.isLegal) continue;
    const afterGroup = getGroupAndLiberties(res.nextBoard, anchorR, anchorC);
    if (afterGroup.stones.length === 0) return true;
    if (afterGroup.liberties.length === 1) {
      return simulateLadderChase(res.nextBoard, anchorR, anchorC, chaserColor, defenderColor, stepsLeft - 1);
    }
  }
  return false; // no forcing move available - a ladder breaker is in the way
}

// ---------------------------------------------------------------------------
// Candidate generation (shared heuristic, reused by search at every depth)
// ---------------------------------------------------------------------------

interface CandidateScore { r: number; c: number; score: number; capturedCount: number; }

interface CandidateOptions {
  includeLadderBonus: boolean;
  noiseScale: number;
  lastMove?: Point | null;
}

type CornerId = 'TR' | 'TL' | 'BR' | 'BL';

// Helper to find distinct group keys adjacent to a point
function getAdjacentGroupKeys(
  board: GoBoard,
  r: number,
  c: number,
  targetColor: 'BLACK' | 'WHITE'
): { keys: Set<string>; minLiberties: number } {
  const size = board.length;
  const neighbors = getAdjacentPoints(r, c, size);
  const keys = new Set<string>();
  let minLiberties = Infinity;

  for (const n of neighbors) {
    if (board[n.r][n.c] === targetColor) {
      const g = getGroupAndLiberties(board, n.r, n.c);
      const groupKey = `${g.stones[0].r},${g.stones[0].c}`;
      keys.add(groupKey);
      if (g.liberties.length < minLiberties) {
        minLiberties = g.liberties.length;
      }
    }
  }

  return { keys, minLiberties: minLiberties === Infinity ? 0 : minLiberties };
}

function generateRankedCandidates(
  board: GoBoard,
  color: 'BLACK' | 'WHITE',
  koPoint: Point | null,
  options: CandidateOptions
): CandidateScore[] {
  const size = board.length;
  const opponentColor: 'BLACK' | 'WHITE' = color === 'BLACK' ? 'WHITE' : 'BLACK';
  const candidates: CandidateScore[] = [];

  const mid = Math.floor(size / 2);
  const quadrantCounts = [0, 0, 0, 0]; // TL, TR, BL, BR
  let totalStones = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'EMPTY') continue;
      totalStones++;
      quadrantCounts[(r < mid ? 0 : 2) + (c < mid ? 0 : 1)]++;
    }
  }
  const isOpeningPhase = totalStones < (size === 19 ? 32 : size === 13 ? 20 : 12);

  // Pre-analyze corner occupancy for fuseki heuristics
  const cornerDefs: { corner: CornerId; minR: number; maxR: number; minC: number; maxC: number }[] = [
    { corner: 'TL', minR: 0, maxR: 5, minC: 0, maxC: 5 },
    { corner: 'TR', minR: 0, maxR: 5, minC: size - 6, maxC: size - 1 },
    { corner: 'BL', minR: size - 6, maxR: size - 1, minC: 0, maxC: 5 },
    { corner: 'BR', minR: size - 6, maxR: size - 1, minC: size - 6, maxC: size - 1 },
  ];

  const cornerState = cornerDefs.map(def => {
    let myStones = 0;
    let oppStones = 0;
    const myPoints: Point[] = [];
    const oppPoints: Point[] = [];

    for (let r = Math.max(0, def.minR); r <= Math.min(size - 1, def.maxR); r++) {
      for (let c = Math.max(0, def.minC); c <= Math.min(size - 1, def.maxC); c++) {
        if (board[r][c] === color) {
          myStones++;
          myPoints.push({ r, c });
        } else if (board[r][c] === opponentColor) {
          oppStones++;
          oppPoints.push({ r, c });
        }
      }
    }
    return { ...def, myStones, oppStones, myPoints, oppPoints };
  });

  // Key corner target coordinates
  const starOffset = size === 9 ? 2 : 3;
  const keyCornerPoints: Point[] = [
    { r: starOffset, c: starOffset },
    { r: starOffset, c: size - 1 - starOffset },
    { r: size - 1 - starOffset, c: starOffset },
    { r: size - 1 - starOffset, c: size - 1 - starOffset },
  ];
  if (size >= 13) {
    keyCornerPoints.push(
      { r: 2, c: 3 }, { r: 3, c: 2 },
      { r: 2, c: size - 4 }, { r: 3, c: size - 3 },
      { r: size - 3, c: 2 }, { r: size - 4, c: 3 },
      { r: size - 3, c: size - 4 }, { r: size - 4, c: size - 3 },
      { r: 2, c: 2 }, { r: 2, c: size - 3 },
      { r: size - 3, c: 2 }, { r: size - 3, c: size - 3 }
    );
  } else if (size === 9) {
    keyCornerPoints.push(
      { r: 1, c: 2 }, { r: 2, c: 1 },
      { r: 1, c: 6 }, { r: 2, c: 7 },
      { r: 6, c: 1 }, { r: 7, c: 2 },
      { r: 6, c: 6 }, { r: 7, c: 7 }
    );
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 'EMPTY') continue;
      const moveRes = playGoMove(board, r, c, color, koPoint);
      if (!moveRes.isLegal) continue;

      let score = 0;
      score += moveRes.capturedCount * 50;

      const ownGroup = getGroupAndLiberties(moveRes.nextBoard, r, c);
      const liberties = ownGroup.liberties.length;

      // Capped liberty evaluation to avoid endless clumping for liberties alone
      if (liberties === 1 && moveRes.capturedCount === 0) {
        // Test if this is a working snapback (倒撲)
        let isWorkingSnapback = false;
        if (ownGroup.stones.length === 1) {
          const oppReply = playGoMove(moveRes.nextBoard, ownGroup.liberties[0].r, ownGroup.liberties[0].c, opponentColor, moveRes.koPoint);
          if (oppReply.isLegal && oppReply.capturedCount > 0) {
            const oppCapGroup = getGroupAndLiberties(oppReply.nextBoard, ownGroup.liberties[0].r, ownGroup.liberties[0].c);
            if (oppCapGroup.liberties.length === 1) {
              isWorkingSnapback = true;
            }
          }
        }
        if (!isWorkingSnapback) {
          score -= 5000; // Strict suicide / self-atari penalty!
        }
      } else if (liberties === 2) {
        score -= 10;
      } else if (liberties === 3) {
        score += 8;
      } else {
        score += 15;
      }

      // Check if filling own real eye (填自眼)
      if (moveRes.capturedCount === 0 && isRealEye(board, r, c, color)) {
        score -= 5000; // Fatal penalty for filling own real eye!
      }

      const distR = Math.min(r, size - 1 - r);
      const distC = Math.min(c, size - 1 - c);
      const edgeDist = Math.min(distR, distC);

      // Line Penalties / Bonuses in Opening (角 > 邊 > 腹)
      if (isOpeningPhase) {
        if (edgeDist === 0) {
          score -= 80; // Line 1 is bad in opening
        } else if (edgeDist === 1) {
          score -= 35; // Line 2 is bad in opening
        } else if (edgeDist === 2 || edgeDist === 3) {
          score += 15; // Golden 3rd and 4th lines
        } else if (edgeDist >= 4 && totalStones < 12 && !(size === 9 && r === 4 && c === 4)) {
          score -= 12; // Avoid deep center early
        }

        // Quadrant distribution bonus
        const q = (r < mid ? 0 : 2) + (c < mid ? 0 : 1);
        const count = quadrantCounts[q];
        if (count === 0) score += 18;
        else if (count <= 2) score += 6;

        // Corner heuristics (佔角、守角、掛角)
        for (const cs of cornerState) {
          if (r >= cs.minR && r <= cs.maxR && c >= cs.minC && c <= cs.maxC) {
            if (cs.myStones === 0 && cs.oppStones === 0) {
              const isKeyCorner = keyCornerPoints.some(p => p.r === r && p.c === c);
              if (isKeyCorner) {
                score += 65; // Very high priority: occupying empty corner
              } else {
                score += 20;
              }
            } else if (cs.myStones === 1 && cs.oppStones === 0) {
              const myStone = cs.myPoints[0];
              const mDist = Math.abs(r - myStone.r) + Math.abs(c - myStone.c);
              if ((mDist === 3 || mDist === 4) && r !== myStone.r && c !== myStone.c) {
                score += 45; // Corner Enclosure (守角)
              }
            } else if (cs.myStones === 0 && cs.oppStones === 1) {
              const oppStone = cs.oppPoints[0];
              const mDist = Math.abs(r - oppStone.r) + Math.abs(c - oppStone.c);
              if ((mDist === 3 || mDist === 4) && r !== oppStone.r && c !== oppStone.c) {
                score += 46; // Corner Approach (掛角)
              }
            }
          }
        }

        // Side Extension (拆邊)
        if ((edgeDist === 2 || edgeDist === 3) && size >= 13) {
          const isSideMiddle = (distR >= 5 && distC <= 3) || (distC >= 5 && distR <= 3);
          if (isSideMiddle) {
            score += 28;
          }
        }
      } else {
        if (edgeDist === 0) score -= 10;
        else if (edgeDist === 1) score += 3;
        else if (edgeDist === 2 || edgeDist === 3) score += 12;
      }

      // Adjacent stone relationships
      const neighbors = getAdjacentPoints(r, c, size);
      const directFriends = neighbors.filter(n => board[n.r][n.c] === color);
      const directOpps = neighbors.filter(n => board[n.r][n.c] === opponentColor);

      // Distinguish genuine connection of separate groups vs heavy dumpling clumping vs defending weak groups
      const friendGroupInfo = getAdjacentGroupKeys(board, r, c, color);
      let isDefendingWeakGroup = false;
      let minLibertiesBefore = Infinity;
      let maxLibertiesBefore = 0;
      let maxRealEyesBefore = 0;

      for (const key of friendGroupInfo.keys) {
        const [gr, gc] = key.split(',').map(Number);
        const g = getGroupAndLiberties(board, gr, gc);
        if (g.liberties.length < minLibertiesBefore) minLibertiesBefore = g.liberties.length;
        if (g.liberties.length > maxLibertiesBefore) maxLibertiesBefore = g.liberties.length;
        const eyes = countRealEyes(board, g.stones, color);
        if (eyes > maxRealEyesBefore) maxRealEyesBefore = eyes;
      }

      // 1. Defending weak friendly groups (救/伸長弱棋)
      if (minLibertiesBefore === 1) {
        if (liberties >= 3 || moveRes.capturedCount > 0) {
          score += 65; // Great escape from Atari
          isDefendingWeakGroup = true;
        }
      } else if (minLibertiesBefore === 2) {
        if (liberties >= 3) {
          score += 50; // Critical extension/rescue of group with 2 liberties
          isDefendingWeakGroup = true;
        }
      } else if (minLibertiesBefore === 3) {
        if (liberties >= 4) {
          score += 25; // Reinforcing a 3-liberty group
          isDefendingWeakGroup = true;
        }
      }

      // Eye creation & Making Life evaluation for friendly groups (做活 / 作眼急點 / 騰挪)
      if (friendGroupInfo.keys.size > 0) {
        const resultingGroup = getGroupAndLiberties(moveRes.nextBoard, r, c);
        const eyesAfter = countRealEyes(moveRes.nextBoard, resultingGroup.stones, color);

        if (maxRealEyesBefore < 2 && eyesAfter >= 2) {
          score += 95; // CRITICAL MAKES FULL LIFE (做活成功！完成雙眼存活)
          isDefendingWeakGroup = true;
        } else if (maxRealEyesBefore === 0 && eyesAfter === 1) {
          score += 40; // Creating first real eye (做第一個真實眼位)
          isDefendingWeakGroup = true;
        }

        // Sabaki (騰挪靠托/二路下立/小飛作眼位) when friendly group is weak or invading
        if (minLibertiesBefore <= 3) {
          // Contact attachment in opponent territory (靠/托)
          if (directOpps.length >= 1) {
            score += 42; // 騰挪靠托尋求做活
          }
          // 2nd line descent/extension near edge (二路立/飛擴大眼位)
          const distToEdge = Math.min(r, c, size - 1 - r, size - 1 - c);
          if (distToEdge === 1) {
            score += 38; // 二路下立/小飛作眼位與渡過
          }
        }
      } else {
        // Deep invasion into opponent territory (打入與騰挪)
        const distToEdge = Math.min(r, c, size - 1 - r, size - 1 - c);
        let oppNeighborsCount = 0;
        for (const n of neighbors) {
          if (board[n.r][n.c] === opponentColor) oppNeighborsCount++;
        }
        if (oppNeighborsCount >= 1 && distToEdge >= 1 && distToEdge <= 3) {
          score += 28; // Sabaki invasion point
        }
      }

      if (friendGroupInfo.keys.size >= 2) {
        // Genuine connection of 2+ separate friendly groups (補斷 / 聯絡)
        if (minLibertiesBefore <= 3) {
          score += 40; // Critical rescue/connection of weak group
        } else {
          score += 22; // Good strategic connection
        }
      } else if (friendGroupInfo.keys.size === 1) {
        if (directFriends.length >= 2) {
          // 2+ friendly neighbors that ALREADY belong to the same group!
          // Playing here creates a heavy dumpling / empty triangle shape (愚木/凝形)
          if (minLibertiesBefore >= 3 && moveRes.capturedCount === 0) {
            score -= 35; // Heavy clumping penalty!
          }
        } else {
          score += 2; // Simple solid attachment to 1 stone
        }
      }

      // Cutting distinct opponent groups (切斷)
      const oppGroupInfo = getAdjacentGroupKeys(board, r, c, opponentColor);
      if (oppGroupInfo.keys.size >= 2) {
        score += 35; // Cut opponent stones!
      }

      // Flexible jumping shapes (一間跳, 小飛, 大飛)
      const oneSpaceJumps = [
        { dr: 2, dc: 0, mr: 1, mc: 0 }, { dr: -2, dc: 0, mr: -1, mc: 0 },
        { dr: 0, dc: 2, mr: 0, mc: 1 }, { dr: 0, dc: -2, mr: 0, mc: -1 }
      ];
      let jumpCount = 0;
      for (const j of oneSpaceJumps) {
        const tr = r + j.dr, tc = c + j.dc;
        const mr = r + j.mr, mc = c + j.mc;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (board[tr][tc] === color && board[mr][mc] === 'EMPTY') jumpCount++;
        }
      }
      if (jumpCount > 0) score += jumpCount * 20;

      const knightJumps = [
        { dr: 2, dc: 1 }, { dr: 2, dc: -1 }, { dr: -2, dc: 1 }, { dr: -2, dc: -1 },
        { dr: 1, dc: 2 }, { dr: 1, dc: -2 }, { dr: -1, dc: 2 }, { dr: -1, dc: -2 }
      ];
      let knightCount = 0;
      for (const k of knightJumps) {
        const tr = r + k.dr, tc = c + k.dc;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          if (board[tr][tc] === color) knightCount++;
        }
      }
      if (knightCount > 0) score += Math.min(knightCount, 2) * 15;

      // 2. Penalize UNNECESSARY DEFENSE (過度防守 / 贅手 / 廢棋)
      // If adjacent friendly group is ALREADY safe (>=4 liberties or >=2 real eyes),
      // and this move is not cutting, capturing, jumping, or attacking:
      if (friendGroupInfo.keys.size > 0 && !isDefendingWeakGroup) {
        const isAlreadySafe = maxLibertiesBefore >= 4 || maxRealEyesBefore >= 2;
        if (isAlreadySafe) {
          const isCutting = oppGroupInfo.keys.size >= 2;
          const isCapturing = moveRes.capturedCount > 0;
          const isJumping = jumpCount > 0 || knightCount > 0;
          let isAttackingOpp = false;
          for (const n of neighbors) {
            if (board[n.r][n.c] === opponentColor) {
              const oppG = getGroupAndLiberties(board, n.r, n.c);
              if (oppG.liberties.length <= 3) isAttackingOpp = true;
            }
          }
          if (!isCutting && !isCapturing && !isJumping && !isAttackingOpp) {
            score -= 45; // Penalize unnecessary passive defense near safe group
          }
        }
      }

      // 3. LOCAL RESPONSE to opponent's last move (局部應手)
      if (options.lastMove) {
        const distToLast = Math.abs(r - options.lastMove.r) + Math.abs(c - options.lastMove.c);
        if (distToLast <= 2) {
          // Check if opponent's last move attacked an AI group nearby
          let attackedNearbyGroup = false;
          const lastMoveNeighbors = getAdjacentPoints(options.lastMove.r, options.lastMove.c, size);
          for (const lmn of lastMoveNeighbors) {
            if (board[lmn.r][lmn.c] === color) {
              const g = getGroupAndLiberties(board, lmn.r, lmn.c);
              if (g.liberties.length <= 3) {
                attackedNearbyGroup = true;
                break;
              }
            }
          }

          if (attackedNearbyGroup && (isDefendingWeakGroup || liberties >= 3)) {
            score += 40; // Direct urgent local response to opponent's attack!
          } else {
            score += 12; // General local combat engagement
          }
        }
      }

      if (isOpeningPhase) {
        // In opening phase, penalize unnecessary contact moves against strong isolated opponent stones ("開局切忌貼身靠打")
        let oppAtariOrWeak = false;
        for (const n of neighbors) {
          if (board[n.r][n.c] === opponentColor) {
            const oppG = getGroupAndLiberties(board, n.r, n.c);
            if (oppG.liberties.length <= 2) oppAtariOrWeak = true;
          }
        }
        if (!oppAtariOrWeak) {
          score -= directOpps.length * 25; // Heavily penalize bad opening contact moves
        }
      } else {
        score += directOpps.length * 4;
      }

      // Tactical shape: Hane at head of two opponent stones (二子頭必打)
      if (directOpps.length > 0) {
        for (const n of neighbors) {
          if (board[n.r][n.c] === opponentColor) {
            const dr = n.r - r;
            const dc = n.c - c;
            const nextR = n.r + dr;
            const nextC = n.c + dc;
            if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size && board[nextR][nextC] === opponentColor) {
              score += 22;
            }
          }
        }
      }

      // Tactical shape: Avoid jumping into opponent tiger mouth
      if (directOpps.length >= 3 && moveRes.capturedCount === 0) {
        score -= 40;
      }

      // Pressure on opponent groups, with ladder-awareness for tactical bonuses.
      for (const n of neighbors) {
        if (board[n.r][n.c] !== opponentColor) continue;
        const oppG = getGroupAndLiberties(moveRes.nextBoard, n.r, n.c);
        if (oppG.liberties.length === 1) {
          score += 25; // Atari
          if (options.includeLadderBonus) {
            const captured = simulateLadderChase(moveRes.nextBoard, n.r, n.c, color, opponentColor, 40);
            if (captured) score += 90;
          }
        } else if (oppG.liberties.length === 2 && options.includeLadderBonus) {
          const captured = simulateLadderChase(moveRes.nextBoard, n.r, n.c, color, opponentColor, 40);
          if (captured) score += 40;
        }
      }

      if (options.noiseScale > 0) {
        score += Math.random() * options.noiseScale;
      }

      candidates.push({ r, c, score, capturedCount: moveRes.capturedCount });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

// ---------------------------------------------------------------------------
// Look-ahead search (minimax + alpha-beta, restricted to top-ranked candidates)
// ---------------------------------------------------------------------------

function lifeDeathAdjustment(board: GoBoard, color: 'BLACK' | 'WHITE'): number {
  const size = board.length;
  const visited = new Set<string>();
  let adjustment = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== color) continue;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      const group = getGroupAndLiberties(board, r, c);
      group.stones.forEach(s => visited.add(`${s.r},${s.c}`));

      const eyes = countRealEyes(board, group.stones, color);
      if (eyes >= 2) {
        adjustment += 10 + group.stones.length; // fully alive group reward
      } else if (eyes === 1 && group.liberties.length >= 3) {
        adjustment += 4; // 1 solid eye with decent liberties
      } else if (eyes === 0 && group.liberties.length <= 2) {
        adjustment -= group.stones.length * 4; // vulnerable eyeless group
      }
    }
  }
  return adjustment;
}

function evaluateBoardForColor(board: GoBoard, color: 'BLACK' | 'WHITE', useLifeDeath: boolean): number {
  const territory = estimateTerritory(board);
  const opponent: 'BLACK' | 'WHITE' = color === 'BLACK' ? 'WHITE' : 'BLACK';
  let score = color === 'BLACK'
    ? territory.blackTotal - territory.whiteTotal
    : territory.whiteTotal - territory.blackTotal;

  if (useLifeDeath) {
    score += lifeDeathAdjustment(board, color) - lifeDeathAdjustment(board, opponent);
  }
  return score;
}

interface SearchNode { move: Point | null; score: number; }

function minimaxSearch(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  toMove: 'BLACK' | 'WHITE',
  depth: number,
  maxDepth: number,
  koPoint: Point | null,
  breadths: number[],
  useLifeDeath: boolean,
  rootNoiseScale: number,
  alpha: number,
  beta: number,
  lastMove: Point | null = null
): SearchNode {
  if (depth >= maxDepth) {
    return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
  }

  const candidates = generateRankedCandidates(board, toMove, koPoint, {
    includeLadderBonus: true,
    noiseScale: depth === 0 ? rootNoiseScale : 0,
    lastMove: depth === 0 ? lastMove : null
  });
  const breadth = breadths[depth] ?? 4;
  const limited = candidates.slice(0, breadth);

  if (limited.length === 0) {
    return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
  }

  const maximizing = toMove === aiColor;
  const nextColor: 'BLACK' | 'WHITE' = toMove === 'BLACK' ? 'WHITE' : 'BLACK';

  if (depth === 0) {
    const scoredNodes: { move: Point; score: number }[] = [];
    let maxScore = -Infinity;

    for (const cand of limited) {
      const moveRes = playGoMove(board, cand.r, cand.c, toMove, koPoint);
      if (!moveRes.isLegal) continue;

      const captureAdjust = (toMove === aiColor ? 1 : -1) * moveRes.capturedCount * 4;
      const child = minimaxSearch(
        moveRes.nextBoard, aiColor, nextColor, depth + 1, maxDepth,
        moveRes.koPoint, breadths, useLifeDeath, rootNoiseScale, alpha, beta,
        { r: cand.r, c: cand.c }
      );
      const total = child.score + captureAdjust + cand.score * 0.25;
      scoredNodes.push({ move: { r: cand.r, c: cand.c }, score: total });
      if (total > maxScore) maxScore = total;
    }

    if (scoredNodes.length === 0) {
      return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
    }

    let totalStones = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        if (board[r][c] !== 'EMPTY') totalStones++;
      }
    }
    const isOpening = totalStones < (board.length === 19 ? 32 : board.length === 13 ? 20 : 12);
    const margin = isOpening ? 2.5 : 1.2;
    const topNodes = scoredNodes.filter(n => maxScore - n.score <= margin);
    const chosen = topNodes[Math.floor(Math.random() * topNodes.length)];
    return { move: chosen.move, score: chosen.score };
  }

  let bestScore = maximizing ? -Infinity : Infinity;
  let bestMove: Point | null = null;

  for (const cand of limited) {
    const moveRes = playGoMove(board, cand.r, cand.c, toMove, koPoint);
    if (!moveRes.isLegal) continue;

    const captureAdjust = (toMove === aiColor ? 1 : -1) * moveRes.capturedCount * 4;
    const child = minimaxSearch(
      moveRes.nextBoard, aiColor, nextColor, depth + 1, maxDepth,
      moveRes.koPoint, breadths, useLifeDeath, rootNoiseScale, alpha, beta,
      { r: cand.r, c: cand.c }
    );
    const total = child.score + captureAdjust;

    if (maximizing) {
      if (total > bestScore) { bestScore = total; bestMove = { r: cand.r, c: cand.c }; }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (total < bestScore) { bestScore = total; bestMove = { r: cand.r, c: cand.c }; }
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break; // alpha-beta prune
  }

  if (bestMove === null) {
    return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
  }
  return { move: bestMove, score: bestScore };
}

// ---------------------------------------------------------------------------
// Joseki opening book
// ---------------------------------------------------------------------------

const CORNERS: CornerId[] = ['TR', 'TL', 'BR', 'BL'];
const JOSEKI_LOCAL_CAP = 8;
const JOSEKI_MAX_LOCAL_STONES = 16;

function toLocalCorner(r: number, c: number, size: number, corner: CornerId): { top: number; right: number } {
  switch (corner) {
    case 'TR': return { top: r, right: size - 1 - c };
    case 'TL': return { top: r, right: c };
    case 'BR': return { top: size - 1 - r, right: size - 1 - c };
    case 'BL': return { top: size - 1 - r, right: c };
  }
}

function fromLocalCorner(top: number, right: number, size: number, corner: CornerId): Point {
  switch (corner) {
    case 'TR': return { r: top, c: size - 1 - right };
    case 'TL': return { r: top, c: right };
    case 'BR': return { r: size - 1 - top, c: size - 1 - right };
    case 'BL': return { r: size - 1 - top, c: right };
  }
}

const JOSEKI_MAP: Map<string, JosekiPoint> = new Map();
for (const entry of JOSEKI_BOOK) {
  const key = entry.prefix.map(p => `${p.role}:${p.top}:${p.right}`).sort().join('|');
  if (!JOSEKI_MAP.has(key)) JOSEKI_MAP.set(key, entry.next);
}

function getCornerOfPoint(p: Point, size: number): CornerId | null {
  const localCap = size >= 19 ? JOSEKI_LOCAL_CAP : size >= 13 ? 6 : 4;
  if (p.r <= localCap && p.c >= size - 1 - localCap) return 'TR';
  if (p.r <= localCap && p.c <= localCap) return 'TL';
  if (p.r >= size - 1 - localCap && p.c <= localCap) return 'BL';
  if (p.r >= size - 1 - localCap && p.c >= size - 1 - localCap) return 'BR';
  return null;
}

function findJosekiMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  opponentColor: 'BLACK' | 'WHITE',
  koPoint: Point | null,
  priorityCorner: CornerId | null = null
): Point | null {
  const size = board.length;
  const localCap = size >= 19 ? JOSEKI_LOCAL_CAP : size >= 13 ? 6 : 4;

  const orderedCorners: CornerId[] = priorityCorner
    ? [priorityCorner, ...CORNERS.filter(c => c !== priorityCorner)]
    : CORNERS;

  for (const corner of orderedCorners) {
    const localStones: { top: number; right: number; color: 'BLACK' | 'WHITE' }[] = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = board[r][c];
        if (color === 'EMPTY') continue;
        const { top, right } = toLocalCorner(r, c, size, corner);
        if (top > localCap || right > localCap) continue;
        localStones.push({ top, right, color });
      }
    }

    if (localStones.length === 0 || localStones.length > JOSEKI_MAX_LOCAL_STONES) continue;

    for (const firstColorGuess of [aiColor, opponentColor] as const) {
      const keyParts = localStones.map(s => {
        const role: JosekiRole = s.color === firstColorGuess ? 'F' : 'S';
        return `${role}:${s.top}:${s.right}`;
      }).sort();
      const next = JOSEKI_MAP.get(keyParts.join('|'));
      if (!next) continue;

      const nextColor: 'BLACK' | 'WHITE' = next.role === 'F'
        ? firstColorGuess
        : (firstColorGuess === 'BLACK' ? 'WHITE' : 'BLACK');
      if (nextColor !== aiColor) continue;

      const movePoint = fromLocalCorner(next.top, next.right, size, corner);
      if (board[movePoint.r][movePoint.c] !== 'EMPTY') continue;
      const res = playGoMove(board, movePoint.r, movePoint.c, aiColor, koPoint);
      if (res.isLegal) {
        return movePoint;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Local Stability / Defense (局部定型與安全)
// ---------------------------------------------------------------------------
function findLocalDefenseMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  opponentColor: 'BLACK' | 'WHITE',
  koPoint: Point | null,
  lastMove: Point | null
): Point | null {
  if (!lastMove) return null;
  const size = board.length;

  // 1. Check if AI has a group near lastMove (distance <= 2) with 2 or 3 liberties that needs local extension/defense
  let urgentGroup: { stones: Point[]; liberties: Point[] } | null = null;
  let minLiberties = Infinity;

  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = lastMove.r + dr;
      const c = lastMove.c + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) {
        if (board[r][c] === aiColor) {
          const group = getGroupAndLiberties(board, r, c);
          if (group.liberties.length >= 2 && group.liberties.length <= 3 && group.liberties.length < minLiberties) {
            minLiberties = group.liberties.length;
            urgentGroup = group;
          }
        }
      }
    }
  }

  if (urgentGroup && urgentGroup.liberties.length > 0) {
    let bestMove: Point | null = null;
    let maxLibGain = -1;

    for (const lib of urgentGroup.liberties) {
      const res = playGoMove(board, lib.r, lib.c, aiColor, koPoint);
      if (!res.isLegal) continue;
      const newGroup = getGroupAndLiberties(res.nextBoard, lib.r, lib.c);

      // Do not play self-atari
      if (newGroup.liberties.length <= 1 && res.capturedCount === 0) continue;

      const libGain = newGroup.liberties.length - urgentGroup.liberties.length + res.capturedCount * 5;
      if (libGain > maxLibGain) {
        maxLibGain = libGain;
        bestMove = lib;
      }
    }
    if (bestMove && maxLibGain > 0) {
      return bestMove;
    }
  }

  // 2. If opponent played a direct contact attachment (貼/托/切) against an AI stone, reply locally
  let contactedAiStone: Point | null = null;
  const dX = [-1, 1, 0, 0];
  const dY = [0, 0, -1, 1];
  for (let i = 0; i < 4; i++) {
    const nr = lastMove.r + dX[i];
    const nc = lastMove.c + dY[i];
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === aiColor) {
      contactedAiStone = { r: nr, c: nc };
      break;
    }
  }

  if (contactedAiStone) {
    const myGroup = getGroupAndLiberties(board, contactedAiStone.r, contactedAiStone.c);
    if (myGroup.liberties.length <= 4) {
      for (const lib of myGroup.liberties) {
        const res = playGoMove(board, lib.r, lib.c, aiColor, koPoint);
        if (!res.isLegal) continue;
        const afterG = getGroupAndLiberties(res.nextBoard, lib.r, lib.c);
        if (afterG.liberties.length >= 2 || res.capturedCount > 0) {
          return lib; // Stay local to resolve contact fight!
        }
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Opening Fuseki (佔空角 -> 拆邊 -> 定式 Joseki)
// ---------------------------------------------------------------------------
function findOpeningFusekiMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  opponentColor: 'BLACK' | 'WHITE',
  koPoint: Point | null,
  lastMove: Point | null = null
): Point | null {
  const size = board.length;
  const priorityCorner = lastMove ? getCornerOfPoint(lastMove, size) : null;

  // Check empty corners first
  const cap = size >= 19 ? 5 : size >= 13 ? 4 : 2;
  const cornerDefs: { corner: CornerId; minR: number; maxR: number; minC: number; maxC: number }[] = [
    { corner: 'TR', minR: 0, maxR: cap, minC: size - 1 - cap, maxC: size - 1 },
    { corner: 'TL', minR: 0, maxR: cap, minC: 0, maxC: cap },
    { corner: 'BL', minR: size - 1 - cap, maxR: size - 1, minC: 0, maxC: cap },
    { corner: 'BR', minR: size - 1 - cap, maxR: size - 1, minC: size - 1 - cap, maxC: size - 1 },
  ];

  const emptyCorners: CornerId[] = [];
  const cornerStonesCount: Record<CornerId, number> = { TR: 0, TL: 0, BL: 0, BR: 0 };

  for (const def of cornerDefs) {
    let stoneCount = 0;
    for (let r = def.minR; r <= def.maxR; r++) {
      for (let c = def.minC; c <= def.maxC; c++) {
        if (board[r][c] !== 'EMPTY') stoneCount++;
      }
    }
    cornerStonesCount[def.corner] = stoneCount;
    if (stoneCount === 0) emptyCorners.push(def.corner);
  }

  // 1. If priorityCorner exists AND it has an active Joseki sequence in progress (>= 2 stones OR emptyCorners is empty):
  //    Complete the active local sequence FIRST!
  if (priorityCorner) {
    const priorityStones = cornerStonesCount[priorityCorner];
    if (priorityStones >= 2 || emptyCorners.length === 0) {
      const localJoseki = findJosekiMove(board, aiColor, opponentColor, koPoint, priorityCorner);
      if (localJoseki) return localJoseki;
    }
  }

  // 2. Occupy empty corners (佔空角: #1 Rule of Go Opening)
  if (emptyCorners.length > 0) {
    const corner = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    const starOffset = size === 19 ? 3 : size === 13 ? 3 : 2;
    const candidatesRelative = [
      { top: starOffset, right: starOffset },     // Star point 4-4 (70% probability)
      { top: starOffset - 1, right: starOffset }, // Komoku 3-4 (15% probability)
      { top: starOffset, right: starOffset - 1 }, // Komoku 4-3 (15% probability)
    ];
    const rand = Math.random();
    const choice = rand < 0.70 ? candidatesRelative[0] : rand < 0.85 ? candidatesRelative[1] : candidatesRelative[2];
    const pt = fromLocalCorner(choice.top, choice.right, size, corner);
    const res = playGoMove(board, pt.r, pt.c, aiColor, koPoint);
    if (res.isLegal) return pt;
  }

  // 3. Side Big Points (拆邊 / 佔邊)
  const mid = Math.floor(size / 2);
  const sideOffset = size === 19 ? 3 : size === 13 ? 3 : 2;
  const sidePoints: Point[] = [
    { r: sideOffset, c: mid },
    { r: mid, c: sideOffset },
    { r: size - 1 - sideOffset, c: mid },
    { r: mid, c: size - 1 - sideOffset },
  ];

  const emptySides = sidePoints.filter(p => {
    if (board[p.r][p.c] !== 'EMPTY') return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = p.r + dr, nc = p.c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (board[nr][nc] !== 'EMPTY') return false;
        }
      }
    }
    return true;
  });

  let totalBoardStones = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 'EMPTY') totalBoardStones++;
    }
  }

  if (emptySides.length > 0 && totalBoardStones < (size === 19 ? 24 : size === 13 ? 16 : 10)) {
    const choice = emptySides[Math.floor(Math.random() * emptySides.length)];
    const res = playGoMove(board, choice.r, choice.c, aiColor, koPoint);
    if (res.isLegal) return choice;
  }

  // 4. Joseki opening book for any other occupied corners (Approaches / Enclosures)
  return findJosekiMove(board, aiColor, opponentColor, koPoint, priorityCorner);
}

// ---------------------------------------------------------------------------
// Public entry point - difficulty-tiered Go AI
//   EASY   : 1-ply heuristic only, no ladder reading, no atari-escape, high noise
//            (plays like a genuine beginner: falls for ladders, misses escapes)
//   NORMAL : ladder-aware heuristic + 2-ply search (AI move -> opponent's best reply)
//   HARD   : ladder-aware heuristic + 3-ply alpha-beta search + simplified life/death
//            evaluation (AI -> opponent -> AI), low noise, sets up tactical traps
// ---------------------------------------------------------------------------
/**
 * The compact local book is useful as coaching for beginner and intermediate
 * play. Hard mode must evaluate the whole board first, otherwise a matching
 * local shape can override a tactically urgent move elsewhere.
 */
export function shouldUseOpeningBook(
  difficulty: 'EASY' | 'NORMAL' | 'HARD',
  board?: GoBoard
): boolean {
  if (difficulty !== 'HARD') return true;
  if (!board) return false;
  const stones = board.flat().filter(stone => stone !== 'EMPTY').length;
  const openingLimit = board.length === 9 ? 8 : board.length === 13 ? 14 : 20;
  return stones < openingLimit;
}

export function getGoAIMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  difficulty: 'EASY' | 'NORMAL' | 'HARD',
  koPoint: Point | null = null,
  lastMove: Point | null = null
): Point | null {
  const opponentColor: 'BLACK' | 'WHITE' = aiColor === 'BLACK' ? 'WHITE' : 'BLACK';
  const size = board.length;

  // 1. Always take a free capture if one is on the board (excluding snapback traps).
  const oppAtari = findGroupsInAtari(board, opponentColor);
  if (oppAtari.length > 0) {
    oppAtari.sort((a, b) => b.stones.length - a.stones.length);
    for (const item of oppAtari) {
      const res = playGoMove(board, item.liberty.r, item.liberty.c, aiColor, koPoint);
      if (res.isLegal && res.capturedCount > 0) {
        // Quality check: avoid snapback trap (倒撲陷阱)
        const resultingGroup = getGroupAndLiberties(res.nextBoard, item.liberty.r, item.liberty.c);
        if (resultingGroup.liberties.length === 1 && item.stones.length === 1) {
          const oppReply = playGoMove(res.nextBoard, resultingGroup.liberties[0].r, resultingGroup.liberties[0].c, opponentColor, res.koPoint);
          if (oppReply.isLegal && oppReply.capturedCount > 1) {
            continue; // Skip snapback trap!
          }
        }
        return item.liberty;
      }
    }
  }

  // 2. Escape from atari - EASY skips this entirely (a classic beginner mistake).
  if (difficulty !== 'EASY') {
    const myAtari = findGroupsInAtari(board, aiColor);
    if (myAtari.length > 0) {
      myAtari.sort((a, b) => b.stones.length - a.stones.length);
      for (const item of myAtari) {
        const res = playGoMove(board, item.liberty.r, item.liberty.c, aiColor, koPoint);
        if (!res.isLegal) continue;
        const afterGroup = getGroupAndLiberties(res.nextBoard, item.liberty.r, item.liberty.c);

        // Quality check for 1-stone group escape
        if (item.stones.length === 1) {
          // If escaping a single stone leaves it with only 2 liberties and no captures made:
          if (afterGroup.liberties.length < 3 && res.capturedCount === 0) {
            // Check if opponent can immediately put it back in atari with 1 move
            let canOppAtariAgain = false;
            for (const lib of afterGroup.liberties) {
              const testOpp = playGoMove(res.nextBoard, lib.r, lib.c, opponentColor, res.koPoint);
              if (testOpp.isLegal) {
                const oppG = getGroupAndLiberties(testOpp.nextBoard, item.liberty.r, item.liberty.c);
                if (oppG.liberties.length === 1) {
                  canOppAtariAgain = true;
                  break;
                }
              }
            }
            if (canOppAtariAgain) {
              // Futile 1-stone escape (送子 / 越救死越多). Skip forced escape!
              continue;
            }
          }
        }

        if (afterGroup.liberties.length > 1 || res.capturedCount > 0) {
          // HARD double-checks: is this escape actually a ladder that dies anyway?
          if (difficulty === 'HARD' && afterGroup.liberties.length === 2) {
            const stillDies = simulateLadderChase(
              res.nextBoard, item.liberty.r, item.liberty.c, opponentColor, aiColor, 40
            );
            if (stillDies) continue; // futile - let the search below consider alternatives
          }
          return item.liberty;
        }
      }
    }
  }

  // 3. Local Stability / Defense (著重局部安全、防守與穩定) - NORMAL and HARD
  if (difficulty !== 'EASY' && lastMove) {
    const localDefense = findLocalDefenseMove(board, aiColor, opponentColor, koPoint, lastMove);
    if (localDefense) return localDefense;
  }

  // 4. Opening Fuseki (佔空角 -> 拆邊 -> 定式 Joseki) - NORMAL/HARD
  if (difficulty !== 'EASY' && shouldUseOpeningBook(difficulty, board)) {
    const fusekiMove = findOpeningFusekiMove(board, aiColor, opponentColor, koPoint, lastMove);
    if (fusekiMove) return fusekiMove;
  } else if (difficulty === 'EASY') {
    // EASY occupies empty corner 80% of the time if any empty corners exist
    if (Math.random() < 0.8) {
      const fusekiMove = findOpeningFusekiMove(board, aiColor, opponentColor, koPoint, lastMove);
      if (fusekiMove) return fusekiMove;
    }
  }

  // 4. Difficulty-specific move selection.
  if (difficulty === 'EASY') {
    const candidates = generateRankedCandidates(board, aiColor, koPoint, {
      includeLadderBonus: false,
      noiseScale: 25,
      lastMove
    });
    return candidates.length > 0 ? { r: candidates[0].r, c: candidates[0].c } : null;
  }

  if (difficulty === 'NORMAL') {
    const result = minimaxSearch(board, aiColor, aiColor, 0, 2, koPoint, [8, 5], false, 4, -Infinity, Infinity, lastMove);
    if (result.move) return result.move;
    const fallback = generateRankedCandidates(board, aiColor, koPoint, { includeLadderBonus: true, noiseScale: 6, lastMove });
    return fallback.length > 0 ? { r: fallback[0].r, c: fallback[0].c } : null;
  }

  // HARD LEVEL - High tactical competence tailored to 9x9, 13x13, 19x19
  const hardDepth = size <= 9 ? 4 : 3;
  const hardBreadths = size <= 9 ? [14, 10, 6, 4] : size <= 13 ? [12, 8, 5] : [10, 6, 4];
  const rootNoise = 0; // Deterministic precision for HARD level

  const result = minimaxSearch(
    board, aiColor, aiColor, 0, hardDepth, koPoint, hardBreadths, true, rootNoise, -Infinity, Infinity, lastMove
  );
  if (result.move) return result.move;

  const fallback = generateRankedCandidates(board, aiColor, koPoint, { includeLadderBonus: true, noiseScale: 0, lastMove });
  return fallback.length > 0 ? { r: fallback[0].r, c: fallback[0].c } : null;
}

// Territory Estimation (Area Scoring & Influence Model)
export interface TerritoryScore {
  blackStones: number;
  whiteStones: number;
  blackTerritory: number;
  whiteTerritory: number;
  neutralTerritory: number;
  territoryMap: ('BLACK' | 'WHITE' | 'NEUTRAL' | 'STONE')[][];
  blackTotal: number;
  whiteTotal: number;
  komi: number;
  leadColor: 'BLACK' | 'WHITE' | 'TIE';
  leadMargin: number;
  blackWinRate: number; // Estimated Win Rate % (0 - 100)
  commentary: string;
}

export function estimateTerritory(board: GoBoard, komi: number = 6.5): TerritoryScore {
  const size = board.length;
  const territoryMap: ('BLACK' | 'WHITE' | 'NEUTRAL' | 'STONE')[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill('NEUTRAL'));

  let blackStones = 0;
  let whiteStones = 0;
  const blackStonePositions: Point[] = [];
  const whiteStonePositions: Point[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'BLACK') {
        blackStones++;
        blackStonePositions.push({ r, c });
        territoryMap[r][c] = 'STONE';
      } else if (board[r][c] === 'WHITE') {
        whiteStones++;
        whiteStonePositions.push({ r, c });
        territoryMap[r][c] = 'STONE';
      }
    }
  }

  // 1. First Pass: Flood Fill Enclosed Regions
  const visited: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  const openRegions: Point[][] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'EMPTY' && !visited[r][c]) {
        const region: Point[] = [];
        let touchesBlack = false;
        let touchesWhite = false;

        const queue: Point[] = [{ r, c }];
        visited[r][c] = true;

        while (queue.length > 0) {
          const curr = queue.shift()!;
          region.push(curr);

          const neighbors = getAdjacentPoints(curr.r, curr.c, size);
          for (const n of neighbors) {
            if (board[n.r][n.c] === 'BLACK') {
              touchesBlack = true;
            } else if (board[n.r][n.c] === 'WHITE') {
              touchesWhite = true;
            } else if (board[n.r][n.c] === 'EMPTY' && !visited[n.r][n.c]) {
              visited[n.r][n.c] = true;
              queue.push(n);
            }
          }
        }

        if (touchesBlack && !touchesWhite) {
          for (const pt of region) {
            territoryMap[pt.r][pt.c] = 'BLACK';
          }
        } else if (!touchesBlack && touchesWhite) {
          for (const pt of region) {
            territoryMap[pt.r][pt.c] = 'WHITE';
          }
        } else {
          openRegions.push(region);
        }
      }
    }
  }

  // 2. Second Pass: Influence Map for Open / Mid-Game Regions
  // Using inverse distance weighting to determine local dominance
  for (const region of openRegions) {
    for (const pt of region) {
      let blackInf = 0;
      let whiteInf = 0;

      for (const b of blackStonePositions) {
        const dist = Math.abs(b.r - pt.r) + Math.abs(b.c - pt.c);
        if (dist <= 4) {
          blackInf += 1 / Math.pow(dist, 1.4);
        }
      }

      for (const w of whiteStonePositions) {
        const dist = Math.abs(w.r - pt.r) + Math.abs(w.c - pt.c);
        if (dist <= 4) {
          whiteInf += 1 / Math.pow(dist, 1.4);
        }
      }

      const diff = blackInf - whiteInf;
      if (diff > 0.4) {
        territoryMap[pt.r][pt.c] = 'BLACK';
      } else if (diff < -0.4) {
        territoryMap[pt.r][pt.c] = 'WHITE';
      } else {
        territoryMap[pt.r][pt.c] = 'NEUTRAL';
      }
    }
  }

  // 3. Count Totals
  let blackTerritory = 0;
  let whiteTerritory = 0;
  let neutralTerritory = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'EMPTY') {
        const owner = territoryMap[r][c];
        if (owner === 'BLACK') blackTerritory++;
        else if (owner === 'WHITE') whiteTerritory++;
        else neutralTerritory++;
      }
    }
  }

  // Area scoring (Chinese rules baseline)
  const blackTotal = blackStones + blackTerritory;
  const whiteTotal = whiteStones + whiteTerritory + komi;
  const diff = blackTotal - whiteTotal;
  const absDiff = Math.abs(diff);

  let leadColor: 'BLACK' | 'WHITE' | 'TIE' = 'TIE';
  if (diff > 0.1) leadColor = 'BLACK';
  else if (diff < -0.1) leadColor = 'WHITE';

  // Win rate estimation model based on point lead
  // Sigmoid formula: 1 / (1 + exp(-0.15 * diff))
  const blackWinRate = Math.min(99, Math.max(1, Math.round((1 / (1 + Math.exp(-0.18 * diff))) * 100)));

  let commentary = '';
  if (blackStones === 0 && whiteStones === 0) {
    commentary = '棋局剛開始，雙方尚未落子，盤面完全均勢。';
  } else if (absDiff < 2) {
    commentary = `雙方勢均力敵（差距僅約 ${absDiff.toFixed(1)} 目），勝負取決於後續邊角攻防與官子爭奪！`;
  } else if (leadColor === 'BLACK') {
    if (absDiff > 12) {
      commentary = `黑方大優（盤面約領先 ${absDiff.toFixed(1)} 目），實地與外勢兼具，勝率極高！`;
    } else {
      commentary = `黑方略佔上風（盤面約領先 ${absDiff.toFixed(1)} 目），局勢平穩掌控中。`;
    }
  } else {
    if (absDiff > 12) {
      commentary = `白方大優（含貼目 6.5 目，約領先 ${absDiff.toFixed(1)} 目），厚勢已成！`;
    } else {
      commentary = `白方稍佔優勢（含貼目約領先 ${absDiff.toFixed(1)} 目），黑方需尋找切斷或圍空機會。`;
    }
  }

  return {
    blackStones,
    whiteStones,
    blackTerritory,
    whiteTerritory,
    neutralTerritory,
    territoryMap,
    blackTotal: Number(blackTotal.toFixed(1)),
    whiteTotal: Number(whiteTotal.toFixed(1)),
    komi,
    leadColor,
    leadMargin: Number(absDiff.toFixed(1)),
    blackWinRate,
    commentary
  };
}
