// Home.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import getSocket from '../../socket';
import type { Socket } from 'socket.io-client';

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
  const [playerInfo, setPlayerInfo] = useState<playerInfoType>({});

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onPlayerJoined = (data: any) => {
      setPlayerInfo((prev) => ({ ...prev, roomName: data.name }));
      if (data.isYou) toast('search game');
    };

    const onGameStarted = (data: any) => {
      const room = data.roomName || playerInfo.roomName;
      const socketId = socket.id;
      const currentPlayer = data.players?.find((p: any) => p.socket === socketId);
      const playerName = currentPlayer ? currentPlayer.name : name;
      navigate('/game', { state: { playerName, startGame: true, socketId: socket.id, roomName: room, pieceSequence: data.pieceSequence } });
      toast(
        `The game has started with ${data.pieceSequence} piece! ${data.players
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
      socket.disconnect();
    };

    socket.off('playerJoined', onPlayerJoined);
    socket.off('gameStarted', onGameStarted);
    socket.off('updatePiece', onUpdatePiece);
    socket.off('playerLeft', onPlayerLeft);

    socket.on('playerJoined', onPlayerJoined);
    socket.on('gameStarted', onGameStarted);
    socket.on('updatePiece', onUpdatePiece);
    socket.on('playerLeft', onPlayerLeft);

    return () => {
      socket.off('playerJoined', onPlayerJoined);
      socket.off('gameStarted', onGameStarted);
      socket.off('updatePiece', onUpdatePiece);
      socket.off('playerLeft', onPlayerLeft);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, navigate]);

  const handlePlay = (solo: boolean) => {
    if (solo) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('joinRoom', { playerName: name });
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
    </div>
  );
};

export default Home;
