import React, { useState } from 'react';

import './App.css';
import {
  GEM_COLORS,
  COLORS,
  MAIN_COLORS,
  LEVELS,
  POINTS_TO_WIN,
  MAX_TOKENS,
  MAX_RESERVED_CARDS,
} from './constants';
import {
  randInt,
  getShuffledColors,
  getPlayerPoints,
  getPlayerTokenCount,
  getRandomColor,
  gemsOfColor,
  removeGems,
  canPlayerAffordCard,
} from './utils';
import {
  GameBoard,
  CardComponent,
} from './Board';

import {
  Card,
  CardLevel,
  GemColor,
  Player,
  Noble,
  CardPool,
} from './types';

const addPlayer = (players: Player[]) => ([...players, {
  id: players.length,
  cards: [],
  nobles: [],
  reservedCards: [],
  gems: [],
} as Player]);

const initPlayers = () => addPlayer(addPlayer([]));

const initGems = (playerCount = 2): GemColor[] => {
  const tokenCount = 2 + playerCount;
  const goldTokenCount = 5;
  return [
    ...MAIN_COLORS.flatMap(color => Array(tokenCount).fill(color)),
    ...Array(goldTokenCount).fill(GEM_COLORS.GOLD),
  ];
};

const initCards = (): CardPool => {
  // TODO: read cards from somewhere or generate

  const generateCard = (level: CardLevel): Card => {
    level = (level !== null) ? level : CardLevel[LEVELS[randInt(LEVELS.length)]];

    let colors = getShuffledColors().slice(0, 4);
    let cost = Array(randInt(5,3)).fill(null).map(() => getRandomColor(colors));
    let points = cost.length >= 4 ? 1 : 0;

    if (CardLevel.two === level) {
      colors = getShuffledColors().slice(0, 3);
      cost = Array(randInt(9,7)).fill(null).map(() => getRandomColor(colors));
      points = cost.length >= 8 ? 2 : 1;
    } else if (CardLevel.three === level) {
      colors = getShuffledColors().slice(0, 2);
      cost = Array(randInt(10,7)).fill(null).map(() => getRandomColor(colors));
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
        [...gems, ...Array(cardCost).fill(color)]
      , [])
    };
  };

  return Array(playerCount + 1).fill(null).map(generateNoble);
};

