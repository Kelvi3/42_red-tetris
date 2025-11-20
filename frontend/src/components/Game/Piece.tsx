// types.ts
type Piece = {
  shape: number[][];
  color: string;
};

// pieces.ts
export const PIECES: { [key: string]: Piece } = {
  I: {
    shape: [
      [1, 1, 1, 1]
    ],
    color: '#A020F0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFD700'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080'
  }
};