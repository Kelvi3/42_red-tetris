import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTetris, computeMove, computeRotate, computeHardDrop } from './useTetris';
import { COLORS } from './constants';
import './Board.css';
import './OpponentBoard.css';
import { useSocket } from '../../context/SocketContext';
import BoardDisplay from './BoardDisplay';

interface Opponent {
  name: string;
  state: {
    board: any[][];
    player: any;
  };
}

function Board() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const name = params.player || location.state?.playerName || 'Player1';
  const startGameState = location.state?.startGame || false;
  const roomName = params.room || location.state?.roomName || null;
  const pieceSequence = location.state?.pieceSequence || null;
  const { socket, connect, leaveRoom, disconnect } = useSocket();
  const isSolo = roomName === 'solo';

  const [validated, setValidated] = useState<boolean | null>(startGameState || isSolo ? true : null);
  const [opponents, setOpponents] = useState<Record<string, Opponent>>({});

  useEffect(() => {
    if (startGameState || isSolo) return;

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
  }, [startGameState, navigate, roomName, name, socket, isSolo]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const onRowsCleared = React.useCallback((rows: number) => {
    if (isSolo || !socket || !roomName) return;
    const penalty = rows;
    console.log(`[Board] emitting linesCleared: ${rows} (penalty: ${penalty})`);
    if (penalty > 0) {
      // toast.info(`Attack! Sending ${penalty} lines.`);
    }
    socket.emit('linesCleared', { roomName, rowsCleared: rows });
  }, [isSolo, socket, roomName]);

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
    addPenaltyLines,
    applyPlayer,
    applyLockAndReset
  } = useTetris(pieceSequence, onRowsCleared);

  // Listen for penalty lines
  useEffect(() => {
    if (isSolo || !socket) return;
    
    const onPenalty = (data: { sender: string, senderId?: string, lines: number }) => {
        if (data.senderId && data.senderId === socket.id) {
            console.log(`[Board] ignoring self-penalty from ${data.sender}`);
            return;
        }

        console.log(`[Board] received penaltyLines from ${data.sender}: ${data.lines}`);
        toast.warning(`Attack from ${data.sender}: ${data.lines} lines!`);
        addPenaltyLines(data.lines);
    };
    
    socket.on('penaltyLines', onPenalty);
    return () => {
        socket.off('penaltyLines', onPenalty);
    };
  }, [socket, isSolo, addPenaltyLines]);

  // Broadcast local state
  useEffect(() => {
    if (isSolo || !socket || !roomName) return;
    // Broadcast whenever board or player changes (move, rotate, drop)
    socket.emit('updatePlayerState', {
      roomName,
      state: { board, player }
    });
  }, [board, player, isSolo, socket, roomName]);

  // Listen for opponents
  useEffect(() => {
    if (isSolo || !socket) return;

    const onOpponentUpdate = (data: { socketId: string, name: string, state: any }) => {
      setOpponents((prev) => ({
        ...prev,
        [data.socketId]: { name: data.name, state: data.state }
      }));
    };

    socket.on('opponentStateUpdate', onOpponentUpdate);

    return () => {
      socket.off('opponentStateUpdate', onOpponentUpdate);
    };
  }, [socket, isSolo]);

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
    if (isSolo) return;
    if (!socket || !socket.id) {
      navigate('/');
    }
  }, [socket, navigate, isSolo]);

  useEffect(() => {
    if (gameOver) {
      if (isSolo) return;
      const s = socket || connect();
      s.emit('playerLost', { roomName, playerName: name }, (res: any) => {
        try { disconnect(); } catch (e) {}
        navigate('/');
      });
    }
  }, [gameOver, socket, connect, disconnect, navigate, roomName, name, isSolo])

    useEffect(() => {
      if (isSolo) return;
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
    }, [socket, navigate, setDropTime, leaveRoom, roomName, isSolo]);

    useEffect(() => {
      if (isSolo) return;
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

      };
    }, [socket, roomName, leaveRoom, isSolo]);

    useEffect(() => {
      if (isSolo) return;
      const onPlayerLeft = (data: any) => {
        console.log('[Board] received playerLeft', data);
        const leftName = data?.playerName || 'Opponent';
        toast.info(`${leftName} a quitté la partie`);
        
        setOpponents(prev => {
          const next = { ...prev };
          const key = Object.keys(next).find(k => next[k].name === leftName);
          if (key) delete next[key];
          return next;
        });
      };

      if (socket) socket.on('playerLeft', onPlayerLeft);
      return () => {
        if (socket) socket.off('playerLeft', onPlayerLeft);
      };
    }, [socket, navigate, setDropTime, disconnect, isSolo]);

    useEffect(() => {
      if (isSolo) return;
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
    }, [socket, navigate, setDropTime, disconnect, isSolo]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver || ended) return;

    const { key } = e;
    // e.preventDefault(); // Prevent default only if it's a game key
    // Actually, Board usually focuses.

    switch (key) {
      case "ArrowLeft":
        e.preventDefault();
        {
          const moved = computeMove(player, board, -1);
          if (moved && applyPlayer) applyPlayer(moved);
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        {
          const moved = computeMove(player, board, 1);
          if (moved && applyPlayer) applyPlayer(moved);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        {
          const rotated = computeRotate(player, board);
          if (rotated && applyPlayer) applyPlayer(rotated);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        setDropTime(50);
        drop();
        break;

      case " ":
        e.preventDefault();
        {
          const landed = computeHardDrop(player, board);
          if (landed && applyLockAndReset) applyLockAndReset(landed);
        }
        break;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (gameOver || ended) return;

    if (e.key === "ArrowDown") {
      setDropTime(1000);
    }
  };

  return (
    <div className="game-container">
      {/* Opponents Sidebar */}
      {!isSolo && opponents  && Object.keys(opponents).length > 0 && (
        <div className="opponents-sidebar">
          {Object.entries(opponents).map(([id, opp]) => (
            <div key={id} className="opponent-card">
              <h3>{opp.name}</h3>
              <BoardDisplay 
                board={opp.state.board} 
                player={opp.state.player} 
                cellSize={10} // Smaller cells for opponents
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Game Area */}
      <div className="main-area">
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
            if (roomName && !isSolo) {
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
            {isSolo && (
              <button onClick={startGame} className="game-button">
                {gameOver ? 'Recommencer' : 'Start Game'}
              </button>
            )}
          </div>

          <BoardDisplay board={board} player={player} />

          <div className="controls-info">
            <p>← → : Bouger</p>
            <p>↑ : Rotation</p>
            <p>↓ : Descendre vite</p>
            <p>Espace : Chute instantanée</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Board;