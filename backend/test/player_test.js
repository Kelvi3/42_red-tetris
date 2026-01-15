import chai from 'chai'
import Player from '../src/server/player'
import Piece from '../src/server/piece'

chai.should()

describe('Player Logic', function(){
  it('should compute spectrum heights from board correctly', function(){
    const p = new Player('tester','s1');

    p.board = p.createEmptyBoard();

    p.board[15][0] = 1;
    p.board[0][1] = 1;
    p.board[5][2] = 1;
    p.board[18][2] = 1;

    p.updateSpectrum();

    p.spectrum[0].should.equal(5);
    p.spectrum[1].should.equal(20);
    p.spectrum[2].should.equal(2);
    for (let x = 3; x < 10; x++) {
      p.spectrum[x].should.equal(0);
    }
  });

  it('should create empty board correctly', function(){
    const p = new Player('test', 's1');
    const board = p.createEmptyBoard();
    board.length.should.equal(20);
    board[0].length.should.equal(10);
    board.forEach(row => {
      row.forEach(cell => {
        cell.should.equal(0);
      });
    });
  });

  it('should set piece correctly', function(){
    const p = new Player('test', 's1');
    const piece = new Piece('I');
    p.setPiece(piece);
    p.currentPiece.should.equal(piece);
    p.currentPiece.type.should.equal('I');
  });

  it('should mark player as dead', function(){
    const p = new Player('test', 's1');
    p.isAlive.should.equal(true);
    p.die();
    p.isAlive.should.equal(false);
  });

  it('should initialize with correct properties', function(){
    const p = new Player('alice', 'socket123');
    p.name.should.equal('alice');
    p.socket.should.equal('socket123');
    p.isHost.should.equal(false);
    (p.currentPiece === null).should.equal(true);
  });
});
