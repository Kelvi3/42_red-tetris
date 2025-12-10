export type TetrominoShape = (string | number)[][];

export interface ITetromino {
  shape: TetrominoShape;
  color: string;
}

export interface IPlayer {
  pos: { x: number; y: number };
  tetromino: TetrominoShape;
  color: string;
  collided: boolean;
}

export type BoardGrid = (string | null)[][];