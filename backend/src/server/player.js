class Player {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    this.board = this.createEmptyBoard();
    this.currentPiece = null;
    this.isAlive = true;
    this.isHost = false;
    this.spectrum = Array(10).fill(0);
  }

  createEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  updateSpectrum() {
    for (let x = 0; x < 10; x++) {
      let h = 0;
      for (let y = 0; y < 20; y++) {
        if (this.board[y][x]) h = 20 - y;
      }
      this.spectrum[x] = h;
    }
  }

  setPiece(piece) {
    this.currentPiece = piece;
  }

  die() {
    this.isAlive = false;
  }
}

module.exports = Player;
