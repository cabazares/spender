import React from 'react';

import {
  getCurrentPlayer,
} from '../utils';

import {
  PlayerList,
} from './PlayerList';
import {
  NobleGallery,
} from './NobleGallery';
import {
  CardGallery,
} from './CardGallery';
import {
  GemStack,
} from './GemStack';

import {
  Card,
  GemColor,
  Player,
  Game,
} from '../types';



export interface GameBoardProps {
  game: Game,
  onPlayerSelectGem: (gem: GemColor) => void,
  onPlayerSelectCard: (card: Card) => void,
  onReservedCardListSelect: (player: Player) => void,
}

export const GameBoard = (
  {
    game,
    onPlayerSelectGem,
    onPlayerSelectCard,
    onReservedCardListSelect,
  }: GameBoardProps
): React.ReactElement<GameBoardProps> => {
  return (<>
    <div className="gameBoard">
      <PlayerList
        players={game.players}
        player={getCurrentPlayer(game)}
        onReservedCardListSelect={onReservedCardListSelect}
      />
      <CardGallery
        cardPool={game.cardPool}
        onPlayerSelectCard={onPlayerSelectCard}
        player={getCurrentPlayer(game)}
        tokensToBuy={game.tokensToBuy}
      />
      <GemStack gems={game.gemPool} onPlayerSelectGem={onPlayerSelectGem}/>
      <NobleGallery nobles={game.noblePool} />
    </div>
  </>);
};

export default GameBoard;
