import './Board.css'

function Board() {
    
  const ROWS = 20
  const COLS = 10
  
  const emptyBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0))
  
  return (
    <div className="board">
      {emptyBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div 
              key={colIndex} 
              className="cell"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board