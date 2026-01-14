import React from 'react';
import { COLORS } from './constants';
import { IPlayer } from './types';
import './Board.css';

interface BoardDisplayProps {
  board: any[][];
  player?: IPlayer | null;
  style?: React.CSSProperties;
  className?: string;
  cellSize?: number;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board, player, style, className, cellSize }) => {
  const boardState = board.map((row, y) =>
    row.map((cell, x) => {
      let isPlayerCell = false;
      if (player && player.tetromino) {
         isPlayerCell =
          y >= player.pos.y &&
          y < player.pos.y + player.tetromino.length &&
          x >= player.pos.x &&
          x < player.pos.x + player.tetromino[0].length &&
          player.tetromino[y - player.pos.y][x - player.pos.x] !== 0;
      }
      return isPlayerCell ? player!.color : cell;
    })
  );

  return (
    <div className={`board ${className || ''}`} style={style}>
      {boardState.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cellColor, colIndex) => (
            <div
              key={colIndex}
              className="cell"
              style={{
                width: cellSize ? `${cellSize}px` : undefined,
                height: cellSize ? `${cellSize}px` : undefined,
                backgroundColor: cellColor || COLORS.EMPTY,
                border: cellColor
                  ? '1px solid rgba(0,0,0,0.1)'
                  : '1px solid #333',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
