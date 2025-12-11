import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTetris } from '../Game/useTetris'; // Réutilisation du moteur physique
import { COLORS } from '../Game/constants';
import '../Game/Board.css'; // Réutilisation du style

function SoloBoard() {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Utilisation du hook sans dépendances réseau
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

  // Focus automatique pour les contrôles clavier
  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  // Gestion du Game Over local
  useEffect(() => {
    if (gameOver && gameStarted) {
      toast.error("Game Over!");
      setGameStarted(false);
    }
  }, [gameOver, gameStarted]);

  // Lancement du jeu
  const handleStart = () => {
    setGameStarted(true);
    startGame();
    wrapperRef.current?.focus();
  };

  const handleQuit = () => {
    navigate('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const { key } = e;
    // Empêcher le scroll par défaut avec les flèches
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
      e.preventDefault();
    }

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
        setDropTime(50); // Accélération
        drop();
        break;
      case " ":
        hardDrop();
        break;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    if (e.key === "ArrowDown") {
      setDropTime(1000); // Retour à la vitesse normale
    }
  };

  // Rendu du plateau
  const boardState = board.map((row, y) =>
    row.map((cell, x) => {
      // Vérifier si la cellule fait partie de la pièce active du joueur
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
      style={{ outline: "none" }}
    >
      <div className="header">
        <h1>Mode Solo</h1>
        {gameOver && <h2 style={{ color: 'red' }}>GAME OVER</h2>}
        
        <div className="button-group">
          <button className="game-button" onClick={handleStart}>
            {gameStarted || gameOver ? 'Recommencer' : 'Start Game'}
          </button>
          <button className="game-button" onClick={handleQuit}>
            Quitter
          </button>
        </div>
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

export default SoloBoard;
