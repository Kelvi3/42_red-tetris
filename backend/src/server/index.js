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
  const games = {}; // Changed from an array to a dictionary

  io.on('connection', (socket) => {
    loginfo("Socket connected: " + socket.id);

    socket.on('joinRoom', ({ playerName }) => {
      const roomName = Object.keys(games).find(
        (key) => games[key] && games[key].players && games[key].players.length === 1
      ) || `room${Object.keys(games).length}`;

      if (!games[roomName]) {
        games[roomName] = new Game(roomName);
      }

      const game = games[roomName];

      if (!playerName && game.players.length === 0)
        playerName = 'player1';
      else if (!playerName)
        playerName = 'player2';

      const player = new Player(playerName, socket.id);
      game.addPlayer(player);

      socket.join(game.roomName);

      io.to(game.roomName).emit('playerJoined', {
        name: game.roomName,
        game: game.players.length === 2,
      });
    });

    socket.on('startGame', ({ roomName }) => {
      const game = games[roomName];
      if (game && socket.id) {
        game.startGame();
        io.to(roomName).emit('gameStarted', { pieceSequence: game.pieceSequence });
      }
    });

    socket.on('movePiece', ({ roomName, move }) => {
      const game = games[roomName];
      if (game) socket.to(roomName).emit('updatePiece', { move });
    });

    socket.on('disconnect', () => {
      for (const roomName in games) {
        const game = games[roomName];
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
          game.removePlayer(player);
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

