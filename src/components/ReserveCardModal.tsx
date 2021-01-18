import React from 'react';

import {
  CardComponent,
} from './CardComponent';

import {
  Card,
  Player,
} from '../types';

export interface ReserveCardModalProps {
  card: Card,
  player: Player,
  onPlayerConfirmReservation: () => void,
  onPlayerCancelReservation: () => void,
}

export const ReserveCardModal = (
  { card, player, onPlayerConfirmReservation, onPlayerCancelReservation }: ReserveCardModalProps
): React.ReactElement<ReserveCardModalProps> => (
  <div className="reserveCardModal">
    <CardComponent
      card={card}
      player={player} />
    <input type="button" onClick={onPlayerConfirmReservation} value="Reserve Card" />
    <input type="button" onClick={onPlayerCancelReservation} value="Cancel" />
  </div>
);
