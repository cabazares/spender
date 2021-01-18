import React from 'react';

import {
  GemColor,
  Card,
  CardLevel,
  Player,
} from '../types';

import {
  CardComponent,
} from './CardComponent';

export interface CardRowProps {
  level: CardLevel,
  cards: Card[],
  player: Player,
  tokensToBuy: GemColor[],
  onPlayerSelectCard: (card: Card) => void,
}

export const CardRow = (
  { level, cards, player, tokensToBuy, onPlayerSelectCard }: CardRowProps
): React.ReactElement<CardRowProps> => (
  <div className="cardGalleryRow" key={level}>
    {cards.map((card, key) =>
      <CardComponent
        key={key}
        card={card}
        player={player}
        tokensToBuy={tokensToBuy}
        onPlayerSelectCard={onPlayerSelectCard}
      />
    )}
  </div>
);

export default CardRow;
