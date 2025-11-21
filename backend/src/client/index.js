import React from 'react'
import ReactDom from 'react-dom';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers';
import App from './containers/app';
import { alert } from './actions/alert';
import { io } from 'socket.io-client';

const initialState = {};

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
);

const socket = io('http://127.0.0.1:3004/');

let playerInfo = {};
let input = '';
socket.on('connect', () => {
  // socket.emit('joinRoom', { playerName: input });

  socket.on('playerJoined', (data) => {
    store.dispatch(alert(`Search game...`));
    playerInfo.roomName = data.name;
    if (data.game) {
      socket.emit('startGame', { roomName: data.name });
    }
  });

  socket.on('gameStarted', (data) => {
    console.log(data)
    store.dispatch(alert(`The game has started with ${data.pieceSequence} piece! ${data.players.map((e) => e.name).join(' vs ')}`));

    const currentPlayer = data.players.find((p) => p.socket === socket.id);
    if (currentPlayer) {
      playerInfo.playerName = currentPlayer.name;
    }
  });

  socket.on('updatePiece', (data) => {
    console.log('Piece updated:', data);
  });
  
  socket.on('playerLeft', () => {
    store.dispatch(alert(`Player left, search game...`));
  })
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    socket.emit('movePiece', { roomName: playerInfo.roomName, move: 'left', player: playerInfo.playerName, socketId: socket.id });
  } else if (event.key === 'ArrowRight') {
    socket.emit('movePiece', { roomName: playerInfo.roomName, move: 'right', player: playerInfo.playerName, socketId: socket.id });
  } else if (event.key === 'ArrowUp') {
    socket.emit('rotatePiece', { roomName: playerInfo.roomName, player: playerInfo.playerName, socketId: socket.id });
  }
});

function handleNextPiece() {
  socket.emit('nextPiece', { roomName: playerInfo.roomName, socketId: socket.id });
}

const searchGame = () => {
  socket.emit('joinRoom', { playerName: input });
}

ReactDom.render(
  <Provider store={store}>
    <App inputVal={input} searchGame={searchGame} handleNextPiece={handleNextPiece}/>
  </Provider>,
  document.getElementById('tetris')
);

// Exemple d'alerte initiale
store.dispatch(alert('Soon, will be here a fantastic Tetris ...'));