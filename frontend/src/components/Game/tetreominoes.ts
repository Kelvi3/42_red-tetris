// tetrominoes.ts
import { COLORS } from './constants';
import { ITetromino, TetrominoShape } from './types';

export const TETROMINOS: { [key: string]: { shape: TetrominoShape } } = {
  I: { shape: [[1, 1, 1, 1]] },
  J: { shape: [[1, 0, 0], [1, 1, 1]] },
  L: { shape: [[0, 0, 1], [1, 1, 1]] },
  O: { shape: [[1, 1], [1, 1]] },
  S: { shape: [[0, 1, 1], [1, 1, 0]] },
  T: { shape: [[0, 1, 0], [1, 1, 1]] },
  Z: { shape: [[1, 1, 0], [0, 1, 1]] },
};

export const randomTetromino = (): ITetromino => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const randColor = COLORS.PALETTE[Math.floor(Math.random() * COLORS.PALETTE.length)];

  return {
    shape: TETROMINOS[randKey].shape,
    color: randColor,
  };
};