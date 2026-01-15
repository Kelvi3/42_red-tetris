import params from '../../params.js';
import * as server from './index.js';

server.create(params.server)
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });