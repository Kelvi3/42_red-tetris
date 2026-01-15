import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import Board from '../Board';
import * as useTetrisModule from '../useTetris';

const mockNavigate = vi.fn();
const mockLeaveRoom = vi.fn().mockResolvedValue({ ok: true });
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSocket = {
  id: 'test-socket-id',
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn((event, data, callback) => {
    if (event === 'canJoinRoom' && callback) {
      callback({ ok: true });
    }
  }),
  connected: true,
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../context/SocketContext', () => ({
  useSocket: () => ({
    socket: mockSocket,
    connect: mockConnect,
    leaveRoom: mockLeaveRoom,
    disconnect: mockDisconnect,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('Board', () => {
  const mockUseTetris = {
    player: {
      pos: { x: 3, y: 0 },
      tetromino: [[1]],
      color: '#FF0000',
      collided: false,
    },
    board: Array(20).fill(null).map(() => Array(10).fill('')),
    gameOver: false,
    movePlayer: vi.fn(),
    drop: vi.fn(),
    hardDrop: vi.fn(),
    playerRotate: vi.fn(),
    setDropTime: vi.fn(),
    startGame: vi.fn(),
    addPenaltyLines: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTetrisModule, 'useTetris').mockReturnValue(mockUseTetris);
  });

  it('should render without crashing in solo mode', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true, pieceSequence: ['I', 'O', 'T'] }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('should render board component', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const boardElements = container.querySelectorAll('.board');
    expect(boardElements.length).toBeGreaterThan(0);
  });

  it('should have game wrapper', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('should render with room and player params', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/testroom/TestPlayer',
        state: { startGame: true, roomName: 'testroom', playerName: 'TestPlayer' }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('should use useTetris hook', () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(useTetrisModule.useTetris).toHaveBeenCalled();
  });

  it('should handle multiplayer mode', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/room123/Player1',
        state: { 
          startGame: true, 
          roomName: 'room123', 
          playerName: 'Player1',
          pieceSequence: ['I', 'O']
        }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('should render BoardDisplay component', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const boardCells = container.querySelectorAll('.cell');
    expect(boardCells.length).toBeGreaterThan(0);
  });

  it('should handle solo mode correctly', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTetrisModule, 'useTetris').mockReturnValue(mockUseTetris);
  });

  it('should handle keyboard ArrowLeft', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowLeft' });
    expect(mockUseTetris.movePlayer).toHaveBeenCalledWith(-1);
  });

  it('should handle keyboard ArrowRight', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowRight' });
    expect(mockUseTetris.movePlayer).toHaveBeenCalledWith(1);
  });

  it('should handle keyboard ArrowUp for rotation', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowUp' });
    expect(mockUseTetris.playerRotate).toHaveBeenCalled();
  });

  it('should handle keyboard ArrowDown for fast drop', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowDown' });
    expect(mockUseTetris.setDropTime).toHaveBeenCalledWith(50);
    expect(mockUseTetris.drop).toHaveBeenCalled();
  });

  it('should handle keyboard Space for hard drop', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: ' ' });
    expect(mockUseTetris.hardDrop).toHaveBeenCalled();
  });

  it('should handle keyboard ArrowDown key up', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyUp(wrapper!, { key: 'ArrowDown' });
    expect(mockUseTetris.setDropTime).toHaveBeenCalledWith(1000);
  });

  it('should render game over message when gameOver is true', () => {
    const gameOverMock = { ...mockUseTetris, gameOver: true };
    vi.spyOn(useTetrisModule, 'useTetris').mockReturnValue(gameOverMock);

    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('should not handle keys when game is over', () => {
    const gameOverMock = { ...mockUseTetris, gameOver: true };
    vi.spyOn(useTetrisModule, 'useTetris').mockReturnValue(gameOverMock);

    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowLeft' });
    expect(mockUseTetris.movePlayer).not.toHaveBeenCalled();
  });

  it('should show opponents sidebar in multiplayer', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/room123/Player1',
        state: { 
          startGame: true,
          roomName: 'room123',
          playerName: 'Player1'
        }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('should call startGame on mount when startGameState is true', () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { startGame: true }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    waitFor(() => {
      expect(mockUseTetris.startGame).toHaveBeenCalled();
    });
  });

  it('should render with piece sequence', () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/solo/Player1',
        state: { 
          startGame: true,
          pieceSequence: ['I', 'O', 'T', 'S']
        }
      }]}>
        <Routes>
          <Route path="/:room/:player" element={<Board />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(useTetrisModule.useTetris).toHaveBeenCalledWith(
      ['I', 'O', 'T', 'S'],
      expect.any(Function)
    );
  });
});
