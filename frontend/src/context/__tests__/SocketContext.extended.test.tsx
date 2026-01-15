import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SocketProvider, useSocket } from '../SocketContext';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn((event, data, callback) => {
      if (callback) callback({ ok: true });
    }),
    on: vi.fn(),
    off: vi.fn(),
    id: 'test-socket-id',
  })),
}));

describe('SocketContext - Extended Tests', () => {
  it('should handle multiple connect calls', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
      result.current.connect();
      result.current.connect();
    });

    expect(result.current.socket).toBeDefined();
  });

  it('should handle connect after disconnect', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    act(() => {
      result.current.connect();
    });

    expect(result.current.socket).toBeDefined();
  });

  it('should handle leaveRoom without socket', async () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    let leaveResult;
    await act(async () => {
      leaveResult = await result.current.leaveRoom('test-room');
    });

    expect(leaveResult).toBeDefined();
  });

  it('should handle leaveRoom without roomName', async () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
    });

    let leaveResult;
    await act(async () => {
      leaveResult = await result.current.leaveRoom();
    });

    expect(leaveResult).toBeDefined();
  });

  it('should handle disconnect when not connected', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.socket).toBeNull();
  });

  it('should provide all required context methods', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    expect(result.current).toHaveProperty('socket');
    expect(result.current).toHaveProperty('connect');
    expect(result.current).toHaveProperty('disconnect');
    expect(result.current).toHaveProperty('leaveRoom');
  });
});
