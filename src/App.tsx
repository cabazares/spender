import React, { useState } from 'react';

import './App.css';
import {
  COLORS, LEVELS, randInt, getRandomGemColor, getShuffledColors, canPlayerAffordCard,
} from './utils';
import GameBoard from './Board';

import {
  Card,
  CardLevel,
  GemColor,
  GemCollection,
  Gem,
  Player,
  Noble,
  CardPool,
} from './types';



const addPlayer = (players: Player[]) => ([...players, {
  id: players.length,
  cards: [],
  nobles: [],
  reservedCards: [],
  gems: 
    // initialize empty gems
    COLORS.reduce((curr, color) => ({...curr, [color]: []}), {}) as GemCollection,
} as Player]);

const initPlayers = () => addPlayer(addPlayer([]));

const initGems = (playerCount: number = 2): GemCollection => {
  const tokenCount = 4;
  return {
    [GemColor.green]: Array(tokenCount).fill(GemColor.green),
    [GemColor.red]: Array(tokenCount).fill(GemColor.red),
    [GemColor.blue]: Array(tokenCount).fill(GemColor.blue),
    [GemColor.white]: Array(tokenCount).fill(GemColor.white),
    [GemColor.black]: Array(tokenCount).fill(GemColor.black),
    [GemColor.gold]: Array(5).fill(GemColor.gold),
  }
};

const initCards = (): CardPool => {
  // TODO: read cards from somewhere or generate

  const generateCard = (level: CardLevel): Card => ({
    color: getRandomGemColor(),
    points: randInt(5, 0),
    cost: Array(randInt(4,1)).fill(null).map(getRandomGemColor),
    level: (level !== null) ? level : CardLevel[LEVELS[randInt(LEVELS.length)]],
  })
  

  return {
    deck: Array(78).fill(null).map(generateCard),
    [CardLevel.one]: Array(4).fill(null).map(() => generateCard(CardLevel.one)),
    [CardLevel.two]: Array(4).fill(null).map(() => generateCard(CardLevel.two)),
    [CardLevel.three]: Array(4).fill(null).map(() => generateCard(CardLevel.three)),
  }
}

const initNobles = (): Noble[] => {
  // TODO: read from somewhere

  const generateNoble = (): Noble => {
    // get 2 or 3 random colors
    const numColors = Math.round(Math.random()) + 2;
    const cardCost = numColors === 3 ? 3 : 4;
    const colors = getShuffledColors().splice(0, numColors);

    return {
      points: 3,
      //  cost required in gems colors
      cost:  colors.reduce((gems: GemColor[], color) =>
        [...gems, ...Array(cardCost).fill(GemColor[color])]
      , [])
    }
  };

  // TODO: change number of nobles depending on number of players
  return Array(3).fill(null).map(generateNoble);
}

