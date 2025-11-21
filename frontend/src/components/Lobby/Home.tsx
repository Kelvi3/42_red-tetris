// Home.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import getSocket from '../../socket';

type playerInfoType = {
  roomName?: string,
  playerName?: string,
  name?: string,
  socket?: string,
}
const Home = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [playerInfo, setPlayerInfo] = useState<playerInfoType>({});

  useEffect(() => {
  console.log(socketRef);
  const socket = getSocket();
  socketRef.current = socket;

    socket.on('connect', () => {
      socket.on('playerJoined', (data: any) => {
        setPlayerInfo((prev) => ({ ...prev, roomName: data.name }));

        if (data.isYou) {
          toast('search game');
        }

        if (data.game && data.isYou) {
          socket.emit('startGame', { roomName: data.name });
        }
      });

      socket.on('gameStarted', (data) => {
  // pass only serializable data in navigation state (socket object cannot be cloned)
  navigate('/game', { state: { playerName: playerInfo.name, startGame: true, socketId: socket.id } });
        toast(
          `The game has started with ${data.pieceSequence} piece! ${data.players
            .map((e: playerInfoType) => e.name)
            .join(' vs ')}`
        );
        const currentPlayer = data.players.find(
          (p: playerInfoType) => p.socket === socket.id
        );
        if (currentPlayer) {
          setPlayerInfo((prev) => ({ ...prev, playerName: currentPlayer.name }));
        }
      });

      socket.on('updatePiece', (data) => {
        console.log('Piece updated:', data);
      });

      socket.on('playerLeft', (payload: any) => {
        if (payload && payload.playerName) {
          toast(`${payload.playerName} left, search game...`);
        }
        socket.disconnect();
      });
    });
  }, [socketRef]);


  const handlePlay = () => {
    socketRef.current?.emit('joinRoom', { playerName: name });
  };

  return (
    <div className="home-container">
      <h1>Red Tetris</h1>
      <input
        type="text"
        placeholder="Enter your name"
        className="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="button-container">
        <button className="game-button" onClick={handlePlay}>
          Play
        </button>
        <Link to="/multiplayer">
          <button className="game-button">Multiplayer</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
