import React from 'react';

import {
  LEVELS,
} from '../constants';

import {
  GemColor,
  Card,
  CardLevel,
  CardPool,
  Player,
} from '../types';

import {
  CardRow,
} from './CardRow';


export interface CardGalleryProps {
  cardPool: CardPool,
  player: Player,
  tokensToBuy: GemColor[],
  onPlayerSelectCard: (card: Card) => void
}

export const CardGallery = (
  { cardPool, player, tokensToBuy, onPlayerSelectCard }: CardGalleryProps
): React.ReactElement<CardGalleryProps> => (
  <div className="cardGallery">
    {LEVELS.map(level =>
      <CardRow
        key={level}
        level={CardLevel[level]}
        cards={cardPool.cards.filter(card => card.level === CardLevel[level])}
        player={player}
        tokensToBuy={tokensToBuy}
        onPlayerSelectCard={onPlayerSelectCard}
      />
    )}
  </div>
);

export default CardGallery;
