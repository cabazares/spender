import {
  GEM_COLORS,
  COLORS,
  MAIN_COLORS,
  LEVELS,
  POINTS_TO_WIN,
  MAX_TOKENS,
  MAX_RESERVED_CARDS,
  TOTAL_GOLD_TOKENS,
  TOTAL_CARDS,
  CARDS_PER_LEVEL,
  GAME_STATES,
} from './constants';

import {
  randInt,
  getShuffledColors,
  getCurrentPlayer,
  getPlayerPoints,
  getPlayerTokenCount,
  getRandomColor,
  gemsOfColor,
  removeGems,
  canPlayerAffordCard,
  removeCardFromBoard,
  getTokensToPayForCard,
} from './utils';

import {
  Card,
  CardLevel,
  GemColor,
  Player,
  Noble,
  CardPool,
  Game,
} from './types';


// create gems based on number of players
const createGems = (playerCount = 2): GemColor[] => {
  const tokenCount = 2 + playerCount;
  return [
    ...MAIN_COLORS.flatMap(color => Array(tokenCount).fill(color)),
    ...Array(TOTAL_GOLD_TOKENS).fill(GEM_COLORS.GOLD),
  ];
};


// create randomised cards
// TODO: read cards from somewheree
const createCards = (): CardPool => {
  const generateCard = (level: CardLevel): Card => {
    level = (level !== null) ? level : CardLevel[LEVELS[randInt(LEVELS.length)]];

    let colors = getShuffledColors().slice(0, 4);
    let cost = Array(randInt(5,3)).fill(null).map(() => getRandomColor(colors));
    let points = cost.length >= 4 ? 1 : 0;

    if (CardLevel.two === level) {
      colors = getShuffledColors().slice(0, 3);
      cost = Array(randInt(9,7)).fill(null).map(() => getRandomColor(colors));
      points = cost.length >= 8 ? 2 : 1;
    } else if (CardLevel.three === level) {
      colors = getShuffledColors().slice(0, 2);
      cost = Array(randInt(10,8)).fill(null).map(() => getRandomColor(colors));
      points = cost.length >= 8 ? 5 : 4;
    }

    return {
      color: colors[0],
      points,
      cost,
      level,
    };
  };

  const generateCards = (level: CardLevel): Card[] =>
    Array(CARDS_PER_LEVEL).fill(null).map(() => generateCard(level));

  return {
    deck: Array(TOTAL_CARDS - (LEVELS.length * CARDS_PER_LEVEL)).fill(null).map(generateCard),
    cards: [
      ...generateCards(CardLevel.one),
      ...generateCards(CardLevel.two),
      ...generateCards(CardLevel.three),
    ],
  };
};

// crate randomised nobles
// TODO: read from somewhere
const createNobles = (playerCount = 2): Noble[] => {
  const generateNoble = (): Noble => {
    // get 2 or 3 random colors
    const numColors = Math.round(Math.random()) + 2;
    const cardCost = numColors === 3 ? 3 : 4;
    const colors = getShuffledColors().splice(0, numColors);

    return {
      points: 3,
      //  cost required in gems colors
      cost:  colors.reduce((gems: GemColor[], color) =>
        [...gems, ...Array(cardCost).fill(color)]
      , [])
    };
  };

  return Array(playerCount + 1).fill(null).map(generateNoble);
};

const switchToNextPlayer = (game: Game): Game => {
  // increment index to select next player in list, reset to index zero if over length
  const nextPlayerIndex = game.currentPlayerIndex + 1;
  return {
    ...game,
    state: GAME_STATES.TURN,
    tokensToBuy: [],
    cardToReserve: null,
    currentPlayerIndex: nextPlayerIndex >= game.players.length ? 0 : nextPlayerIndex,
  };
};

export const createGame = (): Game => ({
  players: [],
  gemPool: createGems(),
  cardPool: createCards(),
  noblePool: createNobles(),
  currentPlayerIndex: -1,
  state: GAME_STATES.SETUP,
  tokensToBuy: [],
  cardToReserve: null,
  affordableNobles: [],
} as Game);

export const addPlayer = (game: Game): Game => ({
  ...game,
  players: [...game.players, {
    id: game.players.length,
    cards: [],
    nobles: [],
    reservedCards: [],
    gems: [],
  } as Player],
  currentPlayerIndex: game.currentPlayerIndex == -1 ? 0 : game.currentPlayerIndex,
});

export const chooseGemToBuy = (game: Game, token: GemColor): Game =>
  ( // dont allow selecting gems if more than MAX already
    getPlayerTokenCount(getCurrentPlayer(game)) > MAX_TOKENS ||
    // only allow up to 3 tokens
    game.tokensToBuy.length >= 3 ||
    // prevent adding  token when pool is empty
    gemsOfColor(game.gemPool, token).length === 0 ||
    // only allow same color if pool token count >= 4
    (gemsOfColor(game.gemPool, token).length < 3 &&
      gemsOfColor(game.tokensToBuy, token).length) ||
    // prevent another gem selection if 2 tokens of same color already selected
    COLORS
      .map(color => game.tokensToBuy.filter(gem => gem === color).length)
      .some(count => count >= 2) ||
    // prevent same color selection if token of another color already present
    (COLORS
      .map(color => gemsOfColor(game.tokensToBuy, color).length)
      .reduce((total, count) => total + count, 0) >= 2 && game.tokensToBuy.includes(token))
  )
    ? game
    : ({
      ...game,
      cardToReserve: null,
      tokensToBuy: [...game.tokensToBuy, token],
      gemPool: removeGems(game.gemPool, [token]),
    });

export const cancelGemPurchase = (game: Game, token: GemColor): Game => ({
  ...game,
  tokensToBuy: removeGems(game.tokensToBuy, [token]),
  gemPool: [...game.gemPool, token],
});

