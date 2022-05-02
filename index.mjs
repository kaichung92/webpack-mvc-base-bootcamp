import express from "express";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";

import { createServer } from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import pkg from "pokersolver";
import { createRequire } from "module";
import bindRoutes from "./routes.mjs";

// These lines make "require" available
const require = createRequire(import.meta.url);
let { Hand } = require("pokersolver");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cookie: true,
});
// Initialise Express instance
// Set the Express view engine to expect EJS templates
app.set("view engine", "ejs");
// Bind cookie parser middleware to parse cookies in requests
app.use(cookieParser());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());
// Bind method override middleware to parse PUT and DELETE requests sent as POST requests
app.use(methodOverride("_method"));
// Expose the files stored in the public folder
app.use(express.static("public"));
// Expose the files stored in the distribution folder
app.use(express.static("dist"));

// Bind route definitions to the Express application
bindRoutes(app);

let game = {
  pOne: {
    id: 0,
    name: "",
    stack: 100,
    cards: [],
    bet: 0,
  },
  pTwo: {
    id: 0,
    name: "",
    stack: 100,
    cards: [],
    bet: 0,
  },
  pot: {
    deck: [],
    stack: 0,
    cards: [],
  },
  state: {
    pTurn: 0,
    dealer: "",
    gameState: 0,
    turnCounter: 0,
  },
};

const users = [];
let user;
let winner = "";
// function
const makeDeck = () => {
  const cardDeck = [];
  for (let i = 0; i < 4; i += 1) {
    for (let j = 1; j <= 13; j += 1) {
      const card = { name: `${j}`, rank: j, symbol: i };
      switch (i) {
        case 0:
          card.symbol = "♠";
          card.suitName = "s";
          card.color = "black";
          break;
        case 1:
          card.symbol = "♣";
          card.suitName = "c";
          card.color = "black";
          break;
        case 2:
          card.symbol = "♥";
          card.suitName = "h";
          card.color = "red";
          break;
        case 3:
          card.symbol = "♦";
          card.suitName = "d";
          card.color = "red";
          break;
        default:
      }

      switch (j) {
        case 1:
          card.name = "A";
          break;
        case 11:
          card.name = "J";
          break;
        case 12:
          card.name = "Q";
          break;
        case 13:
          card.name = "K";
          break;
        default:
      }

      cardDeck.push(card);
    }
  }

  const getRandomIndex = (max) => Math.floor(Math.random() * max);

  for (let i = 0; i < cardDeck.length; i += 1) {
    const randomIndex = getRandomIndex(cardDeck.length);
    const randomCard = cardDeck[randomIndex];
    const currentCard = cardDeck[i];

    cardDeck[i] = randomCard;
    cardDeck[randomIndex] = currentCard;
  }
  return cardDeck;
};