function App(): React.ReactElement<Record<string, unknown>> {
  const [players, setPlayers] = useState<Player[]>(initPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [tokensToBuy, setTokensToBuy] = useState<GemColor[]>([]);
  const [cardToReserve, setCardToReserve] = useState<Card | null>(null);
  const [gemPool, setGemPool] = useState<GemColor[]>(initGems());
  const [cardPool, setCardPool] = useState<CardPool>(initCards());
  const [nobles, setNobles] = useState<Noble[]>(initNobles());

  const playerInTurn = players[currentPlayerIndex];

  const [shouldShowReservedCards, setShouldShowReservedCards] = useState<boolean>(false);
  const [reservedCardsPlayer, setReservedCardsPlayer] = useState<Player>(playerInTurn);

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

    onTurnEnd();
  };

  const onTurnEnd = () => {
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
    setNobles(nobles.filter(noble => noble != afforableNobles[0]));
  };

  const checkIfPlayerWon = () => {
    if (getPlayerPoints(playerInTurn) >= POINTS_TO_WIN) {
      alert(`Congrats! Player ${playerInTurn.id} won!`);
    }
  };

  const onPlayerSelectGem = (gem: GemColor) => {
    if (
      // dont allow selecting gems if more than MAX already
      getPlayerTokenCount(playerInTurn) > MAX_TOKENS ||
      // prevent adding  token when pool is empty
      gemsOfColor(gemPool, gem).length === 0 ||
      // only allow same color if pool token count >= 4
      (gemsOfColor(gemPool, gem).length < 3 && gemsOfColor(tokensToBuy, gem).length) ||
      // prevent another gem selection if 2 tokens of same color already selected
      COLORS
        .map(color => tokensToBuy.filter(token => token === color).length)
        .some(count => count >= 2) ||
      // prevent same color selection if token of another color already present
      (COLORS
        .map(color => gemsOfColor(tokensToBuy, color).length)
        .reduce((total, count) => total + count, 0) >= 2 && tokensToBuy.includes(gem))
    ) {
      return;
    }
    setCardToReserve(null);
    setShouldShowReservedCards(false);

    // limit buying to max 3 tokens
    if (tokensToBuy.length < 3) {
      setTokensToBuy([...tokensToBuy, gem]);
    } else {
      return;
    }

    // remove gems from gem pool
    setGemPool(removeGems(gemPool, [gem]));
  };

  const addGemsToPlayer = (gems: GemColor[]) => {
    // add gem selected to current players gem collection
    const updatedPlayer = {
      ...playerInTurn,
      gems: [...playerInTurn.gems, ...gems],
    };
    setPlayers(players.map((player) => (player.id === playerInTurn.id ? updatedPlayer : player)));
  };

  const resetTokensToBuy = () => {
    setTokensToBuy([]);
    setGemPool([...gemPool, ...tokensToBuy]);
  };

  const removeCardFromBoard = (card: Card) => {
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
  };

  const onPlayerSelectCard = (card: Card, canReserve = true) => {
    // prevent player from buying when they have to discard first
    if (getPlayerTokenCount(playerInTurn) > MAX_TOKENS) {
      return;
    }
    // check if the user can afford the card
    if (!canPlayerAffordCard(playerInTurn, card)) {
      if (canReserve && playerInTurn.reservedCards.length < MAX_RESERVED_CARDS) {
        // Offer option to reserve
        setCardToReserve(card);
        resetTokensToBuy();
        setShouldShowReservedCards(false);
      }
      return;
    }

    // discount from cards
    const cardDiscount: GemColor[] = playerInTurn.cards
      .reduce((gems: GemColor[], card) => [...gems, card.color], []);

    // cost minus discount in cards
    const costInTokens = removeGems(card.cost, cardDiscount);
    // gold the player has
    const playerGold = gemsOfColor(playerInTurn.gems, GEM_COLORS.GOLD);
    // non gold tokens left for the user
    const tokensLeft = removeGems(playerInTurn.gems, [...costInTokens, ...playerGold]);
    // non gold tokens paid by the user
    const tokensPaid = removeGems(playerInTurn.gems, [...tokensLeft, ...playerGold]);

    // compute how much gold tokens were used to pay
    const costDeficit = removeGems(costInTokens, tokensPaid);
    const goldTokenCost = Array(Math.max(costDeficit.length, 0)).fill(GEM_COLORS.GOLD);

    setGemPool([...gemPool, ...tokensPaid, ...goldTokenCost]);

    // add card selected to current players cards
    const updatedPlayer = {
      ...playerInTurn,
      cards: [...playerInTurn.cards, card],
      gems: removeGems(playerInTurn.gems, [...tokensPaid, ...goldTokenCost]),
    };
    setPlayers(players.map(player => (player.id === playerInTurn.id ? updatedPlayer : player)));

    removeCardFromBoard(card);

    onTurnEnd();
  };

  const returnPlayerGemToPool = (gem: GemColor) => {
    // remove gems from player
    setPlayers(players.map(player => (player.id === playerInTurn.id ? {
      ...player,
      gems: removeGems(player.gems, [gem])
    } : player)));

    // give back gem tokens to pool
    setGemPool([...gemPool, gem]);
  };

  const reserveCard = (card: Card) => {
    const hasGoldInPool = gemsOfColor(gemPool, GEM_COLORS.GOLD).length > 0;
    // remove gold token from gem pool
    if (hasGoldInPool) {
      setGemPool(removeGems(gemPool, [GEM_COLORS.GOLD]));
    }

    const updatedPlayer: Player = {
      ...playerInTurn,
      reservedCards: [...playerInTurn.reservedCards, card],
      gems: [...playerInTurn.gems, ...(hasGoldInPool ? [GEM_COLORS.GOLD] : [])],
    };
    setPlayers(players.map(player => (player.id === playerInTurn.id ? updatedPlayer : player)));

    setCardToReserve(null);
    removeCardFromBoard(card);

    onTurnEnd();
  };

  return (
    <div className="App">
      {/* Modal to show selected tokens */}
      {tokensToBuy.length > 0 && 
        <div className="turnModal">
          <div className="tokensToBuyBox">
            {tokensToBuy.map((token, key) => {
              return (
                <div key={key} className="tokenToBuy">
                  <div className={`gemToken color-${token}`}>1</div>
                  <input type="button" onClick={() => {
                    setTokensToBuy(tokensToBuy.filter(t => t !== token));
                    // add back token to gem pool
                    setGemPool([ ...gemPool, token]);
                  }} value="x"/>
                </div>
              );
            })}
          </div>
          <input type="button" onClick={endPlayerTurn} value="End Turn" />
        </div>
      }

      {/* Modal to reserve card*/}
      {cardToReserve !== null && 
        <div className="reserveCardModal">
          <CardComponent
            card={cardToReserve}
            currentPlayer={playerInTurn} />
          <input type="button" onClick={() => reserveCard(cardToReserve)} value="Reserve Card" />
          <input type="button" onClick={() => setCardToReserve(null)} value="Cancel" />
        </div>
      }

      {/* Modal to show reseved cards */}
      {shouldShowReservedCards &&
        <div className="playerReservedCardsModal">
          <div>Reserved Cards:</div>
          {reservedCardsPlayer.reservedCards.map((card, key) => (
            <div key={key}>
              <CardComponent
                card={card}
                currentPlayer={reservedCardsPlayer}
                onPlayerSelectCard={(card: Card) => onPlayerSelectCard(card, false)}
              />
            </div>
          ))}
          <input type="button" onClick={() => setShouldShowReservedCards(false)} value="Cancel" />
        </div>
      }

      {/* Modal to discard tokens */}
      {getPlayerTokenCount(playerInTurn) > MAX_TOKENS &&
        <div className="playerDiscardModal">
          <div>Select tokens to return:</div>
          {COLORS.map(color => (
            <div
              key={color}
              className={`gemToken color-${color}`}
              onClick={() => {
                returnPlayerGemToPool(color);
                if (getPlayerTokenCount(playerInTurn) <= MAX_TOKENS) {
                  onTurnEnd();
                }
              }}
            >{gemsOfColor(playerInTurn.gems, color).length}</div>
          ))}
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
        onReservedCardListSelect={
          (player: Player) => {
            setReservedCardsPlayer(player);
            setShouldShowReservedCards(true);
            resetTokensToBuy();
            setCardToReserve(null);
          }
        }
      />
    </div>
  );
}

export default App;

