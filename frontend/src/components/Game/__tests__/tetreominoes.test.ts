import { describe, it, expect, vi } from 'vitest';
import { TETROMINOS, randomTetromino } from '../tetreominoes';
import { COLORS } from '../constants';

describe('TETROMINOS', () => {
  it('should have all tetromino shapes defined', () => {
    expect(TETROMINOS['0']).toBeDefined();
    expect(TETROMINOS['I']).toBeDefined();
    expect(TETROMINOS['J']).toBeDefined();
    expect(TETROMINOS['L']).toBeDefined();
    expect(TETROMINOS['O']).toBeDefined();
    expect(TETROMINOS['S']).toBeDefined();
    expect(TETROMINOS['T']).toBeDefined();
    expect(TETROMINOS['Z']).toBeDefined();
  });

  it('should have correct I tetromino shape', () => {
    expect(TETROMINOS['I'].shape).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  it('should have correct O tetromino shape', () => {
    expect(TETROMINOS['O'].shape).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  it('should have correct T tetromino shape', () => {
    expect(TETROMINOS['T'].shape).toEqual([
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ]);
  });
});

describe('randomTetromino', () => {
  it('should return a tetromino with shape and color', () => {
    const tetromino = randomTetromino();
    expect(tetromino).toHaveProperty('shape');
    expect(tetromino).toHaveProperty('color');
    expect(Array.isArray(tetromino.shape)).toBe(true);
    expect(typeof tetromino.color).toBe('string');
  });

  it('should return different tetrominos on multiple calls', () => {
    const tetrominos = Array.from({ length: 10 }, () => randomTetromino());
    const shapes = tetrominos.map(t => JSON.stringify(t.shape));
    const uniqueShapes = new Set(shapes);
    expect(uniqueShapes.size).toBeGreaterThan(1);
  });

  it('should return a color from the palette', () => {
    const tetromino = randomTetromino();
    expect(COLORS.PALETTE).toContain(tetromino.color);
  });

  it('should return valid tetromino shapes', () => {
    const validKeys = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const tetromino = randomTetromino();
    const isValid = validKeys.some(key => 
      JSON.stringify(TETROMINOS[key].shape) === JSON.stringify(tetromino.shape)
    );
    expect(isValid).toBe(true);
  });
});
