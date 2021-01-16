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
  [CardLevel.one]: Card[]
  [CardLevel.two]: Card[]
  [CardLevel.three]: Card[]
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

