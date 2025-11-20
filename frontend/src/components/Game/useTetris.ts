// useTetris.ts
import { useState, useCallback, useEffect } from 'react';
import { randomTetromino } from './tetreominoes';
import Board from './Board';
import { createBoard } from './gameHelper';
import { ITetromino, IPlayer } from './types';
import { useInterval } from './useInterval'; // Importe le hook

export const useTetris = () => {
  // ----------------------
  //  STATE PRINCIPAL
  // ----------------------
  const [board, setBoard] = useState<any[][]>(createBoard());
  const [player, setPlayer] = useState<IPlayer>({
    pos: { x: 3, y: 0 },
    tetromino: randomTetromino().shape,
    color: randomTetromino().color,
    collided: false,
  });

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // ----------------------
  //   COLLISIONS
  // ----------------------
  const checkCollision = useCallback(
    (player: IPlayer, board: any[][], move: { x: number; y: number }) => {
      for (let y = 0; y < player.tetromino.length; y++) {
        for (let x = 0; x < player.tetromino[y].length; x++) {
          if (player.tetromino[y][x] !== 0) {
            const newY = y + player.pos.y + move.y;
            const newX = x + player.pos.x + move.x;

            // Hors limite Y
            if (newY < 0 || newY >= board.length) return true;

            // Hors limite X
            if (newX < 0 || newX >= board[0].length) return true;

            // Collision avec une cellule occupée
            if (board[newY][newX] != 0 && board[newY][newX] != null)
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
  const resetPlayer = useCallback(() => {
    const newTet = randomTetromino();
    // let len = newTet.shape.length;

    // if (player.collided == false) return;
    setPlayer({
      pos: { x: 3, y: 0 },
      tetromino: newTet.shape,
      color: newTet.color,
      collided: false,
    });
  }, []);

  // ----------------------
  //   ROTATION
  // ----------------------
  const rotate = (matrix: number[][]): number[][] =>
    matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());

  const playerRotate = useCallback(
    (board: any[][], dir: number) => {
      const clonedPlayer = JSON.parse(JSON.stringify(player));
      clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);

      if (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
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

  // ----------------------
  //   LOCK DE PIECE
  // ----------------------
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

  // ----------------------
  //   DROP
  // ----------------------
  const drop = useCallback(() => {
    // console.log('FORME', player);
    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      console.log('zebi');
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        collided: false,
      }));
    } else {
      console.log('LFL', player.collided, player);
      // setPlayer((wtf) => ({ ...wtf, collided: true }));
      const newBoard = lockPlayerToBoard(player, board);
      console.log(newBoard);
      const cleanedBoard = sweepRows(newBoard);
      console.log('Clean', cleanedBoard);

      setBoard(cleanedBoard);
      resetPlayer();
      setDropTime(1000);
    }
    if (board[0].some((cell) => cell !== 0 && cell !== null)) {
      setGameOver(true);
      setDropTime(null);
      return;
    }
  }, [
    player,
    board,
    checkCollision,
    resetPlayer,
    setBoard,
    setGameOver,
    setDropTime,
  ]);

  const hardDrop = useCallback(() => {
    const dropRecursively = (currentPlayer: IPlayer) => {
      if (!checkCollision(currentPlayer, board, { x: 0, y: 1 })) {
        const newY = currentPlayer.pos.y + 1;
        const updatedPlayer = {
          ...currentPlayer,
          pos: { x: currentPlayer.pos.x, y: newY },
        };
        console.log('feqfwe');
        setPlayer(updatedPlayer);
        dropRecursively(updatedPlayer);
      } else {
        drop();
      }
    };

    dropRecursively(player);
  }, [player, board, checkCollision, drop]);

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

  // Active le drop automatique
  useInterval(() => {
    drop();
  }, dropTime);

  const startGame = () => {
    setBoard(createBoard());
    // resetPlayer();
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
