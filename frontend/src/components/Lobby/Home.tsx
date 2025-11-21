// Home.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Home.css';

const Home = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game', { state: { playerName: name } });
  };
  //   const handleSubmit = async () => {
  //     const response = await fetch('http://localhost:3000/api/player', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ name })
  //     });
  //     const data = await response.json();
  //   };

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
        {/* <Link to="/multiplayer"> */}
        <button className="game-button">Multiplayer</button>
        {/* </Link> */}
      </div>
    </div>
  );
};

export default Home;
