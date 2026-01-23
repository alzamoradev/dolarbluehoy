'use client';

import { useState, useCallback } from 'react';
import { Win98Button } from './RetroUI';

// Game constants
const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameStatus = 'playing' | 'won' | 'lost';

const createEmptyBoard = (): CellState[][] => {
  return Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
};

const placeMines = (board: CellState[][], firstRow: number, firstCol: number): void => {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    
    // Don't place mine on first click or adjacent to it
    const isNearFirst = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;
    
    if (!board[row][col].isMine && !isNearFirst) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
};

const calculateAdjacentMines = (board: CellState[][]): void => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col].isMine) continue;
      
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[row][col].adjacentMines = count;
    }
  }
};

const numberColors: { [key: number]: string } = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-800',
  5: 'text-red-800',
  6: 'text-cyan-600',
  7: 'text-black',
  8: 'text-gray-600',
};

export const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard());
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [flagsRemaining, setFlagsRemaining] = useState(MINES);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useState(() => {
    if (timerActive && gameStatus === 'playing') {
      const interval = setInterval(() => {
        setTime(t => Math.min(t + 1, 999));
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  const revealCell = useCallback((board: CellState[][], row: number, col: number): void => {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;

    board[row][col].isRevealed = true;

    if (board[row][col].adjacentMines === 0 && !board[row][col].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(board, row + dr, col + dc);
        }
      }
    }
  }, []);

  const checkWin = (board: CellState[][]): boolean => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!board[row][col].isMine && !board[row][col].isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    if (board[row][col].isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (isFirstClick) {
      setIsFirstClick(false);
      setTimerActive(true);
      placeMines(newBoard, row, col);
      calculateAdjacentMines(newBoard);
    }

    if (newBoard[row][col].isMine) {
      // Game over - reveal all mines
      newBoard.forEach(r => r.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      }));
      setGameStatus('lost');
      setTimerActive(false);
    } else {
      revealCell(newBoard, row, col);
      if (checkWin(newBoard)) {
        setGameStatus('won');
        setTimerActive(false);
      }
    }

    setBoard(newBoard);
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    if (board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const cell = newBoard[row][col];

    if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsRemaining(f => f + 1);
    } else if (flagsRemaining > 0) {
      cell.isFlagged = true;
      setFlagsRemaining(f => f - 1);
    }

    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setGameStatus('playing');
    setIsFirstClick(true);
    setFlagsRemaining(MINES);
    setTime(0);
    setTimerActive(false);
  };

  const getFaceEmoji = () => {
    if (gameStatus === 'won') return '😎';
    if (gameStatus === 'lost') return '😵';
    return '🙂';
  };

  const formatNumber = (num: number): string => {
    return num.toString().padStart(3, '0');
  };

  return (
    <div className="bg-[#c0c0c0] p-2 select-none">
      {/* Header with counters */}
      <div 
        className="flex justify-between items-center mb-2 p-1 border-2"
        style={{ borderColor: '#808080 #fff #fff #808080' }}
      >
        {/* Mine counter */}
        <div 
          className="bg-black text-red-500 font-mono text-xl px-1 border"
          style={{ borderColor: '#808080 #fff #fff #808080' }}
        >
          {formatNumber(flagsRemaining)}
        </div>

        {/* Reset button */}
        <button
          onClick={resetGame}
          className="w-8 h-8 flex items-center justify-center text-lg border-2 active:border-gray-400 bg-[#c0c0c0]"
          style={{ borderColor: '#fff #808080 #808080 #fff' }}
        >
          {getFaceEmoji()}
        </button>

        {/* Timer */}
        <div 
          className="bg-black text-red-500 font-mono text-xl px-1 border"
          style={{ borderColor: '#808080 #fff #fff #808080' }}
        >
          {formatNumber(time)}
        </div>
      </div>

      {/* Game board */}
      <div 
        className="border-2 inline-block"
        style={{ borderColor: '#808080 #fff #fff #808080' }}
      >
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => (
              <button
                key={colIdx}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onContextMenu={(e) => handleRightClick(e, rowIdx, colIdx)}
                className={`w-6 h-6 flex items-center justify-center text-xs font-bold border
                  ${cell.isRevealed 
                    ? 'bg-[#c0c0c0] border-[#808080]' 
                    : 'bg-[#c0c0c0] border-2 active:border-[#808080]'
                  }
                  ${cell.isRevealed && cell.isMine && gameStatus === 'lost' ? 'bg-red-500' : ''}
                `}
                style={!cell.isRevealed ? { borderColor: '#fff #808080 #808080 #fff' } : {}}
                disabled={gameStatus !== 'playing'}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💣' : (
                    cell.adjacentMines > 0 && (
                      <span className={numberColors[cell.adjacentMines]}>
                        {cell.adjacentMines}
                      </span>
                    )
                  )
                ) : (
                  cell.isFlagged && '🚩'
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Game status */}
      {gameStatus !== 'playing' && (
        <div className="mt-2 text-center">
          <p className="font-retro text-sm text-black mb-2">
            {gameStatus === 'won' ? '🎉 ¡Ganaste!' : '💥 Perdiste...'}
          </p>
          <Win98Button onClick={resetGame}>
            Jugar de nuevo
          </Win98Button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-[10px] text-gray-600 font-retro">
        <p>Click izq: revelar | Click der: bandera</p>
      </div>
    </div>
  );
};

