// import params  from '../../params'
// import * as server from './index'
// server.create(params.server).then( 
//     () => console.log('server is running ...')
// )


import params from '../../params.js';
import * as server from './index.js';

/**
 * Initialisation du serveur Tetris
 * Note : L'extension .js est obligatoire pour la résolution ESM
 */
server.create(params.server)
  .then(() => {
    console.log(`Server is running on ${params.server.host}:${params.server.port}`);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });