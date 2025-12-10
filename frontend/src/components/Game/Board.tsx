// Board.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTetris } from './useTetris';
import { COLORS } from './constants';
import './Board.css';
import { useSocket } from '../../context/SocketContext';

function Board() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const name = params.player || location.state?.playerName || 'Player1';
  const startGameState = location.state?.startGame || false;
  const roomName = params.room || location.state?.roomName || null;
  const pieceSequence = location.state?.pieceSequence || null;
  const { socket, connect, leaveRoom, disconnect } = useSocket();

  const [validated, setValidated] = useState<boolean | null>(startGameState ? true : null);

  useEffect(() => {
    if (startGameState) return;

    if (!roomName || !name) {
      toast.info("Accès refusé — revenez depuis le Lobby");
      navigate('/', { replace: true });
      return;
    }

    setValidated(null);

    const s = socket || connect();

    s.emit('canJoinRoom', { roomName, playerName: name }, (res: any) => {
      if (!res || !res.ok) {
        toast.info("La partie est terminée ou vous n'êtes pas autorisé à la rejoindre");
        setValidated(false);
        navigate('/', { replace: true });
        return;
      }

      setValidated(true);
    });
  }, [startGameState, navigate, roomName, name, socket]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [ended, setEnded] = useState(false);

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
  } = useTetris(pieceSequence);

  if (validated === null) {
    return (
      <div style={{ padding: 20 }}>
        <p>Vérification de la partie en cours...</p>
      </div>
    );
  }

  useEffect(() => {
    if (startGameState && !gameStarted) {
      setGameStarted(true)
      startGame();
    }
  }, [startGame, startGameState])

  useEffect(() => {
    if (!socket || !socket.id) {

      navigate('/');
    }
  }, [socket, navigate]);

  useEffect(() => {
    if (gameOver) {
      const s = socket || connect();
      s.emit('playerLost', { roomName, playerName: name }, (res: any) => {
        try { disconnect(); } catch (e) {}
        navigate('/');
      });
    }
  }, [gameOver, socket, connect, disconnect, navigate, roomName, name])

    useEffect(() => {
      const handler = (data: any) => {
        toast('You won!');
        setDropTime(null);
        setEnded(true);

        leaveRoom(roomName).then(() => {
          navigate('/');
        });
      };

      if (socket) socket.on('youWin', handler);

      return () => {
        if (socket) socket.off('youWin', handler);
      };
    }, [socket, navigate, setDropTime, leaveRoom, roomName]);

    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (socket && roomName) {
          try {
            console.log('[Board] beforeunload: emit leaveRoom', { roomName, socketId: socket.id });
            socket.emit('leaveRoom', { roomName });
          } catch (err) {
            console.error('[Board] beforeunload: emit failed', err);
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (roomName) {
          leaveRoom(roomName).then((res) => {
            console.log('[Board] leaveRoom result on unmount', res);
          });
        }
      };
    }, [socket, roomName, leaveRoom]);

    useEffect(() => {
      const onPlayerLeft = (data: any) => {
        console.log('[Board] received playerLeft', data);
        const leftName = data?.playerName || 'Opponent';
        toast.info(`${leftName} a quitté la partie`);
        setDropTime(null);
        setEnded(true);
        setTimeout(() => {
          try { disconnect(); } catch (err) {}
          navigate('/');
        }, 500);
      };

      if (socket) socket.on('playerLeft', onPlayerLeft);
      return () => {
        if (socket) socket.off('playerLeft', onPlayerLeft);
      };
    }, [socket, navigate, setDropTime, disconnect]);

    useEffect(() => {
      const onAlone = (data: any) => {
        toast.info('Vous êtes seul dans la partie, retour au lobby');
        setDropTime(null);
        setEnded(true);
        setTimeout(() => {
          try { disconnect(); } catch (e) {}
          navigate('/');
        }, 500);
      };

      if (socket) socket.on('alone', onAlone);
      return () => {
        if (socket) socket.off('alone', onAlone);
      };
    }, [socket, navigate, setDropTime, disconnect]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver || ended) return;

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
    if (gameOver || ended) return;

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
      <button className="game-button" onClick={() => {
        if (roomName) {
          const s = socket || connect();
          s.emit('playerLost', { roomName, playerName: name }, (res: any) => {
            try { disconnect(); } catch (e) {}
            navigate('/');
          });
        } else {
          navigate('/');
        }
      }}>Retour</button>      
        <div className="header">
          <h1>{name}</h1>
          {gameOver && <h2 style={{ color: 'red' }}>GAME OVER</h2>}
          {/* {!socket.id &&
            <button onClick={startGame} className="game-button">
              {gameOver ? 'Recommencer' : 'Start Game'}
            </button>
          } */}
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
