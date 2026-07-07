const TOTAL_PITS = 14;
const P1_STORE = 6;
const P2_STORE = 13;

export const simulateMove = (board: number[], startIndex: number, playerTurn: number) => {
    let newBoard = [...board];
    let seeds = newBoard[startIndex];
    newBoard[startIndex] = 0;
    
    let currentIndex = startIndex;
    while (seeds > 0) {
        currentIndex = (currentIndex + 1) % TOTAL_PITS;
        if (playerTurn === 1 && currentIndex === P2_STORE) continue;
        if (playerTurn === 2 && currentIndex === P1_STORE) continue;
        
        newBoard[currentIndex]++;
        seeds--;
    }
    
    let nextTurn = playerTurn === 1 ? 2 : 1;
    let extraTurn = false;
    
    if ((playerTurn === 1 && currentIndex === P1_STORE) || (playerTurn === 2 && currentIndex === P2_STORE)) {
        nextTurn = playerTurn;
        extraTurn = true;
    } else if (
        newBoard[currentIndex] === 1 &&
        ((playerTurn === 1 && currentIndex >= 0 && currentIndex <= 5) || 
         (playerTurn === 2 && currentIndex >= 7 && currentIndex <= 12))
    ) {
        const oppositeIndex = 12 - currentIndex;
        if (newBoard[oppositeIndex] > 0) {
            const captured = newBoard[oppositeIndex] + 1;
            newBoard[oppositeIndex] = 0;
            newBoard[currentIndex] = 0;
            newBoard[playerTurn === 1 ? P1_STORE : P2_STORE] += captured;
        }
    }
    
    const p1Empty = newBoard.slice(0, 6).every(s => s === 0);
    const p2Empty = newBoard.slice(7, 13).every(s => s === 0);
    let isGameOver = false;
    if (p1Empty || p2Empty) {
        isGameOver = true;
        let p1Rem = 0;
        for(let i=0; i<6; i++) { p1Rem += newBoard[i]; newBoard[i] = 0; }
        let p2Rem = 0;
        for(let i=7; i<13; i++) { p2Rem += newBoard[i]; newBoard[i] = 0; }
        newBoard[P1_STORE] += p1Rem;
        newBoard[P2_STORE] += p2Rem;
    }
    
    return { newBoard, nextTurn, extraTurn, isGameOver };
};

const minimax = (board: number[], depth: number, alpha: number, beta: number, maximizingPlayer: boolean, playerTurn: number): number => {
    const p1Empty = board.slice(0, 6).every(s => s === 0);
    const p2Empty = board.slice(7, 13).every(s => s === 0);
    if (depth === 0 || p1Empty || p2Empty) {
        let evalScore = board[P2_STORE] - board[P1_STORE];
        if (!(p1Empty || p2Empty)) {
           let p1Rem = 0; for(let i=0; i<6; i++) p1Rem += board[i];
           let p2Rem = 0; for(let i=7; i<13; i++) p2Rem += board[i];
           evalScore += (p2Rem - p1Rem) * 0.5;
        }
        return evalScore;
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let i = 7; i <= 12; i++) {
            if (board[i] === 0) continue;
            const { newBoard, nextTurn, isGameOver } = simulateMove(board, i, playerTurn);
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, nextTurn === 2, nextTurn);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval === -Infinity ? -1000 : maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i <= 5; i++) {
            if (board[i] === 0) continue;
            const { newBoard, nextTurn, isGameOver } = simulateMove(board, i, playerTurn);
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, nextTurn === 2, nextTurn);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval === Infinity ? 1000 : minEval;
    }
};

export const getAdvancedMove = (board: number[]): number => {
    let bestMove = -1;
    let maxEval = -Infinity;
    
    const validMoves = [];
    for(let i=7; i<=12; i++) if (board[i] > 0) validMoves.push(i);
    
    if (validMoves.length === 0) return -1;
    if (validMoves.length === 1) return validMoves[0];

    // depth 7 might take around a few hundred milliseconds depending on branches
    for (const i of validMoves) {
        const { newBoard, nextTurn } = simulateMove(board, i, 2);
        const evalScore = minimax(newBoard, 7, -Infinity, Infinity, nextTurn === 2, nextTurn);
        if (evalScore > maxEval) {
            maxEval = evalScore;
            bestMove = i;
        }
    }
    
    return bestMove === -1 ? validMoves[0] : bestMove;
};

export const getNormalMove = (board: number[]): number => {
    const validMoves = [];
    for(let i=7; i<=12; i++) if (board[i] > 0) validMoves.push(i);

    if (validMoves.length === 0) return -1;

    let bestMove = validMoves[0];
    let bestScore = -1;

    for (const m of validMoves) {
        let score = 0;
        let seeds = board[m];
        
        let steps = seeds;
        let curr = m;
        while(steps > 0) {
            curr = (curr + 1) % 14;
            if (curr !== P1_STORE) steps--;
        }
        
        if (curr === P2_STORE) score += 50; // Free turn
        if (board[curr] === 0 && curr >= 7 && curr <= 12 && board[12-curr] > 0) score += 20 + board[12-curr]; // Capture
        
        score += Math.random() * 5; // Randomness

        if (score > bestScore) {
            bestScore = score;
            bestMove = m;
        }
    }
    return bestMove;
};
