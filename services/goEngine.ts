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

  // Pre-pass: how many stones already sit in each board quadrant. During the
  // opening this is used to nudge the AI toward spreading across the whole
  // board instead of piling into whichever corner scored highest first -
  // otherwise ties between symmetric corners are always broken the same way.
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
  const isOpeningPhase = totalStones < 16;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 'EMPTY') continue;
      const moveRes = playGoMove(board, r, c, color, koPoint);
      if (!moveRes.isLegal) continue;

      let score = 0;
      score += moveRes.capturedCount * 50;

      if (isOpeningPhase) {
        const q = (r < mid ? 0 : 2) + (c < mid ? 0 : 1);
        const count = quadrantCounts[q];
        if (count === 0) score += 18; // untouched quadrant - stake it out
        else if (count <= 2) score += 6;
      }

      const ownGroup = getGroupAndLiberties(moveRes.nextBoard, r, c);
      const liberties = ownGroup.liberties.length;

      if (liberties === 1 && moveRes.capturedCount === 0) {
        score -= 130;
      } else {
        score += liberties * 5;
      }

      const distR = Math.min(r, size - 1 - r);
      const distC = Math.min(c, size - 1 - c);
      const edgeDist = Math.min(distR, distC);

      if (edgeDist === 0) score -= 10;
      else if (edgeDist === 1) score += 3;
      else if (edgeDist === 2 || edgeDist === 3) score += 12;

      if (size === 9) {
        if ((r === 2 || r === 6) && (c === 2 || c === 6)) score += 15;
        if (r === 4 && c === 4) score += 10;
      } else if (size === 13) {
        if ((r === 3 || r === 9) && (c === 3 || c === 9)) score += 15;
        if (r === 6 && c === 6) score += 10;
      } else if (size === 19) {
        if ((r === 3 || r === 15) && (c === 3 || c === 15)) score += 20;
        if ((r === 2 || r === 16) && (c === 2 || c === 16)) score += 12;
      }

      const neighbors = getAdjacentPoints(r, c, size);
      let friendNeighbors = 0;
      let oppNeighbors = 0;
      for (const n of neighbors) {
        if (board[n.r][n.c] === color) friendNeighbors++;
        else if (board[n.r][n.c] === opponentColor) oppNeighbors++;
      }
      score += friendNeighbors * 6;
      score += oppNeighbors * 4;

      // Pressure on opponent groups, with ladder-awareness for tactical bonuses.
      for (const n of neighbors) {
        if (board[n.r][n.c] !== opponentColor) continue;
        const oppG = getGroupAndLiberties(moveRes.nextBoard, n.r, n.c);
        if (oppG.liberties.length === 1) {
          score += 25; // Atari
          if (options.includeLadderBonus) {
            const captured = simulateLadderChase(moveRes.nextBoard, n.r, n.c, color, opponentColor, 40);
            if (captured) score += 90; // this atari actually ladders to a kill
          }
        } else if (oppG.liberties.length === 2 && options.includeLadderBonus) {
          const captured = simulateLadderChase(moveRes.nextBoard, n.r, n.c, color, opponentColor, 40);
          if (captured) score += 40; // sets up a ladder even though not atari yet
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

      if (group.liberties.length <= 3) {
        const eyes = countRealEyes(board, group.stones, color);
        if (eyes >= 2) {
          adjustment += 4; // secure group
        } else if (group.liberties.length <= 2) {
          adjustment -= group.stones.length * 3; // vulnerable, weighted by group size
        }
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
  beta: number
): SearchNode {
  if (depth >= maxDepth) {
    return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
  }

  // Only the root gets tie-break noise: deeper plies must stay deterministic for the
  // search to be meaningful, but at the root, ties between symmetric options (e.g.
  // several equally-scored empty corners) should not always resolve the same way.
  const candidates = generateRankedCandidates(board, toMove, koPoint, {
    includeLadderBonus: true,
    noiseScale: depth === 0 ? rootNoiseScale : 0
  });
  const breadth = breadths[depth] ?? 4;
  const limited = candidates.slice(0, breadth);

  if (limited.length === 0) {
    return { move: null, score: evaluateBoardForColor(board, aiColor, useLifeDeath) };
  }

  const maximizing = toMove === aiColor;
  const nextColor: 'BLACK' | 'WHITE' = toMove === 'BLACK' ? 'WHITE' : 'BLACK';
  let bestScore = maximizing ? -Infinity : Infinity;
  let bestMove: Point | null = null;

  for (const cand of limited) {
    const moveRes = playGoMove(board, cand.r, cand.c, toMove, koPoint);
    if (!moveRes.isLegal) continue;

    const captureAdjust = (toMove === aiColor ? 1 : -1) * moveRes.capturedCount * 4;
    const child = minimaxSearch(
      moveRes.nextBoard, aiColor, nextColor, depth + 1, maxDepth,
      moveRes.koPoint, breadths, useLifeDeath, rootNoiseScale, alpha, beta
    );
    // Root-level tie-break jitter: symmetric options (e.g. all 4 corners on an empty
    // board) often score EXACTLY equal after search, so without this the strict ">"
    // comparison below would deterministically always keep the first one found.
    const tieBreak = depth === 0 ? (Math.random() - 0.5) * rootNoiseScale : 0;
    const total = child.score + captureAdjust + tieBreak;

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
// JOSEKI_BOOK stores corner sequences relative to a single reference corner
// (top-right) using role labels 'F'/'S' (whoever played first locally / second).
// At runtime we check each of the board's 4 real corners under both possible
// role assignments, so the same compact table works regardless of which
// corner, and which color went first there.

type CornerId = 'TR' | 'TL' | 'BR' | 'BL';
const CORNERS: CornerId[] = ['TR', 'TL', 'BR', 'BL'];
const JOSEKI_LOCAL_CAP = 8; // book entries only ever reference lines 0-8 from a corner
const JOSEKI_MAX_LOCAL_STONES = 16; // corner too crowded/tactical -> book no longer applies

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

// Looks for a matching corner joseki continuation for `aiColor` to play now.
// Only applies to 13x13/19x19 (corner joseki don't meaningfully transfer to 9x9).
function findJosekiMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  opponentColor: 'BLACK' | 'WHITE',
  koPoint: Point | null
): Point | null {
  const size = board.length;
  if (size < 13) return null;

  for (const corner of CORNERS) {
    const localStones: { top: number; right: number; color: 'BLACK' | 'WHITE' }[] = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = board[r][c];
        if (color === 'EMPTY') continue;
        const { top, right } = toLocalCorner(r, c, size, corner);
        if (top > JOSEKI_LOCAL_CAP || right > JOSEKI_LOCAL_CAP) continue;
        localStones.push({ top, right, color });
      }
    }

    if (localStones.length === 0 || localStones.length > JOSEKI_MAX_LOCAL_STONES) continue;

    // We don't track move history, so we don't actually know which color played
    // first in this corner - try both assignments and use whichever matches the book.
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
      if (nextColor !== aiColor) continue; // book's next move is for the opponent, not us

      const movePoint = fromLocalCorner(next.top, next.right, size, corner);
      if (board[movePoint.r][movePoint.c] !== 'EMPTY') continue;
      const res = playGoMove(board, movePoint.r, movePoint.c, aiColor, koPoint);
      if (res.isLegal) return movePoint;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public entry point - difficulty-tiered Go AI
//   EASY   : 1-ply heuristic only, no ladder reading, no atari-escape, high noise
//            (plays like a genuine beginner: falls for ladders, misses escapes)
//   NORMAL : ladder-aware heuristic + 2-ply search (AI move -> opponent's best reply)
//   HARD   : ladder-aware heuristic + 3-ply alpha-beta search + simplified life/death
//            evaluation (AI -> opponent -> AI), low noise, sets up tactical traps
// ---------------------------------------------------------------------------
export function getGoAIMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  difficulty: 'EASY' | 'NORMAL' | 'HARD',
  koPoint: Point | null = null
): Point | null {
  const opponentColor: 'BLACK' | 'WHITE' = aiColor === 'BLACK' ? 'WHITE' : 'BLACK';

  // 1. Always take a free capture if one is on the board.
  const oppAtari = findGroupsInAtari(board, opponentColor);
  if (oppAtari.length > 0) {
    oppAtari.sort((a, b) => b.stones.length - a.stones.length);
    for (const item of oppAtari) {
      const res = playGoMove(board, item.liberty.r, item.liberty.c, aiColor, koPoint);
      if (res.isLegal && res.capturedCount > 0) {
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

  // 3. Joseki opening book - NORMAL/HARD only (EASY has no book knowledge, matching a
  //    genuine beginner who doesn't know joseki and would deviate on their own).
  if (difficulty !== 'EASY') {
    const bookMove = findJosekiMove(board, aiColor, opponentColor, koPoint);
    if (bookMove) return bookMove;
  }

  // 4. Difficulty-specific move selection.
  if (difficulty === 'EASY') {
    const candidates = generateRankedCandidates(board, aiColor, koPoint, {
      includeLadderBonus: false,
      noiseScale: 25
    });
    return candidates.length > 0 ? { r: candidates[0].r, c: candidates[0].c } : null;
  }

  if (difficulty === 'NORMAL') {
    const result = minimaxSearch(board, aiColor, aiColor, 0, 2, koPoint, [8, 5], false, 4, -Infinity, Infinity);
    if (result.move) return result.move;
    const fallback = generateRankedCandidates(board, aiColor, koPoint, { includeLadderBonus: true, noiseScale: 6 });
    return fallback.length > 0 ? { r: fallback[0].r, c: fallback[0].c } : null;
  }

  // HARD
  const result = minimaxSearch(board, aiColor, aiColor, 0, 3, koPoint, [10, 6, 5], true, 3, -Infinity, Infinity);
  if (result.move) return result.move;
  const fallback = generateRankedCandidates(board, aiColor, koPoint, { includeLadderBonus: true, noiseScale: 3 });
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
