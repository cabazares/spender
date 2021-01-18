import React from 'react';

import {
  CardComponent
} from './CardComponent';

import {
  Player,
  Card,
} from '../types';

export interface ReservedCardsModalProps {
  player: Player,
  onPlayerSelectCard: (card: Card) => void,
  onCloseModal: () => void,
}

export const ReservedCardsModal = (
  { player, onPlayerSelectCard, onCloseModal }: ReservedCardsModalProps,
): React.ReactElement<ReservedCardsModalProps> => (
  <div className="playerReservedCardsModal">
    <div>Reserved Cards:</div>
    {player.reservedCards.map((card, key) => (
      <div key={key}>
        <CardComponent
          card={card}
          player={player}
          onPlayerSelectCard={onPlayerSelectCard}
        />
      </div>
    ))}
    <input type="button" onClick={onCloseModal} value="Cancel" />
  </div>
);
