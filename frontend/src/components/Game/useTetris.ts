// useTetris.ts
import { useState, useCallback, useMemo } from 'react';
import { randomTetromino, TETROMINOS } from './tetreominoes';
import { COLORS } from './constants';
import { createBoard } from './gameHelper';
import { IPlayer, BoardGrid, TetrominoShape } from './types';
import { useInterval } from './useInterval'; // Importe le hook

export const useTetris = (initialPieceSequence?: string[] | null) => {
  // ----------------------
  //  STATE PRINCIPAL
  // ----------------------
  const [board, setBoard] = useState<BoardGrid>(createBoard());
  const [player, setPlayer] = useState<IPlayer>({
    pos: { x: 3, y: 0 },
    tetromino: randomTetromino().shape,
    color: randomTetromino().color,
    collided: false,
  });

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  
  const pieceSequence = useMemo(() => initialPieceSequence ?? [], [initialPieceSequence]);
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);

  // ----------------------
  //   COLLISIONS
  // ----------------------
  const checkCollision = useCallback(
    (playerToCheck: IPlayer, boardToCheck: BoardGrid, move: { x: number; y: number }) => {
      for (let y = 0; y < playerToCheck.tetromino.length; y++) {
        for (let x = 0; x < playerToCheck.tetromino[y].length; x++) {
          if (playerToCheck.tetromino[y][x] !== 0) {
            const newY = y + playerToCheck.pos.y + move.y;
            const newX = x + playerToCheck.pos.x + move.x;

            // Hors limite Y
            if (newY < 0 || newY >= boardToCheck.length) return true;

            // Hors limite X
            if (newX < 0 || newX >= boardToCheck[0].length) return true;

            // Collision avec une cellule occupée
            if (boardToCheck[newY][newX] !== null)
              return true;
          }
        }
      }
      return false;
    },
    []
  );

  // ----------------------
  //   RESET / SPAWN
  // ----------------------
  const resetPlayer = useCallback((boardToCheck: BoardGrid) => {
    const newTet = (() => {
      if (pieceSequence && pieceSequence.length > 0) {
        const type = pieceSequence[currentPieceIndex % pieceSequence.length];
        setCurrentPieceIndex((i) => i + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shape = (TETROMINOS as any)[type]?.shape || TETROMINOS['I'].shape;
        const color = COLORS.PALETTE[Math.floor(Math.random() * COLORS.PALETTE.length)];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { shape, color } as any;
      }
      return randomTetromino();
    })();
    
    // On vérifie sur le plateau qu'on vient de calculer (le plus récent)
    // et non sur l'état 'board' qui peut être en retard.
    const isFirstRowOccupied = boardToCheck[0].some(
      (cell) => cell !== null
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

  // ----------------------
  //   ROTATION
  // ----------------------
  const rotate = (matrix: TetrominoShape): TetrominoShape =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse()) as any;

  const playerRotate = useCallback(
    (boardToCheck: BoardGrid, _dir: number) => {
      const clonedPlayer = JSON.parse(JSON.stringify(player));
      clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);

      if (checkCollision(clonedPlayer, boardToCheck, { x: 0, y: 0 })) {
        return;
      }
      console.log('rotate');
      setPlayer(clonedPlayer);
    },
    [player, checkCollision]
  );

  // ----------------------
  //   LIGNES
  // ----------------------
  const sweepRows = useCallback((newBoard: BoardGrid) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned = newBoard.reduce((acc: any[][], row: any[]) => {
      if (row.every((cell) => cell !== null)) {
        acc.unshift(new Array(row.length).fill(null));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    return cleaned;
  }, []);

  // ----------------------
  //   LOCK DE PIECE
  // ----------------------
  const lockPlayerToBoard = useCallback((playerToLock: IPlayer, boardToLock: BoardGrid) => {
    const newBoard = boardToLock.map((row) => [...row]);

    playerToLock.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newBoard[playerToLock.pos.y + y][playerToLock.pos.x + x] = playerToLock.color as any;
        } else {
          // console.log([playerToLock.pos.y + y][playerToLock.pos.x + x]);
        }
      });
    });
    
    return newBoard;
  }, []);
  
  const lockAndReset = useCallback((playerToLock: IPlayer, currentBoard: BoardGrid) => {
    const newBoard = lockPlayerToBoard(playerToLock, currentBoard);
    const cleanedBoard = sweepRows(newBoard);
    
    setBoard(cleanedBoard);
    resetPlayer(cleanedBoard);
    setDropTime(1000);
  }, [lockPlayerToBoard, resetPlayer, sweepRows]);

  // ----------------------
  //   DROP
  // ----------------------
  const drop = useCallback(() => {
    if (!checkCollision(player, board, { x: 0, y: 1 })) {
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
      // Utilisation de la fonction modulaire
      lockAndReset(player, board);
    }
  }, [player, board, checkCollision, lockAndReset, setGameOver, setDropTime]);


  const hardDrop = useCallback(() => {
    const virtualPlayer = JSON.parse(JSON.stringify(player));

    while (!checkCollision(virtualPlayer, board, { x: 0, y: 1 })) {
      virtualPlayer.pos.y += 1;
    }

    lockAndReset(virtualPlayer, board);
    
  }, [player, board, checkCollision, lockAndReset]);

  const movePlayer = useCallback(
    (dir: number) => {
      if (!checkCollision(player, board, { x: dir, y: 0 })) {
        console.log('samer');
        setPlayer((prev) => ({
          ...prev,
          pos: { x: prev.pos.x + dir, y: prev.pos.y },
        }));
      }
    },
    [player, board, checkCollision]
  );

  // ----------------------
  //   START GAME
  // ----------------------

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
  };
};
