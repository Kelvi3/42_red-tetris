const chai = require('chai');
const jwt = require('jsonwebtoken');
const ioClient = require('socket.io-client');

chai.should();

describe('Socket Middleware', function() {
  this.timeout(5000);
  let stopServer;
  const HOST = '127.0.0.1';
  const PORT = 4111;
  const URL = `http://${HOST}:${PORT}`;

  before(function(done) {
    process.env.JWT_SECRET = 'test-secret';
    const server = require('../src/server/index');
    server.create({ host: HOST, port: PORT, url: URL }).then(({ stop }) => {
      stopServer = stop;
      setTimeout(done, 200);
    }).catch(done);
  });

  after(function(done) {
    if (stopServer) return stopServer(done);
    done();
  });

  it('accepts connection with valid JWT', function(done) {
    const token = jwt.sign({ id: 'user1', name: 'tester' }, process.env.JWT_SECRET);
    const socket = ioClient(URL, { auth: { token }, reconnection: false });
    socket.on('connect', () => {
      socket.close();
      done();
    });
    socket.on('connect_error', (err) => {
      socket.close();
      done(err || new Error('connect_error'));
    });
  });

  it('rejects connection with invalid JWT', function(done) {
    const socket = ioClient(URL, { auth: { token: 'invalid-token' }, reconnection: false });
    socket.on('connect', () => {
      socket.close();
      done(new Error('should not connect with invalid token'));
    });
    socket.on('connect_error', (err) => {
      socket.close();
      done();
    });
  });
});
