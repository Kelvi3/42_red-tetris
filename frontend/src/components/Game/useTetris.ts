import { useState, useCallback, useEffect } from 'react';
import { randomTetromino, TETROMINOS } from './tetreominoes';
import { COLORS } from './constants';
import { createBoard } from './gameHelper';
import { IPlayer } from './types';
import { useInterval } from './useInterval';

// Start-Pure Functions
export const checkCollisionPure = (player: IPlayer, board: any[][], move: { x: number; y: number }) => {
  for (let y = 0; y < player.tetromino.length; y++) {
    for (let x = 0; x < player.tetromino[y].length; x++) {
      if (player.tetromino[y][x] !== 0) {
        const newY = y + player.pos.y + move.y;
        const newX = x + player.pos.x + move.x;

        if (newY < 0 || newY >= board.length) return true;
        if (newX < 0 || newX >= board[0].length) return true;
        if (board[newY][newX] != 0 && board[newY][newX] != null) return true;
      }
    }
  }
  return false;
};

export const rotateMatrix = (matrix: number[][]): number[][] =>
  matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());

export const computeMove = (player: IPlayer, board: any[][], dir: number): IPlayer | null => {
  const cloned = JSON.parse(JSON.stringify(player)) as IPlayer;
  cloned.pos.x += dir;
  if (!checkCollisionPure(cloned, board, { x: 0, y: 0 })) return cloned;
  return null;
};

export const computeRotate = (player: IPlayer, board: any[][]): IPlayer | null => {
  const clonedPlayer = JSON.parse(JSON.stringify(player)) as IPlayer;
  clonedPlayer.tetromino = rotateMatrix(clonedPlayer.tetromino as number[][]);

  const pos = clonedPlayer.pos.x;
  let offset = 1;
  while (checkCollisionPure(clonedPlayer, board, { x: 0, y: 0 })) {
    clonedPlayer.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > (clonedPlayer.tetromino[0] as any).length) {
      // rotate back
      clonedPlayer.tetromino = rotateMatrix(clonedPlayer.tetromino as number[][]);
      clonedPlayer.pos.x = pos;
      return null;
    }
  }

  return clonedPlayer;
};

export const computeHardDrop = (player: IPlayer, board: any[][]): IPlayer => {
  const virtualPlayer = JSON.parse(JSON.stringify(player)) as IPlayer;
  while (!checkCollisionPure(virtualPlayer, board, { x: 0, y: 1 })) {
    virtualPlayer.pos.y += 1;
  }
  return virtualPlayer;
};

export const addPenaltyLinesPure = (board: any[][], n: number) => {
  const newBoard = board.map(row => [...row]);
  const width = newBoard[0].length;
  const height = newBoard.length;

  // Count existing penalty rows at bottom
  let existingPenalty = 0;
  for (let i = height - 1; i >= 0; i--) {
    const row = newBoard[i];
    if (row.every(cell => cell === '#808080')) existingPenalty++;
    else break;
  }

  // Add new penalty rows above existing penalty rows, stacking them
  for (let i = 0; i < n; i++) {
    const rowIndex = height - 1 - existingPenalty - i;
    if (rowIndex >= 0) {
      newBoard[rowIndex] = new Array(width).fill('#808080');
    } else {
      newBoard[0] = new Array(width).fill('#808080');
    }
  }

  return newBoard;
};
// End-Pure Functions


