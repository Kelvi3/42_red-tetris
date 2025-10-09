// Home.tsx
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Red Tetris</h1>
      <Link to="/game">
        <button>Jouer</button>
      </Link>
    </div>
  );
}

export default Home;