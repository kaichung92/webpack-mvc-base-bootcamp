import axios from 'axios';

// const socket = io();

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

export default function initGameController(db) {
  const preFlop = (request, response) => {
    const playerName = request.cookies.userId;
    response.render('game', { playerName });
  };

  const flop = () => {

  };

  const turn = () => {
  };

  const river = () => {
    allFiveCard.push(myDeck.pop());
  };

  const endRound = () => {
    playerOneCard = [];
    playerTwoCard = [];
    allFiveCard = [];
  };
  // options the player can run check, fold, call and raise

  return {
    preFlop, flop, turn, river, endRound,
  };
}
