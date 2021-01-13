import {
  GemColor,
  GemColorString,
  Card,
  CardLevel,
  Player,
  Noble,
} from './types';

export const randInt = (max: number, min = 0): number => Math.floor(Math.random() * max) + min;

export const enumKeys  = <
  O extends Record<string, unknown>,
  K extends keyof O = keyof O
>(obj: O): K[] => Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];

export const COLORS = enumKeys(GemColor);
export const MAIN_COLORS = COLORS.filter(color => color !== GemColor.gold);
export const LEVELS = enumKeys(CardLevel);

export const getRandomGemColorFromArray = (choices: GemColorString[]): GemColor =>
  GemColor[choices[randInt(choices.length)]];
export const getRandomGemColor = (): GemColor => getRandomGemColorFromArray(MAIN_COLORS);
export const getRandomGemColorWithGold = (): GemColor => getRandomGemColorFromArray(COLORS);

export const shuffle = (colorsToUse: GemColorString[]): GemColorString[] => {
  const colors  = [...colorsToUse];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    const temp = colors[i];
    colors[i] = colors[j];
    colors[j] = temp;
  }
  return colors;
};
export const getShuffledColors = (): GemColorString[] => shuffle(MAIN_COLORS);
export const getShuffledColorsWithGold = (): GemColorString[] => shuffle(COLORS);

// player utils

export const getPlayerPoints = (player: Player): number =>
  player.cards.reduce((total: number, card: Card) => total + card.points, 0) +
  player.nobles.reduce((total: number, noble: Noble) => total + noble.points, 0);

export const canPlayerAffordCard = (player: Player, card: Card): boolean =>
  COLORS.map((color) => {
    const cost = card.cost.filter(token => token === color).length;
    // TODO: take into account player cards and gold token
    return cost <= player.gems[color].length;
  }).every(Boolean);

