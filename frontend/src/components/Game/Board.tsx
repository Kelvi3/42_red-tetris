// Board.tsx
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PIECES } from './Piece';
import { useState } from 'react';
import './Board.css';
// import { useEffect } from 'react';

// function Board() {
//   const currentPiece = PIECES.I;
//   const location = useLocation();
//   const name = location.state.playerName || 'Player1';

//   const ROWS = 20;
//   const COLS = 10;
//   const emptyBoard = Array(ROWS)
//     .fill(null)
//     .map(() => Array(COLS).fill(0));

//   return (
//     <div>
//       <Link to="/">
//         <button className="game-button">Back</button>
//         </Link>
//       <h1>{name}</h1>
//       <div className="board">
//         {emptyBoard.map((row, rowIndex) => (
//           <div key={rowIndex} className="row">
//             {row.map((cell, colIndex) => (
//               <div key={colIndex} className="cell" />
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>

//   );
// }

function Board() {
  const currentPiece = PIECES.I;
  const location = useLocation();
  const name = location.state.playerName || 'Player1';
  
  const ROWS = 20;
  const COLS = 10;
  
  // Position de la pièce
  const [pieceX, setPieceX] = useState(3);
  const [pieceY, setPieceY] = useState(0);
  
  const emptyBoard = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));
  
  const board = emptyBoard.map((row, y) => 
    row.map((cell, x) => {
      const localY = y - pieceY;
      const localX = x - pieceX;
      
      if (
        localY >= 0 && 
        localY < currentPiece.shape.length &&
        localX >= 0 && 
        localX < currentPiece.shape[0].length &&
        currentPiece.shape[localY][localX] === 1
      ) {
        return currentPiece.color;
      }
      return cell;
    })
  );

  return (
    <div>
      <Link to="/">
        <button className="game-button">Back</button>
      </Link>
      <h1>{name}</h1>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div 
                key={colIndex} 
                className="cell"
                style={{ 
                  backgroundColor: cell || '#000' 
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;

