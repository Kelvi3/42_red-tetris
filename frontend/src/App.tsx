// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Board from './components/Game/Board';
import HomePage from './components/Lobby/Home';
import './App.css';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;