import React from 'react';

import {
  COLORS,
  MAX_TOKENS,
  PLAYER_CHOICE_POOL,
} from '../constants';
import {
  getPlayerPoints,
  getPlayerTokenCount,
  gemsOfColor,
} from '../utils';

import {
  Player,
} from '../types';

export interface PlayerListProps {
  players: Player[]
  player: Player
  onReservedCardListSelect: (player: Player) => void
}

export const PlayerList = (
  { players, player, onReservedCardListSelect }: PlayerListProps
): React.ReactElement<PlayerListProps> => (
  <div className="playerList">
    {players.map(p => (
      <div
        key={p.id}
        className={`playerHand ${player === p ? 'currentPlayer' : ''}`}
      >
        <div className="heading">
          <img className="playerImg" src={PLAYER_CHOICE_POOL.find(pl => pl.name === p.id)?.src} />
          <div className="playerName">{p.id}</div>
          <div className="playerPoints">{getPlayerPoints(p)}</div>
        </div>
        <div>{getPlayerTokenCount(p)}/{MAX_TOKENS}</div>
        <div className="playerGemAndCardsBox">
          {COLORS.map((color) => (
            <div key={color} className="playerGemAndCards">
              <div  className={`cardCount color-${color}`}>
                {p.cards.filter(card => card.color === color).length}
              </div>
              <div className={`gemToken color-${color}`}>
                {gemsOfColor(p.gems, color).length}
              </div>
            </div>
          ))}
        </div>
        <div>
          reserved cards:
          {p.reservedCards.map((card, key) => {
            return (<div key={key} onClick={() => {
              onReservedCardListSelect(p);
            }}>{card.color}</div>);
          })}
        </div>
        <div>
          Noble points: {p.nobles.reduce((total, noble) => total + noble.points, 0)}
        </div>
      </div>
    ))}
  </div>
);

export default PlayerList;
