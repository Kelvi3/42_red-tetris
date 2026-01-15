const Game = require('./game');
const Player = require('./player');
const cors = require('cors');
const express = require('express');

const initApp = (app, params, cb) => {
  const { host, port } = params;

  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.static('public'));

  app.listen({ host, port }, () => {
    cb();
  });
};

const initEngine = (io) => {
  const games = {};
  let roomCounter = 0;

  io.on('connection', (socket) => {

    socket.on('joinRoom', ({ playerName, roomName, action }) => {
      if (!roomName) {
        if (action === 'join') {
             socket.emit('roomError', 'Room name is required to join.');
             return;
        }
        const waitingRoom = Object.keys(games).find(
          (key) => games[key] && games[key].players && games[key].players.length === 1
        );
        roomName = waitingRoom || `room${roomCounter++}`;
      }

      if (action === 'join' && !games[roomName]) {
        socket.emit('roomError', `Room '${roomName}' does not exist.`);
        return;
      }
      if (action === 'create' && games[roomName]) {
        socket.emit('roomError', `Room '${roomName}' already exists.`);
        return;
      }

      if (!games[roomName]) games[roomName] = new Game(roomName);

      const game = games[roomName];

      if (game.players.length >= 4) {
         socket.emit('roomError', 'Room is full');
         return;
      }

      if (game.isStarted) {
        socket.emit('roomError', 'Game already started');
        return;
      }

      if (!playerName) {
        playerName = `player${game.players.length + 1}`;
      }

      const player = new Player(playerName, socket.id);
      game.addPlayer(player);

      socket.join(game.roomName);
      socket.emit('playerJoined', {
        name: game.roomName,
        game: game.players.length === 2,
        isYou: true,
        isHost: game.host && game.host.socket === socket.id
      });
      socket.to(game.roomName).emit('playerJoined', {
        name: game.roomName,
        game: game.players.length === 2,
        isYou: false,
      });

      const playerList = game.players.map(p => ({ name: p.name, isHost: p.isHost }));
      io.to(game.roomName).emit('updatePlayerList', playerList);
    });

    socket.on('startGame', ({ roomName }) => {
      const game = games[roomName];
      if (game && socket.id) {
        if (game.host && game.host.socket !== socket.id) return;
        
        if (game.players.length < 2) {
          socket.emit('roomError', 'Cannot start game with less than 2 players.');
          return;
        }

        game.startGame();
        io.to(roomName).emit('gameStarted', { pieceSequence: game.pieceSequence, players: games[roomName].players, roomName });
      }
    });

    socket.on('canJoinRoom', ({ roomName, playerName }, cb) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socket.id && p.name === playerName);
        if (player) {
          if (typeof cb === 'function') cb({ ok: true });
          return;
        }
      }
      if (typeof cb === 'function') cb({ ok: false });
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

    socket.on('linesCleared', ({ roomName, rowsCleared }) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
          const penalty = rowsCleared; 
          if (penalty > 0) {
            socket.to(roomName).emit('penaltyLines', {
              sender: player.name,
              senderId: socket.id,
              lines: penalty
            });
          }
        }
      }
    });

    socket.on('updatePlayerState', ({ roomName, state }) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
           // We could update server-side state here if needed
           socket.to(roomName).emit('opponentStateUpdate', {
             socketId: socket.id,
             name: player.name,
             state
           });
        }
      }
    });

    socket.on('playerLost', ({ roomName, playerName }, cb) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
          player.isAlive = false;
          
          io.to(roomName).emit('playerEliminated', { playerName });
          
          if (game.checkGameOver()) {
            const alivePlayer = game.players.find(p => p.isAlive);
            if (alivePlayer) {
              io.to(roomName).emit('gameFinished', { winnerName: alivePlayer.name });
              delete games[roomName];
            }
          }
          
          if (typeof cb === 'function') cb({ ok: true });
        } else {
          if (typeof cb === 'function') cb({ ok: false, reason: 'player not found' });
        }
      } else {
        if (typeof cb === 'function') cb({ ok: false, reason: 'game not found' });
      }
    });

    socket.on('leaveRoom', ({ roomName }, cb) => {
      const game = games[roomName];
      if (game) {
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
            game.removePlayer(player);
            socket.leave(roomName);
            
            socket.to(roomName).emit('playerLeft', { playerName: player.name });
            if (!game.isStarted) {
                const playerList = game.players.map(p => ({ name: p.name, isHost: p.isHost }));
                io.to(roomName).emit('updatePlayerList', playerList);
            }

            if (game.players.length === 1) {
              const remaining = game.players[0];
              io.to(remaining.socket).emit('alone', { playerCount: 1 });
            }
            if (game.players.length === 0) delete games[roomName];
            if (typeof cb === 'function') cb({ ok: true });
          return;
        }
      }
      if (typeof cb === 'function') cb({ ok: false, reason: 'not found' });
    });

    socket.on('disconnect', () => {
      for (const roomName in games) {
        const game = games[roomName];
        const player = game.players.find((p) => p.socket === socket.id);
        if (player) {
          const wasHost = player.isHost;
          const otherPlayers = game.players.filter((p) => p.socket !== socket.id);

          if (game.isStarted) {
            game.removePlayer(player);
            if (otherPlayers.length > 0) {
              const winner = otherPlayers[0];

              io.to(winner.socket).emit('youWin', { winnerName: winner.name });
              io.to(game.roomName).emit('playerLeft', { playerName: player.name });
              
              if (game.players.length === 1) {
                const remaining = game.players[0];
                io.to(remaining.socket).emit('alone', { playerCount: 1 });
              } else if (wasHost && game.players.length > 1) {
                const newHost = game.host;
                io.to(game.roomName).emit('updatePlayerList', 
                  game.players.map(p => ({ name: p.name, isHost: p.isHost }))
                );
              }
            }
            delete games[roomName];
          } else {
            game.removePlayer(player);
            io.to(game.roomName).emit('playerLeft', { playerName: player.name });
            
            const playerList = game.players.map(p => ({ name: p.name, isHost: p.isHost }));
            io.to(game.roomName).emit('updatePlayerList', playerList);

            if (game.players.length === 1) {
              const remaining = game.players[0];
              io.to(remaining.socket).emit('alone', { playerCount: 1 });
            }
            if (game.players.length === 0) delete games[roomName];
          }
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
        cb();
      };

      initEngine(io);
      resolve({ stop });
    });
  });
  return promise;
}

