import React, { useState } from 'react';

import './App.css';
import {
  COLORS,
  LEVELS,
  randInt,
  getRandomGemColor,
  getShuffledColors,
  canPlayerAffordCard,
  getPlayerPoints,
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

const POINTS_TO_WIN = 15;
const MAX_TOKENS = 10;

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

const initGems = (playerCount = 2): GemCollection => {
  const tokenCount = 2 + playerCount;
  return {
    [GemColor.green]: Array(tokenCount).fill(GemColor.green),
    [GemColor.red]: Array(tokenCount).fill(GemColor.red),
    [GemColor.blue]: Array(tokenCount).fill(GemColor.blue),
    [GemColor.white]: Array(tokenCount).fill(GemColor.white),
    [GemColor.black]: Array(tokenCount).fill(GemColor.black),
    [GemColor.gold]: Array(5).fill(GemColor.gold),
  };
};

const initCards = (): CardPool => {
  // TODO: read cards from somewhere or generate

  const generateCard = (level: CardLevel): Card => {
    level = (level !== null) ? level : CardLevel[LEVELS[randInt(LEVELS.length)]];

    // return random colors from N choices
    const getRandomColor = (colorSpace: GemColor[]) => () =>
      colorSpace[randInt(colorSpace.length)];

    let colors = getShuffledColors().slice(0, 4).map(color => GemColor[color]);
    let cost = Array(randInt(5,3)).fill(null).map(getRandomColor(colors));
    let points = cost.length >= 4 ? 1 : 0;

    if (CardLevel.two === level) {
      colors = getShuffledColors().slice(0, 3).map(color => GemColor[color]);
      cost = Array(randInt(9,7)).fill(null).map(getRandomColor(colors));
      points = cost.length >= 8 ? 2 : 1;
    } else if (CardLevel.three === level) {
      colors = getShuffledColors().slice(0, 2).map(color => GemColor[color]);
      cost = Array(randInt(10,7)).fill(null).map(getRandomColor(colors));
      points = cost.length >= 8 ? 5 : 4;
    }

    return {
      color: colors[0],
      points,
      cost,
      level,
    };
  };

  return {
    deck: Array(78).fill(null).map(generateCard),
    [CardLevel.one]: Array(4).fill(null).map(() => generateCard(CardLevel.one)),
    [CardLevel.two]: Array(4).fill(null).map(() => generateCard(CardLevel.two)),
    [CardLevel.three]: Array(4).fill(null).map(() => generateCard(CardLevel.three)),
  };
};

const initNobles = (playerCount = 2): Noble[] => {
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
    };
  };

  return Array(playerCount + 1).fill(null).map(generateNoble);
};

function App(): React.ReactElement<Record<string, unknown>> {
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
  };

  const endPlayerTurn = () => {
    if (tokensToBuy.length) {
      addGemsToPlayer(tokensToBuy);
      setTokensToBuy([]);
    }

    // TODO: ask player to select tokens to return if tokens > 10
    if (COLORS.reduce((total, color) => total + playerInTurn.gems[color].length, 0) > MAX_TOKENS) {
      // TODO:
    }



    checkAvailableNobles();
    checkIfPlayerWon();

    switchToNextPlayer();
  };

  const checkAvailableNobles = () => {
    // check nobles that can be bought
    const afforableNobles = nobles.reduce((total: Noble[], noble: Noble) => {
      if (COLORS.map(color =>
        noble.cost.filter(gemcolor => gemcolor === color).length <=
          playerInTurn.cards.filter(card => card.color === color).length
      ).every(Boolean)) {
        return [...total, noble];
      }
      return total;
    }, []);

    // TODO: show option to choose if multiple

    // get first noble and add it to player's
    if (afforableNobles.length) {
      const updatedPlayer = {
        ...playerInTurn,
        nobles: [...playerInTurn.nobles, afforableNobles[0]],
      };
      setPlayers(players.map((player) => (player.id === playerInTurn.id ? updatedPlayer : player)));
    }
  };

  const checkIfPlayerWon = () => {
    if (getPlayerPoints(playerInTurn) >= POINTS_TO_WIN) {
      alert(`Congrats! Player ${playerInTurn.id} won!`);
    }
  };

  const onPlayerSelectGem = (gem: Gem) => {
    if (
      // prevent adding  token when pool is empty
      gemPool[gem.color].length === 0 ||
      // only allow same color if pool token count >= 4
      (gemPool[gem.color].length < 3 &&
          tokensToBuy.filter(token => token.color === gem.color).length) ||
      // prevent another gem selection if 2 tokens of same color already selected
      COLORS
        .map(color => tokensToBuy.filter(token => token.color === color).length)
        .some(count => count >= 2) ||
      // prevent same color selection if token of another color already present
      (COLORS
        .map(color => tokensToBuy.filter(token => token.color === color).length)
        .reduce((total, count) => total + count, 0) >= 2 &&
       tokensToBuy.map(token => token.color).includes(gem.color))
    ) {
      return;
    }

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
  };

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
    // check if the user can afford the card
    if (!canPlayerAffordCard(playerInTurn, card)) {
      // TODO: Offer option to reserve
      return;
    }

    // give back gem tokens to pool
    const updatedGemPool = COLORS.reduce((pool, color) => {
      const cost = card.cost.filter(token => token === color);
      // remove cards from cost, since we dont add that back to gem pool
      cost.splice(0, playerInTurn.cards.filter(card => card.color === color).length);

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
            {tokensToBuy.map((token, key) => {
              return (
                <div key={key} className="tokenToBuy">
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
              );
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
        tokensToBuy={tokensToBuy}
        onPlayerSelectGem={onPlayerSelectGem}
        onPlayerSelectCard={onPlayerSelectCard}
      />
    </div>
  );
}

export default App;

