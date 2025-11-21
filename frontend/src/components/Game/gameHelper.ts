// gameHelpers.ts
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { BoardGrid, IPlayer } from './types';

export const createBoard = (): BoardGrid =>
  Array.from(Array(BOARD_HEIGHT), () =>
    new Array(BOARD_WIDTH).fill(null) // null signifie vide
  );

export const checkCollision = (
  player: IPlayer,
  board: BoardGrid,
  { x: moveX, y: moveY }: { x: number; y: number }
): boolean => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Vérifier qu'on est sur une cellule de la pièce (pas du vide dans la matrice 3x3 ou 4x4)
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Vérifier qu'on est dans les limites verticales du plateau
          !board[y + player.pos.y + moveY] ||
          // 3. Vérifier qu'on est dans les limites horizontales
          !board[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Vérifier que la cellule cible n'est pas déjà occupée (non null)
          board[y + player.pos.y + moveY][x + player.pos.x + moveX] !== null
        ) {
          return true;
        }
      }
    }
  }
  return false;
};