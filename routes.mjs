import { resolve } from 'path';
import db from './models/index.mjs';

import initLoginController from './controllers/login.mjs';
import initLobbyController from './controllers/lobby.mjs';
import initGameController from './controllers/game.mjs';

export default function bindRoutes(app) {
  const loginController = initLoginController(db);
  const lobbyController = initLobbyController(db);
  const gameController = initGameController(db);

  // special JS page. Include the webpack index.html file
  app.get('/flop', gameController.flop);
  app.get('/game', gameController.preFlop);
  app.get('/', lobbyController.index);
  app.post('/login', loginController.loginAttempt);
  app.get('/login', loginController.login);
  app.get('/register', loginController.register);
  app.post('/register', loginController.newUser);
  app.post('/create', lobbyController.createRoom);
  app.get('/home', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });
}
