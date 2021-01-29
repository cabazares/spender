import React, { useState, useEffect } from 'react';

import './App.css';
import {
  GAME_STATES,
  MAX_PLAYERS,
  MAX_TOKENS,
  PLAYER_CHOICE_POOL,
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
  addNobleToPlayer,
  startGame,
  resetGame,
  removePlayer,
} from '../game';

import {
  getPlayerTokenCount,
  getCurrentPlayer,
  randInt,
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
  PlayerChoice,
} from '../types';
import {DiscardGemModal} from './DiscardGemModal';
import {NobleSelectionModal} from './NobleSelectionModal';

const GameApp = ({ game, setGame }: { game: Game, setGame: (game: Game) => void }) => {
  const [shouldShowReservedCards, setShouldShowReservedCards] = useState<boolean>(false);
  const [reservedCardsPlayer, setReservedCardsPlayer] = useState<Player>(getCurrentPlayer(game));

  return (
    <>
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

      {/* Modal to allow user to select nobles */}
      {game.affordableNobles.length > 0 &&
        <NobleSelectionModal nobles={game.affordableNobles} onSelectNoble={(noble) => {
          setGame(addNobleToPlayer(game, noble));
        }} />
      }

      {/* show gameboard while playing */}
      <GameBoard
        game={game}
        onPlayerSelectGem={(token) => {
          setShouldShowReservedCards(false);
          setGame(chooseGemToBuy(game, token));
        }}
        onPlayerSelectCard={(card) => setGame(processEndOfTurn(buyOrReserveCard(game, card)))}
        onReservedCardListSelect={
          (player: Player) => {
            setReservedCardsPlayer(player);
            setShouldShowReservedCards(true);
          }
        }
      />
    </>
  );
};


const PlayerChoiceComponent = (
  { 
    player: initialPlayer,
    onPlayerReady,
    onPlayerRemove,
    previousPlayerSelect,
    nextPlayerSelect,
  }: {
    player?: Player,
    onPlayerReady: (name: string) => void,
    onPlayerRemove: (name: string) => void,
    previousPlayerSelect: (player?: PlayerChoice) => PlayerChoice,
    nextPlayerSelect: (player?: PlayerChoice) => PlayerChoice,
  }
) => {
  const initialChoice = PLAYER_CHOICE_POOL.find(
    choice => choice.name === (initialPlayer && initialPlayer.id)
  );
  const [player, setPlayer] = useState<PlayerChoice | null>(initialChoice ? initialChoice : null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (initialPlayer) {
      setIsReady(true);
    }
  }, []);

  return (
    <div className="playerSlot">
      {player && 
        <div>
          <img src={player.src} />
          <div>
            <input type="button" onClick={() => {
              setPlayer(previousPlayerSelect(player));
            }} value="<" />
            {player.name}
            <input type="button" onClick={() => {
              setPlayer(nextPlayerSelect(player));
            }} value=">" />
          </div>
        </div>
      }

      {!player &&
        <input type="button" onClick={() => setPlayer(nextPlayerSelect())} value="Add Player" />
      }
      {player && !isReady &&
        <input type="Button" onClick={() => {
          setIsReady(true);
          return onPlayerReady(player.name);
        }} value="Ready?" />
      }
      {player &&
        <input type="Button" onClick={() => {
          setIsReady(false);
          setPlayer(null);
          return onPlayerRemove(player.name);
        }} value="Remove" />
      }
    </div>
  );
};

const App = (): React.ReactElement<Record<string, unknown>> => {
  const [game, setGame] = useState<Game>(createGame());
  const [chosenPlayers, setChosenPlayers] = useState<PlayerChoice[]>([]);

  // handle state changes
  useEffect(() => {
    setGame(processEndOfTurn(game));
  }, [game.state]);

  // preload images
  useEffect(() => {
    PLAYER_CHOICE_POOL.map(({ src }) => (new Image()).src = src);
  }, []);

  const getPlayerChoice = (increment: number, player?: PlayerChoice) => {
    // get next choice
    const posibleChoices = PLAYER_CHOICE_POOL
      .filter(p => !chosenPlayers.includes(p) || p === player);
    let pIndex = player
      ? posibleChoices.indexOf(player) + increment
      : randInt(posibleChoices.length);
    pIndex = pIndex >= posibleChoices.length ? 0 : pIndex;
    pIndex = pIndex <= -1 ? posibleChoices.length - 1 : pIndex;

    setChosenPlayers([
      ...chosenPlayers.filter(p => p !== player),
      posibleChoices[pIndex],
    ]);

    return posibleChoices[pIndex];
  };

  const renderPlayerChoice = (player: Player) => (
    <PlayerChoiceComponent
      player={player}
      onPlayerReady={name => setGame(addPlayer(game, name))}
      onPlayerRemove={name => setGame(removePlayer(game, name))}
      nextPlayerSelect={p => getPlayerChoice(1, p)}
      previousPlayerSelect={p => getPlayerChoice(-1, p)}
    />
  );

  return (
    <div className="App">
      <div className="AppTitle">Spender</div>

      {/* Game Setup */}
      {game.state === GAME_STATES.SETUP &&
        <div className="playerSelectionScreen">
          <div className="playerSlots" >
            {Array(MAX_PLAYERS).fill(null)
              .map((_, index) => renderPlayerChoice(game.players[index]))
            }
          </div>

          {game.players.length > 1 &&
            <div className="startButton" onClick={() => setGame(startGame(game))}>Start Game</div>
          }
        </div>
      }

      {/* main game */}
      {![GAME_STATES.SETUP, GAME_STATES.GAME_END].includes(game.state) &&
        getCurrentPlayer(game) &&
        <GameApp game={game} setGame={setGame} />
      }

      {game.state === GAME_STATES.GAME_END &&
        <div
          className="startButton"
          onClick={() => setGame(resetGame(game))}>Start New Game</div>
      }
    </div>
  );
};

export default App;

