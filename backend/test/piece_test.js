import chai from "chai"
import Piece from "../src/server/piece"

chai.should()

describe('Piece Logic', function(){
  it('should instantiate all pieces', function(){
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    types.forEach(type => {
      const p = new Piece(type);
      p.type.should.equal(type);
      p.rotation.should.equal(0);
    });
  });

  it('should rotate I piece correctly through 4 states', function(){
    const p = new Piece('I');
    p.rotation.should.equal(0);
    
    p.rotate();
    p.rotation.should.equal(1);
    
    p.rotate();
    p.rotation.should.equal(2);
    
    p.rotate();
    p.rotation.should.equal(3);
    
    p.rotate();
    p.rotation.should.equal(0);
  });

  it('should rotate S piece correctly through 4 states', function(){
    const p = new Piece('S');
    p.rotate();
    p.rotate();
    p.rotate();
    p.rotation.should.equal(3);
    p.rotate();
    p.rotation.should.equal(0);
  });
  
  it('should get correct shape structure', function(){
    const p = new Piece('T');
    const shape = p.getCurrentShape();
    shape.should.be.an('array');
    shape.length.should.equal(3);
  });

  it('should move piece left and right', function(){
    const p = new Piece('T', { x: 5, y: 0 });
    p.move(1);
    p.position.x.should.equal(6);
    p.move(-2);
    p.position.x.should.equal(4);
  });

  it('should move piece down', function(){
    const p = new Piece('O', { x: 4, y: 5 });
    p.moveDown();
    p.position.y.should.equal(6);
  });

  it('should hard drop piece', function(){
    const p = new Piece('L', { x: 4, y: 2 });
    p.hardDrop(15);
    p.position.y.should.equal(15);
  });

  it('should rotate back', function(){
    const p = new Piece('Z');
    p.rotation = 2;
    p.rotateBack();
    p.rotation.should.equal(1);
    p.rotateBack();
    p.rotation.should.equal(0);
    p.rotateBack();
    p.rotation.should.equal(3);
  });

  it('should handle all piece types rotations', function(){
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    types.forEach(type => {
      const p = new Piece(type);
      const shape = p.getCurrentShape();
      shape.should.be.an('array');
      p.rotate();
      p.currentPiece !== undefined;
    });
  });
});
