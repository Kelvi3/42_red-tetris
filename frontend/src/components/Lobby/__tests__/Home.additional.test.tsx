import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

const mockNavigate = vi.fn();
const mockConnect = vi.fn(() => mockSocket);
const mockLeaveRoom = vi.fn().mockResolvedValue({ ok: true });
const mockDisconnect = vi.fn();
const mockSocket = {
  id: 'test-socket-id',
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
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
    success: vi.fn(),
  }),
}));

describe('Home - Additional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle Create Room flow', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Enter name
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    // Click multiplayer
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      // Click Create Room
      const createButton = screen.getByText('Create Room');
      fireEvent.click(createButton);
      
      // Enter room name
      const roomInput = screen.getByPlaceholderText('Enter room name') as HTMLInputElement;
      fireEvent.change(roomInput, { target: { value: 'TestRoom' } });
      
      // Click Start
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'joinRoom',
        expect.objectContaining({
          playerName: 'TestPlayer',
          roomName: 'TestRoom',
          action: 'create'
        })
      );
    });
  });

  it('should handle Join Room flow', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Enter name
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'JoinPlayer' } });
    
    // Click multiplayer
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      // Click Join Room
      const joinButton = screen.getByText('Join Room');
      fireEvent.click(joinButton);
      
      // Enter room name
      const roomInput = screen.getByPlaceholderText('Enter room name') as HTMLInputElement;
      fireEvent.change(roomInput, { target: { value: 'ExistingRoom' } });
      
      // Click Join
      const joinSubmitButton = screen.getByText('Join');
      fireEvent.click(joinSubmitButton);
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'joinRoom',
        expect.objectContaining({
          playerName: 'JoinPlayer',
          roomName: 'ExistingRoom',
          action: 'join'
        })
      );
    });
  });

  it('should show toast when submitting room without room name', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Enter player name
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    // Click multiplayer
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      // Click Create Room
      const createButton = screen.getByText('Create Room');
      fireEvent.click(createButton);
      
      // Click Start without entering room name
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);
      
      // Should show toast about entering room name
    });
  });

  it('should go back from create/join room to multiplayer menu', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      const createButton = screen.getByText('Create Room');
      fireEvent.click(createButton);
      
      const backButtons = screen.getAllByText('Back');
      fireEvent.click(backButtons[backButtons.length - 1]);
      
      expect(screen.getByText('Create Room')).toBeTruthy();
      expect(screen.getByText('Join Room')).toBeTruthy();
    });
  });

  it('should render White Tetris title', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('White Tetris')).toBeTruthy();
  });

  it('should handle socket events registration', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Socket events should be registered
    expect(mockSocket.on).toHaveBeenCalled();
  });

  it('should handle empty name on multiplayer click', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Clear name input
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to click multiplayer
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    // Should still show main menu (not switch to multiplayer menu)
    expect(screen.getByText('Play Solo')).toBeTruthy();
  });

  it('should handle whitespace-only name on multiplayer click', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Enter whitespace only
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '   ' } });
    
    // Try to click multiplayer
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    // Should still show main menu
    expect(screen.getByText('Play Solo')).toBeTruthy();
  });

  it('should handle whitespace-only room name on submit', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      const createButton = screen.getByText('Create Room');
      fireEvent.click(createButton);
      
      const roomInput = screen.getByPlaceholderText('Enter room name') as HTMLInputElement;
      fireEvent.change(roomInput, { target: { value: '   ' } });
      
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);
      
      // Should not emit socket event
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'joinRoom',
        expect.anything()
      );
    });
  });
});
