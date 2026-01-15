import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTetris } from './useTetris';
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
    addPenaltyLines
  } = useTetris(pieceSequence, onRowsCleared);

  // Listen for penalty lines
  useEffect(() => {
    if (isSolo || !socket) return;
    
    const onPenalty = (data: { sender: string, senderId?: string, lines: number }) => {
        if (data.senderId && data.senderId === socket.id) return;


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
        if (res && res.ok) {
          toast.info('You are eliminated. Returning to lobby...');
          setEnded(true);

          setTimeout(() => {
            leaveRoom(roomName).then(() => {
              navigate('/');
            }).catch(() => {
              navigate('/');
            });
          }, 1500);
        }
      });
    }
  }, [gameOver, socket, connect, roomName, name, isSolo, leaveRoom, navigate]);

    useEffect(() => {
      if (isSolo) return;
      const handler = (data: any) => {
        toast.success(`Game finished! Winner: ${data.winnerName}`);
        setDropTime(null);
        setEnded(true);

        setTimeout(() => {
          leaveRoom(roomName).then(() => {
            navigate('/');
          });
        }, 2000);
      };

      if (socket) socket.on('gameFinished', handler);

      return () => {
        if (socket) socket.off('gameFinished', handler);
      };
    }, [socket, navigate, setDropTime, leaveRoom, roomName, isSolo]);

    useEffect(() => {
      if (isSolo) return;
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (socket && roomName) {
          try {
            socket.emit('leaveRoom', { roomName });
          } catch (err) {
            // err;
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
      const onPlayerEliminated = (data: any) => {
        const elimName = data?.playerName || 'Opponent';
        toast.warning(`${elimName} is eliminated!`);
      };

      if (socket) socket.on('playerEliminated', onPlayerEliminated);
      return () => {
        if (socket) socket.off('playerEliminated', onPlayerEliminated);
      };
    }, [socket, isSolo]);

    useEffect(() => {
      if (isSolo) return;
      const onPlayerLeft = (data: any) => {
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

    switch (key) {
      case "ArrowLeft":
        e.preventDefault();
        movePlayer(-1);
        break;

      case "ArrowRight":
        e.preventDefault();
        movePlayer(1);
        break;

      case "ArrowUp":
        e.preventDefault();
        playerRotate(board, 1);
        break;

      case "ArrowDown":
        e.preventDefault();
        setDropTime(50);
        drop();
        break;

      case " ":
        e.preventDefault();
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
            leaveRoom(roomName).then(() => {
              navigate('/');
            }).catch(() => {
              navigate('/');
            });
          }}>Retour</button>      
          
          <div className="header">
            <h1>{name}</h1>
            {gameOver && ended && <h2 style={{ color: 'red' }}>GAME OVER</h2>}
            {gameOver && ended && <p style={{ color: '#aaa', fontSize: '14px' }}>You are eliminated. Watching others play...</p>}
            {isSolo && (
              <button onClick={startGame} className="game-button">
                {gameOver ? 'Recommencer' : 'Start Game'}
              </button>
            )}
          </div>

          {gameOver && ended ? (
            <div style={{ width: '100%' }}>
              {!isSolo && opponents && Object.keys(opponents).length > 0 ? (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <h3 style={{ color: '#fff', marginBottom: '15px' }}>Remaining players:</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {Object.entries(opponents).map(([id, opp]) => (
                      <div key={id} style={{ border: '2px solid #fff2', padding: '10px' }}>
                        <h4 style={{ color: '#fff', marginBottom: '10px' }}>{opp.name}</h4>
                        <BoardDisplay 
                          board={opp.state.board} 
                          player={opp.state.player} 
                          cellSize={15}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#aaa', marginTop: '20px' }}>Waiting for game to finish...</p>
              )}
            </div>
          ) : (
            <BoardDisplay board={board} player={player} />
          )}

          {!gameOver && (
            <div className="controls-info">
              <p>← → : Bouger</p>
              <p>↑ : Rotation</p>
              <p>↓ : Descendre vite</p>
              <p>Espace : Chute instantanée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Board;