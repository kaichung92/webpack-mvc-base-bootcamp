// let { Hand } = require('pokersolver');

const socket = io();
const { RoomId } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

let username = '';
let gameState = 0;
let dealer = '';
let dealerCall = 0;
let myBet = 0;
let currentBet = 0;
let myCards = [];
let checkChecker = 0;

const slider = document.getElementById('myRange');
const output = document.getElementById('demo');
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
};
// select check call and raise button
const checkButton = document.getElementById('check-fold-btn');
const callButton = document.getElementById('call-btn');
const raiseButton = document.getElementById('raise-btn');

// select player cards
const playerCard = document.getElementsByClassName('player-card');
const playerSuit = document.getElementsByClassName('player-suit');
const playerBack = document.getElementsByClassName('player-back');

// select opp cards
const oppCard = document.getElementsByClassName('opp-card');
const oppSuit = document.getElementsByClassName('opp-suit');
const oppBack = document.getElementsByClassName('opp-back');

// select pot cards
const potCard = document.getElementsByClassName('pot-card');
const potSuit = document.getElementsByClassName('pot-suit');
const potBack = document.getElementsByClassName('pot-back');
const potCredit = document.getElementById('pot-size');
const potMsg = document.getElementById('pot-msg');

// select opp stack and name
const oppName = document.getElementById('opp-name');
const oppCredit = document.getElementById('opp-credit');

// select my credit
const myCredit = document.getElementById('my-money');

// dealer button
const myDealerButton = document.getElementById('my-dealer-btn');
const oppDealerButton = document.getElementById('opp-dealer-btn');

const actionButtonToggle = () => {
  checkButton.classList.toggle('disabled');
  callButton.classList.toggle('disabled');
  raiseButton.classList.toggle('disabled');
};

const colorChangerPlayer = (card, id) => {
  if (card.suitName === 'h' || card.suitName === 'd') {
    // change the color of Number and suit
    playerCard[id].classList.add('text-danger');
    playerSuit[id].classList.add('text-danger');
    playerBack[id].classList.remove('bg-dark');
    playerBack[id].classList.add('bg-light');
    playerSuit[id].innerText = card.symbol;
    playerCard[id].innerText = card.name;
  }
  if (card.suitName === 's' || card.suitName === 'c') {
    // change the color of Number and suit
    playerCard[id].classList.add('text-dark');
    playerSuit[id].classList.add('text-dark');
    playerBack[id].classList.remove('bg-dark');
    playerBack[id].classList.add('bg-light');
    playerSuit[id].innerText = card.symbol;
    playerCard[id].innerText = card.name;
  }
};

const colorChangerOpp = (card, id) => {
  if (card.suitName === 'h' || card.suitName === 'd') {
    // change the color of Number and suit
    oppCard[id].classList.add('text-danger');
    oppSuit[id].classList.add('text-danger');
    oppBack[id].classList.remove('bg-dark');
    oppBack[id].classList.add('bg-light');
    oppSuit[id].innerText = card.symbol;
    oppCard[id].innerText = card.name;
  }
  if (card.suitName === 's' || card.suitName === 'c') {
    // change the color of Number and suit
    oppCard[id].classList.add('text-dark');
    oppSuit[id].classList.add('text-dark');
    oppBack[id].classList.remove('bg-dark');
    oppBack[id].classList.add('bg-light');
    oppSuit[id].innerText = card.symbol;
    oppCard[id].innerText = card.name;
  }
};

const colorChangerPot = (card, id) => {
  if (card.suitName === 'h' || card.suitName === 'd') {
    // change the color of Number and suit
    potCard[id].classList.add('text-danger');
    potSuit[id].classList.add('text-danger');
    potBack[id].classList.remove('bg-dark');
    potBack[id].classList.add('bg-light');
    potSuit[id].innerText = card.symbol;
    potCard[id].innerText = card.name;
  }
  if (card.suitName === 's' || card.suitName === 'c') {
    // change the color of Number and suit
    potCard[id].classList.add('text-dark');
    potSuit[id].classList.add('text-dark');
    potBack[id].classList.remove('bg-dark');
    potBack[id].classList.add('bg-light');
    potSuit[id].innerText = card.symbol;
    potCard[id].innerText = card.name;
  }
};

