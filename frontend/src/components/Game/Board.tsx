// Board.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    if (startGameState) return;

    if (!roomName || !name) {
      toast.info("Accès refusé — revenez depuis le Lobby");
      navigate('/', { replace: true });
      return;
    }

    setValidated(null);

    const s = socket || connect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.emit('canJoinRoom', { roomName, playerName: name }, (res: any) => {
      if (!res || !res.ok) {
        toast.info("La partie est terminée ou vous n'êtes pas autorisé à la rejoindre");
        setValidated(false);
        navigate('/', { replace: true });
        return;
      }

      setValidated(true);
    });
  }, [startGameState, navigate, roomName, name, socket, connect]);

  useEffect(() => {
    if (startGameState && !gameStarted) {
      setGameStarted(true)
      startGame();
    }
  }, [startGame, startGameState, gameStarted]);

  useEffect(() => {
    if (!socket || !socket.id) {
      navigate('/');
    }
  }, [socket, navigate]);

  useEffect(() => {
    if (gameOver) {
      const s = socket || connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.emit('playerLost', { roomName, playerName: name }, (_res: any) => {
        try { disconnect(); } catch { /* ignore */ }
        navigate('/');
      });
    }
  }, [gameOver, socket, connect, disconnect, navigate, roomName, name]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_data: any) => {
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
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPlayerLeft = (data: any) => {
      console.log('[Board] received playerLeft', data);
      const leftName = data?.playerName || 'Opponent';
      toast.info(`${leftName} a quitté la partie`);
      setDropTime(null);
      setEnded(true);
      setTimeout(() => {
        try { disconnect(); } catch { /* ignore */ }
        navigate('/');
      }, 500);
    };

    if (socket) socket.on('playerLeft', onPlayerLeft);
    return () => {
      if (socket) socket.off('playerLeft', onPlayerLeft);
    };
  }, [socket, navigate, setDropTime, disconnect]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onAlone = (_data: any) => {
      toast.info('Vous êtes seul dans la partie, retour au lobby');
      setDropTime(null);
      setEnded(true);
      setTimeout(() => {
        try { disconnect(); } catch { /* ignore */ }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerRotate(board as any[][], 1);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boardState = board.map((row: any[], y: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row.map((cell: any, x: number) => {
      const isPlayerCell =
        y >= player.pos.y &&
        y < player.pos.y + player.tetromino.length &&
        x >= player.pos.x &&
        x < player.pos.x + player.tetromino[0].length &&
        player.tetromino[y - player.pos.y][x - player.pos.x] !== 0;
      return isPlayerCell ? player.color : cell;
    })
  );

  if (validated === null) {
    return (
      <div style={{ padding: 20 }}>
        <p>Vérification de la partie en cours...</p>
      </div>
    );
  }

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s.emit('playerLost', { roomName, playerName: name }, (_res: any) => {
            try { disconnect(); } catch { /* ignore */ }
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {boardState.map((row: any[], rowIndex: number) => (
          <div key={rowIndex} className="row">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {row.map((cellColor: any, colIndex: number) => (
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