const startGame = () => {
  game.pot.deck.push(makeDeck());
  game.pOne.cards.push(game.pot.deck[0].pop());
  game.pTwo.cards.push(game.pot.deck[0].pop());
  game.pOne.cards.push(game.pot.deck[0].pop());
  game.pTwo.cards.push(game.pot.deck[0].pop());
};
io.on("connection", (socket) => {
  function userJoin(id, username, roomId) {
    const user = { id, username, roomId };
    users.push(user);
    return user;
  }
  const cookies = cookie.parse(socket.handshake.headers.cookie);
  // join different rooms
  socket.on("joinRoom", (roomId) => {
    const username = cookies.userId;
    user = userJoin(socket.id, username, roomId);
    console.log(`number of players: ${users.length}`);
    io.to(user.id).emit("my-username-soc", user.username);
    if (users.length === 1) {
      game.pOne.name = user.username;
    }
    io.to(socket.id).emit("personalUsername", username);

    socket.join(user.roomId);
    if (users.length === 2) {
      io.in(user.roomId).emit(
        "beginning-update-name-soc",
        users[0].username,
        users[1].username
      );
      game.pTwo.name = user.username;
      io.in(user.roomId).emit(
        "potMsg",
        "Great everyone is here, press check to start"
      );
    }
  });

  // starting of game, making deck, username will be dealer,
  socket.on("dealer-assign-cos", (username) => {
    game.state.dealer = username;
    startGame();
    game.state.gameState += 1;
    if (username === game.pOne.name) {
      game.pOne.bet += 1;
      game.pOne.stack -= game.pOne.bet;
      game.pTwo.bet += 2;
      game.pTwo.stack -= game.pTwo.bet;
      game.pot.stack += game.pOne.bet + game.pTwo.bet;
      io.in(user.roomId).emit(
        "current-bet-my-bet-soc",
        game.state.dealer,
        game.pOne.bet,
        game.pTwo.bet
      );
      io.in(user.roomId).emit(
        "starting-pot-soc",
        game.state.dealer,
        game.pOne.stack,
        game.pTwo.stack,
        game.pot.stack
      );
    } else {
      game.pTwo.bet += 1;
      game.pTwo.stack -= game.pTwo.bet;
      game.pOne.bet += 2;
      game.pOne.stack -= game.pOne.bet;
      game.pot.stack += game.pOne.bet + game.pTwo.bet;
      io.in(user.roomId).emit(
        "current-bet-my-bet-soc",
        game.state.dealer,
        game.pTwo.bet,
        game.pOne.bet
      );
      io.in(user.roomId).emit(
        "starting-pot-soc",
        game.state.dealer,
        game.pTwo.stack,
        game.pOne.stack,
        game.pot.stack
      );
    }
    console.log(game.pOne.name, game.pOne.cards);
    console.log(game.pTwo.name, game.pTwo.cards);

    io.in(user.roomId).emit("toggle-dealer-button-soc", username);
    io.in(user.roomId).emit(
      "starting-two-cards-soc",
      game.pOne.name,
      game.pTwo.name,
      game.pOne.cards,
      game.pTwo.cards
    );
    io.in(user.roomId).emit("update-dealer-postion", game.state.dealer);
    io.in(user.roomId).emit("potMsg", `${username}, action on you.`);
  });

  socket.on("flopOpp", (arg) => {
    console.log(arg); // world
    socket.to(user.roomId).emit("dealerButton");
    io.in(user.roomId).emit("potMsg", "dealer button first to act");
    socket.to(user.roomId).emit("flopOppShow", arg);
    socket.to(user.roomId).emit("preflopAction");
  });

  socket.on("raiseButton", (raise) => {
    io.in(user.roomId).emit("potMsg", `raise to ${raise}`);
    socket.to(user.roomId).emit("raiseUpdate", raise);
  });

  socket.on("draw-three-flop-cos", (number) => {
    for (let i = 0; i < number; i += 1) {
      game.pot.cards.push(game.pot.deck[0].pop());
    }
    io.in(user.roomId).emit("draw-three-flop-soc", game.pot.cards);
  });

  socket.on("potCards", (cards, asdasd) => {
    socket.to(user.roomId).emit("showPotCards", cards);
  });

  socket.on("showOppCards", (playerOneCard) => {
    socket.to(user.roomId).emit("showPotCards-SoC", playerOneCard);
  });

  socket.on("raise-button-cos", (player, betSize) => {
    if (player === game.pOne.name) {
      game.pOne.stack -= betSize;
      game.pOne.bet += betSize;
      game.pot.stack += Number(betSize);
      io.in(user.roomId).emit(
        "raise-button-soc",
        game.pOne.name,
        game.pot.stack,
        game.pOne.stack
      );
    } else {
      game.pTwo.stack -= betSize;
      game.pTwo.bet += betSize;
      game.pot.stack += Number(betSize);
      io.in(user.roomId).emit(
        "raise-button-soc",
        game.pTwo.name,
        game.pot.stack,
        game.pTwo.stack
      );
    }
    console.log(game.pOne.name);
    console.log(game.pOne.stack);
    console.log(game.pOne.bet);
    console.log(game.pTwo.name);
    console.log(game.pTwo.stack);
    console.log(game.pTwo.bet);
  });

  socket.on("update-raise-slider-cos", (player) => {
    if (player === game.pOne.name) {
      socket.emit("update-rasie-slider-soc", game.pOne.stack);
    } else {
      socket.emit("update-rasie-slider-soc", game.pTwo.stack);
    }
  });
  socket.on("show-opp-cards-cos", (player) => {
    io.in(user.roomId).emit(
      "show-opp-cards-soc",
      game.state.dealer,
      game.pTwo.cards,
      game.pOne.cards
    );
  });
  socket.on("button-controller", () => {
    socket.to(user.roomId).emit("button-controller-soc");
  });

  socket.on("update-current-raise-cos", (username, bet) => {
    if (username === game.pOne.name) {
      game.pOne.bet = bet;
    } else {
      game.pTwo.bet = bet;
    }
    socket.to(user.roomId).emit("update-crrent-rasie-soc", bet);
  });
  socket.on("dealer-button-controller-cos", () => {
    socket.to(user.roomId).emit("dealer-button-controller-soc");
  });

  socket.on("update-pot-stack", (potSize) => {
    socket.to(user.roomId).emit("update-pot-stack-soc", potSize);
  });
  socket.on("update-stack-cos", () => {
    socket.to(user.roomId).emit("update-stack-soc");
  });

  socket.on("toggle-button-cos", () => {
    io.in(user.roomId).emit("toggle-button-soc");
  });

  socket.on("message-to-all-cos", (msg) => {
    io.in(user.roomId).emit("message-to-all-soc", msg);
  });

  socket.on("message-to-self-cos", (betSize) => {
    socket.emit("message-to-self-soc", betSize);
  });

  socket.on("message-to-opp-cos", (username) => {
    socket.to(user.roomId).emit("message-to-opp-soc", username);
  });

  socket.on("resetting-game-cos", (username) => {
    io.in(user.roomId).emit("reset-all-players-var-soc");
    io.in(user.roomId).emit("clear-pot-cards-soc");
    if (!winner) {
      if (username === game.pOne.name) {
        winner = game.pTwo.name;
      } else {
        winner = game.pOne.name;
      }
    }

    if (winner === "draw") {
      const half = game.pot.stack / 2;
      game.pOne.stack += half;
      game.pTwo.stack += half;
    }

    if (winner === game.pOne.name) {
      game.pOne.stack += game.pot.stack;
    } else {
      game.pTwo.stack += game.pot.stack;
    }

    if (game.pOne.name === game.state.dealer) {
      game.state.dealer = game.pTwo.name;
    } else {
      game.state.dealer = game.pOne.name;
    }
    game.pOne.cards = [];
    game.pOne.bet = 0;
    game.pTwo.cards = [];
    game.pTwo.bet = 0;
    game.pot.deck = [];
    game.pot.stack = 0;
    game.pot.cards = [];
    game.state.gameState = 1;
    game.state.turnCounter = 0;
    game.pot.stack = 0;
    winner = "";
    startGame();

    if (game.state.dealer === game.pOne.name) {
      game.pOne.bet += 1;
      game.pOne.stack -= game.pOne.bet;
      game.pTwo.bet += 2;
      game.pTwo.stack -= game.pTwo.bet;
      game.pot.stack += game.pOne.bet + game.pTwo.bet;
      io.in(user.roomId).emit(
        "current-bet-my-bet-soc",
        game.state.dealer,
        game.pOne.bet,
        game.pTwo.bet
      );
      io.in(user.roomId).emit(
        "starting-pot-soc",
        game.state.dealer,
        game.pOne.stack,
        game.pTwo.stack,
        game.pot.stack
      );
    } else {
      game.pTwo.bet += 1;
      game.pTwo.stack -= game.pTwo.bet;
      game.pOne.bet += 2;
      game.pOne.stack -= game.pOne.bet;
      game.pot.stack += game.pOne.bet + game.pTwo.bet;
      io.in(user.roomId).emit(
        "current-bet-my-bet-soc",
        game.state.dealer,
        game.pTwo.bet,
        game.pOne.bet
      );
      io.in(user.roomId).emit(
        "starting-pot-soc",
        game.state.dealer,
        game.pTwo.stack,
        game.pOne.stack,
        game.pot.stack
      );
    }

    io.in(user.roomId).emit("activite-action-button-soc", game.state.dealer);
    io.in(user.roomId).emit("toggle-dealer-button-soc", game.state.dealer);
    io.in(user.roomId).emit(
      "starting-two-cards-soc",
      game.pOne.name,
      game.pTwo.name,
      game.pOne.cards,
      game.pTwo.cards
    );
    io.in(user.roomId).emit("update-dealer-postion", game.state.dealer);
    io.in(user.roomId).emit("potMsg", `${game.state.dealer}, action on you.`);
  });

  socket.on("increase-gamestate-cos", () => {
    game.state.gameState += 1;
    game.pOne.bet = 0;
    game.pTwo.bet = 0;
    io.in(user.roomId).emit("increase-gamestate-soc");
  });
  socket.on("increase-check-checker-cos", (count) => {
    io.in(user.roomId).emit("increase-check-cheaker-soc", count);
  });

  socket.on("show-winner-cos", (username) => {
    let p1 = [];
    let p2 = [];
    for (let i = 0; i < 2; i += 1) {
      p1.push(`${game.pOne.cards[i].name}${game.pOne.cards[i].suitName}`);
      p2.push(`${game.pTwo.cards[i].name}${game.pTwo.cards[i].suitName}`);
    }
    for (let i = 0; i < 5; i += 1) {
      p1.push(`${game.pot.cards[i].name}${game.pot.cards[i].suitName}`);
      p2.push(`${game.pot.cards[i].name}${game.pot.cards[i].suitName}`);
    }
    const handOne = Hand.solve(p1);
    const handTwo = Hand.solve(p2);
    let handWinner = Hand.winners([handOne, handTwo]);
    console.log(`player one hand: ${handOne.descr}`);
    console.log(`player two hand: ${handTwo.descr}`);
    console.log(`winning hand: ${handWinner[0].descr}`);
    if (
      handWinner[0].descr === handOne.descr &&
      handOne.descr === handTwo.descr
    ) {
      io.in(user.roomId).emit("potMsg", "its a draw");
      winner = "draw";
      return;
    }

    if (handWinner[0].descr === handOne.descr) {
      io.in(user.roomId).emit(
        "potMsg",
        `${game.pOne.name} won with ${handWinner[0].descr}`
      );
      winner = `${game.pOne.name}`;
    }
    if (handWinner[0].descr === handTwo.descr) {
      io.in(user.roomId).emit(
        "potMsg",
        `${game.pTwo.name} won with ${handWinner[0].descr}`
      );
      winner = `${game.pTwo.name}`;
    }
    console.log(winner);
  });

  function userLeave(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  }
  socket.on("toggle-fold-check-call-cos", (currentBet) => {
    socket.to(user.roomId).emit("toggle-fold-check-call-soc", currentBet);
  });

  socket.on("increase-dealercall-counter-cos", () => {
    io.in(user.roomId).emit("increase-dealercall-counter-soc");
  });

  io.emit();
});

// Set Express to listen on the given port
const PORT = process.env.PORT || 3004;
// app.listen(PORT);
httpServer.listen(PORT);
