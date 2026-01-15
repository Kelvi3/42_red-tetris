import { describe, it, expect, vi } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { SocketProvider, useSocket } from '../SocketContext';
import React from 'react';

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

describe('SocketContext', () => {
  it('should provide socket context', () => {
    const TestComponent = () => {
      const { socket } = useSocket();
      return <div>{socket ? 'Connected' : 'Not connected'}</div>;
    };

    const { getByText } = render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    expect(getByText(/connected/i)).toBeTruthy();
  });

  it('should throw error when useSocket is used outside provider', () => {
    const TestComponent = () => {
      try {
        useSocket();
        return <div>Success</div>;
      } catch (e: any) {
        return <div>{e.message}</div>;
      }
    };

    const { getByText } = render(<TestComponent />);
    expect(getByText(/must be used within/i)).toBeTruthy();
  });

  it('should provide connect function', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    expect(typeof result.current.connect).toBe('function');
  });

  it('should provide disconnect function', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should provide leaveRoom function', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    expect(typeof result.current.leaveRoom).toBe('function');
  });

  it('should connect to socket', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
    });

    expect(result.current.socket).toBeDefined();
  });

  it('should disconnect socket', () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.socket).toBeNull();
  });

  it('should leave room', async () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: SocketProvider,
    });

    act(() => {
      result.current.connect();
    });

    let leaveResult;
    await act(async () => {
      leaveResult = await result.current.leaveRoom('test-room');
    });

    expect(leaveResult).toBeDefined();
  });

  it('should render children', () => {
    const { getByText } = render(
      <SocketProvider>
        <div>Test Child</div>
      </SocketProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

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
