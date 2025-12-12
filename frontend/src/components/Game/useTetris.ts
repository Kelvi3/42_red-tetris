import { useState, useCallback, useEffect } from 'react';
import { randomTetromino, TETROMINOS } from './tetreominoes';
import { COLORS } from './constants';
import { createBoard } from './gameHelper';
import { IPlayer } from './types';
import { useInterval } from './useInterval';

export const useTetris = (initialPieceSequence?: string[] | null) => {
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

  const checkCollision = useCallback(
    (player: IPlayer, board: any[][], move: { x: number; y: number }) => {
      for (let y = 0; y < player.tetromino.length; y++) {
        for (let x = 0; x < player.tetromino[y].length; x++) {
          if (player.tetromino[y][x] !== 0) {
            const newY = y + player.pos.y + move.y;
            const newX = x + player.pos.x + move.x;

            if (newY < 0 || newY >= board.length) return true;

            if (newX < 0 || newX >= board[0].length) return true;

            if (board[newY][newX] != 0 && board[newY][newX] != null)
              return true;
          }
        }
      }
      return false;
    },
    []
  );

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
      const clonedPlayer = JSON.parse(JSON.stringify(player));
      clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);

      const pos = clonedPlayer.pos.x;
      let offset = 1;
      while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
        clonedPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > clonedPlayer.tetromino[0].length) {
          rotate(clonedPlayer.tetromino);
          clonedPlayer.pos.x = pos;
          return;
        }
      }
      setPlayer(clonedPlayer);
    },
    [player, checkCollision]
  );

  const sweepRows = (newBoard: any[][]) => {
    let rowsCleared = 0;

    const cleaned = newBoard.reduce((acc: any[][], row: any[]) => {
      if (row.every((cell) => cell !== 0 && cell !== null)) {
        rowsCleared++;
        acc.unshift(new Array(row.length).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    return cleaned;
  };

  const lockPlayerToBoard = (player: IPlayer, board: any[][]) => {
    const newBoard = board.map((row) => [...row]);

    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[player.pos.y + y][player.pos.x + x] = player.color;
        } else {
          console.log([player.pos.y + y][player.pos.x + x]);
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
      lockAndReset(player, board);
    }
  }, [player, board, checkCollision, lockAndReset, setGameOver, setDropTime]);


  const hardDrop = useCallback(() => {
    let virtualPlayer = JSON.parse(JSON.stringify(player));

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