const delayForThreeSec = () => {
  socket.emit('resetting-game-cos', username);
};
checkButton.addEventListener('click', () => {
  if (callButton.classList.contains('disabled')) {
    callButton.classList.toggle('disabled');
  }

  if (checkButton.textContent.includes('Fold')) {
    checkButton.innerText = 'Check';
  }

  if (gameState === 0) {
    socket.emit('dealer-assign-cos', username);
    socket.emit('message-to-self-cos', 'youre the dealer! action on you');
    socket.emit('message-to-opp-cos', `${username} is the dealer`);
    socket.emit('toggle-fold-check-call-cos', myBet);
    checkButton.innerText = 'Fold';
    return;
  }

  if (currentBet > myBet) {
    // reset game
    setTimeout(delayForThreeSec, 5000);
    return;
  }

  if (currentBet === myBet && gameState === 1) {
    socket.emit('draw-three-flop-cos', 3);
    socket.emit('increase-gamestate-cos');
    socket.emit('message-to-all-cos', 'there comes the flop');
    socket.emit('toggle-fold-check-call-cos', myBet);
    callButton.classList.toggle('disabled');
    return;
  }

  if (currentBet === myBet && gameState > 1 && gameState < 4 && checkChecker === 0) {
    checkChecker += 1;
    socket.emit('toggle-button-cos');
    socket.emit('increase-check-checker-cos', checkChecker);
    socket.emit('message-to-all-cos', `${username} has checked`);
    socket.emit('toggle-fold-check-call-cos', myBet);
    console.log(myBet);
    return;
  }

  if (currentBet === myBet && gameState > 1 && gameState < 4 && checkChecker === 1) {
    checkChecker -= 1;
    socket.emit('draw-three-flop-cos', 1);
    socket.emit('increase-gamestate-cos');
    socket.emit('toggle-button-cos');
    socket.emit('increase-check-checker-cos', checkChecker);
    socket.emit('toggle-fold-check-call-cos', myBet);

    if (gameState === 2) {
      socket.emit('message-to-all-cos', 'there comes the turn');
    } else {
      socket.emit('message-to-all-cos', 'there comes the river');
    }

    return;
  }
  if (currentBet === myBet && gameState === 4 && checkChecker === 0) {
    checkChecker += 1;
    socket.emit('toggle-button-cos');
    socket.emit('increase-check-checker-cos', checkChecker);
    socket.emit('message-to-opp-cos', 'there comes the river');
    socket.emit('toggle-fold-check-call-cos', myBet);

    return;
  }

  if (currentBet === myBet && gameState === 4 && checkChecker === 1) {
    socket.emit('show-opp-cards-cos');
    socket.emit('show-winner-cos', username);
    setTimeout(delayForThreeSec, 5000);
  }
});

callButton.addEventListener('click', () => {
  if (checkButton.textContent.includes('Fold')) {
    checkButton.innerText = 'Check';
  }
  const callAmount = currentBet - myBet;
  myBet = currentBet;

  if (gameState === 1 && dealer === username && dealerCall === 0) {
    console.log('within pre flop call');
    socket.emit('update-current-raise-cos', username, myBet);
    socket.emit('raise-button-cos', username, callAmount);
    socket.emit('update-raise-slider-cos', username);
    socket.emit('toggle-button-cos');
    socket.emit('message-to-self-cos', `you have called to ${myBet}`);
    socket.emit('message-to-opp-cos', `${username} have called, action on you`);
    socket.emit('toggle-fold-check-call-cos', myBet);
    socket.emit('increase-dealercall-counter-cos');
    return;
  }
  if (gameState === 1 && dealerCall === 1) {
    console.log('within call with gamestate 1');
    socket.emit('update-current-raise-cos', username, myBet);
    socket.emit('increase-gamestate-cos');
    socket.emit('message-to-all-cos', `${username} has called, theres the flop`);

    socket.emit('raise-button-cos', username, callAmount);
    socket.emit('update-raise-slider-cos', username);
    socket.emit('draw-three-flop-cos', 3);
    socket.emit('toggle-fold-check-call-cos', myBet);
    if (dealer === username) {
      socket.emit('toggle-button-cos');
    } else {
      callButton.classList.add('disabled');
    }
    return;
  }

  if (gameState > 1 && gameState < 4 || gameState === 1 && dealerCall === 1) {
    socket.emit('update-current-raise-cos', username, myBet);
    socket.emit('increase-gamestate-cos');
    socket.emit('raise-button-cos', username, callAmount);
    socket.emit('update-raise-slider-cos', username);
    socket.emit('draw-three-flop-cos', 1);
    if (dealer === username) {
      socket.emit('toggle-button-cos');
    } else {
      callButton.classList.add('disabled');
    }
    socket.emit('toggle-fold-check-call-cos', myBet);
  }

  if (gameState === 4) {
    socket.emit('show-opp-cards-cos');
    socket.emit('show-winner-cos', username);
    setTimeout(delayForThreeSec, 6000);
  }
});

