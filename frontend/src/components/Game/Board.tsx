// Board.tsx
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Board.css';
// import { useEffect } from 'react';

function Board() {
  const location = useLocation();
  const name = location.state.playerName || 'Player1';

  const ROWS = 20;
  const COLS = 10;
  const emptyBoard = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));

  return (
    <div>
      <Link to="/">
        <button className="game-button">Back</button>
        </Link>
      <h1>{name}</h1>
      <div className="board">
        {emptyBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className="cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;
