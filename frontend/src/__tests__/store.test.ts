import { describe, it, expect, vi } from 'vitest';
import { useAppDispatch, useAppSelector } from '../store';

vi.mock('../reducers', () => ({
  default: (state = {}) => state,
}));

vi.mock('../../middlewares/storeStateMiddleWare', () => ({
  storeStateMiddleWare: () => (next: any) => (action: any) => next(action),
}));

describe('store', () => {
  it('should export useAppDispatch hook', () => {
    expect(typeof useAppDispatch).toBe('function');
  });

  it('should export useAppSelector hook', () => {
    expect(typeof useAppSelector).toBe('function');
  });
});
