export type Cell = "X" | "O" | null;
export type Board = Cell[];
export type Difficulty = "easy" | "medium" | "impossible";

export const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board: Board): { winner: Cell; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isDraw(board: Board): boolean {
  return board.every((c) => c !== null) && !checkWinner(board).winner;
}

export function availableMoves(board: Board): number[] {
  return board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
}

// Minimax with alpha-beta pruning. AI is "O", human is "X".
function minimax(
  board: Board,
  depth: number,
  isMax: boolean,
  alpha: number,
  beta: number,
  ai: "X" | "O",
  human: "X" | "O",
): number {
  const { winner } = checkWinner(board);
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (availableMoves(board).length === 0) return 0;

  if (isMax) {
    let best = -Infinity;
    for (const i of availableMoves(board)) {
      board[i] = ai;
      best = Math.max(best, minimax(board, depth + 1, false, alpha, beta, ai, human));
      board[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of availableMoves(board)) {
      board[i] = human;
      best = Math.min(best, minimax(board, depth + 1, true, alpha, beta, ai, human));
      board[i] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function bestMove(board: Board, ai: "X" | "O" = "O"): number {
  const human: "X" | "O" = ai === "O" ? "X" : "O";
  let best = -Infinity;
  let move = -1;
  for (const i of availableMoves(board)) {
    const copy = [...board];
    copy[i] = ai;
    const score = minimax(copy, 0, false, -Infinity, Infinity, ai, human);
    if (score > best) {
      best = score;
      move = i;
    }
  }
  return move;
}

export function randomMove(board: Board): number {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

export function chooseAIMove(board: Board, difficulty: Difficulty): number {
  if (difficulty === "easy") {
    // 80% random, 20% optimal
    return Math.random() < 0.8 ? randomMove(board) : bestMove(board);
  }
  if (difficulty === "medium") {
    // 50/50
    return Math.random() < 0.5 ? randomMove(board) : bestMove(board);
  }
  return bestMove(board);
}
