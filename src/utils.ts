import {
  GemColor,
  Card,
  Player,
  Noble,
  CardPool,
  Game,
  CardLevel,
} from './types';

import {
  GEM_COLORS,
  MAIN_COLORS,
  COLORS,
} from './constants';

export const randInt = (max: number, min = 0): number =>
  Math.floor(Math.random() * (max - min)) + min;

export const getRandomColor = (choices: GemColor[] = MAIN_COLORS): GemColor =>
  choices[randInt(choices.length)];
export const getRandomColorWithGold = (): GemColor => getRandomColor(COLORS);

export const shuffle = (colorsToUse: GemColor[]): GemColor[] => {
  const colors  = [...colorsToUse];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    const temp = colors[i];
    colors[i] = colors[j];
    colors[j] = temp;
  }
  return colors;
};
export const getShuffledColors = (): GemColor[] => shuffle(MAIN_COLORS);
export const getShuffledColorsWithGold = (): GemColor[] => shuffle(COLORS);

export const gemsByColor = (gems: GemColor[]): Record<GemColor, GemColor[]> =>
  COLORS.reduce((pool, color) => ({
    ...pool,
    [color]: gems.filter(gem =>  gem === color)
  }), {}) as Record<GemColor, GemColor[]>;

export const gemsOfColor = (gems: GemColor[], color: GemColor): GemColor[] =>
  gems.filter(gem => gem === color);

export const removeGems = (gems: GemColor[], toRemove: GemColor[]): GemColor[] => {
  return gems.reduce(([updated, gemsToRemove], gem) => {
    const gemIndex = gemsToRemove.indexOf(gem);
    if (gemIndex !== -1) {
      gemsToRemove.splice(gemIndex, 1);
    }
    return [[...updated, ...(gemIndex === -1 ? [gem] : [])], gemsToRemove];
  }, [[], [...toRemove]])[0];
};

// player utils

export const getCurrentPlayer = (game: Game): Player => game.players[game.currentPlayerIndex];

export const getPlayerPoints = (player: Player): number =>
  player.cards.reduce((total: number, card: Card) => total + card.points, 0) +
  player.nobles.reduce((total: number, noble: Noble) => total + noble.points, 0);

export const canPlayerAffordCard = (
  player: Player, card: Card, extraGems: GemColor[] = []): boolean => {
  let goldTokenCount = gemsOfColor(player.gems, GEM_COLORS.GOLD).length;

  return COLORS.map((color) => {
    const cost = card.cost.filter(token => token === color).length;
    const discount = player.cards.filter(card => card.color === color).length;

    const canSpend = discount +
      gemsOfColor(player.gems, color).length +
      gemsOfColor(extraGems, color).length;

    // check if can afford with discount and tokens)
    if (cost <= canSpend) {
      return true;
    } else if (cost <= canSpend + goldTokenCount) {
      goldTokenCount -= cost - canSpend;
      return true;
    }
    return false;
  }).every(Boolean);
};

export const getPlayerTokenCount = (player: Player): number =>
  COLORS.reduce(
    (total: number, color: GemColor) => total + gemsOfColor(player.gems, color).length, 0);

export const removeCardFromBoard = (cardPool: CardPool, card: Card): CardPool => {
  const cardIndex = cardPool.cards.indexOf(card);
  const newCard = cardPool.deck.find(cardInDeck => cardInDeck.level === card.level);
  const newCards = [...cardPool.cards];
  if (newCard) {
    newCards[cardIndex] = newCard;
  } else {
    newCards.splice(cardIndex, 1);
  }
  return {
    ...cardPool,
    deck: cardPool.deck.filter(cardInDeck => cardInDeck !== newCard),
    cards: newCards,
  };
};

export const getTokensToPayForCard = (game: Game, card: Card): GemColor[] => {
  const currentPlayer = game.players[game.currentPlayerIndex];
  // discount from cards
  const cardDiscount: GemColor[] = currentPlayer.cards
    .reduce((gems: GemColor[], card: Card) => [...gems, card.color], []);

  // cost minus discount in cards
  const costInTokens = removeGems(card.cost, cardDiscount);
  // gold the player has
  const playerGold = gemsOfColor(currentPlayer.gems, GEM_COLORS.GOLD);
  // non gold tokens left for the user
  const tokensLeft = removeGems(currentPlayer.gems, [...costInTokens, ...playerGold]);
  // non gold tokens paid by the user
  const tokensPaid = removeGems(currentPlayer.gems, [...tokensLeft, ...playerGold]);

  // compute how much gold tokens were used to pay
  const costDeficit = removeGems(costInTokens, tokensPaid);
  const goldTokenCost = Array(Math.max(costDeficit.length, 0)).fill(GEM_COLORS.GOLD);

  return [...tokensPaid, ...goldTokenCost];
};

const IMAGE_TYPES = {
  [CardLevel.one]: 'nature',
  [CardLevel.two]: 'animals',
  [CardLevel.three]: 'arch',
};

export const getCardBackgroundUrl = (card: Card): string =>
  `https://placeimg.com/120/160/${IMAGE_TYPES[card.level]}?r=${card.cost.join('-')}`;

export const preloadImg = (src: string): string => (new Image()).src = src;

