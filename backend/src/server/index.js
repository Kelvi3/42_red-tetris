import fs  from 'fs'
import debug from 'debug'
const Game = require('./game');
const Player = require('./player');
const cors = require('cors');
const express = require('express');

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info')

const initApp = (app, params, cb) => {
  const { host, port } = params;

  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.static('public'));

  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html';
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    });
  };

  app.on('request', handler);

  app.listen({ host, port }, () => {
    loginfo(`tetris listen on ${params.url}`);
    cb();
  });
};

const initEngine = (io) => {
  const games = {};

  io.on('connection', (socket) => {
    loginfo("Socket connected: " + socket.id);

    socket.on('joinRoom', ({ playerName }) => {
      const roomName = Object.keys(games).find(
        (key) => games[key] && games[key].players && games[key].players.length === 1
      ) || `room${Object.keys(games).length}`;
      console.log(games, roomName)
      if (!games[roomName]) games[roomName] = new Game(roomName);

      const game = games[roomName];

      if (!playerName && game.players.length === 0)
        playerName = 'player1';
      else if (!playerName)
        playerName = 'player2';

      const player = new Player(playerName, socket.id);
      game.addPlayer(player);

      socket.join(game.roomName);

      socket.emit('playerJoined', {
        name: game.roomName,
        game: game.players.length === 2,
        isYou: true,
      });
      socket.to(game.roomName).emit('playerJoined', {
        name: game.roomName,
        game: game.players.length === 2,
        isYou: false,
      });
    });

    socket.on('startGame', ({ roomName }) => {
      const game = games[roomName];
      if (game && socket.id) {
        game.startGame();
        io.to(roomName).emit('gameStarted', { pieceSequence: game.pieceSequence, players: games[roomName].players });
      }
    });

    const findLastOneIndex = (matrix) => {
      let lastIndex = -1;
    
      for (let i = matrix.length - 1; i >= 0; i--) {
        for (let j = matrix[i].length - 1; j >= 0; j--) {
          if (matrix[i][j] === 1) {
            return j;
          }
        }
      }
      return lastIndex + 1;
    }

    const findFirstOneIndex = (matrix) => {
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] === 1) {
            return j;
          }
        }
      }
      return -1;
    };

    socket.on('movePiece', ({ roomName, move, socketId }) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socketId);
        if (player && player.currentPiece) {
          const piece = player.currentPiece;
          const boardWidth = {start: 0, end: 10};

          if ((move == 'right' && findLastOneIndex(piece.shape[piece.rotation]) + piece.position.x < boardWidth.end) ||
              (move == 'left' && piece.position.x - findFirstOneIndex(piece.shape[piece.rotation]) > boardWidth.start)) {
            if (move == 'right')
              player.currentPiece.move(1);
            else 
              player.currentPiece.move(-1);
            io.to(socketId).emit('updatePiece', { move });
          }
        }
      }
    });

    socket.on('nextPiece', ({ roomName, socketId }) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socketId);
        if (player) {
          const nextPiece = game.getNextPiece();
          io.to(socketId).emit('updatePiece', { piece: nextPiece });
        }
      }
    });

    socket.on('rotatePiece', ({ roomName, socketId }) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socketId);
        if (player && player.currentPiece) {
          player.currentPiece.rotate();
          io.to(roomName).emit('updatePiece', { player: player.name, piece: player.currentPiece });
        }
      }
    });

    socket.on('disconnect', () => {
      for (const roomName in games) {
        const game = games[roomName];
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
          game.removePlayer(player);
          socket.to(roomName).emit('playerLeft');
          io.to(game.roomName).emit('playerLeft', { playerName: player.name });
          if (game.players.length === 0)
            delete games[roomName];
          break;
        }
      }
    });
  });
};

export function create(params) {
  const promise = new Promise((resolve) => {
    const app = require('http').createServer();
    initApp(app, params, () => {
      const io = require('socket.io')(app, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      const stop = (cb) => {
        io.close();
        app.close(() => {
          app.unref();
        });
        loginfo(`Engine stopped.`);
        cb();
      };

      initEngine(io);
      resolve({ stop });
    });
  });
  return promise;
}

