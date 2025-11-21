// Board.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTetris } from './useTetris';
import { COLORS } from './constants';
import './Board.css';
import getSocket from '../../socket';

function Board() {
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.state?.playerName || 'Player1';
  const startGameState = location.state.startGame || false;
  // use shared socket singleton instead of passing socket object through navigation state
  const socket = getSocket();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const {
    player,
    board,
    gameOver,
    movePlayer,
    drop,
    hardDrop,
    playerRotate,
    setDropTime,
    startGame,
  } = useTetris();

  useEffect(() => {
    if (startGameState && !gameStarted) {
      setGameStarted(true)
      startGame();
    }
  }, [startGame, startGameState])

  useEffect(() => {
    if (gameOver && socket) {
      navigate('/');
      socket.disconnect();
    }
  }, [gameOver, socket])


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver) return;

    const { key } = e;
    e.preventDefault();

    switch (key) {
      case "ArrowLeft":
        movePlayer(-1);
        break;

      case "ArrowRight":
        movePlayer(1);
        break;

      case "ArrowUp":
        playerRotate(board, 1);
        break;

      case "ArrowDown":
        setDropTime(50);
        drop();
        break;

      case " ":
        hardDrop();
        break;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (gameOver) return;

    if (e.key === "ArrowDown") {
      setDropTime(1000);
    }
  };

  // 1. Calcule l'état du tableau (un tableau 2D de couleurs)
  const boardState = board.map((row, y) =>
    row.map((cell, x) => {
      const isPlayerCell =
        y >= player.pos.y &&
        y < player.pos.y + player.tetromino.length &&
        x >= player.pos.x &&
        x < player.pos.x + player.tetromino[0].length &&
        player.tetromino[y - player.pos.y][x - player.pos.x] !== 0;
      return isPlayerCell ? player.color : cell;
    })
  );

  return (
    <div
      className="game-wrapper"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      ref={wrapperRef}
      onMouseEnter={() => wrapperRef.current?.focus()}
      style={{ outline: "none" }}
    >
      <Link to="/">
        <button className="game-button">Retour</button>
      </Link>

      <div className="header">
        <h1>{name}</h1>
        {gameOver && <h2 style={{ color: 'red' }}>GAME OVER</h2>}
        <button onClick={startGame} className="game-button">
          {gameOver ? 'Recommencer' : 'Start Game'}
        </button>
      </div>

      <div className="board">
        {boardState.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cellColor, colIndex) => (
              <div
                key={colIndex}
                className="cell"
                style={{
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

      <div className="controls-info">
        <p>← → : Bouger</p>
        <p>↑ : Rotation</p>
        <p>↓ : Descendre vite</p>
        <p>Espace : Chute instantanée</p>
      </div>
    </div>
  );
}

export default Board;
