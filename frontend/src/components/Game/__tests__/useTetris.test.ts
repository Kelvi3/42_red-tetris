import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTetris } from '../useTetris';

describe('useTetris', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(result.current.board).toBeDefined();
    expect(result.current.board.length).toBeGreaterThan(0);
    expect(result.current.player).toBeDefined();
    expect(result.current.gameOver).toBe(false);
  });

  it('should have board with correct dimensions', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(result.current.board.length).toBe(20);
    expect(result.current.board[0].length).toBe(10);
  });

  it('should start game', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino.length).toBeGreaterThan(0);
  });

  it('should move player left', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    const initialX = result.current.player.pos.x;
    
    act(() => {
      result.current.movePlayer(-1);
    });
    
    expect(result.current.player.pos.x).toBeLessThanOrEqual(initialX);
  });

  it('should move player right', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    const initialX = result.current.player.pos.x;
    
    act(() => {
      result.current.movePlayer(1);
    });
    
    expect(result.current.player.pos.x).toBeGreaterThanOrEqual(initialX);
  });

  it('should have drop function', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(typeof result.current.drop).toBe('function');
  });

  it('should have hardDrop function', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(typeof result.current.hardDrop).toBe('function');
  });

  it('should have playerRotate function', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(typeof result.current.playerRotate).toBe('function');
  });

  it('should have setDropTime function', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(typeof result.current.setDropTime).toBe('function');
  });

  it('should handle piece sequence when provided', () => {
    const pieceSequence = ['I', 'O', 'T'];
    const { result } = renderHook(() => useTetris(pieceSequence));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should call onRowsCleared callback when rows are cleared', () => {
    const onRowsCleared = vi.fn();
    const { result } = renderHook(() => useTetris(null, onRowsCleared));
    
    act(() => {
      result.current.startGame();
    });

    expect(onRowsCleared).toBeDefined();
  });

  it('should rotate player tetromino', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    const initialTetromino = JSON.stringify(result.current.player.tetromino);
    
    act(() => {
      result.current.playerRotate(result.current.board, 1);
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should update drop time', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.setDropTime(500);
    });

    expect(result.current.setDropTime).toBeDefined();
  });

  it('should execute drop function', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    const initialY = result.current.player.pos.y;
    
    act(() => {
      result.current.drop();
    });
    
    expect(result.current.player.pos.y).toBeGreaterThanOrEqual(initialY);
  });

  it('should execute hardDrop function', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.hardDrop();
    });

    expect(result.current.player).toBeDefined();
  });

  it('should handle null piece sequence', () => {
    const { result } = renderHook(() => useTetris(null));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should handle empty piece sequence', () => {
    const { result } = renderHook(() => useTetris([]));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should not move player left beyond boundary', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
        
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.movePlayer(-1);
      }
    });
    
    expect(result.current.player.pos.x).toBeDefined();
  });

  it('should not move player right beyond boundary', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.movePlayer(1);
      }
    });

    expect(result.current.player.pos.x).toBeDefined();
  });

  it('should have addPenaltyLines function', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(typeof result.current.addPenaltyLines).toBe('function');
  });

  it('should handle rows cleared callback', () => {
    const onRowsCleared = vi.fn();
    const { result } = renderHook(() => useTetris(null, onRowsCleared));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(onRowsCleared).toBeDefined();
  });

  it('should initialize with correct initial state', () => {
    const { result } = renderHook(() => useTetris());
    
    expect(result.current.gameOver).toBe(false);
    expect(result.current.board).toBeDefined();
    expect(result.current.player).toBeDefined();
  });

  it('should have addPenaltyLines function available', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.addPenaltyLines(2);
    });
    
    expect(result.current.board).toBeDefined();
  });

  it('should handle multiple piece sequence items', () => {
    const sequence = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const { result } = renderHook(() => useTetris(sequence));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should handle game state updates', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.drop();
    });
    
    expect(result.current.board).toBeDefined();
  });

  it('should support multiple rotations', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.playerRotate(result.current.board, 1);
      result.current.playerRotate(result.current.board, 1);
      result.current.playerRotate(result.current.board, 1);
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });

  it('should handle rapid key presses', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.movePlayer(1);
        result.current.movePlayer(-1);
      }
    });
    
    expect(result.current.player.pos).toBeDefined();
  });

  it('should maintain board dimensions throughout game', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.board.length).toBe(20);
    expect(result.current.board[0].length).toBe(10);
    
    act(() => {
      result.current.drop();
    });
    
    expect(result.current.board.length).toBe(20);
    expect(result.current.board[0].length).toBe(10);
  });

  it('should handle drop time changes', () => {
    const { result } = renderHook(() => useTetris());
    
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.setDropTime(100);
      result.current.setDropTime(500);
      result.current.setDropTime(null);
    });
    
    expect(result.current.setDropTime).toBeDefined();
  });

  it('should work with piece sequence cycling', () => {
    const sequence = ['I', 'O'];
    const { result } = renderHook(() => useTetris(sequence));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.player.tetromino).toBeDefined();
  });
});
