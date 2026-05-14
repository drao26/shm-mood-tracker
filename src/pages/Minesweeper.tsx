import { useMemo, useState } from 'react';
import Button95 from '../components/Button95';

type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

interface Cell {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, (): Cell => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    }))
  );
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function countAdjacentMines(board: Cell[][], row: number, col: number) {
  let count = 0;

  for (let adjacentRow = row - 1; adjacentRow <= row + 1; adjacentRow += 1) {
    for (let adjacentCol = col - 1; adjacentCol <= col + 1; adjacentCol += 1) {
      if (adjacentRow === row && adjacentCol === col) continue;
      if (adjacentRow < 0 || adjacentRow >= ROWS || adjacentCol < 0 || adjacentCol >= COLS) continue;
      if (board[adjacentRow][adjacentCol].mine) count += 1;
    }
  }

  return count;
}

function createBoard(safeRow: number, safeCol: number) {
  const board = createEmptyBoard();
  let placed = 0;

  while (placed < MINE_COUNT) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);

    if ((row === safeRow && col === safeCol) || board[row][col].mine) continue;

    board[row][col].mine = true;
    placed += 1;
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (board[row][col].mine) continue;
      board[row][col].adjacent = countAdjacentMines(board, row, col);
    }
  }

  return board;
}

function revealArea(board: Cell[][], startRow: number, startCol: number) {
  const stack: Array<[number, number]> = [[startRow, startCol]];

  while (stack.length > 0) {
    const [row, col] = stack.pop()!;

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;

    const cell = board[row][col];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;

    if (cell.mine || cell.adjacent !== 0) continue;

    for (let adjacentRow = row - 1; adjacentRow <= row + 1; adjacentRow += 1) {
      for (let adjacentCol = col - 1; adjacentCol <= col + 1; adjacentCol += 1) {
        if (adjacentRow === row && adjacentCol === col) continue;
        stack.push([adjacentRow, adjacentCol]);
      }
    }
  }
}

function revealAllMines(board: Cell[][]) {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      revealed: cell.mine ? true : cell.revealed,
    }))
  );
}

function hasWon(board: Cell[][]) {
  return board.every((row) => row.every((cell) => cell.mine || cell.revealed));
}

const numberColors: Record<number, string> = {
  1: '#0000aa',
  2: '#107c10',
  3: '#c50f1f',
  4: '#5c2d91',
  5: '#8b4513',
  6: '#008080',
  7: '#111111',
  8: '#6e6a7a',
};

export default function Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard);
  const [status, setStatus] = useState<GameStatus>('ready');

  const flaggedCount = useMemo(
    () => board.flat().filter((cell) => cell.flagged).length,
    [board]
  );

  const minesRemaining = MINE_COUNT - flaggedCount;

  function resetGame() {
    setBoard(createEmptyBoard());
    setStatus('ready');
  }

  function handleReveal(row: number, col: number) {
    if (status === 'won' || status === 'lost') return;

    let nextStatus: GameStatus = status;

    setBoard((currentBoard) => {
      let nextBoard = cloneBoard(currentBoard);
      const clickedCell = nextBoard[row][col];

      if (clickedCell.flagged || clickedCell.revealed) {
        return currentBoard;
      }

      if (status === 'ready') {
        nextBoard = createBoard(row, col);
        nextStatus = 'playing';
      }

      if (nextBoard[row][col].mine) {
        nextStatus = 'lost';
        return revealAllMines(nextBoard);
      }

      revealArea(nextBoard, row, col);

      if (hasWon(nextBoard)) {
        nextStatus = 'won';
      }

      return nextBoard;
    });

    setStatus(nextStatus);
  }

  function handleFlagToggle(row: number, col: number) {
    if (status === 'won' || status === 'lost') return;

    setBoard((currentBoard) => {
      const nextBoard = cloneBoard(currentBoard);
      const cell = nextBoard[row][col];

      if (cell.revealed) return currentBoard;
      if (!cell.flagged && flaggedCount >= MINE_COUNT) return currentBoard;

      cell.flagged = !cell.flagged;
      return nextBoard;
    });
  }

  const statusText = {
    ready: 'left click to reveal · right click to flag',
    playing: 'clear every safe square to win',
    won: 'you cleared the field! ✨',
    lost: 'boom! click new game to try again',
  }[status];

  return (
    <div className="flex flex-col items-center gap-3 text-[11px] text-[var(--text)]">
      <div className="w-full max-w-[280px] border-2 border95-outset bg-[var(--chrome)] p-[6px]">
        <div className="border-2 border95-inset bg-[var(--chrome)] p-[6px]">
          <div className="mb-[6px] flex items-center justify-between gap-2 border-2 border95-inset bg-[var(--chrome)] px-2 py-1">
            <div className="min-w-[52px] bg-black px-1 py-[2px] text-center text-[14px] font-bold tracking-[1px] text-[#ff2b2b]">
              {String(Math.max(minesRemaining, 0)).padStart(3, '0')}
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="flex h-[30px] w-[30px] items-center justify-center border-2 border95-outset bg-[var(--chrome)] text-[18px] leading-none active:border95-inset"
              aria-label="Start a new game"
            >
              {status === 'lost' ? '☠' : status === 'won' ? '😎' : '🙂'}
            </button>
            <div className="min-w-[52px] bg-black px-1 py-[2px] text-center text-[14px] font-bold tracking-[1px] text-[#ff2b2b]">
              {String(
                board.flat().filter((cell) => cell.revealed && !cell.mine).length
              ).padStart(3, '0')}
            </div>
          </div>

          <div
            className="grid border-2 border95-inset bg-[var(--chrome-dark)]"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isExploded = status === 'lost' && cell.mine;
                const displayValue = cell.flagged
                  ? '🚩'
                  : cell.revealed && cell.mine
                    ? '💣'
                    : cell.revealed && cell.adjacent > 0
                      ? cell.adjacent
                      : '';

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() => handleReveal(rowIndex, colIndex)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      handleFlagToggle(rowIndex, colIndex);
                    }}
                    className={`flex h-[26px] w-[26px] items-center justify-center border text-[14px] font-bold leading-none ${
                      cell.revealed
                        ? 'border95-inset bg-[#d7d2dc]'
                        : 'border95-outset bg-[var(--chrome)] active:border95-inset'
                    } ${isExploded ? 'bg-[#f8c5c5]' : ''}`}
                    style={{
                      color: typeof displayValue === 'number' ? numberColors[displayValue] : 'inherit',
                    }}
                    aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                  >
                    {displayValue}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <p className="m-0 text-center">{statusText}</p>
      <div className="flex items-center gap-2">
        <Button95 onClick={resetGame}>new game</Button95>
        <span>mines: {MINE_COUNT}</span>
      </div>
    </div>
  );
}
