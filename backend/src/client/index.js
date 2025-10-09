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

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);

  socket.emit('joinRoom', { playerName: '' });

  socket.on('playerJoined', (data) => {
    console.log('Player joined:', data.name);
    store.dispatch(alert(`${data.name} joined the game!`));
    if (data.game)
      socket.emit('startGame', { roomName: data.name });
  });

  socket.on('gameStarted', (data) => {
    console.log('Game started with piece sequence:', data.pieceSequence);
    store.dispatch(alert(`The game has started with ${data.pieceSequence} piece!`));
  });

  socket.on('updatePiece', (data) => {
    console.log('Piece updated:', data);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    socket.emit('movePiece', { roomName: 'room0', move: 'left' });
  } else if (event.key === 'ArrowRight') {
    socket.emit('movePiece', { roomName: 'room0', move: 'right' });
  }
});

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('tetris')
);

// Exemple d'alerte initiale
store.dispatch(alert('Soon, will be here a fantastic Tetris ...'));