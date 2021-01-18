import React from 'react';

import {
  Game, GemColor,
} from '../types';

export interface SelectedGemsModalProps {
  game: Game,
  onDeselectGem: (token: GemColor) => void,
  onConfirmChoices: () => void,
}

export const SelectedGemsModal = (
  { game, onDeselectGem, onConfirmChoices }: SelectedGemsModalProps
): React.ReactElement<SelectedGemsModalProps> => (
  <div className="turnModal">
    <div className="tokensToBuyBox">
      {game.tokensToBuy.map((token, key) => {
        return (
          <div key={key} className="tokenToBuy">
            <div className={`gemToken color-${token}`}>1</div>
            <input type="button" onClick={() => onDeselectGem(token)} value="x"/>
          </div>
        );
      })}
    </div>
    <input type="button" onClick={onConfirmChoices} value="End Turn" />
  </div>
);