raiseButton.addEventListener('click', () => {
  if (callButton.classList.contains('disabled')) {
    callButton.classList.toggle('disabled');
  }
  raiseButton.value = slider.value;
  const betSize = raiseButton.value;
  myBet += Number(betSize);
  if (myBet < currentBet * 2) {
    socket.emit('message-to-self-cos', `minimun raise: ${currentBet * 2}`);
    return;
  }
  if (gameState === 1) {
    socket.emit('increase-dealercall-counter-cos');
  }
  socket.emit('update-current-raise-cos', username, myBet);
  socket.emit('raise-button-cos', username, betSize);
  socket.emit('update-raise-slider-cos', username);
  socket.emit('message-to-self-cos', `you have raised to ${myBet}`);
  socket.emit('message-to-opp-cos', `${username} have raised to ${myBet}, action on you`);
  socket.emit('toggle-button-cos');
  socket.emit('toggle-fold-check-call-cos', myBet);
});

socket.on('beginning-update-name-soc', (p1, p2) => {
  if (username === p1) {
    oppName.innerText = p2;
  } else {
    oppName.innerText = p1;
  }
});
socket.on('potMsg', (msg) => {
  potMsg.innerText = `${msg}`;
});

socket.on('toggle-dealer-button-soc', (dealer) => {
  if (gameState === 0)gameState += 1;
  if (username === dealer) {
    oppDealerButton.classList.add('invisible');
    myDealerButton.classList.remove('invisible');
  } else {
    oppDealerButton.classList.remove('invisible');
    myDealerButton.classList.add('invisible');
  }
});
socket.on('raise-button-soc', (raiser, pot, newStack) => {
  if (username === raiser) {
    myCredit.innerText = `${newStack}`;
    potCredit.innerText = `${pot}`;
  } else {
    oppCredit.innerText = `${newStack}`;
    potCredit.innerText = `${pot}`;
  }
});
socket.on('my-username-soc', (name) => {
  username = name;
  console.log(`my name is ${username}`);
});

socket.on('starting-two-cards-soc', (p1, p2, p1cards, p2cards) => {
  if (username === p1) {
    myCards = p1cards;
    for (let i = 0; i < 2; i += 1) {
      colorChangerPlayer(myCards[i], [i]); }
  }
  if (username === p2) {
    myCards = p2cards;
    for (let i = 0; i < 2; i += 1) {
      colorChangerPlayer(myCards[i], [i]); }
  }
});

socket.on('starting-pot-soc', (dealer, p1Stack, p2Stack, potStack) => {
  if (username === dealer) {
    myCredit.innerText = `${p1Stack}`;
    oppCredit.innerText = `${p2Stack}`;
  } else {
    oppCredit.innerText = `${p1Stack}`;
    myCredit.innerText = `${p2Stack}`;
    actionButtonToggle();
  }
  potCredit.innerText = `${potStack}`;
});

socket.on('draw-three-flop-soc', (flopCards) => {
  console.log(flopCards);
  for (let i = 0; i < 5; i += 1) {
    colorChangerPot(flopCards[i], [i]);
  }
});

