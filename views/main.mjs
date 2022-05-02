//const socket = io();
const { RoomId } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const game = {
  pOne: {
    id: 0, name: '', stack: 100, cards: [], preFlop: 0, flop: 0, turn: 0, river: 0,
  },
  pTwo: {
    id: 0, name: '', stack: 100, cards: [], preFlop: 0, flop: 0, turn: 0, river: 0,
  },
  bet: {
    preFlop: 0, flop: 0, turn: 0, river: 0,
  },
  pot: { deck: [], stack: 0, cards: [] },
  state: {
    pTurn: 0, dealer: 0, bb: 1, gameStage: 0, turnCounter: 0,
  },
  showDown: { pOne: [], pTwo: [] },
};
let pOneCards = game.pOne.cards;
let pTwoCards = game.pTwo.cards;
let { deck } = game.pot;
let potCards = game.pot.cards;
let { gameStage } = game.state;

const slider = document.getElementById('myRange');
const output = document.getElementById('demo');
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
};
//select check call and raise button
const checkButton = document.getElementById('check-fold-btn');
const callButton = document.getElementById('call-btn');
const raiseButton = document.getElementById('raise-btn');

//select player cards
const playerCard = document.getElementsByClassName('player-card');
const playerSuit = document.getElementsByClassName('player-suit');
const playerBack = document.getElementsByClassName('player-back');

//select opp cards
const oppCard = document.getElementsByClassName('opp-card');
const oppSuit = document.getElementsByClassName('opp-suit');
const oppBack = document.getElementsByClassName('opp-back');

//select pot cards
const potCard = document.getElementsByClassName('pot-card');
const potSuit = document.getElementsByClassName('pot-suit');
const potBack = document.getElementsByClassName('pot-back');
const potCredit = document.getElementById('pot-size');
const potMsg = document.getElementById('pot-msg');

//select opp stack and name
const oppName = document.getElementById('opp-name');
const oppCredit = document.getElementById('opp-credit');

//select my credit
const myCredit = document.getElementById('my-money');

// dealer button
const myDealerButton = document.getElementById('my-dealer-btn');
const oppDealerButton = document.getElementById('opp-dealer-btn');

// change pot card color
const colorChangerPot = (card, id) => {
  if (card.suitName === 'h' || card.suitName === 'd') {
    // change the color of Number and suit
    potCard[id].classList.add('text-danger');
    potSuit[id].classList.add('text-danger');
    potBack[id].classList.add('bg-light');
  }
  if (card.suitName === 's' || card.suitName === 'c') {
    // change the color of Number and suit
    potCard[id].classList.add('text-dark');
    potSuit[id].classList.add('text-dark');
    potBack[id].classList.add('bg-light');
  }
};

// change player card color
const colorChangerPlayer = (card, id) => {
  if (card.suitName === 'h' || card.suitName === 'd') {
    // change the color of Number and suit
    playerCard[id].classList.add('text-danger');
    playerSuit[id].classList.add('text-danger');
    playerBack[id].classList.remove(`bg-dark`)
  }
  if (card.suitName === 's' || card.suitName === 'c') {
    // change the color of Number and suit
    playerCard[id].classList.add('text-dark');
    playerSuit[id].classList.add('text-dark');
    playerBack[id].classList.remove(`bg-dark`)

  }
};

const potCardHandler = (cards) => {
  for (let i = 0; i < cards.length; i += 1) {
    potCard[i].innerText = cards[i].name;
    potSuit[i].innerText = cards[i].symbol;
    potBack[i].classList.remove('bg-dark');

    colorChangerPot(cards[i], i);
  }
};