function App() {
  const [players, setPlayers] = useState<Player[]>(initPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [tokensToBuy, setTokensToBuy] = useState<Gem[]>([]);
  const [gemPool, setGemPool] = useState<GemCollection>(initGems());
  const [cardPool, setCardPool] = useState<CardPool>(initCards());
  const [nobles, setNobles] = useState<Noble[]>(initNobles());

  const playerInTurn = players[currentPlayerIndex];

  const switchToNextPlayer = () => {
    // increment index to select next player in list, reset to index zero if over length
    const nextPlayerIndex = currentPlayerIndex + 1;
    setCurrentPlayerIndex(nextPlayerIndex >= players.length ? 0 : nextPlayerIndex);
  }

  const endPlayerTurn = () => {
    if (tokensToBuy.length) {
      addGemsToPlayer(tokensToBuy);
      setTokensToBuy([]);
    }

    // TODO: limit to 10 tokens in hand
    // ask player to select tokens to return

    checkAvailableNobles();
    checkIfPlayerWon();

    switchToNextPlayer();
  };

  const checkAvailableNobles = () => {
    // TODO: check nobles that can be bought
    // show option to choose if multiple
  };

  const checkIfPlayerWon = () => {
    // TODO
  };

  const onPlayerSelectGem = (gem: Gem) => {
    // prevent adding  token when pool is empty
    if (gemPool[gem.color].length === 0) {
      return;
    }

    // TODO: limit max 2 tokens of same color, and only if pool token count >= 4

    // limit buying to max 3 tokens
    if (tokensToBuy.length < 3) {
      setTokensToBuy([...tokensToBuy, gem]);
    } else {
      return;
    }

    // remove gems from gem pool
    setGemPool({
      ...gemPool,
      [gem.color]: gemPool[gem.color].slice(0, gemPool[gem.color].length - 1),
    });
  }

  const addGemsToPlayer = (gems: Gem[]) => {
    // add gem selected to current players gem collection
    const updatedPlayer = {
      ...playerInTurn,
      gems: gems.reduce((pool, gem) => ({
        ...pool,
        [gem.color]: [...pool[gem.color], gem],
      }), playerInTurn.gems)
    };
    setPlayers(players.map((player) => (player.id === playerInTurn.id ? updatedPlayer : player)));
  };

  const onPlayerSelectCard = (card: Card) => {
    // check if player has enough gem/cards
    const goldTokens = [...playerInTurn.gems.gold];

    // cant buy
    if (!canPlayerAffordCard(playerInTurn, card)) {
      // TODO: Offer option to reserve
      return;
    }

    // TODO: take cards nto account
    const updatedGemPool = COLORS.reduce((pool, color) => {
      const cost = card.cost.filter(token => token === color);
      // TODO: take into account gold token
      // remove gems from player
      playerInTurn.gems[GemColor[color]].splice(0, cost.length);

      return {
        ...pool,
        [GemColor[color]]: [...pool[GemColor[color]], ...cost],
      };
    }, gemPool);
    setGemPool(updatedGemPool);

    // add card selected to current players cards
    const updatedPlayer = {
      ...playerInTurn,
      cards: [...playerInTurn.cards, card],
    };
    setPlayers(players.map((player) => (player.id === playerInTurn.id ? updatedPlayer : player)));

    // replace card from deck
    const cardIndex = cardPool[card.level].indexOf(card);
    const newCard = cardPool.deck.find(cardInDeck => cardInDeck.level === card.level);
    const newCards = [...cardPool[card.level]];
    if (newCard) {
      newCards[cardIndex] = newCard;
    } else {
      newCards.splice(cardIndex, 1);
    }
    setCardPool({
      ...cardPool,
      deck: cardPool.deck.filter(cardInDeck => cardInDeck !== newCard),
      [card.level]: newCards,
    });

    checkAvailableNobles();
    checkIfPlayerWon();

    switchToNextPlayer();
  };

  return (
    <div className="App">
      {tokensToBuy.length > 0 && 
        <div className="turnModal">
          <div className="tokensToBuyBox">
            {tokensToBuy.map((token) => {
              return (
                <div className="tokenToBuy">
                  <div className={`gemToken color-${token.color}`}>1</div>
                  <input type="button" onClick={() => {
                    setTokensToBuy(tokensToBuy.filter(t => t !== token));
                    // add back token to gem pool
                    setGemPool({
                      ...gemPool,
                      [token.color]: [...gemPool[token.color], token]
                    });
                  }} value="x"/>
                </div>
              )
            })}
          </div>
          <input type="button" onClick={endPlayerTurn} value="End Turn" />
        </div>
      }

      <GameBoard
          gemPool={gemPool}
          players={players}
          playerInTurn={playerInTurn}
          cardPool={cardPool}
          noblePool={nobles}
          onPlayerSelectGem={onPlayerSelectGem}
          onPlayerSelectCard={onPlayerSelectCard}
      />
    </div>
  );
}

export default App;

