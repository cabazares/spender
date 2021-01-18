import React from 'react';

import {
  GEM_COLORS,
  COLORS,
  LEVELS,
  MAX_TOKENS,
} from './constants';
import {
  getPlayerPoints,
  getPlayerTokenCount,
  canPlayerAffordCard,
  gemsOfColor,
  getCurrentPlayer,
} from './utils';

import {
  Card,
  CardPool,
  GemColor,
  Player,
  Noble,
  CardLevel,
  Game,
} from './types';


const GemStack = (
  { gems, onPlayerSelectGem }:
  { gems: GemColor[], onPlayerSelectGem?: (gem: GemColor) => void }
) => (
  <div className="gemStack">
    {COLORS.map(color => {
      const tokens = gemsOfColor(gems, color);
      return (
        <div
          key={color}
          className={`gemToken color-${color}`}
          onClick={() => {
            if (tokens.length > 0 && color !== GEM_COLORS.GOLD) {
              onPlayerSelectGem && onPlayerSelectGem(color);
            }
          }}
        >{tokens.length}</div>
      );
    })}
  </div>
);

export interface CardComponentProps {
  card: Card,
  currentPlayer:Player,
  tokensToBuy?: GemColor[],
  onPlayerSelectCard?: (card: Card) => void
}

export const CardComponent = (
  { card, currentPlayer, tokensToBuy=[], onPlayerSelectCard=() => ({}) }: CardComponentProps
): React.ReactElement<CardComponentProps>  => {
  const canAfford = canPlayerAffordCard(currentPlayer, card);
  const canAffordLater = canPlayerAffordCard(currentPlayer, card, tokensToBuy);

  const classNames = [
    'card',
    'card-visible',
    canAfford ? 'card-affordable' : '',
    !canAfford && canAffordLater ? 'card-affordable-later' : '',
  ];
  return (
    <div className={classNames.join(' ')} onClick={() => onPlayerSelectCard(card)}>
      {card.points > 0 && <div className="points">{card.points}</div>}
      <div className={`gem gem-${card.color}`} />
      <div className="costBox">
        {COLORS.map(color => {
          const count = card.cost.filter(gemColor => gemColor === color).length;
          return count ? <div key={color} className={`cost color-${color}`}>{count}</div> : null;
        })}
      </div>
    </div>
  );
};

const CardRow = (
  { level, cards, currentPlayer, tokensToBuy, onPlayerSelectCard }:
  {
    level: CardLevel,
    cards: Card[],
    currentPlayer: Player,
    tokensToBuy: GemColor[],
    onPlayerSelectCard: (card: Card) => void,
  }
) => (
  <div className="cardGalleryRow" key={level}>
    {cards.map((card, key) =>
      <CardComponent
        key={key}
        card={card}
        currentPlayer={currentPlayer}
        tokensToBuy={tokensToBuy}
        onPlayerSelectCard={onPlayerSelectCard}
      />
    )}
  </div>
);

const CardGallery = (
  { cardPool, currentPlayer, tokensToBuy, onPlayerSelectCard }:
  {
    cardPool: CardPool,
    currentPlayer: Player,
    tokensToBuy: GemColor[],
    onPlayerSelectCard: (card: Card) => void
  }
) => (
  <div className="cardGallery">
    {LEVELS.map(level =>
      <CardRow
        key={level}
        level={CardLevel[level]}
        cards={cardPool.cards.filter(card => card.level === CardLevel[level])}
        currentPlayer={currentPlayer}
        tokensToBuy={tokensToBuy}
        onPlayerSelectCard={onPlayerSelectCard}
      />
    )}
  </div>
);

const NobleGallery = ({ nobles }: { nobles: Noble[] }) => (
  <div className="noblesBox">
    {nobles.map((noble, key) => (
      <div key={key} className="nobleCard">
        {COLORS.map(color => {
          const count = noble.cost.filter(gemColor => gemColor === color).length;
          return count ? <div key={color} className={`cost color-${color}`}>{count}</div> : null;
        })}
        <div className="points">{noble.points}</div>
      </div>
    ))}
  </div>
);

const PlayerList = (
  { players, currentPlayer, onReservedCardListSelect }:
  { players: Player[], currentPlayer: Player, onReservedCardListSelect: (player: Player) => void }
) => (
  <div className="playerList">
    {players.map((player) => (
      <div
        key={player.id}
        className={`playerHand ${currentPlayer === player ? 'currentPlayer' : ''}`}
      >
        <div className="heading">
          <div className="playerName">Player {player.id}</div>
          <div className="playerPoints">{getPlayerPoints(player)}</div>
        </div>
        <div>{getPlayerTokenCount(player)}/{MAX_TOKENS}</div>
        {COLORS.map((color) => (
          <div key={color} className="playerGemAndCards">
            <div  className={`cardCount color-${color}`}>
              {player.cards.filter(card => card.color === color).length}
            </div>
            <div className={`gemToken color-${color}`}>
              {gemsOfColor(player.gems, color).length}
            </div>
          </div>
        ))}
        <div>
          reserved cards:
          {player.reservedCards.map((card, key) => {
            return (<div key={key} onClick={() => {
              onReservedCardListSelect(player);
            }}>{card.color}</div>);
          })}
        </div>
        <div>
          Noble points: {player.nobles.reduce((total, noble) => total + noble.points, 0)}
        </div>
      </div>
    ))}
  </div>
);

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
        currentPlayer={getCurrentPlayer(game)}
        onReservedCardListSelect={onReservedCardListSelect}
      />
      <div className="playArea">
        <CardGallery
          cardPool={game.cardPool}
          onPlayerSelectCard={onPlayerSelectCard}
          currentPlayer={getCurrentPlayer(game)}
          tokensToBuy={game.tokensToBuy}
        />
        <GemStack gems={game.gemPool} onPlayerSelectGem={onPlayerSelectGem}/>
        <NobleGallery nobles={game.noblePool} />
      </div>
    </div>
  </>);
};

export default GameBoard;
