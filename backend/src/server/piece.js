class Piece {
  constructor(type, position = { x: 4, y: 0 }) {
    this.type = type;
    this.position = position;
    this.rotation = 0;
    this.shape = Piece.SHAPES[type];
  }

  getCurrentShape() {
    return this.shape[this.rotation % this.shape.length];
  }

  rotate() {
    this.rotation = (this.rotation + 1) % this.shape.length;
  }

  rotateBack() {
    this.rotation = (this.rotation - 1 + this.shape.length) % this.shape.length;
  }

  move(dx) {
    this.position.x += dx;
  }

  moveDown() {
    this.position.y += 1;
  }

  hardDrop(y) {
    this.position.y = y;
  }

  static get SHAPES() {
    return {
      I: [
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
        [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
        [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
        [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
      ],
      O: [
        [[1,1],[1,1]]
      ],
      T: [
        [[0,1,0],[1,1,1],[0,0,0]],
        [[0,1,0],[0,1,1],[0,1,0]],
        [[0,0,0],[1,1,1],[0,1,0]],
        [[0,1,0],[1,1,0],[0,1,0]]
      ],
      S: [
        [[0,1,1],[1,1,0],[0,0,0]],
        [[0,1,0],[0,1,1],[0,0,1]],
        [[0,0,0],[0,1,1],[1,1,0]],
        [[1,0,0],[1,1,0],[0,1,0]]
      ],
      Z: [
        [[1,1,0],[0,1,1],[0,0,0]],
        [[0,0,1],[0,1,1],[0,1,0]],
        [[0,0,0],[1,1,0],[0,1,1]],
        [[0,1,0],[1,1,0],[1,0,0]]
      ],
      J: [
        [[1,0,0],[1,1,1],[0,0,0]],
        [[0,1,1],[0,1,0],[0,1,0]],
        [[0,0,0],[1,1,1],[0,0,1]],
        [[0,1,0],[0,1,0],[1,1,0]]
      ],
      L: [
        [[0,0,1],[1,1,1],[0,0,0]],
        [[0,1,0],[0,1,0],[0,1,1]],
        [[0,0,0],[1,1,1],[1,0,0]],
        [[1,1,0],[0,1,0],[0,1,0]]
      ]
    };
  }
}

module.exports = Piece;
