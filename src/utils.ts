import {
  GemColor,
  GemColorStrings,
  Card,
  CardLevel,
  Player,
  Noble,
} from './types';

export const randInt = (max: number, min = 0): number => Math.floor(Math.random() * max) + min;

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export const COLORS = enumKeys(GemColor);
export const MAIN_COLORS = COLORS.filter(color => color !== GemColor.gold);
export const LEVELS = enumKeys(CardLevel);

export const getRandomGemColorFromArray = (choices: GemColorStrings[]) =>
  GemColor[choices[randInt(choices.length)]];
export const getRandomGemColor = () => getRandomGemColorFromArray(MAIN_COLORS);
export const getRandomGemColorWithGold = () => getRandomGemColorFromArray(COLORS);

export const shuffle = (colorsToUse: GemColorStrings[]) => {
    const colors  = [...colorsToUse];
    for (var i = colors.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var temp = colors[i];
        colors[i] = colors[j];
        colors[j] = temp;
    }
    return colors;
};
export const getShuffledColors = () => shuffle(MAIN_COLORS);
export const getShuffledColorsWithGold = () => shuffle(COLORS);

// player utils

export const getPlayerPoints = (player: Player) =>
  player.cards.reduce((total: number, card: Card) => total + card.points, 0) +
  player.nobles.reduce((total: number, noble: Noble) => total + noble.points, 0);

export const canPlayerAffordCard = (player: Player, card: Card) =>
  COLORS.map((color) => {
    const cost = card.cost.filter(token => token === color).length;
    // TODO: take into account player cards and gold token
    return cost <= player.gems[color].length;
  }).every(Boolean);