socket.on('update-rasie-slider-soc', (maxStack) => {
  slider.max = maxStack;
});

socket.on('toggle-button-soc', () => {
  actionButtonToggle();
});

socket.on('show-opp-cards-soc', (dealer, card1, card2) => {
  if (username === dealer) {
    for (let i = 0; i < 2; i += 1) {
      colorChangerOpp(card1[i], [i]);
    }
  }
  else {
    for (let i = 0; i < 2; i += 1) {
      colorChangerOpp(card2[i], [i]);
    }
  }
});

socket.on('update-dealer-postion', (user) => {
  dealer = user;
});

socket.on('change-fold-to-check-soc', () => {
  checkButton.innerText = 'Check';
});

socket.on('message-to-self-soc', (betSize) => {
  potMsg.innerText = `${betSize}`;
});

socket.on('message-to-opp-soc', (user) => {
  potMsg.innerText = `${user}`;
});

socket.on('activite-action-button-soc', (dealer) => {
  if (username === dealer) {
    checkButton.classList.remove('disabled');
    callButton.classList.remove('disabled');
    raiseButton.classList.remove('disabled');
  }
});
socket.on('clear-pot-cards-soc', () => {
  for (let i = 0; i < 5; i += 1) {
    potCard[i].classList.remove('text-danger');
    potSuit[i].classList.remove('text-danger');
    potCard[i].classList.remove('text-dark');
    potSuit[i].classList.remove('text-dark');
    potBack[i].classList.add('bg-dark');
    potBack[i].classList.remove('bg-light');
    potSuit[i].innerText = '';
    potCard[i].innerText = '';
  }
  for (let j = 0; j < 2; j += 1) {
    oppCard[j].classList.remove('text-dark');
    oppSuit[j].classList.remove('text-dark');
    oppCard[j].classList.remove('text-danger');
    oppSuit[j].classList.remove('text-danger');
    oppBack[j].classList.remove('bg-light');
    oppBack[j].classList.add('bg-dark');
    oppSuit[j].innerText = '';
    oppCard[j].innerText = '';
    playerCard[j].classList.remove('text-dark');
    playerSuit[j].classList.remove('text-dark');
    playerCard[j].classList.remove('text-danger');
    playerSuit[j].classList.remove('text-danger');
    playerBack[j].classList.remove('bg-light');
    playerBack[j].classList.add('bg-dark');
    playerSuit[j].innerText = '';
    playerCard[j].innerText = '';
  }
});

socket.on('reset-all-players-var-soc', () => {
  gameState = 1;
  dealer = '';
  dealerCall = 0;
  myBet = 0;
  currentBet = 0;
  myCards = [];
  checkChecker = 0;
  checkButton.classList.remove('disabled');
  callButton.classList.remove('disabled');
  raiseButton.classList.remove('disabled');
});

socket.on('current-bet-my-bet-soc', (dealer, sb, bb) => {
  if (username === dealer) {
    myBet = sb;
    currentBet = bb;
  } else {
    myBet = bb;
    currentBet = bb;
  }
});
socket.on('increase-gamestate-soc', () => {
  gameState += 1;
  currentBet = 0;
  myBet = 0;
});
socket.on('update-crrent-rasie-soc', (bet) => {
  currentBet = bet;
});
socket.on('increase-check-cheaker-soc', (count) => {
  checkChecker = count;
  console.log(checkChecker);
});

socket.on('message-to-all-soc', (msg) => {
  potMsg.innerText = `${msg}`;
});

socket.on('toggle-fold-check-call-soc', (curr) => {
  console.log('hello from toggle-check-fold');
  if (curr === myBet) {
    console.log('met call button toggle');
    console.log(curr);
    console.log(myBet);
    checkButton.innerText = 'Check';

    callButton.classList.toggle('disabled');
  }
  if (curr > myBet) {
    console.log('within check-fold-toggle');
    console.log(curr);
    console.log(myBet);
    checkButton.innerText = 'Fold';
  }
});

socket.on('increase-dealercall-counter-soc', () => {
  console.log('increasing dealerCall');
  dealerCall = 1;
  console.log(dealerCall);
});
socket.emit('joinRoom', RoomId);
