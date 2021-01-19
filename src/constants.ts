import {
  GemColor,
  CardLevel,
  GameState,
} from './types';

const enumKeys  = <
  O extends Record<string, unknown>,
  K extends keyof O = keyof O
>(obj: O): K[] => Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];

export const GEM_COLORS = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  WHITE: 'white',
  BLACK: 'black',
  GOLD: 'gold',
} as Record<string, GemColor>;
export const MAIN_COLORS: GemColor[] = [
  GEM_COLORS.RED,
  GEM_COLORS.GREEN,
  GEM_COLORS.BLUE,
  GEM_COLORS.WHITE,
  GEM_COLORS.BLACK,
];
export const GAME_STATES = {
  SETUP: 'setup',
  TURN: 'playerTurn',
  END_TURN: 'endOfTurn',
  CHECK_WIN: 'checkWinner',
  GAME_END: 'gameEnd',
} as Record<string, GameState>;

export const COLORS: GemColor[] = [...MAIN_COLORS, GEM_COLORS.GOLD];
export const LEVELS = enumKeys(CardLevel);

export const TOTAL_GOLD_TOKENS = 5;
export const TOTAL_CARDS = 90;
export const CARDS_PER_LEVEL = 4;

export const POINTS_TO_WIN = 15;
export const MAX_TOKENS = 10;
export const MAX_RESERVED_CARDS = 3;
