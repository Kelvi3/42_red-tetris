// Home.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Home.css';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { Socket } from 'socket.io-client';

type playerInfoType = {
  roomName?: string;
  playerName?: string;
  name?: string;
  socket?: string;
};

const Home = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const { socket, connect } = useSocket();
  const [playerInfo, setPlayerInfo] = useState<playerInfoType>({});
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const s = socket;
    socketRef.current = s;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPlayerJoined = (data: any) => {
      setPlayerInfo((prev) => ({ ...prev, roomName: data.name }));
      if (data.isYou) toast('search game');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGameStarted = (data: any) => {
      const room = data.roomName || playerInfo.roomName;
      const socketId = socket ? socket.id : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onUpdatePiece = (data: any) => {
      console.log('Piece updated:', data);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPlayerLeft = (payload: any) => {
      if (payload && payload.playerName)
        toast(`${payload.playerName} left`);
      else
        toast('player left game')
    };

    if (s) {
      s.off('playerJoined', onPlayerJoined);
      s.off('gameStarted', onGameStarted);
      s.off('updatePiece', onUpdatePiece);
      s.off('playerLeft', onPlayerLeft);

      s.on('playerJoined', onPlayerJoined);
      s.on('gameStarted', onGameStarted);
      s.on('updatePiece', onUpdatePiece);
      s.on('playerLeft', onPlayerLeft);
    }

    return () => {
      if (s) {
        s.off('playerJoined', onPlayerJoined);
        s.off('gameStarted', onGameStarted);
        s.off('updatePiece', onUpdatePiece);
        s.off('playerLeft', onPlayerLeft);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, navigate, socket]);

  const handlePlay = (solo: boolean) => {
    if (solo) return;
    if (!name || name.trim().length === 0) {
      toast('Please enter a name');
      return;
    }
    setWaiting(true);
    const s = socket || connect();
    socketRef.current = s;
    s.emit('joinRoom', { playerName: name });
  };

  return (
    <div className="home-container">
      <h1>Red Tetris</h1>
      <input type="text" placeholder="Enter your name" className="name-input" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="button-container">
        <button className="game-button" onClick={() => handlePlay(true)}>
          Play
        </button>
        <button onClick={() => handlePlay(false)} className="button-container">
          Multiplayer
        </button>
      </div>
      {waiting && (
        <div style={{ marginTop: 12 }}>
          <p>En attente d&apos;un adversaire...</p>
        </div>
      )}
    </div>
  );
};

export default Home;
