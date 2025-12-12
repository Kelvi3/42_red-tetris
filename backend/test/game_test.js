import chai from 'chai'
import Game from '../src/server/game'
import Player from '../src/server/player'
import Piece from '../src/server/piece'

chai.should()

describe('Game Logic', function(){
  it('should add and remove players and transfer host when needed', function(){
    const game = new Game('room1');
    const p1 = new Player('one', 's1');
    const p2 = new Player('two', 's2');

    game.addPlayer(p1);
    game.players.length.should.equal(1);
    game.host.should.equal(p1);
    p1.isHost.should.equal(true);

    game.addPlayer(p2);
    game.players.length.should.equal(2);


    game.removePlayer(p1);
    game.players.length.should.equal(1);

    game.host.should.equal(p2);
    p2.isHost.should.equal(true);

    game.removePlayer(p2);
    game.players.length.should.equal(0);
    (game.host === null).should.equal(true);
  });

  it('should start the game and distribute pieces and empty boards', function(){
    const game = new Game('room2');
    const p1 = new Player('a','s1');
    const p2 = new Player('b','s2');
    game.addPlayer(p1);
    game.addPlayer(p2);

    game.startGame();
    game.isStarted.should.equal(true);
    game.pieceSequence.should.be.an('array');
    game.pieceSequence.length.should.be.at.least(1);

    game.players.forEach(p => {
      p.isAlive.should.equal(true);
      (p.currentPiece instanceof Piece).should.equal(true);
      Array.isArray(p.board).should.equal(true);
      p.board.length.should.equal(20);
    });
  });

  it('should generate a piece sequence and getNextPiece extends it when needed', function(){
    const game = new Game('room3');

    game.pieceSequence = game.generatePieceSequence(3);
    game.currentPieceIndex = 0;

    const got = [];
    for (let i = 0; i < 5; i++) {
      const piece = game.getNextPiece();
      (piece instanceof Piece).should.equal(true);
      got.push(piece.type);
    }

    game.pieceSequence.length.should.be.at.least(5);
    game.currentPieceIndex.should.equal(5);
  });

  it('should detect game over when 0 or 1 players alive', function(){
    const game = new Game('room4');
    const p1 = new Player('x','s1');
    const p2 = new Player('y','s2');
    game.addPlayer(p1);
    game.addPlayer(p2);

    p1.isAlive = false;
    p2.isAlive = false;
    game.checkGameOver().should.equal(true);

    p1.isAlive = true;
    p2.isAlive = false;
    game.checkGameOver().should.equal(true);

    p1.isAlive = true;
    p2.isAlive = true;
    game.checkGameOver().should.equal(false);
  });
});
