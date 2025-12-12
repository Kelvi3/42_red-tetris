import chai from 'chai'
import Player from '../src/server/player'

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
});
