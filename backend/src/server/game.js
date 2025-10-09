const Piece = require('./piece');
const Player = require('./player');

class Game {
  constructor(roomName) {
    this.roomName = roomName;
    this.players = [];
    this.pieceSequence = [];
    this.currentPieceIndex = 0;
    this.isStarted = false;
    this.host = null;
    this.socketId = null;
  }

  addPlayer(player) {
    this.players.push(player);
    if (!this.host) {
      this.host = player;
      this.socketId == player.socket;
      player.isHost = true;
    }
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p !== player);
    if (player.isHost && this.players.length > 0) {
      this.host = this.players[0];
      this.host.isHost = true;
    }
    if (this.players.length === 0) {
      this.host = null;
    }
  }

  startGame() {
    this.isStarted = true;
    this.pieceSequence = this.generatePieceSequence();
    this.currentPieceIndex = 0;
    this.players.forEach(player => {
      player.isAlive = true;
      player.setPiece(this.getNextPiece());
      player.board = player.createEmptyBoard();
    });
  }

  generatePieceSequence(length = 20) {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const sequence = [];
    for (let i = 0; i < length; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      sequence.push(type);
    }
    return sequence;
  }

  getNextPiece() {
    if (this.currentPieceIndex >= this.pieceSequence.length) {
      this.pieceSequence = this.pieceSequence.concat(this.generatePieceSequence());
    }
    const type = this.pieceSequence[this.currentPieceIndex++];
    return new Piece(type);
  }

  updateSpectrums() {
    this.players.forEach(player => player.updateSpectrum());
  }

  checkGameOver() {
    const alive = this.players.filter(p => p.isAlive);
    return alive.length <= 1;
  }
}

module.exports = Game;
