// tetrominoes.ts
import { COLORS } from './constants';
import { ITetromino, TetrominoShape } from './types';

export const TETROMINOS: { [key: string]: { shape: TetrominoShape } } = {
  0: { shape: [[0]] },
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
};

export const randomTetromino = (): ITetromino => {
  const keys = 'IJLOSTZ';
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const randColor = COLORS.PALETTE[Math.floor(Math.random() * COLORS.PALETTE.length)];

  return {
    shape: TETROMINOS[randKey].shape,
    color: randColor,
  };
};