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
    // State 0
    p.rotation.should.equal(0);
    
    // Rotate to 1
    p.rotate();
    p.rotation.should.equal(1);
    
    // Rotate to 2
    p.rotate();
    p.rotation.should.equal(2);
    
    // Rotate to 3
    p.rotate();
    p.rotation.should.equal(3);
    
    // Rotate back to 0
    p.rotate();
    p.rotation.should.equal(0);
  });

  it('should rotate S piece correctly through 4 states', function(){
    const p = new Piece('S');
    p.rotate(); // 1
    p.rotate(); // 2
    p.rotate(); // 3
    p.rotation.should.equal(3);
    p.rotate(); // 0
    p.rotation.should.equal(0);
  });
  
  it('should get correct shape structure', function(){
    const p = new Piece('T');
    const shape = p.getCurrentShape();
    shape.should.be.an('array');
    shape.length.should.equal(3); // 3x3
  });
});
