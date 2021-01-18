import React, { useState, useEffect } from 'react';

import './App.css';
import {
  COLORS,
  MAX_TOKENS,
} from './constants';

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
} from './game';

import {
  getPlayerTokenCount,
  gemsOfColor,
  getCurrentPlayer,
} from './utils';
import {
  GameBoard,
  CardComponent,
} from './Board';

import {
  Card,
  Player,
  Game,
} from './types';

function App(): React.ReactElement<Record<string, unknown>> {
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
        <div className="turnModal">
          <div className="tokensToBuyBox">
            {game.tokensToBuy.map((token, key) => {
              return (
                <div key={key} className="tokenToBuy">
                  <div className={`gemToken color-${token}`}>1</div>
                  <input type="button" onClick={() => {
                    setGame(cancelGemPurchase(game, token));
                  }} value="x"/>
                </div>
              );
            })}
          </div>
          <input type="button" onClick={() => setGame(buyChosenGems(game))} value="End Turn" />
        </div>
      }

      {/* Modal to reserve card*/}
      {game.cardToReserve !== null && 
        <div className="reserveCardModal">
          <CardComponent
            card={game.cardToReserve}
            currentPlayer={getCurrentPlayer(game)} />
          <input
            type="button"
            onClick={() => setGame(reserveChosenCard(game))}
            value="Reserve Card" />
          <input
            type="button"
            onClick={() => setGame(cancelCardReservation(game))}
            value="Cancel" />
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
                onPlayerSelectCard={(card: Card) => {
                  setGame(buyReservedCard(game, card));
                  setShouldShowReservedCards(false);
                }}
              />
            </div>
          ))}
          <input type="button" onClick={() => setShouldShowReservedCards(false)} value="Cancel" />
        </div>
      }

      {/* Modal to discard tokens */}
      {getPlayerTokenCount(getCurrentPlayer(game)) > MAX_TOKENS &&
        <div className="playerDiscardModal">
          <div>Select tokens to return:</div>
          {COLORS.map(color => (
            <div
              key={color}
              className={`gemToken color-${color}`}
              onClick={() => {
                setGame(
                  // check end of turn after discard
                  processEndOfTurn(
                    // return selected gem back to pool
                    returnPlayerGemToPool(game, color)));
              }}
            >{gemsOfColor(getCurrentPlayer(game).gems, color).length}</div>
          ))}
        </div>
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
}

export default App;

