import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

const mockNavigate = vi.fn();
const mockLeaveRoom = vi.fn().mockResolvedValue(undefined);
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../context/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      id: 'test-socket-id',
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    connect: mockConnect,
    leaveRoom: mockLeaveRoom,
    disconnect: mockDisconnect,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
  }),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });

  it('should render main menu initially', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('White Tetris')).toBeTruthy();
  });

  it('should have Play Solo button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const soloButton = screen.getByText('Play Solo');
    expect(soloButton).toBeTruthy();
  });

  it('should navigate to solo mode when Play Solo button is clicked', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const soloButton = screen.getByText('Play Solo');
    fireEvent.click(soloButton);
    expect(mockNavigate).toHaveBeenCalledWith('/solo');
  });

  it('should have Multiplayer button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const multiplayerButton = screen.getByText('Multiplayer');
    expect(multiplayerButton).toBeTruthy();
  });

  it('should show multiplayer menu when Multiplayer button is clicked', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    expect(container.querySelector('.name-input')).toBeTruthy();
  });

  it('should render name input in multiplayer menu', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeTruthy();
  });

  it('should update name input value', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'TestPlayer' } });
    expect(input.value).toBe('TestPlayer');
  });

  it('should show multiplayer options after clicking Multiplayer', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    const multiplayerButton = screen.getByText('Multiplayer');
    fireEvent.click(multiplayerButton);
    
    waitFor(() => {
      expect(screen.getByText('Create Room')).toBeTruthy();
      expect(screen.getByText('Join Room')).toBeTruthy();
    });
  });

  it('should render Back button in multiplayer menu', () => {
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
      const backButton = screen.getByText('Back');
      expect(backButton).toBeTruthy();
    });
  });

  it('should handle Create Room button click', () => {
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
      // Should show room input
    });
  });

  it('should handle Join Room button click', () => {
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
      const joinButton = screen.getByText('Join Room');
      fireEvent.click(joinButton);
      // Should show room input
    });
  });

  it('should show create room view', () => {
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
      
      expect(screen.getByPlaceholderText('Enter room name')).toBeTruthy();
    });
  });

  it('should show join room view', () => {
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
      const joinButton = screen.getByText('Join Room');
      fireEvent.click(joinButton);
      
      expect(screen.getByPlaceholderText('Enter room name')).toBeTruthy();
    });
  });

  it('should handle room name input', () => {
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
      fireEvent.change(roomInput, { target: { value: 'TestRoom' } });
      expect(roomInput.value).toBe('TestRoom');
    });
  });

  it('should go back from multiplayer menu to main', () => {
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
      const backButtons = screen.getAllByText('Back');
      fireEvent.click(backButtons[0]);
      
      expect(screen.getByText('Play Solo')).toBeTruthy();
    });
  });
});
