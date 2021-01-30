import React from 'react';

import {
  COLORS,
} from '../constants';

import {
  canPlayerAffordCard,
  getCardBackgroundUrl,
} from '../utils';

import {
  GemColor,
  Card,
  Player,
} from '../types';

export interface CardComponentProps {
  card: Card,
  player: Player,
  tokensToBuy?: GemColor[],
  onPlayerSelectCard?: (card: Card) => void
}

export const CardComponent = (
  { card, player, tokensToBuy=[], onPlayerSelectCard=() => ({}) }: CardComponentProps
): React.ReactElement<CardComponentProps>  => {
  const canAfford = canPlayerAffordCard(player, card);
  const canAffordLater = canPlayerAffordCard(player, card, tokensToBuy);

  const classNames = [
    'card',
    'card-visible',
    canAfford ? 'card-affordable' : '',
    !canAfford && canAffordLater ? 'card-affordable-later' : '',
  ];

  return (
    <div className={classNames.join(' ')}
      onClick={() => onPlayerSelectCard(card)}
      style={{background: `url('${getCardBackgroundUrl(card)}') repeat white`}}
    >
      <div className="cardHeader">
        <div className={`gem gem-${card.color}`} />
        {card.points > 0 && <div className="points">{card.points}</div>}
      </div>
      <div className="costBox">
        {COLORS.map(color => {
          const count = card.cost.filter(gemColor => gemColor === color).length;
          return count ? <div key={color} className={`cost color-${color}`}>{count}</div> : null;
        })}
      </div>
    </div>
  );
};