const makeDeck = () => {
  const cardDeck = [];
  for (let i = 0; i < 4; i += 1) {
    for (let j = 1; j <= 13; j += 1) {
      const card = { name: `${j}`, rank: j, symbol: i };
      switch (i) {
        case 0:
          card.symbol = '♠';
          card.suitName = 's';
          card.color = 'black';
          break;
        case 1:
          card.symbol = '♣';
          card.suitName = 'c';
          card.color = 'black';
          break;
        case 2:
          card.symbol = '♥';
          card.suitName = 'h';
          card.color = 'red';
          break;
        case 3:
          card.symbol = '♦';
          card.suitName = 'd';
          card.color = 'red';
          break;
        default:
      }

      switch (j) {
        case 1:
          card.name = 'A';
          break;
        case 11:
          card.name = 'J';
          break;
        case 12:
          card.name = 'Q';
          break;
        case 13:
          card.name = 'K';
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

// preflop bank update
const preflopBankUpdate = () => {
  myBank -= sb;
  oppBank -= bb;
  myBet = sb;
  potBank += sb + bb;
  potCredit.innerText = potBank;
  myCredit.innerText = myBank;
  oppCredit.innerText = oppBank;
  slider.max = myBank;
};

const preflopOppUpdate = () => {
  myBank -= bb;
  oppBank -= sb;
  potBank += sb + bb;
  myCredit.innerText = myBank;
  oppCredit.innerText = oppBank;
  potCredit.innerText = potBank;
  console.log(`my bank size ${myBank}`);
};
// to update bank and pot size
const myBankUpdate = (amount) => {
  myBank -= amount;
  potBank += Number(amount);
  potCredit.innerText = potBank;
  myCredit.innerText = myBank;
  slider.max = myBank;
};

const oppBankUpdate = (amount) => {
  oppBank -= amount;
  console.log('asdasd');
  console.log(myBank);
  potBank += Number(amount);
  myCredit.innerText = myBank;
  oppCredit.innerText = oppBank;
  potCredit.innerText = potBank;
};

// to enable and disable buttons
const actionButtonEnable = () => {
  checkButton.classList.remove('disabled');
  callButton.classList.remove('disabled');
  raiseButton.classList.remove('disabled');
};

const actionButtonDisable = () => {
  checkButton.classList.add('disabled');
  callButton.classList.add('disabled');
  raiseButton.classList.add('disabled');
};
// preflop draw and shuffle deck
const resetGame = () => {
pOneCards = []
pTwoCards = []
deck =[]
potCards = []
gameStage  = 0
};

const startGame = () => {
  deck.push(makeDeck());
  pOneCards.push(deck.pop());
  pTwoCards.push(deck.pop());
  pOneCards.push(deck.pop());
  pTwoCards.push(deck.pop());
};
// check button listener
checkButton.addEventListener('click', () => {
  // on the first click, clicker will be player one and have the dealer button
  if (gameStage === 0) {
    gameStage = 1;
  }
  // dealing of two cards, dealt by dealer, start with sb, opp bb
  if (gameStage === 1) {
    gameStage += 1;
    preflopBankUpdate();
    myDealerButton.classList.remove('invisible');
    myDealerButton.classList.add('visible');
    for (let i = 0; i < 2; i += 1) {
      playerCard[i].innerText = playerOneCard[i].name;
      playerSuit[i].innerText = playerOneCard[i].symbol;
      playerBack[i].classList.remove('bg-dark');
      playerBack[i].classList.add('bg-light');
      colorChangerPlayer(playerOneCard[i], i);
    }
    socket.emit('flopOpp', playerTwoCard);
  }
  // pre-flop action
  else if (gameStage === 2) {
    allFiveCards.push(myDeck.pop());
    gameStage += 1;
    potCardHandler(allFiveCards);
  }
  else if (gameState === 3) {
    allFiveCards.push(myDeck.pop());
    gameStage += 1;
    potCardHandler(allFiveCards);
  }
});

// const callButton = document.getElementById();
// connecting to room

// changing opp name
socket.on('messageToAll', (userId) => {
  oppName.innerText = `${userId}`;
  game.pOne.name = 
});

// changing message for pot-msg
socket.on('potMsg', (message, users) => {
  potMsg.innerText = `${message}`;
  gameState = 1;
});

socket.on('PreflopDraw', (users) => {
});

socket.on('flopOppShow', (cards) => {
  console.log('within flopOppShow');
  for (let i = 0; i < 2; i += 1) {
    playerCard[i].innerText = cards[i].name;
    playerSuit[i].innerText = cards[i].symbol;
    playerBack[i].classList.remove('bg-dark');
    playerBack[i].classList.add('bg-light');
    colorChangerPlayer(cards[i], i);
  }
  actionButtonDisable();
});

socket.on('dealerButton', () => {
  oppDealerButton.classList.remove('invisible');
  oppDealerButton.classList.add('visible');
});

raiseButton.addEventListener('click', () => {
  raiseButton.value = slider.value;
  preflopBet = raiseButton.value;
  myBankUpdate(preflopBet);
  actionButtonDisable();

  socket.emit('raiseButton', preflopBet);
});

// callButton.addEventListener('click', () => {
//   const reminderCredit = preflopBet - myBet;
//   myBankUpdate(reminderCredit);
//   actionButtonDisable();
//   socket.emit('raiseButton', reminderCredit);
// });
let asdasd = 0;
callButton.addEventListener('click', () => {
  console.log('call button clicked');
  console.log(asdasd);
  if (asdasd === 0) {
    allFiveCards.push(myDeck.pop());
    allFiveCards.push(myDeck.pop());
    allFiveCards.push(myDeck.pop());
    asdasd += 1;
    potCardHandler(allFiveCards);

    socket.emit('potCards', allFiveCards);
  } else if (asdasd === 1) {
    allFiveCards.push(myDeck.pop());
    asdasd += 1;
    potCardHandler(allFiveCards);
    socket.emit('potCards', allFiveCards, asdasd);
  } else if (asdasd === 2) {
    allFiveCards.push(myDeck.pop());
    asdasd += 1;
    potCardHandler(allFiveCards);
    socket.emit('potCards', allFiveCards);
  } else {
    for (let i = 0; i < 2; i += 1) {
      oppCard[i].innerText = playerTwoCard[i].name;
      oppSuit[i].innerText = playerTwoCard[i].symbol;
      oppBack[i].classList.remove('bg-dark');
      oppBack[i].classList.add('bg-light');
      colorChangerPlayer(playerTwoCard[i], i);
      socket.emit('showOppCards', playerOneCard);
    }
  }
});

socket.on('raiseUpdate', (raise) => {
  console.log(`within raise update: ${raise}`);
  oppBankUpdate(raise);
  actionButtonEnable();
});

socket.on('preflopAction', () => {
  preflopOppUpdate();
});

socket.on('showPotCards', (cards) => {
  console.log('from show pot cards');
  potCardHandler(cards);
  actionButtonEnable();
});

socket.on('showPotCards-SoC', (card) => {
  for (let i = 0; i < 2; i += 1) {
    oppCard[i].innerText = card[i].name;
    oppSuit[i].innerText = card[i].symbol;
    oppBack[i].classList.remove('bg-dark');
    oppBack[i].classList.add('bg-light');
    colorChangerPlayer(card[i], i); }
});


//socket.emit('joinRoom', RoomId);
