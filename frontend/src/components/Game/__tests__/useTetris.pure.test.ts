import { describe, it, expect } from 'vitest';
import { createBoard } from '../gameHelper';
import { TETROMINOS } from '../tetreominoes';
import {
  checkCollisionPure,
  rotateMatrix,
  computeMove,
  computeRotate,
  computeHardDrop,
  addPenaltyLinesPure,
} from '../useTetris';

describe('useTetris pure helpers', () => {
  it('rotateMatrix rotates a matrix clockwise', () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    const r = rotateMatrix(m);
    expect(r).toEqual([
      [3, 1],
      [4, 2],
    ]);
  });

  it('computeMove returns moved player or null at boundary', () => {
    const board = createBoard();
    const player: any = {
      pos: { x: 3, y: 0 },
      tetromino: TETROMINOS.O.shape,
      color: 'red',
      collided: false,
    };

    const moved = computeMove(player, board, -1);
    expect(moved).not.toBeNull();
    if (moved) expect(moved.pos.x).toBe(2);

    const leftEdge: any = { ...player, pos: { x: 0, y: 0 } };
    const cant = computeMove(leftEdge, board, -1);
    expect(cant).toBeNull();
  });

  it('computeRotate rotates tetromino when space available', () => {
    const board = createBoard();
    const player: any = {
      pos: { x: 3, y: 0 },
      tetromino: TETROMINOS.T.shape,
      color: 'blue',
      collided: false,
    };

    const rotated = computeRotate(player, board);
    expect(rotated === null).toBe(false);
    if (rotated) expect(rotated.tetromino).toBeDefined();
  });

  it('computeHardDrop lands player above filled rows', () => {
    const board = createBoard();
    const height = board.length;
    for (let x = 0; x < board[0].length; x++) board[height - 1][x] = '#';

    const player: any = {
      pos: { x: 3, y: 0 },
      tetromino: TETROMINOS.O.shape,
      color: 'green',
      collided: false,
    };

    const landed = computeHardDrop(player, board);
    expect(landed.pos.y).toBeGreaterThan(0);
    expect(landed.pos.y + player.tetromino.length - 1).toBeLessThan(height - 1);
  });

  it('checkCollisionPure detects collisions correctly', () => {
    const board = createBoard();
    board[0][5] = '#';

    const player: any = {
      pos: { x: 4, y: 0 },
      tetromino: [[1,1]],
      color: 'x',
      collided: false,
    };

    const collides = checkCollisionPure(player, board, { x: 1, y: 0 });
    expect(collides).toBe(true);

    const ok = checkCollisionPure(player, board, { x: -1, y: 0 });
    expect(ok).toBe(false);
  });

  it('addPenaltyLinesPure stacks penalty rows at bottom', () => {
    const board = createBoard();
    const withOne = addPenaltyLinesPure(board, 1);
    const h = withOne.length;
    expect(withOne[h - 1].every((c:any) => c === '#808080')).toBe(true);

    const withThree = addPenaltyLinesPure(withOne, 2);
    expect(withThree[h - 1].every((c:any) => c === '#808080')).toBe(true);
    expect(withThree[h - 2].every((c:any) => c === '#808080')).toBe(true);
    expect(withThree[h - 3].every((c:any) => c === '#808080')).toBe(true);
  });
});
