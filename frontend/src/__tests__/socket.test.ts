import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as socketModule from '../socket';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: true,
    connect: vi.fn(),
  })),
}));

describe('socket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should create and return a socket', () => {
    const socket = socketModule.getSocket();
    expect(socket).toBeDefined();
    expect(socket).toHaveProperty('connected');
  });

  it('should export getSocket function', () => {
    expect(typeof socketModule.getSocket).toBe('function');
  });

  it('should export default function', () => {
    expect(typeof socketModule.default).toBe('function');
  });
});