export const buyChosenGems = (game: Game): Game => ({
  ...game,
  state: GAME_STATES.END_TURN,
  tokensToBuy: [],
  players: game.players
    .map((player) => (player === getCurrentPlayer(game) ? {
      ...player,
      gems: [...player.gems, ...game.tokensToBuy],
    }: player)),
});

export const chooseCardToReserve = (game: Game, card: Card): Game => ({
  ...game,
  tokensToBuy: [],
  cardToReserve: card,
});

export const cancelCardReservation = (game: Game): Game => ({
  ...game,
  tokensToBuy: [],
  cardToReserve: null,
});

export const reserveChosenCard = (game: Game): Game => ({
  ...game,
  cardToReserve: null,
  state: GAME_STATES.END_TURN,
  gemPool: removeGems(game.gemPool, [GEM_COLORS.GOLD]),
  // remove card from board
  cardPool:
    game.cardToReserve ? removeCardFromBoard(game.cardPool, game.cardToReserve) : game.cardPool,
  players: game.players
    .map(player => (player === getCurrentPlayer(game) ? {
      ...player,
      // add gold gem to player if present
      gems: [
        ...player.gems,
        ...(gemsOfColor(game.gemPool, GEM_COLORS.GOLD).length > 0 ? [GEM_COLORS.GOLD] : []),
      ],
      // add card
      reservedCards: [
        ...player.reservedCards,
        ...(game.cardToReserve ? [game.cardToReserve] : []),
      ],
    } : player)),
});

export const buyReservedCard = (game: Game, card: Card): Game =>
  canPlayerAffordCard(getCurrentPlayer(game), card)
    ?  ({
      ...game,
      state: GAME_STATES.END_TURN,
      gemPool: [...game.gemPool, ...getTokensToPayForCard(game, card)],
      // remove card from board
      cardPool: removeCardFromBoard(game.cardPool, card),
      players: game.players
        .map(player => (player === getCurrentPlayer(game) ? {
          ...player,
          // remove cost from player
          gems: removeGems(player.gems, getTokensToPayForCard(game, card)),
          // add card to player
          cards: [...player.cards, card],
          // remove card from reserved cards
          reservedCards: player.reservedCards.filter(rcard => rcard !== card),
        } : player)),
    }) : game;

export const buyCard = (game: Game, card: Card): Game =>
  canPlayerAffordCard(getCurrentPlayer(game), card)
    ?  ({
      ...game,
      state: GAME_STATES.END_TURN,
      gemPool: [...game.gemPool, ...getTokensToPayForCard(game, card)],
      // remove card from board
      cardPool: removeCardFromBoard(game.cardPool, card),
      players: game.players
        .map(player => (player === getCurrentPlayer(game) ? {
          ...player,
          // remove cost from player
          gems: removeGems(player.gems, getTokensToPayForCard(game, card)),
          // add card to player
          cards: [...player.cards, card],
        } : player)),
    }) : chooseCardToReserve(game, card);

export const buyOrReserveCard = (game: Game, card: Card): Game =>
  canPlayerAffordCard(getCurrentPlayer(game), card)
    ? buyCard(game, card)
    : (getCurrentPlayer(game).reservedCards.length < MAX_RESERVED_CARDS)
      ? chooseCardToReserve(game, card)
      : game;

export const returnPlayerGemToPool = (game: Game, token: GemColor): Game => ({
  ...game,
  // remove gems from player
  players: game.players
    .map(player => (player === getCurrentPlayer(game) ? {
      ...player,
      gems: removeGems(player.gems, [token])
    } : player)),
  // give back gem tokens to pool
  gemPool: [...game.gemPool, token],
});

// check nobles that can be bought
const getAffordableNobles = (game: Game) =>
  game.noblePool.reduce((total: Noble[], noble: Noble) => {
    if (COLORS.map(color =>
      noble.cost.filter(gemcolor => gemcolor === color).length <=
        getCurrentPlayer(game).cards.filter(card => card.color === color).length
    ).every(Boolean)) {
      return [...total, noble];
    }
    return total;
  }, []);

export const addNobleToPlayer = (game: Game, noble: Noble): Game => ({
  ...game,
  state: GAME_STATES.CHECK_WIN,
  noblePool: game.noblePool.filter(n => n !== noble),
  affordableNobles: [],
  players: game.players
    .map(player => (player === getCurrentPlayer(game) ? {
      ...player,
      nobles: [...player.nobles, noble],
    } : player)),
});


export const processEndOfTurn = (game: Game): Game => {
  // handle switching game states
  if (game.state === GAME_STATES.SETUP) {
    // start game
    return {
      ...game,
      state: GAME_STATES.TURN,
    };
  } else if (game.state === GAME_STATES.END_TURN) {
    //  ask player to discard extra tokens
    if (getPlayerTokenCount(getCurrentPlayer(game)) > MAX_TOKENS) {
      return game;
    }

    // check nobles
    const affordableNobles = getAffordableNobles(game);

    if (affordableNobles.length === 1) {
      // add noble to player and recheck conditions
      return processEndOfTurn(addNobleToPlayer(game, affordableNobles[0]));
    } else if (affordableNobles.length > 1) {
      return {
        ...game,
        affordableNobles,
      };
    }

    return {
      ...game,
      state: GAME_STATES.CHECK_WIN,
    };
  } else if (game.state === GAME_STATES.CHECK_WIN) {
    // check win condition
    if (getPlayerPoints(getCurrentPlayer(game)) >= POINTS_TO_WIN) {
      alert(`Player ${getCurrentPlayer(game).id} has won!`);
      return {
        ...game,
        state: GAME_STATES.GAME_END,
      };
    }

    return switchToNextPlayer(game);
  }

  return game;
};

