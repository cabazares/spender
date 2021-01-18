export type GemColor =
  | 'red'
  | 'green'
  | 'blue'
  | 'white'
  | 'black'
  | 'gold'
;

export enum CardLevel {
  one, two, three
}

export interface Card {
  color: GemColor
  cost: GemColor[]
  points: number;
  level: CardLevel,
}

export interface CardPool {
  deck: Card[]
  cards: Card[]   // cards face up on table
}

export interface Noble {
  points: number;
  cost: GemColor[]
}

export interface Player {
  id: number
  gems: GemColor[],
  cards: Card[]
  reservedCards: Card[]
  nobles: Noble[]
}

export type GameState =
  | 'setup'       // initial state, setting up players. before game start
  | 'playerTurn'  // waiting for player to finish turn
  | 'endOfTurn'   // calculate if winner won, pleyer has to discard card, select nobles, etc
  | 'gameEnd'     // end of game
;

export interface Game {
  players: Player[]
  gemPool: GemColor[]
  cardPool: CardPool,
  noblePool: Noble[]
  currentPlayerIndex: number
  state: GameState
  // related to current turn
  tokensToBuy: GemColor[]
  cardToReserve: Card | null
}
