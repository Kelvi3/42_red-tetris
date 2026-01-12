const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function socketLogger(socket, next) {
  try {
    const addr = (socket.handshake && socket.handshake.address) || (socket.conn && socket.conn.remoteAddress) || 'unknown';
  } catch (err) {
  }
  next();
}

function socketJwtAuth(socket, next) {
  const token = (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) || (socket.handshake && socket.handshake.query && socket.handshake.query.token);

  if (!token) {
    socket.user = { anonymous: true };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    return next();
  });
}

module.exports = {
  socketLogger,
  socketJwtAuth,
};
