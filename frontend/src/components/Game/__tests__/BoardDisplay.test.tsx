import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BoardDisplay from '../BoardDisplay';
import { COLORS } from '../constants';
import { IPlayer } from '../types';

describe('BoardDisplay', () => {
  const emptyBoard = Array(10).fill(null).map(() => Array(10).fill(''));

  it('should render a board', () => {
    const { container } = render(<BoardDisplay board={emptyBoard} />);
    const boardElement = container.querySelector('.board');
    expect(boardElement).toBeTruthy();
  });

  it('should render correct number of rows', () => {
    const { container } = render(<BoardDisplay board={emptyBoard} />);
    const rows = container.querySelectorAll('.row');
    expect(rows).toHaveLength(10);
  });

  it('should render correct number of cells per row', () => {
    const { container } = render(<BoardDisplay board={emptyBoard} />);
    const firstRow = container.querySelector('.row');
    const cells = firstRow?.querySelectorAll('.cell');
    expect(cells).toHaveLength(10);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BoardDisplay board={emptyBoard} className="custom-class" />
    );
    const boardElement = container.querySelector('.board');
    expect(boardElement?.classList.contains('custom-class')).toBe(true);
  });

  it('should apply custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = render(
      <BoardDisplay board={emptyBoard} style={customStyle} />
    );
    const boardElement = container.querySelector('.board') as HTMLElement;
    expect(boardElement?.style.backgroundColor).toBe('red');
  });

  it('should render empty cells with default empty color', () => {
    const { container } = render(<BoardDisplay board={emptyBoard} />);
    const firstCell = container.querySelector('.cell') as HTMLElement;
    expect(firstCell?.style.backgroundColor).toBe(COLORS.EMPTY);
  });

  it('should render cells with colors from board state', () => {
    const coloredBoard = emptyBoard.map((row, y) => 
      row.map((_, x) => x === 0 ? '#FF0000' : '')
    );
    const { container } = render(<BoardDisplay board={coloredBoard} />);
    const rows = container.querySelectorAll('.row');
    
    rows.forEach(row => {
      const firstCell = row.querySelector('.cell') as HTMLElement;
      expect(firstCell?.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  it('should render player tetromino on board', () => {
    const player: IPlayer = {
      pos: { x: 3, y: 0 },
      tetromino: [
        [1, 1],
        [1, 1],
      ],
      color: '#00FF00',
      collided: false,
    };

    const { container } = render(
      <BoardDisplay board={emptyBoard} player={player} />
    );
    
    const rows = container.querySelectorAll('.row');
    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll('.cell');
    
    const cell3 = cells[3] as HTMLElement;
    expect(cell3?.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });

  it('should apply cellSize when provided', () => {
    const { container } = render(
      <BoardDisplay board={emptyBoard} cellSize={30} />
    );
    const firstCell = container.querySelector('.cell') as HTMLElement;
    expect(firstCell?.style.width).toBe('30px');
    expect(firstCell?.style.height).toBe('30px');
  });

  it('should not apply cellSize when not provided', () => {
    const { container } = render(<BoardDisplay board={emptyBoard} />);
    const firstCell = container.querySelector('.cell') as HTMLElement;
    expect(firstCell?.style.width).toBe('');
    expect(firstCell?.style.height).toBe('');
  });

  it('should handle player without tetromino', () => {
    const player: IPlayer = {
      pos: { x: 0, y: 0 },
      tetromino: [],
      color: '#FF0000',
      collided: false,
    };

    const { container } = render(
      <BoardDisplay board={emptyBoard} player={player} />
    );
    const boardElement = container.querySelector('.board');
    expect(boardElement).toBeTruthy();
  });

  it('should handle null player', () => {
    const { container } = render(
      <BoardDisplay board={emptyBoard} player={null} />
    );
    const boardElement = container.querySelector('.board');
    expect(boardElement).toBeTruthy();
  });
});
