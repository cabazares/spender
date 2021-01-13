
export enum GemColor {
  red = "red",
  green = "green",
  blue = "blue",
  white = "white",
  black = "black",
  gold = "gold"
}
export type GemColorStrings = keyof typeof GemColor;

export enum CardLevel {
  one, two, three
}

export interface Gem {
  color: GemColor
}

export interface GemCollection {
  [GemColor.green]: GemColor.green[]
  [GemColor.red]: GemColor.red[]
  [GemColor.blue]: GemColor.blue[]
  [GemColor.white]: GemColor.white[]
  [GemColor.black]: GemColor.black[]
  [GemColor.gold]: GemColor.gold[]
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
  gems: GemCollection
  cards: Card[]
  reservedCards: Card[]
  nobles: Noble[]
}

