// Home.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Home.css';
// import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';

type playerInfoType = {
  roomName?: string;
  playerName?: string;
  name?: string;
  socket?: string;
  isHost?: boolean;
};

type PlayerListItem = {
  name: string;
  isHost: boolean;
};

type ViewState = 'MAIN' | 'MULTIPLAYER_MENU' | 'CREATE_ROOM' | 'JOIN_ROOM';

const Home = () => {
  const [name, setName] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [view, setView] = useState<ViewState>('MAIN');
  const [playersList, setPlayersList] = useState<PlayerListItem[]>([]);
  
  const navigate = useNavigate();
  const socketRef = useRef<any>(null);
  const { socket, connect, leaveRoom, disconnect } = useSocket();
  const [playerInfo, setPlayerInfo] = useState<playerInfoType>({});
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const s = socket;
    socketRef.current = s;

    const onPlayerJoined = (data: any) => {
      setPlayerInfo((prev) => ({ 
        ...prev, 
        roomName: data.name, 
        isHost: data.isYou ? data.isHost : prev.isHost
      }));
      if (data.isYou) toast('Joined room');
    };

    const onUpdatePlayerList = (list: PlayerListItem[]) => {
      setPlayersList(list);
    };

    const onGameStarted = (data: any) => {
      const room = data.roomName || playerInfo.roomName;
      const socketId = socket ? socket.id : null;
      const currentPlayer = data.players?.find((p: any) => p.socket === socketId);
      const playerName = currentPlayer ? currentPlayer.name : name;
      setWaiting(false);
      navigate(`/${room}/${playerName}`, { state: { playerName, startGame: true, socketId, roomName: room, pieceSequence: data.pieceSequence } });

      toast(
        `The game has started! ${data.players
          .map((e: playerInfoType) => e.name)
          .join(' vs ')}`
      );
      if (currentPlayer) setPlayerInfo((prev) => ({ ...prev, playerName: currentPlayer.name }));
    };

    const onUpdatePiece = (data: any) => {
      console.log('Piece updated:', data);
    };

    const onPlayerLeft = (payload: any) => {
      if (payload && payload.playerName)
        toast(`${payload.playerName} left`);
      else
        toast('player left game')
    };

    const onRoomError = (errorMsg: string) => {
      toast.error(errorMsg);
      setWaiting(false);
    };

    if (s) {
      s.off('playerJoined', onPlayerJoined);
      s.off('updatePlayerList', onUpdatePlayerList);
      s.off('gameStarted', onGameStarted);
      s.off('updatePiece', onUpdatePiece);
      s.off('playerLeft', onPlayerLeft);
      s.off('roomError', onRoomError);

      s.on('playerJoined', onPlayerJoined);
      s.on('updatePlayerList', onUpdatePlayerList);
      s.on('gameStarted', onGameStarted);
      s.on('updatePiece', onUpdatePiece);
      s.on('playerLeft', onPlayerLeft);
      s.on('roomError', onRoomError);
    }

    return () => {
      if (s) {
        s.off('playerJoined', onPlayerJoined);
        s.off('updatePlayerList', onUpdatePlayerList);
        s.off('gameStarted', onGameStarted);
        s.off('updatePiece', onUpdatePiece);
        s.off('playerLeft', onPlayerLeft);
        s.off('roomError', onRoomError);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, navigate, socket]);

  const handlePlaySolo = () => {
    navigate('/solo');
  };

  const handleMultiplayer = () => {
    if (!name || name.trim().length === 0) {
      toast('Please enter a name');
      return;
    }
    setView('MULTIPLAYER_MENU');
  };

  const handleJoinOrCreate = (action: 'create' | 'join') => {
    if (action === 'create') setView('CREATE_ROOM');
    if (action === 'join') setView('JOIN_ROOM');
  };

  const handleSubmitRoom = () => {
    if (!roomNameInput || roomNameInput.trim().length === 0) {
      toast('Please enter a room name');
      return;
    }
    setWaiting(true);
    setPlayersList([]); // Reset list on new attempt
    const s = socket || connect();
    socketRef.current = s;
    
    // Determine action based on current view
    const action = view === 'CREATE_ROOM' ? 'create' : 'join';
    
    s.emit('joinRoom', { playerName: name, roomName: roomNameInput, action });
  };

  const handleStartGame = () => {
    if (socket && playerInfo.roomName) {
      socket.emit('startGame', { roomName: playerInfo.roomName });
    }
  };

  const cancelSearch = async () => {
    setWaiting(false);
    setPlayersList([]);
    const room = playerInfo.roomName;
    try {
      if (room) {
        await leaveRoom(room);
      } else {
        disconnect();
      }
    } catch (err) {
      console.error('cancelSearch error', err);
      try { disconnect(); } catch (e) {}
    }
    setPlayerInfo({});
  };

  const renderContent = () => {
    if (waiting) {
       return (
        <>
          <p>Waiting for players in room: <strong>{playerInfo.roomName}</strong></p>
          
          <div className="players-list" style={{ margin: '20px 0', textAlign: 'left' }}>
            <h4>Players connected:</h4>
            <ul>
              {playersList.map((player, idx) => (
                <li key={idx}>
                  {player.name} {player.isHost ? '(Host)' : ''}
                </li>
              ))}
            </ul>
          </div>

          {playerInfo.isHost && (
            <button 
              onClick={handleStartGame} 
              className="game-button" 
              style={{ marginBottom: 10 }}
              disabled={playersList.length < 2} // Disable if less than 2 players
            >
              Start Game
            </button>
          )}
          <button onClick={cancelSearch} className="game-button">
            Annuler
          </button>
        </>
       )
    }


    switch (view) {
      case 'MAIN':
        return (
          <>
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="name-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <div className="button-container">
              <button className="game-button" onClick={handlePlaySolo}>
                Play Solo
              </button>
              <button className="game-button" onClick={handleMultiplayer}>
                Multiplayer
              </button>
            </div>
          </>
        );
      case 'MULTIPLAYER_MENU':
        return (
          <div className="button-container">
            <button className="game-button" onClick={() => handleJoinOrCreate('create')}>
              Create Room
            </button>
            <button className="game-button" onClick={() => handleJoinOrCreate('join')}>
              Join Room
            </button>
             <button className="game-button" onClick={() => setView('MAIN')}>
              Back
            </button>
          </div>
        );
      case 'CREATE_ROOM':
      case 'JOIN_ROOM':
        return (
          <>
            <h3>{view === 'CREATE_ROOM' ? 'Create Room' : 'Join Room'}</h3>
            <input 
              type="text" 
              placeholder="Enter room name" 
              className="name-input" 
              value={roomNameInput} 
              onChange={(e) => setRoomNameInput(e.target.value)} 
            />
            <div className="button-container">
              <button className="game-button" onClick={handleSubmitRoom}>
                {view === 'CREATE_ROOM' ? 'Start' : 'Join'}
              </button>
              <button className="game-button" onClick={() => setView('MULTIPLAYER_MENU')}>
                Back
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <h1>White Tetris</h1>
      {renderContent()}
    </div>
  );
};

export default Home;
