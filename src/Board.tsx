import React from 'react';

import { COLORS, LEVELS, getPlayerPoints, canPlayerAffordCard } from './utils';

import {
  Card,
  CardPool,
  GemColor,
  GemCollection,
  Gem,
  Player,
  Noble,
  CardLevel,
} from './types';


const GemStack = (
  { gems, onPlayerSelectGem }:
  { gems: GemCollection, onPlayerSelectGem?: (gem: Gem) => void }
) => (
  <div className="gemStack">
    {COLORS.map(color => (
      <div
        key={color}
        className={`gemToken color-${color}`}
        onClick={() => {
          if (gems[color].length > 0 && color !== GemColor.gold) {
            onPlayerSelectGem && onPlayerSelectGem({ color } as Gem);
          }
        }}
      >{gems[color].length}</div>
    ))}
  </div>
);

const CardComponent = (
  { card, currentPlayer, onPlayerSelectCard }:
  { card: Card, currentPlayer:Player, onPlayerSelectCard: (card: Card) => void }
) => {
  const canAfford = canPlayerAffordCard(currentPlayer, card);
  return (
    <div
      className={`card card-visible ${canAfford ? 'card-affordable' : ''}`}
      onClick={() => onPlayerSelectCard(card)}>
      <div className="points">{card.points}</div>
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
  { level, cards, currentPlayer, onPlayerSelectCard }:
  {
    level: CardLevel,
    cards: Card[],
    currentPlayer: Player,
    onPlayerSelectCard: (card: Card) => void,
  }
) => (
  <div className="cardGalleryRow">
    {CardLevel[level]}
    {cards.map((card, key) =>
      <CardComponent
        key={key}
        card={card}
        onPlayerSelectCard={onPlayerSelectCard}
        currentPlayer={currentPlayer}
      />
    )}
  </div>
);

const CardGallery = (
  { cardPool, currentPlayer, onPlayerSelectCard }:
  { cardPool: CardPool, currentPlayer: Player, onPlayerSelectCard: (card: Card) => void }
) => (
  <div className="cardGallery">
    {LEVELS.map(level =>
      <CardRow
        key={level}
        level={CardLevel[level]}
        cards={cardPool[CardLevel[level]]}
        currentPlayer={currentPlayer}
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

const PlayerList = ({ players, currentPlayer }: { players: Player[], currentPlayer: Player }) => (
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
        {COLORS.map((color) => (
          <div key={color} className="playerGemAndCards">
            <div  className={`cardCount color-${color}`}>
              {player.cards.filter(card => card.color === color).length}
            </div>
            <div className={`gemToken color-${color}`}>
              {player.gems[color].length}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

interface GameBoardProps {
  gemPool: GemCollection,
  cardPool: CardPool,
  noblePool: Noble[],
  players: Player[],
  playerInTurn: Player,
  onPlayerSelectGem: (gem: Gem) => void,
  onPlayerSelectCard: (card: Card) => void,
}

const GameBoard = (
  {
    gemPool,
    cardPool,
    noblePool,
    players,
    playerInTurn,
    onPlayerSelectGem,
    onPlayerSelectCard,
  }: GameBoardProps
): React.ReactElement<GameBoardProps> => (
  <div className="gameBoard">
    <PlayerList players={players} currentPlayer={playerInTurn} />
    <div className="playArea">
      <CardGallery
        cardPool={cardPool}
        onPlayerSelectCard={onPlayerSelectCard}
        currentPlayer={playerInTurn}
      />
      <GemStack gems={gemPool} onPlayerSelectGem={onPlayerSelectGem}/>
      <NobleGallery nobles={noblePool} />
    </div>
  </div>
);

export default GameBoard;
