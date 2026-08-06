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

// Simple heuristic AI for Go matches
export function getGoAIMove(
  board: GoBoard,
  aiColor: 'BLACK' | 'WHITE',
  difficulty: 'EASY' | 'NORMAL' | 'HARD',
  koPoint: Point | null = null
): Point | null {
  const size = board.length;
  const opponentColor: 'BLACK' | 'WHITE' = aiColor === 'BLACK' ? 'WHITE' : 'BLACK';

  // 1. Check if we can capture any opponent group in Atari
  const oppAtari = findGroupsInAtari(board, opponentColor);
  if (oppAtari.length > 0) {
    // Sort by largest group
    oppAtari.sort((a, b) => b.stones.length - a.stones.length);
    for (const item of oppAtari) {
      const res = playGoMove(board, item.liberty.r, item.liberty.c, aiColor, koPoint);
      if (res.isLegal && res.capturedCount > 0) {
        return item.liberty;
      }
    }
  }

  // 2. Check if our own groups are in Atari and need escape
  const myAtari = findGroupsInAtari(board, aiColor);
  if (myAtari.length > 0 && difficulty !== 'EASY') {
    myAtari.sort((a, b) => b.stones.length - a.stones.length);
    for (const item of myAtari) {
      const res = playGoMove(board, item.liberty.r, item.liberty.c, aiColor, koPoint);
      if (res.isLegal) {
        // Verify that escaping actually gains more liberties
        const afterGroup = getGroupAndLiberties(res.nextBoard, item.liberty.r, item.liberty.c);
        if (afterGroup.liberties.length > 1 || res.capturedCount > 0) {
          return item.liberty;
        }
      }
    }
  }

  // 3. Evaluate candidate empty spots
  const candidates: { r: number; c: number; score: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'EMPTY') {
        const moveRes = playGoMove(board, r, c, aiColor, koPoint);
        if (!moveRes.isLegal) continue;

        let score = 0;

        // Captures are high value
        score += moveRes.capturedCount * 50;

        const ownGroup = getGroupAndLiberties(moveRes.nextBoard, r, c);
        const liberties = ownGroup.liberties.length;

        // Don't play into self-atari unless easy mode occasionally misses it
        if (liberties === 1 && moveRes.capturedCount === 0) {
          if (difficulty === 'HARD') score -= 200;
          else if (difficulty === 'NORMAL') score -= 100;
        } else {
          score += liberties * 5;
        }

        // Distance from edge heuristic (3rd and 4th line are classic gold territory lines)
        const distR = Math.min(r, size - 1 - r);
        const distC = Math.min(c, size - 1 - c);
        const edgeDist = Math.min(distR, distC);

        if (edgeDist === 0) {
          // 1st line (edge) is generally endgame / bad early on unless capturing
          score -= (difficulty === 'HARD' ? 15 : 5);
        } else if (edgeDist === 1) {
          // 2nd line
          score += 3;
        } else if (edgeDist === 2 || edgeDist === 3) {
          // 3rd or 4th line (Golden territory & influence lines)
          score += 12;
        }

        // Proximity to star points / corners on empty board
        if (size === 9) {
          if ((r === 2 || r === 6) && (c === 2 || c === 6)) score += 15; // 3-3 points
          if (r === 4 && c === 4) score += 10; // Tengen
        } else if (size === 13) {
          if ((r === 3 || r === 9) && (c === 3 || c === 9)) score += 15;
          if (r === 6 && c === 6) score += 10;
        } else if (size === 19) {
          if ((r === 3 || r === 15) && (c === 3 || c === 15)) score += 20; // 4-4 Star points
          if ((r === 2 || r === 16) && (c === 2 || c === 16)) score += 12;
        }

        // Adjacent friendly stones (connection & good shape)
        const neighbors = getAdjacentPoints(r, c, size);
        let friendNeighbors = 0;
        let oppNeighbors = 0;
        for (const n of neighbors) {
          if (board[n.r][n.c] === aiColor) friendNeighbors++;
          else if (board[n.r][n.c] === opponentColor) oppNeighbors++;
        }

        score += friendNeighbors * 6;
        score += oppNeighbors * 4;

        // Opponent group pressure (putting opponent in Atari)
        for (const n of neighbors) {
          if (board[n.r][n.c] === opponentColor) {
            const oppG = getGroupAndLiberties(moveRes.nextBoard, n.r, n.c);
            if (oppG.liberties.length === 1) {
              score += 25; // Good attacking move (Atari)
            }
          }
        }

        // Add small random noise based on difficulty to avoid deterministic repeating
        const noise = difficulty === 'EASY' ? Math.random() * 25 : Math.random() * 6;
        score += noise;

        candidates.push({ r, c, score });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return { r: candidates[0].r, c: candidates[0].c };
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