export const useTetris = (initialPieceSequence?: string[] | null, onRowsCleared?: (n: number) => void) => {
  const [board, setBoard] = useState<any[][]>(createBoard());
  const [player, setPlayer] = useState<IPlayer>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    color: '',
    collided: false,
  });

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const pieceSequence = initialPieceSequence ?? [];
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);

  // The hook will use the pure helpers defined below via wrappers.

  const resetPlayer = useCallback((boardToCheck: any[][]) => {
    const newTet = (() => {
      if (pieceSequence && pieceSequence.length > 0) {
        const type = pieceSequence[currentPieceIndex % pieceSequence.length];
        setCurrentPieceIndex((i) => i + 1);
        const color = COLORS.PALETTE[Math.floor(Math.random() * COLORS.PALETTE.length)];
        const shape = TETROMINOS[type]?.shape || TETROMINOS['I'].shape;
        return { shape, color } as any;
      }
      return randomTetromino();
    })();
    
    const isFirstRowOccupied = boardToCheck[0].some(
      (cell: any) => cell !== 0 && cell !== null
    );

    if (isFirstRowOccupied) {
      setGameOver(true);
      setDropTime(null);
    } else {
      setPlayer({
        pos: { x: 3, y: 0 },
        tetromino: newTet.shape,
        color: newTet.color,
        collided: false,
      });
    }
  }, [pieceSequence, currentPieceIndex]);

  const rotate = (matrix: number[][]): number[][] =>
    matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());

  const playerRotate = useCallback(
    (board: any[][], dir: number) => {
      const rotated = computeRotate(player, board);
      if (rotated) setPlayer(rotated);
    },
    [player]
  );

  const sweepRows = (newBoard: any[][]) => {
    let rowsCleared = 0;

    const cleaned = newBoard.reduce((acc: any[][], row: any[]) => {
      const isPenalty = row.every(cell => cell === '#808080');
      if (row.every((cell) => cell !== 0 && cell !== null) && !isPenalty) {
        rowsCleared++;
        acc.unshift(new Array(row.length).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    if (rowsCleared > 0 && onRowsCleared)
      onRowsCleared(rowsCleared);

    return cleaned;
  };

  const lockPlayerToBoard = (player: IPlayer, board: any[][]) => {
    const newBoard = board.map((row) => [...row]);

    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[player.pos.y + y][player.pos.x + x] = player.color;
        }
      });
    });
    
    return newBoard;
  };
  
  const lockAndReset = useCallback((playerToLock: IPlayer, currentBoard: any[][]) => {
    const newBoard = lockPlayerToBoard(playerToLock, currentBoard);
    const cleanedBoard = sweepRows(newBoard);
    
    setBoard(cleanedBoard);
    resetPlayer(cleanedBoard);
    setDropTime(1000);
  }, [lockPlayerToBoard, resetPlayer, setBoard, setDropTime]);

  const drop = useCallback(() => {
    if (!checkCollisionPure(player, board, { x: 0, y: 1 })) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        collided: false,
      }));
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      lockAndReset(player, board);
    }
  }, [player, board, lockAndReset, setGameOver, setDropTime]);


  const hardDrop = useCallback(() => {
    const virtualPlayer = computeHardDrop(player, board);
    lockAndReset(virtualPlayer, board);
  }, [player, board, lockAndReset]);

  const movePlayer = useCallback(
    (dir: number) => {
      const moved = computeMove(player, board, dir);
      if (moved) setPlayer(moved);
    },
    [player, board]
  );

  const addPenaltyLines = useCallback((n: number) => {
    setBoard(prev => {
       const newBoard = prev.map(row => [...row]);
       const width = newBoard[0].length;
       const height = newBoard.length;

       // Count existing penalty rows at bottom
       let existingPenalty = 0;
       for (let i = height - 1; i >= 0; i--) {
         const row = newBoard[i];
         if (row.every(cell => cell === '#808080')) existingPenalty++;
         else break;
       }

       // Add new penalty rows above existing penalty rows, stacking them
       for (let i = 0; i < n; i++) {
         const rowIndex = height - 1 - existingPenalty - i;
         if (rowIndex >= 0) {
           newBoard[rowIndex] = new Array(width).fill('#808080');
         } else {
           // no more space above: overwrite top row (will be handled as game over elsewhere)
           newBoard[0] = new Array(width).fill('#808080');
         }
       }

       return newBoard;
    });
  }, []);

  useInterval(() => {
    drop();
  }, dropTime);

  const startGame = () => {
    const newBoard = createBoard();
    setBoard(newBoard);
    resetPlayer(newBoard);
    setGameOver(false);
    setDropTime(1000);
  };

  return {
    player,
    board,
    gameOver,
    movePlayer,
    drop,
    hardDrop,
    playerRotate,
    setDropTime,
    startGame,
    addPenaltyLines,
    // Allow external components to apply pure-computed player changes
    applyPlayer: (newPlayer: IPlayer) => setPlayer(newPlayer),
    // Allow external components to lock a player and trigger board reset
    applyLockAndReset: (playerToLock: IPlayer) => lockAndReset(playerToLock, board)
  };
};
