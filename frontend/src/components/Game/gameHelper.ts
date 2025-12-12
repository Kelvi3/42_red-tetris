import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { BoardGrid, IPlayer } from './types';

export const createBoard = (): BoardGrid =>
  Array.from(Array(BOARD_HEIGHT), () =>
    new Array(BOARD_WIDTH).fill(null)
  );

export const checkCollision = (
  player: IPlayer,
  board: BoardGrid,
  { x: moveX, y: moveY }: { x: number; y: number }
): boolean => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      if (player.tetromino[y][x] !== 0) {
        const targetRow = board[y + player.pos.y + moveY];
        const targetCell = targetRow && targetRow[x + player.pos.x + moveX];
        if (typeof targetRow === 'undefined' || typeof targetCell === 'undefined' || targetCell !== null) {
          return true;
        }
      }
    }
  }
  return false;
};