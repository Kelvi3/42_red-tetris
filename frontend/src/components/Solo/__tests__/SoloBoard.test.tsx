import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SoloBoard from '../SoloBoard';
import * as useTetrisModule from '../../Game/useTetris';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('SoloBoard', () => {
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
    vi.spyOn(useTetrisModule, 'useTetris').mockReturnValue(mockUseTetris as any);
  });

  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });

  it('should render Start button', () => {
    render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    expect(screen.getByText('Start Game')).toBeTruthy();
  });

  it('should render Back button', () => {
    render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('should call startGame when Start button is clicked', () => {
    render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    expect(mockUseTetris.startGame).toHaveBeenCalled();
  });

  it('should navigate to home when Back button is clicked', () => {
    render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle ArrowLeft key', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowLeft' });
    expect(mockUseTetris.movePlayer).toHaveBeenCalledWith(-1);
  });

  it('should handle ArrowRight key', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowRight' });
    expect(mockUseTetris.movePlayer).toHaveBeenCalledWith(1);
  });

  it('should handle ArrowUp key for rotation', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowUp' });
    expect(mockUseTetris.playerRotate).toHaveBeenCalled();
  });

  it('should handle ArrowDown key for drop', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowDown' });
    expect(mockUseTetris.setDropTime).toHaveBeenCalledWith(50);
    expect(mockUseTetris.drop).toHaveBeenCalled();
  });

  it('should handle space key for hard drop', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: ' ' });
    expect(mockUseTetris.hardDrop).toHaveBeenCalled();
  });

  it('should reset drop time on ArrowDown key up', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyUp(wrapper!, { key: 'ArrowDown' });
    expect(mockUseTetris.setDropTime).toHaveBeenCalledWith(1000);
  });

  it('should not handle keys before game starts', () => {
    const { container } = render(
      <BrowserRouter>
        <SoloBoard />
      </BrowserRouter>
    );
    
    const wrapper = container.querySelector('.game-wrapper');
    fireEvent.keyDown(wrapper!, { key: 'ArrowLeft' });
    expect(mockUseTetris.movePlayer).not.toHaveBeenCalled();
  });
});
