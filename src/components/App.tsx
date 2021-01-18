import React, { useState, useEffect } from 'react';

import './App.css';
import {
  MAX_TOKENS,
} from '../constants';

import {
  buyChosenGems,
  buyReservedCard,
  cancelCardReservation,
  cancelGemPurchase,
  createGame,
  addPlayer,
  reserveChosenCard,
  returnPlayerGemToPool,
  chooseGemToBuy,
  buyOrReserveCard,
  processEndOfTurn,
} from '../game';

import {
  getPlayerTokenCount,
  getCurrentPlayer,
} from '../utils';
import {
  GameBoard,
} from './Board';
import {
  SelectedGemsModal,
} from './SelectedGemsModal';
import {
  ReserveCardModal,
} from './ReserveCardModal';
import {
  ReservedCardsModal,
} from './ReservedCardsModal';

import {
  Card,
  Player,
  Game,
} from '../types';
import {DiscardGemModal} from './DiscardGemModal';

const App = (): React.ReactElement<Record<string, unknown>> => {
  const [game, setGame] = useState<Game>(addPlayer(addPlayer(createGame())));

  const [shouldShowReservedCards, setShouldShowReservedCards] = useState<boolean>(false);
  const [reservedCardsPlayer, setReservedCardsPlayer] = useState<Player>(getCurrentPlayer(game));

  useEffect(() => {
    setGame(processEndOfTurn(game));
  }, [game.state]);

  return (
    <div className="App">
      <div>Spender</div>
      {/* Modal to show selected tokens */}
      {game.tokensToBuy.length > 0 &&
        <SelectedGemsModal
          game={game}
          onDeselectGem={(token) => setGame(cancelGemPurchase(game, token))}
          onConfirmChoices={() => setGame(buyChosenGems(game))}
        />
      }

      {/* Modal to reserve card*/}
      {game.cardToReserve !== null &&
        <ReserveCardModal
          card={game.cardToReserve}
          player={getCurrentPlayer(game)}
          onPlayerConfirmReservation={() => setGame(reserveChosenCard(game))}
          onPlayerCancelReservation={() => setGame(cancelCardReservation(game))}
        />
      }

      {/* Modal to show reseved cards */}
      {shouldShowReservedCards &&
        <ReservedCardsModal
          player={reservedCardsPlayer}
          onPlayerSelectCard={(card: Card) => {
            setGame(buyReservedCard(game, card));
            setShouldShowReservedCards(false);
          }}
          onCloseModal={() => setShouldShowReservedCards(false)}
        />
      }

      {/* Modal to discard tokens */}
      {getPlayerTokenCount(getCurrentPlayer(game)) > MAX_TOKENS &&
        <DiscardGemModal
          gems={getCurrentPlayer(game).gems}
          onSelectGem={
            (color) => setGame(
              // check end of turn after discard
              processEndOfTurn(
                // return selected gem back to pool
                returnPlayerGemToPool(game, color))
            )
          }
        />
      }

      <GameBoard
        game={game}
        onPlayerSelectGem={(token) => setGame(chooseGemToBuy(game, token))}
        onPlayerSelectCard={(card) => setGame(processEndOfTurn(buyOrReserveCard(game, card)))}
        onReservedCardListSelect={
          (player: Player) => {
            setReservedCardsPlayer(player);
            setShouldShowReservedCards(true);
          }
        }
      />
    </div>
  );
};

export default App;

