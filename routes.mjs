import { resolve } from 'path';

import initLoginController from './controllers/login.mjs';
import initLobbyController from './controllers/lobby.mjs';
import initGameController from './controllers/game.mjs';

export default function bindRoutes(app) {
<<<<<<< HEAD
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
=======
  // Root route returns the Webpack-generated main.html file
  app.get('/', (request, response) => {
>>>>>>> f53b9b50d9a3c78b3a6b66b26536c5f75018930b
    response.sendFile(resolve('dist', 'main.html'));
  });
}
